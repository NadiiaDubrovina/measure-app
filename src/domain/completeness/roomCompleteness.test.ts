import assert from 'node:assert';
import test from 'node:test';
import { evaluateRoomCompleteness } from './roomCompleteness';
import { buildCanonicalRoomExportPackage } from '../export/roomJsonExporter';
import { Room, MeasurementSession, DEFAULT_PROVENANCE } from '../types/spatial';
import { Client } from '../types/client';
import { Project } from '../types/project';

test('Room Completeness: Empty room has 0% score and missing item reports', () => {
  const emptyRoom: Room = {
    id: 'room-empty',
    organizationId: 'org-test',
    projectId: 'proj-test',
    name: 'Kuchnia testowa',
    roomType: 'kitchen',
    floorCondition: 'finished_tile',
    walls: [],
    openings: [],
    utilityPoints: [],
    structuralObstacles: [],
    sketches: [],
    media: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const report = evaluateRoomCompleteness(emptyRoom);
  assert.strictEqual(report.score, 0);
  assert.strictEqual(report.isReadyForDesign, false);
  assert.ok(report.missing.some(msg => msg.toLowerCase().includes('walls missing')));
  assert.ok(report.missing.some(msg => msg.toLowerCase().includes('ceiling height missing')));
});

test('Room Completeness: Room with 1 wall generates warning and partial score', () => {
  const partialRoom: Room = {
    id: 'room-partial',
    organizationId: 'org-test',
    projectId: 'proj-test',
    name: 'Kuchnia częściowa',
    roomType: 'kitchen',
    ceilingHeightMm: 2600,
    floorCondition: 'finished_tile',
    walls: [
      {
        id: 'wall-1',
        roomId: 'room-partial',
        identifier: 'Ściana A',
        sequenceIndex: 0,
        lengthMm: 3200,
        heightMm: 2600,
        cornerAngleDeg: 90,
        material: 'concrete',
        provenance: DEFAULT_PROVENANCE
      }
    ],
    openings: [],
    utilityPoints: [],
    structuralObstacles: [],
    sketches: [],
    media: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const report = evaluateRoomCompleteness(partialRoom);
  assert.ok(report.score > 0);
  assert.ok(report.warnings.some(msg => msg.includes('Only 1 wall recorded')));
});

test('Room Completeness: Detects out-of-square corner angle warning', () => {
  const angledRoom: Room = {
    id: 'room-angled',
    organizationId: 'org-test',
    projectId: 'proj-test',
    name: 'Kuchnia z kątem rozwartym',
    roomType: 'kitchen',
    ceilingHeightMm: 2650,
    floorCondition: 'finished_tile',
    walls: [
      {
        id: 'wall-1',
        roomId: 'room-angled',
        identifier: 'Ściana A',
        sequenceIndex: 0,
        lengthMm: 3450,
        heightMm: 2650,
        cornerAngleDeg: 90,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'wall-2',
        roomId: 'room-angled',
        identifier: 'Ściana B',
        sequenceIndex: 1,
        lengthMm: 2800,
        heightMm: 2650,
        cornerAngleDeg: 88.5, // acute corner!
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'wall-3',
        roomId: 'room-angled',
        identifier: 'Ściana C',
        sequenceIndex: 2,
        lengthMm: 3450,
        heightMm: 2650,
        cornerAngleDeg: 91.5,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'wall-4',
        roomId: 'room-angled',
        identifier: 'Ściana D',
        sequenceIndex: 3,
        lengthMm: 2800,
        heightMm: 2650,
        cornerAngleDeg: 90,
        provenance: DEFAULT_PROVENANCE
      }
    ],
    openings: [],
    utilityPoints: [
      {
        id: 'u-1',
        roomId: 'room-angled',
        type: 'water_cold',
        distanceFromCornerMm: 1200,
        heightFromFloorMm: 550,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'u-2',
        roomId: 'room-angled',
        type: 'drain_pipe',
        distanceFromCornerMm: 1250,
        heightFromFloorMm: 450,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'u-3',
        roomId: 'room-angled',
        type: 'socket_400v',
        distanceFromCornerMm: 2200,
        heightFromFloorMm: 600,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'u-4',
        roomId: 'room-angled',
        type: 'socket_230v',
        distanceFromCornerMm: 800,
        heightFromFloorMm: 1100,
        provenance: DEFAULT_PROVENANCE
      }
    ],
    structuralObstacles: [],
    sketches: [
      {
        id: 'sketch-1',
        storageKey: 'sketch-key-1',
        title: 'Szkic odręczny A',
        createdAt: new Date().toISOString()
      }
    ],
    media: [
      {
        id: 'photo-1',
        storageKey: 'photos/photo-1.jpg',
        tag: 'room_overview',
        fileName: 'overview.jpg',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const report = evaluateRoomCompleteness(angledRoom);
  // Should flag the 88.5 deg corner angle
  assert.ok(report.warnings.some(msg => msg.includes('88.5°') && msg.includes('out of square')));
  // High completeness score (walls 35 + ceiling 15 + utilities 25 + media 25 = 100)
  assert.ok(report.score >= 80, `Expected score >= 80, got ${report.score}`);
  assert.strictEqual(report.isReadyForDesign, true);
});

test('Canonical Room JSON Export: Formats internal model into vendor-neutral schema', () => {
  const room: Room = {
    id: 'room-export-test',
    organizationId: 'org-yadima',
    projectId: 'proj-001',
    name: 'Kuchnia z wyspą',
    roomType: 'kitchen',
    ceilingHeightMm: 2700,
    floorCondition: 'finished_tile',
    walls: [
      {
        id: 'w-1',
        roomId: 'room-export-test',
        identifier: 'Ściana A',
        sequenceIndex: 0,
        lengthMm: 3600,
        heightMm: 2700,
        cornerAngleDeg: 90.0,
        material: 'brick',
        provenance: DEFAULT_PROVENANCE
      }
    ],
    openings: [
      {
        id: 'op-1',
        roomId: 'room-export-test',
        type: 'window',
        wallIdentifier: 'Ściana A',
        widthMm: 1200,
        heightMm: 1400,
        distanceFromCornerMm: 1000,
        sillHeightMm: 850,
        provenance: DEFAULT_PROVENANCE
      }
    ],
    utilityPoints: [
      {
        id: 'util-1',
        roomId: 'room-export-test',
        type: 'socket_230v',
        wallIdentifier: 'Ściana A',
        distanceFromCornerMm: 450,
        heightFromFloorMm: 1150,
        provenance: DEFAULT_PROVENANCE
      }
    ],
    structuralObstacles: [],
    sketches: [
      {
        id: 'sk-1',
        storageKey: 'sketches/sk-1.png',
        title: 'Oryginalny szkic ze spotkania',
        createdAt: new Date().toISOString()
      }
    ],
    media: [
      {
        id: 'photo-1',
        storageKey: 'photos/p-1.jpg',
        tag: 'wall',
        fileName: 'sciana_a.jpg',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z'
  };

  const client: Client = {
    id: 'client-001',
    organizationId: 'org-yadima',
    firstName: 'Marek',
    lastName: 'Nowak',
    phone: '+48 501 234 567',
    address: {
      street: 'ul. Dobra 12/8',
      city: 'Warszawa',
      postalCode: '00-388'
    },
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T10:00:00.000Z'
  };

  const project: Project = {
    id: 'proj-001',
    organizationId: 'org-yadima',
    clientId: 'client-001',
    name: 'Apartament Powiśle',
    status: 'MEASURED',
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T10:00:00.000Z'
  };

  const session: MeasurementSession = {
    id: 'session-001',
    roomId: 'room-export-test',
    status: 'COMPLETED',
    specialistName: 'Dymitr (Firma YADIMA)',
    measurementDate: '2026-09-21T10:00:00.000Z',
    notes: 'Klient planuje blat spiekany.',
    createdAt: '2026-09-21T10:00:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z'
  };

  const exportPayload = buildCanonicalRoomExportPackage(room, client, project, session);

  // Verify structure
  assert.strictEqual(exportPayload.format, 'CANONICAL_ROOM_MEASUREMENT_PACKAGE');
  assert.strictEqual(exportPayload.schemaVersion, '1.0.0');
  assert.strictEqual(exportPayload.room.id, 'room-export-test');
  assert.strictEqual(exportPayload.room.name, 'Kuchnia z wyspą');
  assert.strictEqual(exportPayload.room.ceiling.nominalMm, 2700);
  assert.strictEqual(exportPayload.room.walls.length, 1);
  assert.strictEqual(exportPayload.room.openings.length, 1);
  assert.strictEqual(exportPayload.room.utilities.length, 1);
  assert.strictEqual(exportPayload.room.sketches.length, 1);
  assert.strictEqual(exportPayload.room.photos.length, 1);

  // Check that photos & sketches store storageKey, not Base64
  assert.strictEqual(exportPayload.room.sketches[0].storageKey, 'sketches/sk-1.png');
  assert.ok(!exportPayload.room.sketches[0].storageKey.startsWith('data:image'));
  assert.strictEqual(exportPayload.room.photos[0].storageKey, 'photos/p-1.jpg');

  // Verify project context
  assert.strictEqual(exportPayload.client.name, 'Marek Nowak');
  assert.strictEqual(exportPayload.project.name, 'Apartament Powiśle');
  assert.strictEqual(exportPayload.session.specialistName, 'Dymitr (Firma YADIMA)');

  // Verify no vendor lock-in strings
  const jsonStr = JSON.stringify(exportPayload);
  assert.ok(!jsonStr.includes('ViyarPro'));
  assert.ok(!jsonStr.includes('EGGER_CODE'));
});
