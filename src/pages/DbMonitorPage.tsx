import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { dbMonitor, useDbMonitorSnapshot, type DbMonitorSnapshot } from '../services/dbMonitor';

const formatDuration = (durationMs: number) => {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatRelativeWindow = (snapshot: DbMonitorSnapshot) => {
  const seconds = Math.max(1, Math.round((Date.now() - snapshot.startedAt) / 1000));
  return `${seconds}s`;
};

const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: '1px solid #d7e0ea',
      background: 'linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%)',
      minWidth: 180,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {subtitle}
    </Typography>
  </Paper>
);

const LineChart = ({ snapshot }: { snapshot: DbMonitorSnapshot }) => {
  const points = useMemo(() => {
    const nowSecond = Math.floor(Date.now() / 1000);
    const sourceBuckets = new Map(snapshot.buckets.map((bucket) => [bucket.second, bucket]));
    const series = Array.from({ length: 60 }, (_, index) => {
      const second = nowSecond - 59 + index;
      return sourceBuckets.get(second)?.total || 0;
    });

    const maxValue = Math.max(1, ...series);
    return series.map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${x},${y}`;
    });
  }, [snapshot.buckets]);

  const lastMinuteTotals = useMemo(() => {
    const nowSecond = Math.floor(Date.now() / 1000);
    return snapshot.buckets
      .filter((bucket) => bucket.second >= nowSecond - 59)
      .reduce(
        (accumulator, bucket) => {
          accumulator.total += bucket.total;
          accumulator.authApi += bucket.authApi;
          accumulator.couchdb += bucket.couchdb;
          accumulator.pouchdb += bucket.pouchdb;
          return accumulator;
        },
        { total: 0, authApi: 0, couchdb: 0, pouchdb: 0 },
      );
  }, [snapshot.buckets]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #d7e0ea',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Llamados por segundo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ventana móvil de 60 segundos. Total último minuto: {lastMinuteTotals.total}
      </Typography>

      <Box
        sx={{
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(32, 89, 163, 0.08) 0%, rgba(32, 89, 163, 0.02) 100%)',
          p: 1,
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 180 }}>
          <polyline
            fill="none"
            stroke="#2059a3"
            strokeWidth="2.5"
            points={points.join(' ')}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`Auth API: ${lastMinuteTotals.authApi}`} size="small" sx={{ bgcolor: '#e8f0fb' }} />
        <Chip label={`CouchDB: ${lastMinuteTotals.couchdb}`} size="small" sx={{ bgcolor: '#e4f5ec' }} />
        <Chip label={`PouchDB local: ${lastMinuteTotals.pouchdb}`} size="small" sx={{ bgcolor: '#fff1df' }} />
      </Stack>
    </Paper>
  );
};

const TopTargets = ({ snapshot }: { snapshot: DbMonitorSnapshot }) => {
  const topTargets = snapshot.targets.slice(0, 12);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #d7e0ea',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Top endpoints / DBs
      </Typography>

      <Stack spacing={1.25}>
        {topTargets.map((item) => {
          const width = topTargets[0] ? Math.max(8, (item.count / topTargets[0].count) * 100) : 0;

          return (
            <Box key={item.key}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.source} · avg {formatDuration(Math.round(item.avgDurationMs))}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.count}
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 0.75,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: '#ecf1f6',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${width}%`,
                    height: '100%',
                    borderRadius: 999,
                    bgcolor: item.source === 'couchdb' ? '#3a8f5a' : item.source === 'pouchdb' ? '#cc8a2f' : '#2059a3',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

const SyncStatusPanel = ({ snapshot }: { snapshot: DbMonitorSnapshot }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid #d7e0ea',
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
      Syncs registradas
    </Typography>

    <Stack spacing={1}>
      {snapshot.syncs.slice(0, 20).map((item) => (
        <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.database}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={item.state}
            color={item.state === 'error' ? 'error' : item.state === 'active' ? 'success' : 'default'}
            variant={item.state === 'active' ? 'filled' : 'outlined'}
          />
        </Stack>
      ))}
    </Stack>
  </Paper>
);

const RecentEvents = ({ snapshot }: { snapshot: DbMonitorSnapshot }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid #d7e0ea',
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      Feed en tiempo real
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Últimos {snapshot.recentEvents.length} eventos capturados.
    </Typography>

    <Stack divider={<Divider flexItem />} spacing={1}>
      {snapshot.recentEvents.slice(0, 30).map((event) => (
        <Stack key={event.id} direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <Box sx={{ minWidth: 110 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(event.timestamp)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ minWidth: 180, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip size="small" label={event.source} />
            <Chip
              size="small"
              label={event.status}
              color={event.status === 'error' ? 'error' : 'success'}
              variant="outlined"
            />
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {event.method} {event.label}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', wordBreak: 'break-all' }}
            >
              {event.details}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', wordBreak: 'break-all' }}
            >
              {event.initiator}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 90, textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatDuration(event.durationMs)}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  </Paper>
);

export const DbMonitorPage = () => {
  const snapshot = useDbMonitorSnapshot();
  const activeSyncCount = snapshot.syncs.filter((item) => item.state === 'active').length;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        overflow: 'auto',
        background: 'linear-gradient(180deg, #eef3f8 0%, #f8fafc 100%)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            DB Monitor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Auth API, syncs CouchDB y operaciones locales PouchDB en tiempo real.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ventana actual: {formatRelativeWindow(snapshot)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Button variant="outlined" onClick={() => dbMonitor.reset()}>
            Reset
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 2 }}>
        <StatCard title="Eventos totales" value={snapshot.totals.total} subtitle="Desde el último reset" />
        <StatCard title="Auth API" value={snapshot.totals.authApi} subtitle="Login, renew, logout y afines" />
        <StatCard title="CouchDB" value={snapshot.totals.couchdb} subtitle="Requests remotas detectadas" />
        <StatCard title="PouchDB local" value={snapshot.totals.pouchdb} subtitle="find, allDocs, get, put, etc." />
        <StatCard title="Syncs activas" value={activeSyncCount} subtitle={`${snapshot.syncs.length} registradas`} />
        <StatCard title="Errores" value={snapshot.totals.errors} subtitle="Eventos con estado error" />
      </Stack>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1.4fr 1fr' },
          gap: 2,
        }}
      >
        <LineChart snapshot={snapshot} />
        <TopTargets snapshot={snapshot} />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '0.8fr 1.6fr' },
          gap: 2,
        }}
      >
        <SyncStatusPanel snapshot={snapshot} />
        <RecentEvents snapshot={snapshot} />
      </Box>
    </Box>
  );
};
