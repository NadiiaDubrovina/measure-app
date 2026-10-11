# Room-to-Production Platform — System Architecture

## 1. Architectural Philosophy: Modular Monolith
The platform is engineered as a **Modular Monolith** adhering to **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

Microservices are explicitly avoided at this stage. A well-designed modular monolith provides:
- Single deployment unit and zero inter-service network latency.
- Strict compile-time interface enforcement between domain, application, and infrastructure layers.
- Simple, predictable local-first testing and offline operation.
- Clear module boundaries that can be decomposed into independent services in the future if high-scale demands require it.

---

## 2. The Three-Tier Canonical Domain Architecture

To prevent conceptual mixing, the domain is organized into three strictly separated tiers:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          1. ROOM / SPATIAL MODEL                          │
│               "What exists in the physical space?" (Ground Truth)         │
│  - Site, Room, Walls, Angles, Ceilings, Floors                            │
│  - Openings (Doors, Windows, Niches, Radiator Projections)                │
│  - UtilityPoints (Electrical 230V/400V, Water, Drains, Gas, Ventilation)   │
│  - Structural Obstacles & Protrusions                                     │
│  - Measurements & Observations (Manual Laser, Tape)                       │
│  - Raw Media: Photos, Videos, Hand-Drawn Sketches                         │
│  - AI-Detected Elements (Provisional, requires Human Confirmation)        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Referenced by ID
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        2. FURNITURE DESIGN MODEL                          │
│          "What do we want to build in this space?" (Planning)             │
│  - FurnitureDesign (The aggregate layout for a room)                      │
│  - FurnitureObject (Cabinetry runs, islands, wardrobes, vanities)         │
│  - Zones & Modules (Base units, tall units, wall cabinets)                │
│  - Customer Requirements & Functional Constraints                         │
│  - Planned Appliances & Fixture Allocations                               │
│  - Material Selections (Provider-neutral decors & textures)               │
│  - Hardware & Fitting Requirements                                        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Transformed into
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           3. PRODUCTION MODEL                             │
│       "How will the approved design be manufactured?" (Execution)         │
│  - ProductionSpecification (Bill of Materials & Cutting Jobs)             │
│  - PartItems (Panels, fronts, shelves with millimeter cutting dimensions) │
│  - EdgeBanding Specifications (0.8mm, 1mm, 2mm ABS application)            │
│  - Machining & CNC Instructions (Drilling patterns, hinge bores, grooves) │
│  - Supplier Mappings (Viyar, EGGER, Blum catalog references)              │
│  - Export Job Packages (.dxf, .xml, .project, structured JSON)            │
└───────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **No Direct Model Conflation**: Physical room reality (`Wall`, `UtilityPoint`, `Opening`) is never embedded inside a planned `FurnitureObject`. A `FurnitureObject` merely references the wall or zone where it is placed.

---

## 3. Canonical Internal Model & Adapter Boundaries

The platform owns its canonical project, room, furniture, and production data:
- **Stable Internal UUIDs**: Every aggregate root and sub-entity uses immutable internal UUIDs.
- **Vendor Neutrality**: The internal model never imports or directly depends on EGGER, Viyar, or proprietary CAD schemas.
- **External Identifier Mapping**: Vendor codes (e.g. Viyar product IDs, EGGER decor codes) are maintained in a dedicated `ExternalIdentifierMapping` structure.
- **Outward-Facing Connectors**: All external integrations connect via standardized adapter ports.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                               Domain Core                                │
│        (Room Model, Furniture Design, Production Specs, Materials)        │
│                       STABLE INTERNAL UUIDs ONLY                          │
└───────────┬───────────────────┬───────────────────┬───────────────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
│  Data Persistence Port│ │ Media Storage Port│ │ Integration Connectors│
│  (IRoomRepository,    │ │ (IMediaStorageSvc)│ │ (IProductionExport,   │
│   IMeasurementRepo)   │ │                   │ │  IMaterialCatalog)    │
└───────────┬───────────┘ └─────────┬─────────┘ └───────────┬───────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
│ IndexedDBAdapter (P1) │ │ IndexedDBBlobStore│ │ GenericJsonExport (P1)│
│ SupabaseAdapter (P2)  │ │ SupabaseStorageP2 │ │ ViyarProConnector(P4)│
└───────────────────────┘ └───────────────────┘ └───────────────────────┘
```

---

## 4. Module Boundaries in the Monolith

```
src/
├── domain/
│   ├── spatial/          # Room, Wall, Opening, UtilityPoint, Site
│   ├── measurement/      # MeasurementSession, Observation, Provenance
│   ├── media/            # MediaAttachment, SourceSketch, IMediaStorageService
│   ├── design/           # FurnitureDesign, FurnitureObject, Requirements
│   ├── materials/        # MaterialDefinition, SupplierMapping, Decor
│   ├── production/       # ProductionSpecification, PartItem, Machining
│   ├── validation/       # Completeness, ValidationIssue, VerificationState
│   └── shared/           # Organization, User, Common Types
├── application/
│   ├── spatial/          # CaptureRoomWall, AddUtilityPoint, VerifyRoom
│   ├── measurement/      # StartSession, SaveDraft, RecordObservation
│   ├── design/           # PlanFurnitureObject, AssignMaterial
│   └── export/           # GenerateRoomPackage, GenerateProductionPackage
├── infrastructure/
│   ├── storage/          # IndexedDbRoomRepo, IndexedDbMediaStorage
│   └── connectors/       # GenericJsonExporter, (Future ViyarProConnector)
└── ui/
    ├── components/       # TouchKeypad, VisualChecklist, PhotoCapture
    └── views/            # RoomOverview, WallEditor, UtilityPointEditor
```

---

## 5. Media & Hand-Drawn Sketch Architecture
1. **Zero Base64 in JSON Records**: All binary assets (photos, videos, sketches) are stored as native `Blob` / `File` objects in an isolated IndexedDB store (`furniture_platform_media_db`).
2. **First-Class Hand-Drawn Sketches**: Sketches (`SourceSketch`) preserve the original image binary alongside spatial annotations and extracted dimensions. Source images are never discarded after digital extraction.
3. **Decoupled URL Lifecycle**: The UI uses `URL.createObjectURL` with explicit memory cleanup via `URL.revokeObjectURL`.

---

## 6. AI Recognition Safety Gate & Decoupled State Machines
Future AI detections (doors, sockets, walls) must never silently reach production. The lifecycle is separated into three independent state machines:

1. **Room Verification State**:
   $$\text{DRAFT} \to \text{MEASUREMENT\_IN\_PROGRESS} \to \text{AI\_PROCESSED} \to \text{HUMAN\_REVIEW\_REQUIRED} \to \mathbf{\text{ROOM\_VERIFIED}}$$
2. **Furniture Design State**:
   $$\text{CONCEPT} \to \text{IN\_REVIEW} \to \mathbf{\text{CLIENT\_APPROVED}} \to \text{DESIGN\_FROZEN}$$
3. **Production Export State**:
   $$\text{UNPREPARED} \to \text{SPEC\_GENERATED} \to \mathbf{\text{READY\_FOR\_EXPORT}} \to \text{EXPORTED}$$

> [!CAUTION]
> A project can only transition to `READY_FOR_EXPORT` when `ROOM_VERIFIED` is true. Unverified AI spatial elements cannot be used for production exports.
