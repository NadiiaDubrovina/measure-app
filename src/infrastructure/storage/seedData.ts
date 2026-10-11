import { Client } from '../../domain/types/client';
import { Project } from '../../domain/types/project';
import { Measurement } from '../../domain/types/measurement';
import { Room, MeasurementSession, DEFAULT_PROVENANCE } from '../../domain/types/spatial';

export const DEFAULT_ORG_ID = 'org-yadima-furniture-01';

export const SEED_CLIENTS: Client[] = [
  {
    id: 'client-001',
    organizationId: DEFAULT_ORG_ID,
    firstName: 'Anna',
    lastName: 'Kowalska',
    phone: '+48 501 234 567',
    email: 'anna.kowalska@example.com',
    preferredChannel: 'whatsapp',
    address: {
      street: 'ul. Marszałkowska 10/4',
      city: 'Warszawa',
      postalCode: '00-590',
      floor: 3,
      hasElevator: true,
      accessNotes: 'Code: 1234. Parking in the courtyard.'
    },
    notes: 'Expects premium custom cabinetry. High attention to corner joint lines.',
    createdAt: new Date('2026-08-20T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-20T10:00:00Z').toISOString()
  },
  {
    id: 'client-002',
    organizationId: DEFAULT_ORG_ID,
    firstName: 'Marek',
    lastName: 'Wiśniewski',
    phone: '+48 602 987 654',
    email: 'm.wisniewski@example.com',
    preferredChannel: 'phone',
    address: {
      street: 'al. Jana Pawła II 45/12',
      city: 'Warszawa',
      postalCode: '01-001',
      floor: 1,
      hasElevator: false,
      accessNotes: 'Old tenement building, high ceilings (~3400mm).'
    },
    notes: 'Needs hallway niche wardrobe and kitchen spatial measurement.',
    createdAt: new Date('2026-08-25T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-25T14:30:00Z').toISOString()
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'project-001',
    organizationId: DEFAULT_ORG_ID,
    clientId: 'client-001',
    name: 'Marszałkowska Modern Kitchen & Bath',
    status: 'MEASURED',
    notes: 'Full renovation, screed cured, tile backsplash line marked.',
    createdAt: new Date('2026-08-21T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-21T09:00:00Z').toISOString()
  },
  {
    id: 'project-002',
    organizationId: DEFAULT_ORG_ID,
    clientId: 'client-002',
    name: 'Jana Pawła Tenement Wardrobes',
    status: 'NEW_LEAD',
    notes: 'High ceiling niche wardrobe with sliding glass doors.',
    createdAt: new Date('2026-08-26T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-26T11:00:00Z').toISOString()
  }
];

export const SEED_ROOMS: Room[] = [
  {
    id: 'room-001',
    organizationId: DEFAULT_ORG_ID,
    projectId: 'project-001',
    name: 'Główna Kuchnia (Main Kitchen)',
    roomType: 'kitchen',
    floorLevelMm: 0,
    ceilingHeightMm: 2650,
    ceilingHeightMinMm: 2645,
    ceilingHeightMaxMm: 2655,
    floorCondition: 'finished_tile',
    notes: 'Floor tiles finished. Water feeds are fixed. Window sill projects 35mm from wall.',
    createdAt: new Date('2026-08-22T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-22T08:30:00Z').toISOString(),
    walls: [
      {
        id: 'wall-001',
        roomId: 'room-001',
        identifier: 'Wall A (Main Sink & Cooktop)',
        sequenceIndex: 0,
        lengthMm: 3450,
        lengthMiddleMm: 3452,
        lengthTopMm: 3448,
        heightLeftMm: 2650,
        heightRightMm: 2650,
        cornerAngleDeg: 90.0,
        material: 'concrete',
        notes: 'Reinforced concrete, good anchor pull-out resistance.',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'wall-002',
        roomId: 'room-001',
        identifier: 'Wall B (Window Side)',
        sequenceIndex: 1,
        lengthMm: 2800,
        lengthMiddleMm: 2805,
        lengthTopMm: 2798,
        heightLeftMm: 2650,
        heightRightMm: 2648,
        cornerAngleDeg: 88.5,
        plumbDeviationMm: -5,
        material: 'brick',
        notes: 'Corner A-B is 88.5° (acute angle). Needs filler strip on cabinet run.',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'wall-003',
        roomId: 'room-001',
        identifier: 'Wall C (Entrance & Tall Units)',
        sequenceIndex: 2,
        lengthMm: 3450,
        heightLeftMm: 2648,
        heightRightMm: 2650,
        cornerAngleDeg: 90.0,
        material: 'drywall_double',
        notes: 'Double drywall with OSB backing for upper cabinets.',
        provenance: DEFAULT_PROVENANCE
      }
    ],
    openings: [
      {
        id: 'opening-001',
        roomId: 'room-001',
        wallId: 'wall-002',
        wallIdentifier: 'Wall B (Window Side)',
        type: 'window',
        distanceFromCornerMm: 800,
        widthMm: 1200,
        heightMm: 1450,
        sillHeightMm: 860,
        projectionDepthMm: 35,
        notes: 'Window handle clearance: 110mm from sash bottom.',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'opening-002',
        roomId: 'room-001',
        wallId: 'wall-002',
        wallIdentifier: 'Wall B (Window Side)',
        type: 'radiator',
        distanceFromCornerMm: 850,
        widthMm: 1000,
        heightMm: 600,
        sillHeightMm: 150,
        projectionDepthMm: 120,
        notes: 'Radiator projection into room: 120mm.',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'opening-003',
        roomId: 'room-001',
        wallId: 'wall-003',
        wallIdentifier: 'Wall C (Entrance & Tall Units)',
        type: 'door',
        distanceFromCornerMm: 400,
        widthMm: 900,
        heightMm: 2100,
        notes: 'Pocket sliding door.',
        provenance: DEFAULT_PROVENANCE
      }
    ],
    utilityPoints: [
      {
        id: 'util-001',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'water_cold',
        distanceFromCornerMm: 1200,
        heightFromFloorMm: 550,
        depthProjectionMm: 40,
        isRelocatable: false,
        notes: 'Corner valve 1/2 inch',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'util-002',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'water_hot',
        distanceFromCornerMm: 1350,
        heightFromFloorMm: 550,
        depthProjectionMm: 40,
        isRelocatable: false,
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'util-003',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'drain_pipe',
        distanceFromCornerMm: 1280,
        heightFromFloorMm: 450,
        diameterMm: 50,
        depthProjectionMm: 50,
        isRelocatable: false,
        notes: 'Center of 50mm drain pipe',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'util-004',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'socket_400v',
        distanceFromCornerMm: 2500,
        heightFromFloorMm: 600,
        isRelocatable: false,
        notes: '3-phase cable box for induction cooktop',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'util-005',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'socket_230v',
        distanceFromCornerMm: 800,
        heightFromFloorMm: 1100,
        isRelocatable: false,
        notes: 'Double countertop outlet',
        provenance: DEFAULT_PROVENANCE
      },
      {
        id: 'util-006',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'socket_230v',
        distanceFromCornerMm: 1750,
        heightFromFloorMm: 300,
        isRelocatable: false,
        notes: 'Dishwasher dedicated socket',
        provenance: DEFAULT_PROVENANCE
      }
    ],
    structuralObstacles: [
      {
        id: 'obs-001',
        roomId: 'room-001',
        wallId: 'wall-001',
        wallIdentifier: 'Wall A (Main Sink & Cooktop)',
        type: 'pipe_riser',
        name: 'Wspólny pion kanalizacyjny (Main Pipe Riser)',
        distanceFromCornerMm: 50,
        widthMm: 180,
        depthMm: 180,
        heightMm: 2650,
        notes: 'Vertical building riser in corner A-B.'
      }
    ],
    sketches: [
      {
        id: 'sketch-001',
        roomId: 'room-001',
        mediaAttachmentId: 'media-sketch-001',
        storageKey: 'blobs/media-sketch-001',
        storageProvider: 'local_indexeddb',
        title: 'Szkic pomiarowy z natury (On-site hand sketch)',
        notes: 'Szkic z zaznaczonym kątem 88.5° i wymiarami pionu.',
        createdAt: new Date('2026-08-22T09:15:00Z').toISOString()
      }
    ],
    media: [
      {
        id: 'media-room-001',
        organizationId: DEFAULT_ORG_ID,
        storageKey: 'blobs/media-room-001',
        storageProvider: 'local_indexeddb',
        fileName: 'kuchnia-sciana-glowna.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 384000,
        tag: 'room_overview',
        caption: 'Widok na ścianę A z podejściami wody i 400V',
        createdAt: new Date('2026-08-22T09:20:00Z').toISOString()
      },
      {
        id: 'media-room-002',
        organizationId: DEFAULT_ORG_ID,
        storageKey: 'blobs/media-room-002',
        storageProvider: 'local_indexeddb',
        fileName: 'okno-grzejnik-naroznik.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 412000,
        tag: 'opening',
        caption: 'Parapet okienny i grzejnik na ścianie B',
        createdAt: new Date('2026-08-22T09:22:00Z').toISOString()
      }
    ]
  }
];

export const SEED_SESSIONS: MeasurementSession[] = [
  {
    id: 'session-001',
    organizationId: DEFAULT_ORG_ID,
    projectId: 'project-001',
    roomId: 'room-001',
    specialistName: 'Dima (Firma YADIMA)',
    measurementDate: '2026-08-22',
    status: 'COMPLETED',
    notes: 'Complete spatial verification. All critical feeds and angles measured.',
    observations: [
      'Laser measure calibrated: Leica DISTO D2',
      'Digital angle finder used for Wall A-B corner',
      'Client present during measurement visit'
    ],
    createdAt: new Date('2026-08-22T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-22T09:30:00Z').toISOString()
  }
];

// Preserved for backwards compatibility with existing UI
const kitchenObject = {
  id: 'obj-kitchen-001',
  measurementId: 'meas-001',
  objectTypeId: 'kitchen',
  name: 'Główny ciąg kuchenny & wyspa',
  status: 'COMPLETED' as const,
  sections: {
    general: {
      sectionId: 'general',
      parameters: {
        roomShape: 'L_shape',
        ceilingHeightMm: 2650,
        floorCondition: 'tiles_finished',
        wallMaterial: 'concrete',
        notes: 'Posadzka równa, kafle ułożone.'
      }
    },
    walls: {
      sectionId: 'walls',
      items: [
        {
          id: 'wall-item-1',
          entityType: 'wall',
          payload: {
            identifier: 'Ściana A (Zlewozmywak)',
            lengthMm: 3450,
            lengthMiddleMm: 3452,
            lengthTopMm: 3448,
            heightLeftMm: 2650,
            heightRightMm: 2650,
            cornerAngleDeg: 90.0
          }
        },
        {
          id: 'wall-item-2',
          entityType: 'wall',
          payload: {
            identifier: 'Ściana B (Okno)',
            lengthMm: 2800,
            lengthMiddleMm: 2805,
            lengthTopMm: 2798,
            heightLeftMm: 2650,
            heightRightMm: 2648,
            cornerAngleDeg: 88.5,
            plumbDeviationMm: -5
          }
        }
      ]
    }
  },
  media: [],
  notes: [],
  completeness: { score: 100, missing: [], warnings: [], ok: [] },
  createdAt: new Date('2026-08-22T08:30:00Z').toISOString(),
  updatedAt: new Date('2026-08-22T08:30:00Z').toISOString()
};

export const SEED_MEASUREMENTS: Measurement[] = [
  {
    id: 'meas-001',
    organizationId: DEFAULT_ORG_ID,
    projectId: 'project-001',
    specialistId: 'spec-01',
    specialistName: 'Dima (Firma YADIMA)',
    measurementDate: '2026-08-22',
    status: 'COMPLETED',
    generalNotes: 'Pomiary wykonane na budowie. Ściany proste, kąt w narożniku A-B to 88.5°.',
    overallCompletenessPct: 92,
    objects: [kitchenObject as any],
    createdAt: new Date('2026-08-22T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-22T08:30:00Z').toISOString()
  }
];
