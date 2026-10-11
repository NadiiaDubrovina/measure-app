export interface WallPayload {
  identifier: string; // e.g. "Wall A (Main)", "Wall B (Window side)"
  lengthMm: number;
  lengthMiddleMm?: number;
  lengthTopMm?: number;
  heightLeftMm: number;
  heightRightMm: number;
  cornerAngleDeg?: number; // e.g. 90.0, 88.5
  plumbDeviationMm?: number;
  baseboardNotes?: string;
  notes?: string;
}

export type OpeningType =
  | 'window'
  | 'door'
  | 'niche'
  | 'radiator'
  | 'vent_shaft'
  | 'structural_beam'
  | 'pipe_riser';

export interface OpeningPayload {
  wallRef: string; // references Wall identifier
  type: OpeningType;
  widthMm: number;
  heightMm: number;
  distanceFromCornerMm: number;
  sillHeightMm?: number; // for windows / radiators
  projectionDepthMm?: number; // how far into room it sticks out
  notes?: string;
}

export type TechnicalPointType =
  | 'socket_230v'
  | 'socket_400v'
  | 'water_cold'
  | 'water_hot'
  | 'drain_pipe'
  | 'gas_pipe'
  | 'ventilation_duct'
  | 'light_switch'
  | 'thermostat'
  | 'underfloor_heating_box';

export interface TechnicalPointPayload {
  wallRef: string;
  type: TechnicalPointType;
  distanceFromCornerMm: number;
  heightFromFloorMm: number;
  diameterMm?: number; // for drains / ducting
  isRelocatable: boolean;
  notes?: string;
}

export type ApplianceType =
  | 'refrigerator'
  | 'oven'
  | 'microwave'
  | 'hob'
  | 'hood'
  | 'dishwasher'
  | 'sink'
  | 'washing_machine'
  | 'dryer'
  | 'wine_cooler'
  | 'coffee_machine'
  | 'other';

export type ApplianceStatus = 'existing' | 'purchasing_new' | 'supplied_by_us';

export interface AppliancePayload {
  type: ApplianceType;
  status: ApplianceStatus;
  brandModel?: string;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  notes?: string;
}

export type MediaTag =
  | 'room_overview'
  | 'wall'
  | 'opening'
  | 'technical'
  | 'appliance'
  | 'defect';

export interface MediaAttachment {
  id: string;
  organizationId: string;
  storageKey: string; // Key in local IndexedDB blob store or remote Supabase Storage path
  storageProvider: 'local_indexeddb' | 'supabase_storage' | 's3';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  tag: MediaTag;
  caption?: string;
  widthPx?: number;
  heightPx?: number;
  createdAt: string;
}

export interface MeasurementNote {
  id: string;
  authorName?: string;
  text: string;
  tags?: string[];
  createdAt: string;
}

// Typed registry mapping entity types to their payloads
export interface EntityTypeMap {
  wall: WallPayload;
  opening: OpeningPayload;
  technical_point: TechnicalPointPayload;
  appliance: AppliancePayload;
}
