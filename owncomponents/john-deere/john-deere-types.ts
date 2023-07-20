export interface OrganizationsResponse {
  links: Link[];
  total: number;
  values: Value[];
}

export interface Link {
  rel: string;
  uri: string;
}

export interface Value {
  "@type": string;
  name: string;
  type: string;
  member: boolean;
  internal: boolean;
  recordMetadata: RecordMetadata;
  id: string;
  links: Link[];
}



export interface FileResponse {
  links:  Link[];
  total:  number;
  values: FileValue[];
}

export interface FileValue {
  "@type":         string;
  name:            string;
  type:            string;
  createdTime:     Date;
  modifiedTime:    Date;
  nativeSize:      number;
  source:          string;
  transferPending: boolean;
  visibleViaShare: string;
  shared:          boolean;
  new:             boolean;
  status:          string;
  archived:        boolean;
  format:          string;
  manufacturer:    string;
  delayProcessing: boolean;
  id:              string;
  links:           Link[];
}

export interface RecordMetadata {
  "@type": string;
  userCreationTimestamp: string;
  createdByUser: any;
  createdBySourceSystemUri: any;
  createdBySourceNode: any;
  userLastModifiedTimestamp: any;
  lastModifiedByUser: any;
  lastModifiedBySourceSystemUri: any;
  lastModifiedBySourceNode: any;
}