import { Room, MeasurementSession } from '../types/spatial';
import { Client } from '../types/client';
import { Project } from '../types/project';
import { evaluateRoomCompleteness } from '../completeness/roomCompleteness';

export interface CanonicalRoomExportPackage {
  format: 'CANONICAL_ROOM_MEASUREMENT_PACKAGE';
  schemaVersion: '1.0.0';
  exportedAt: string;
  metadata: {
    sourcePlatform: 'Room-to-Production Platform';
    pilotPartner: 'Firma YADIMA';
    organizationId: string;
  };
  client: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: unknown;
  };
  project: {
    id: string;
    name: string;
    status: string;
  };
  session: {
    id: string;
    specialistName: string;
    measurementDate: string;
    status: string;
    notes?: string;
  };
  room: {
    id: string;
    name: string;
    roomType?: string;
    ceiling: {
      nominalMm: number;
      minMm?: number;
      maxMm?: number;
    };
    floorCondition: string;
    floorLevelMm?: number;
    wallsCount: number;
    walls: Array<{
      id: string;
      identifier: string;
      sequenceIndex: number;
      lengthMm: number;
      lengthMiddleMm?: number;
      lengthTopMm?: number;
      heightLeftMm?: number;
      heightRightMm?: number;
      cornerAngleDeg?: number;
      plumbDeviationMm?: number;
      material?: string;
      notes?: string;
    }>;
    openingsCount: number;
    openings: Array<{
      id: string;
      wallId?: string;
      wallIdentifier?: string;
      type: string;
      distanceFromCornerMm: number;
      widthMm: number;
      heightMm: number;
      sillHeightMm?: number;
      projectionDepthMm?: number;
      notes?: string;
    }>;
    utilitiesCount: number;
    utilities: Array<{
      id: string;
      wallId?: string;
      wallIdentifier?: string;
      type: string;
      distanceFromCornerMm: number;
      heightFromFloorMm: number;
      depthProjectionMm?: number;
      diameterMm?: number;
      isRelocatable?: boolean;
      notes?: string;
    }>;
    obstaclesCount: number;
    obstacles: Array<{
      id: string;
      name: string;
      type: string;
      wallIdentifier?: string;
      distanceFromCornerMm?: number;
      widthMm?: number;
      depthMm?: number;
      heightMm?: number;
      notes?: string;
    }>;
    sketchesCount: number;
    sketches: Array<{
      id: string;
      title?: string;
      storageKey: string;
      notes?: string;
      createdAt: string;
    }>;
    photosCount: number;
    photos: Array<{
      id: string;
      fileName: string;
      tag: string;
      caption?: string;
      storageKey: string;
      sizeBytes: number;
      mimeType: string;
    }>;
    generalNotes?: string;
  };
  validationSummary: {
    completenessScore: number;
    isReadyForDesign: boolean;
    missingItems: string[];
    warnings: string[];
    completedChecks: string[];
  };
}

export function buildCanonicalRoomExportPackage(
  room: Room,
  client?: Client | null,
  project?: Project | null,
  session?: MeasurementSession | null
): CanonicalRoomExportPackage {
  const completeness = evaluateRoomCompleteness(room);

  return {
    format: 'CANONICAL_ROOM_MEASUREMENT_PACKAGE',
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      sourcePlatform: 'Room-to-Production Platform',
      pilotPartner: 'Firma YADIMA',
      organizationId: room.organizationId
    },
    client: {
      id: client?.id || 'unknown_client',
      name: client ? `${client.firstName} ${client.lastName}` : 'Direct Client',
      phone: client?.phone || '',
      email: client?.email,
      address: client?.address
    },
    project: {
      id: project?.id || room.projectId,
      name: project?.name || 'On-Site Measurement Project',
      status: project?.status || 'MEASURED'
    },
    session: {
      id: session?.id || `session-${room.id}`,
      specialistName: session?.specialistName || 'Specialist',
      measurementDate: session?.measurementDate || new Date().toISOString(),
      status: session?.status || 'COMPLETED',
      notes: session?.notes
    },
    room: {
      id: room.id,
      name: room.name,
      roomType: room.roomType,
      ceiling: {
        nominalMm: room.ceilingHeightMm,
        minMm: room.ceilingHeightMinMm,
        maxMm: room.ceilingHeightMaxMm
      },
      floorCondition: room.floorCondition,
      floorLevelMm: room.floorLevelMm,
      wallsCount: room.walls.length,
      walls: room.walls.map(w => ({
        id: w.id,
        identifier: w.identifier,
        sequenceIndex: w.sequenceIndex,
        lengthMm: w.lengthMm,
        lengthMiddleMm: w.lengthMiddleMm,
        lengthTopMm: w.lengthTopMm,
        heightLeftMm: w.heightLeftMm,
        heightRightMm: w.heightRightMm,
        cornerAngleDeg: w.cornerAngleDeg,
        plumbDeviationMm: w.plumbDeviationMm,
        material: w.material,
        notes: w.notes
      })),
      openingsCount: room.openings.length,
      openings: room.openings.map(o => ({
        id: o.id,
        wallId: o.wallId,
        wallIdentifier: o.wallIdentifier,
        type: o.type,
        distanceFromCornerMm: o.distanceFromCornerMm,
        widthMm: o.widthMm,
        heightMm: o.heightMm,
        sillHeightMm: o.sillHeightMm,
        projectionDepthMm: o.projectionDepthMm,
        notes: o.notes
      })),
      utilitiesCount: room.utilityPoints.length,
      utilities: room.utilityPoints.map(u => ({
        id: u.id,
        wallId: u.wallId,
        wallIdentifier: u.wallIdentifier,
        type: u.type,
        distanceFromCornerMm: u.distanceFromCornerMm,
        heightFromFloorMm: u.heightFromFloorMm,
        depthProjectionMm: u.depthProjectionMm,
        diameterMm: u.diameterMm,
        isRelocatable: u.isRelocatable,
        notes: u.notes
      })),
      obstaclesCount: room.structuralObstacles.length,
      obstacles: room.structuralObstacles.map(ob => ({
        id: ob.id,
        name: ob.name,
        type: ob.type,
        wallIdentifier: ob.wallIdentifier,
        distanceFromCornerMm: ob.distanceFromCornerMm,
        widthMm: ob.widthMm,
        depthMm: ob.depthMm,
        heightMm: ob.heightMm,
        notes: ob.notes
      })),
      sketchesCount: room.sketches.length,
      sketches: room.sketches.map(s => ({
        id: s.id,
        title: s.title,
        storageKey: s.storageKey,
        notes: s.notes,
        createdAt: s.createdAt
      })),
      photosCount: room.media.length,
      photos: room.media.map(m => ({
        id: m.id,
        fileName: m.fileName,
        tag: m.tag,
        caption: m.caption,
        storageKey: m.storageKey,
        sizeBytes: m.sizeBytes,
        mimeType: m.mimeType
      })),
      generalNotes: room.notes
    },
    validationSummary: {
      completenessScore: completeness.score,
      isReadyForDesign: completeness.isReadyForDesign,
      missingItems: completeness.missing,
      warnings: completeness.warnings,
      completedChecks: completeness.completed
    }
  };
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
