import {
  MediaAttachment,
  MeasurementNote,
  EntityTypeMap,
  WallPayload,
  OpeningPayload,
  TechnicalPointPayload,
  AppliancePayload
} from './subEntities';

export type FurnitureObjectTypeId =
  | 'kitchen'
  | 'bathroom_cabinet'
  | 'wardrobe'
  | 'hallway'
  | 'living_room'
  | 'other';

export type RoomShape =
  | 'straight'
  | 'L_shape'
  | 'U_shape'
  | 'alcove'
  | 'island'
  | 'other';

export type FloorCondition = 'level' | 'slanted' | 'screed' | 'tiles_finished';
export type WallMaterial = 'brick' | 'concrete' | 'drywall_single' | 'drywall_double' | 'aerated_concrete';

export interface CompletenessReport {
  score: number; // 0 - 100
  missing: string[];
  warnings: string[];
  ok: string[];
}

export interface RepeatableItem<T = unknown> {
  id: string;
  entityType: string; // e.g. 'wall', 'opening', 'technical_point', 'appliance'
  payload: T;
}

export interface SectionData {
  sectionId: string;
  parameters?: Record<string, unknown>;
  items?: RepeatableItem[];
}

export interface FurnitureObject {
  id: string;
  measurementId: string;
  objectTypeId: string; // References FurnitureObjectTemplate.id
  name: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
  sections: Record<string, SectionData>; // Keyed by section_id from template
  media: MediaAttachment[];             // Metadata references only (zero Base64)
  notes: MeasurementNote[];
  completeness: CompletenessReport;
  createdAt: string;
  updatedAt: string;
}

// Ergonomic, type-safe domain helpers
export function getSectionParameters<T extends Record<string, unknown>>(
  object: FurnitureObject,
  sectionId: string
): T {
  return (object.sections[sectionId]?.parameters as T) || ({} as T);
}

export function getSectionItems<K extends keyof EntityTypeMap>(
  object: FurnitureObject,
  sectionId: string,
  _entityType: K
): Array<RepeatableItem<EntityTypeMap[K]>> {
  const sec = object.sections[sectionId];
  if (!sec || !sec.items) return [];
  return sec.items as Array<RepeatableItem<EntityTypeMap[K]>>;
}

// Quick typed convenience accessors
export function getWalls(object: FurnitureObject): Array<RepeatableItem<WallPayload>> {
  return getSectionItems(object, 'walls', 'wall');
}

export function getOpenings(object: FurnitureObject): Array<RepeatableItem<OpeningPayload>> {
  return getSectionItems(object, 'openings', 'opening');
}

export function getTechnicalPoints(object: FurnitureObject): Array<RepeatableItem<TechnicalPointPayload>> {
  return getSectionItems(object, 'technical', 'technical_point');
}

export function getAppliances(object: FurnitureObject): Array<RepeatableItem<AppliancePayload>> {
  return getSectionItems(object, 'appliances', 'appliance');
}
