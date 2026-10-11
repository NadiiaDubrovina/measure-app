import { MediaAttachment } from './subEntities';

export type SourceType =
  | 'manual_laser'
  | 'manual_tape'
  | 'photo_derived'
  | 'hand_drawn_sketch'
  | 'file_imported'
  | 'ai_detected'
  | 'user_corrected';

export interface Provenance {
  sourceType: SourceType;
  sourceRefId?: string;       // References MediaAttachment.id or SourceSketch.id
  confidenceScore?: number;   // 0.00 to 1.00 (if AI detected)
  verificationStatus: 'unverified' | 'confirmed' | 'corrected' | 'rejected';
  verifiedBy?: string;        // Specialist user ID / name
  verifiedAt?: string;        // ISO timestamp
  correctionNotes?: string;
}

export const DEFAULT_PROVENANCE: Provenance = {
  sourceType: 'manual_laser',
  verificationStatus: 'confirmed',
  verifiedAt: new Date().toISOString()
};

export type WallMaterial =
  | 'concrete'
  | 'brick'
  | 'drywall_single'
  | 'drywall_double'
  | 'aerated_concrete'
  | 'unknown';

export interface Wall {
  id: string;
  roomId: string;
  identifier: string;         // e.g. "Wall A", "Wall B (Window side)"
  sequenceIndex: number;      // 0, 1, 2... clockwise around perimeter
  lengthMm: number;           // Floor-level base measurement
  lengthMiddleMm?: number;    // Bow/convexity check at ~1000mm
  lengthTopMm?: number;       // Ceiling level check
  heightLeftMm?: number;
  heightRightMm?: number;
  cornerAngleDeg?: number;    // Measured angle to next wall (e.g. 90.0, 88.5)
  plumbDeviationMm?: number;  // Vertical tilt over 2000mm (+ lean out, - lean in)
  material?: WallMaterial;
  notes?: string;
  provenance?: Provenance;
}

export type OpeningType =
  | 'window'
  | 'door'
  | 'niche'
  | 'radiator'
  | 'column'
  | 'beam'
  | 'pipe_riser'
  | 'other';

export interface Opening {
  id: string;
  roomId: string;
  wallId?: string;            // ID of associated wall
  wallIdentifier?: string;    // e.g. "Wall A"
  type: OpeningType;
  distanceFromCornerMm: number; // Linear distance along wall baseline from left corner
  widthMm: number;
  heightMm: number;
  sillHeightMm?: number;      // Distance from floor to bottom sill (windows, radiators)
  projectionDepthMm?: number; // Inward/outward projection (radiators, sills, niches)
  notes?: string;
  provenance?: Provenance;
}

export type UtilityType =
  | 'socket_230v'
  | 'socket_400v'
  | 'switch'
  | 'water_cold'
  | 'water_hot'
  | 'drain_pipe'
  | 'gas_pipe'
  | 'ventilation_duct'
  | 'thermostat'
  | 'underfloor_heating_box'
  | 'other';

export interface UtilityPoint {
  id: string;
  roomId: string;
  wallId?: string;
  wallIdentifier?: string;
  type: UtilityType;
  distanceFromCornerMm: number; // Distance along wall baseline
  heightFromFloorMm: number;    // Height above floor
  depthProjectionMm?: number;   // Projection from wall surface
  diameterMm?: number;          // e.g. 50mm drain, 125mm duct
  isRelocatable?: boolean;
  notes?: string;
  provenance?: Provenance;
}

export type ObstacleType =
  | 'column'
  | 'beam'
  | 'pipe_riser'
  | 'bulkhead'
  | 'chimney'
  | 'meter_box'
  | 'other';

export interface StructuralObstacle {
  id: string;
  roomId: string;
  wallId?: string;
  wallIdentifier?: string;
  type: ObstacleType;
  name: string;               // e.g. "Main Vent Shaft", "Corner Column"
  distanceFromCornerMm?: number;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  notes?: string;
}

export interface SourceSketch {
  id: string;
  roomId: string;
  mediaAttachmentId: string;  // References stored binary Blob in IMediaStorageService
  storageKey: string;         // e.g. "blobs/sketch-12345.jpg"
  storageProvider: string;
  title?: string;             // e.g. "Initial Room Hand Sketch"
  notes?: string;
  createdAt: string;
}

export type FloorCondition =
  | 'finished_tile'
  | 'finished_wood'
  | 'raw_screed'
  | 'slanted'
  | 'other';

export interface Room {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;               // e.g. "Main Kitchen", "Master Bedroom"
  roomType?: string;          // Optional classification metadata (e.g. 'kitchen', 'bathroom', 'hallway')
  floorLevelMm?: number;      // Datum offset from site zero
  ceilingHeightMm: number;    // Nominal ceiling height
  ceilingHeightMinMm?: number;
  ceilingHeightMaxMm?: number;
  floorCondition: FloorCondition;
  walls: Wall[];
  openings: Opening[];
  utilityPoints: UtilityPoint[];
  structuralObstacles: StructuralObstacle[];
  sketches: SourceSketch[];
  media: MediaAttachment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MeasurementSessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';

export interface MeasurementSession {
  id: string;
  organizationId: string;
  projectId: string;
  roomId: string;
  specialistName: string;
  measurementDate: string;    // ISO string
  status: MeasurementSessionStatus;
  notes?: string;
  observations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomCompletenessReport {
  score: number;              // 0 - 100%
  isReadyForDesign: boolean;
  missing: string[];          // Critical missing items
  warnings: string[];         // Quality warnings (e.g. out of square angle)
  completed: string[];        // Verified sections
}
