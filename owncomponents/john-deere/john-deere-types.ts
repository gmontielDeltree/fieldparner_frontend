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

export interface JDMachine {
  "@type": string
  visualizationCategory: string
  machineCategories: MachineCategories
  telematicsState: string
  capabilities: any[]
  terminals: Terminals
  displays: Displays
  GUID: string
  contributionDefinitionID: string
  id: string
  name: string
  equipmentMake: EquipmentMake
  equipmentType: EquipmentType
  equipmentApexType: EquipmentApexType
  equipmentModel: EquipmentModel
  isSerialNumberCertified: string
  links: Link[]
}

export interface MachineCategories {
  "@type": string
  otherAttributes: OtherAttributes
}

export interface OtherAttributes {}

export interface Terminals {
  "@type": string
  otherAttributes: OtherAttributes2
}

export interface OtherAttributes2 {}

export interface Displays {
  "@type": string
  otherAttributes: OtherAttributes3
}

export interface OtherAttributes3 {}

export interface EquipmentMake {
  "@type": string
  name: string
  ERID: string
  certified: boolean
  id: string
}

export interface EquipmentType {
  "@type": string
  name: string
  GUID: string
  category: string
  certified: boolean
  marketSegment: string
  id: string
}

export interface EquipmentApexType {
  "@type": string
  name: string
  GUID: string
  category: string
  id: string
}

export interface EquipmentModel {
  "@type": string
  name: string
  GUID: string
  certified: boolean
  classification: string
  id: string
}
