import { useSyncExternalStore } from 'react';
import { fieldpartnerAPI } from '../config';
import { dbContext, remoteCouchDBUrl, syncManager } from './pouchdbService';

type MonitorSource = 'auth-api' | 'couchdb' | 'pouchdb' | 'sync';
type MonitorStatus = 'ok' | 'error';
type SyncLifecycleState = 'registered' | 'active' | 'paused' | 'error' | 'cancelled';

type MonitorEvent = {
  id: number;
  timestamp: number;
  source: MonitorSource;
  method: string;
  target: string;
  label: string;
  status: MonitorStatus;
  durationMs: number;
  initiator: string;
  details: string;
};

type MonitorBucket = {
  second: number;
  total: number;
  authApi: number;
  couchdb: number;
  pouchdb: number;
  sync: number;
};

type MonitorTargetSummary = {
  key: string;
  source: MonitorSource;
  label: string;
  target: string;
  count: number;
  errorCount: number;
  totalDurationMs: number;
  avgDurationMs: number;
};

type SyncStatusItem = {
  name: string;
  database: string;
  state: SyncLifecycleState;
  updatedAt: number;
};

type MonitorTotals = {
  total: number;
  authApi: number;
  couchdb: number;
  pouchdb: number;
  sync: number;
  errors: number;
};

export type DbMonitorSnapshot = {
  startedAt: number;
  totals: MonitorTotals;
  buckets: MonitorBucket[];
  recentEvents: MonitorEvent[];
  targets: MonitorTargetSummary[];
  syncs: SyncStatusItem[];
};

type Listener = () => void;

type ClassifiedRequest = {
  source: 'auth-api' | 'couchdb';
  target: string;
  label: string;
  details: string;
};

type RequestMetadata = {
  method: string;
  url: string;
  startedAt: number;
  initiator: string;
};

type MonitoredMethod =
  | 'find'
  | 'allDocs'
  | 'get'
  | 'put'
  | 'post'
  | 'remove'
  | 'bulkDocs'
  | 'query'
  | 'changes'
  | 'createIndex';

const MAX_EVENTS = 200;
const MAX_BUCKETS = 180;
const XHR_MONITOR_KEY = '__fieldpartnerDbMonitor';
const WRAPPED_METHOD_KEY = '__fieldpartnerDbMonitorWrapped';

const monitoredMethods: MonitoredMethod[] = [
  'find',
  'allDocs',
  'get',
  'put',
  'post',
  'remove',
  'bulkDocs',
  'query',
  'changes',
  'createIndex',
];

const listeners = new Set<Listener>();
const targetSummaries = new Map<string, MonitorTargetSummary>();
const syncStatuses = new Map<string, SyncStatusItem>();
const bucketMap = new Map<number, MonitorBucket>();

let startedAt = Date.now();
let sequence = 0;
let initialized = false;

const totals: MonitorTotals = {
  total: 0,
  authApi: 0,
  couchdb: 0,
  pouchdb: 0,
  sync: 0,
  errors: 0,
};

let recentEvents: MonitorEvent[] = [];
let snapshot: DbMonitorSnapshot = {
  startedAt,
  totals: { ...totals },
  buckets: [],
  recentEvents: [],
  targets: [],
  syncs: [],
};

const sanitizeUrl = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return value;
  }
};

const authApiBase = sanitizeUrl(fieldpartnerAPI.defaults.baseURL || '');
const couchDbBase = sanitizeUrl(remoteCouchDBUrl);

const notify = () => {
  snapshot = {
    startedAt,
    totals: { ...totals },
    buckets: Array.from(bucketMap.values()).sort((a, b) => a.second - b.second),
    recentEvents: [...recentEvents].sort((a, b) => b.timestamp - a.timestamp),
    targets: Array.from(targetSummaries.values()).sort((a, b) => b.count - a.count),
    syncs: Array.from(syncStatuses.values()).sort((a, b) => a.name.localeCompare(b.name)),
  };

  listeners.forEach((listener) => listener());
};

const resetBuckets = () => {
  const minSecond = Math.floor(Date.now() / 1000) - MAX_BUCKETS + 1;

  Array.from(bucketMap.keys()).forEach((second) => {
    if (second < minSecond) {
      bucketMap.delete(second);
    }
  });
};

const incrementBucket = (source: MonitorSource, timestamp: number) => {
  const second = Math.floor(timestamp / 1000);
  const currentBucket = bucketMap.get(second) || {
    second,
    total: 0,
    authApi: 0,
    couchdb: 0,
    pouchdb: 0,
    sync: 0,
  };

  currentBucket.total += 1;
  if (source === 'auth-api') currentBucket.authApi += 1;
  if (source === 'couchdb') currentBucket.couchdb += 1;
  if (source === 'pouchdb') currentBucket.pouchdb += 1;
  if (source === 'sync') currentBucket.sync += 1;

  bucketMap.set(second, currentBucket);
  resetBuckets();
};

const updateTargetSummary = (event: MonitorEvent) => {
  const key = `${event.source}:${event.target}:${event.method}`;
  const currentSummary = targetSummaries.get(key) || {
    key,
    source: event.source,
    label: event.label,
    target: event.target,
    count: 0,
    errorCount: 0,
    totalDurationMs: 0,
    avgDurationMs: 0,
  };

  currentSummary.count += 1;
  currentSummary.totalDurationMs += event.durationMs;
  currentSummary.avgDurationMs = currentSummary.totalDurationMs / currentSummary.count;
  if (event.status === 'error') {
    currentSummary.errorCount += 1;
  }

  targetSummaries.set(key, currentSummary);
};

const getInitiator = () => {
  const stack = new Error().stack?.split('\n').map((line) => line.trim()) || [];
  const relevantFrame = stack.find(
    (line) =>
      line.includes('/src/') &&
      !line.includes('dbMonitor.ts') &&
      !line.includes('react-dom') &&
      !line.includes('node_modules'),
  );

  return relevantFrame?.replace(/^at\s+/, '') || 'unknown';
};

const recordEvent = ({
  source,
  method,
  target,
  label,
  status,
  durationMs,
  initiator,
  details,
}: Omit<MonitorEvent, 'id' | 'timestamp'>) => {
  const timestamp = Date.now();
  const event: MonitorEvent = {
    id: ++sequence,
    timestamp,
    source,
    method,
    target,
    label,
    status,
    durationMs,
    initiator,
    details,
  };

  totals.total += 1;
  totals[source] += 1;
  if (status === 'error') {
    totals.errors += 1;
  }

  incrementBucket(source, timestamp);
  updateTargetSummary(event);
  recentEvents = [event, ...recentEvents].slice(0, MAX_EVENTS);
  notify();
};

const recordSyncState = (name: string, database: string, state: SyncLifecycleState, details: string) => {
  syncStatuses.set(name, {
    name,
    database,
    state,
    updatedAt: Date.now(),
  });

  recordEvent({
    source: 'sync',
    method: state.toUpperCase(),
    target: name,
    label: `${name} -> ${database}`,
    status: state === 'error' ? 'error' : 'ok',
    durationMs: 0,
    initiator: 'syncManager',
    details,
  });
};

const normalizePath = (urlValue: string, baseValue: string) => {
  if (!baseValue || !urlValue.startsWith(baseValue)) {
    return null;
  }

  const relative = urlValue.slice(baseValue.length);
  return relative.replace(/^\/+/, '');
};

const classifyNetworkRequest = (urlValue: string): ClassifiedRequest | null => {
  const sanitizedUrl = sanitizeUrl(urlValue);
  const authPath = normalizePath(sanitizedUrl, authApiBase);
  if (authPath !== null) {
    return {
      source: 'auth-api',
      target: authPath || 'root',
      label: authPath || 'root',
      details: sanitizedUrl,
    };
  }

  const couchPath = normalizePath(sanitizedUrl, couchDbBase);
  if (couchPath !== null) {
    const [database = 'root', ...rest] = couchPath.split('/');
    return {
      source: 'couchdb',
      target: database,
      label: database,
      details: rest.length > 0 ? `${database}/${rest.join('/')}` : database,
    };
  }

  return null;
};

const wrapPromise = <T,>(
  value: Promise<T>,
  onSuccess: () => void,
  onError: () => void,
) => {
  return value
    .then((result) => {
      onSuccess();
      return result;
    })
    .catch((error) => {
      onError();
      throw error;
    });
};

const instrumentPouchDb = () => {
  Object.entries(dbContext).forEach(([dbName, dbInstance]) => {
    const db = dbInstance as Record<string, unknown>;

    monitoredMethods.forEach((methodName) => {
      const originalMethod = db[methodName];
      if (typeof originalMethod !== 'function') {
        return;
      }

      const originalFunction = originalMethod as ((...args: unknown[]) => unknown) & {
        [WRAPPED_METHOD_KEY]?: boolean;
      };

      if (originalFunction[WRAPPED_METHOD_KEY]) {
        return;
      }

      const wrappedMethod = function wrappedDbMethod(this: unknown, ...args: unknown[]) {
        const startedAtMs = performance.now();
        const initiator = getInitiator();

        try {
          const result = originalFunction.apply(this, args);
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            return wrapPromise(
              result as Promise<unknown>,
              () => {
                recordEvent({
                  source: 'pouchdb',
                  method: methodName.toUpperCase(),
                  target: dbName,
                  label: `${dbName}.${methodName}`,
                  status: 'ok',
                  durationMs: Math.round(performance.now() - startedAtMs),
                  initiator,
                  details: `${dbName}.${methodName}`,
                });
              },
              () => {
                recordEvent({
                  source: 'pouchdb',
                  method: methodName.toUpperCase(),
                  target: dbName,
                  label: `${dbName}.${methodName}`,
                  status: 'error',
                  durationMs: Math.round(performance.now() - startedAtMs),
                  initiator,
                  details: `${dbName}.${methodName}`,
                });
              },
            );
          }

          recordEvent({
            source: 'pouchdb',
            method: methodName.toUpperCase(),
            target: dbName,
            label: `${dbName}.${methodName}`,
            status: 'ok',
            durationMs: Math.round(performance.now() - startedAtMs),
            initiator,
            details: `${dbName}.${methodName}`,
          });

          return result;
        } catch (error) {
          recordEvent({
            source: 'pouchdb',
            method: methodName.toUpperCase(),
            target: dbName,
            label: `${dbName}.${methodName}`,
            status: 'error',
            durationMs: Math.round(performance.now() - startedAtMs),
            initiator,
            details: `${dbName}.${methodName}`,
          });
          throw error;
        }
      };

      (wrappedMethod as typeof originalFunction)[WRAPPED_METHOD_KEY] = true;
      db[methodName] = wrappedMethod;
    });
  });
};

const instrumentFetch = () => {
  if (typeof window.fetch !== 'function') {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const requestMethod =
      init?.method ||
      (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') ||
      'GET';

    const requestInfo = classifyNetworkRequest(requestUrl);
    if (!requestInfo) {
      return originalFetch(input, init);
    }

    const startedAtMs = performance.now();
    const initiator = getInitiator();

    try {
      const response = await originalFetch(input, init);
      recordEvent({
        source: requestInfo.source,
        method: requestMethod.toUpperCase(),
        target: requestInfo.target,
        label: requestInfo.label,
        status: response.ok ? 'ok' : 'error',
        durationMs: Math.round(performance.now() - startedAtMs),
        initiator,
        details: `${response.status} ${requestInfo.details}`,
      });
      return response;
    } catch (error) {
      recordEvent({
        source: requestInfo.source,
        method: requestMethod.toUpperCase(),
        target: requestInfo.target,
        label: requestInfo.label,
        status: 'error',
        durationMs: Math.round(performance.now() - startedAtMs),
        initiator,
        details: `ERR ${requestInfo.details}`,
      });
      throw error;
    }
  };
};

const instrumentXhr = () => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function monitoredOpen(
    this: XMLHttpRequest & { [XHR_MONITOR_KEY]?: RequestMetadata },
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    this[XHR_MONITOR_KEY] = {
      method: method.toUpperCase(),
      url: typeof url === 'string' ? url : url.toString(),
      startedAt: 0,
      initiator: getInitiator(),
    };

    return originalOpen.call(this, method, url, async ?? true, username ?? null, password ?? null);
  };

  XMLHttpRequest.prototype.send = function monitoredSend(
    this: XMLHttpRequest & { [XHR_MONITOR_KEY]?: RequestMetadata },
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const metadata = this[XHR_MONITOR_KEY];
    if (!metadata) {
      return originalSend.call(this, body);
    }

    const requestInfo = classifyNetworkRequest(metadata.url);
    if (!requestInfo) {
      return originalSend.call(this, body);
    }

    metadata.startedAt = performance.now();
    const handleLoadEnd = () => {
      recordEvent({
        source: requestInfo.source,
        method: metadata.method,
        target: requestInfo.target,
        label: requestInfo.label,
        status: this.status >= 200 && this.status < 400 ? 'ok' : 'error',
        durationMs: Math.round(performance.now() - metadata.startedAt),
        initiator: metadata.initiator,
        details: `${this.status || 'ERR'} ${requestInfo.details}`,
      });
      this.removeEventListener('loadend', handleLoadEnd);
    };

    this.addEventListener('loadend', handleLoadEnd);
    return originalSend.call(this, body);
  };
};

const extractDatabaseFromRemoteUrl = (remoteUrl: string) => {
  const classified = classifyNetworkRequest(remoteUrl);
  return classified?.target || remoteUrl;
};

const instrumentSyncManager = () => {
  const originalRegister = syncManager.register.bind(syncManager) as typeof syncManager.register;
  const originalCancel = syncManager.cancel.bind(syncManager);
  const originalCancelAll = syncManager.cancelAll.bind(syncManager);

  syncManager.register = ((name: string, local: unknown, remoteUrl: string, opts?: unknown) => {
    const database = extractDatabaseFromRemoteUrl(remoteUrl);
    recordSyncState(name, database, 'registered', `register -> ${database}`);

    const handler = (originalRegister as (name: string, local: unknown, remoteUrl: string, opts?: unknown) => any)(
      name,
      local,
      remoteUrl,
      opts,
    );

    handler
      .on('active', () => recordSyncState(name, database, 'active', `active -> ${database}`))
      .on('paused', () => recordSyncState(name, database, 'paused', `paused -> ${database}`))
      .on('error', () => recordSyncState(name, database, 'error', `error -> ${database}`));

    return handler;
  }) as typeof syncManager.register;

  syncManager.cancel = (name: string) => {
    const existing = syncStatuses.get(name);
    if (existing) {
      recordSyncState(name, existing.database, 'cancelled', `cancel -> ${existing.database}`);
    }

    return originalCancel(name);
  };

  syncManager.cancelAll = () => {
    Array.from(syncStatuses.values()).forEach((item) => {
      recordSyncState(item.name, item.database, 'cancelled', `cancelAll -> ${item.database}`);
    });

    return originalCancelAll();
  };
};

export const initializeDbMonitor = () => {
  if (initialized || typeof window === 'undefined') {
    return;
  }

  initialized = true;
  instrumentPouchDb();
  instrumentFetch();
  instrumentXhr();
  instrumentSyncManager();
  notify();
};

const reset = () => {
  startedAt = Date.now();
  sequence = 0;
  totals.total = 0;
  totals.authApi = 0;
  totals.couchdb = 0;
  totals.pouchdb = 0;
  totals.sync = 0;
  totals.errors = 0;
  recentEvents = [];
  targetSummaries.clear();
  syncStatuses.clear();
  bucketMap.clear();
  notify();
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => snapshot;

export const dbMonitor = {
  subscribe,
  getSnapshot,
  reset,
};

export const useDbMonitorSnapshot = () =>
  useSyncExternalStore(dbMonitor.subscribe, dbMonitor.getSnapshot, dbMonitor.getSnapshot);
