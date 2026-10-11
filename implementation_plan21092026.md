# Room-to-Production Platform — Architecture Evolution Review

## Executive Summary
This architectural review formalizes the evolution of the software from a bespoke measurement application for a single company into an independent, provider-neutral **Room-to-Production Platform**.

The platform transforms raw physical reality (measurements, photos, videos, hand-drawn sketches) into a **VERIFIED canonical digital representation of physical space** that powers downstream furniture design, material selection, risk validation, and manufacturing preparation (e.g. Viyar / ViyarPro, EGGER, CAD/CAM). **Firma YADIMA** serves as the initial real-world pilot testing partner.

In accordance with safety principles:
- No application code has been rewritten.
- No existing working functionality has been deleted.
- No destructive migrations are performed.
- All recommendations are organized into **[A. REQUIRED NOW]**, **[B. PREPARE ARCHITECTURALLY NOW, IMPLEMENT LATER]**, and **[C. FUTURE ENTERPRISE CAPABILITIES]**.

---

## 1. Assessment of the Currently Approved Architecture

### Strengths to Preserve
1. **Modular Monolith & Clean Architecture**: Clean separation between domain, application, infrastructure, and UI. No unnecessary microservice complexity.
2. **Multi-Tenant Foundation**: All aggregate roots carry `organizationId`. Multi-organization isolation is native to the schema.
3. **Local-First Reliability**: Offline-first IndexedDB repository guarantees instant performance in raw concrete sites and cell dead-zones.
4. **Native Binary Media Storage**: Media metadata is decoupled from raw binary files via `IMediaStorageService`. Zero Base64 strings inside domain records.
5. **Declarative Template Engine**: Configuration-driven forms (`SectionDefinition`, `FieldDefinition`) allow UI adaptability without schema migrations.
6. **Ports & Adapters**: External systems are strictly isolated behind abstract ports.

### Structural Gaps in the Previous Model
- **Conflation of Physical Space & Furniture Design**: In the previous MVP design, `FurnitureObject` encapsulated `walls`, `openings`, and `technical_points`. In reality, a physical wall or electrical outlet belongs to the **Room**, not to an individual cabinet run.
- **Absence of Provenance & AI Safety**: Dimensions did not record whether they came from a laser measure, a photo, a hand-drawn sketch, or an AI prediction.
- **Direct Coupling Risk**: Potential future risk of coupling internal entity IDs to external supplier SKUs (e.g. Viyar product IDs or EGGER decor codes).

---

## 2. Components That Remain Unchanged

| Component | Status | Rationale |
|---|---|---|
| **Multi-Tenancy Foundation** | Unchanged | `organizationId` scoping remains on all aggregates. |
| **Local-First Repository Pattern** | Unchanged | Browser-native IndexedDB engine (`fp_db`) preserves zero-latency field operation. |
| **Native Media Blob Store** | Unchanged | Dedicated IndexedDB store (`fp_media_blobs`) handles photos, videos, and sketches as raw Blobs. |
| **Mobile-First Tech Stack** | Unchanged | React 18, Vite, TypeScript, TailwindCSS with touch-first controls (≥48px targets). |
| **Dynamic Section & Field Form Engine** | Unchanged | Reusable for both room-level checklists and furniture module parameters. |
| **Deterministic Completeness Engine** | Unchanged | Instant rule-based scoring without cloud latency or AI hallucination risk. |

---

## 3. Components That Require Refactoring (Room-to-Production Separation)

| Current Implementation | Required Refactoring | Target Architecture Tier |
|---|---|---|
| `FurnitureObject` owns `walls`, `openings`, and `technical_points`. | Move `Wall`, `Opening`, and `UtilityPoint` to a dedicated `Room` aggregate. | **Tier A: Room / Spatial Model** |
| `Measurement` directly holds `objects: FurnitureObject[]`. | `MeasurementSession` attaches to a `Room` and records observations about the physical space. | **Tier A: Room / Spatial Model** |
| `FurnitureObject` represents both room measurement and furniture concept. | `FurnitureObject` is repositioned into the design domain, representing planned cabinetry placed in a room. | **Tier B: Furniture Design Model** |
| Media attachments are tagged simply as photos. | Distinguish `SourceSketch` (hand-drawn paper drawings) as a first-class spatial input. | **Tier A: Room / Spatial Model** |

---

## 4. Domain Entity Review (Now vs Later)

| Entity | Owning Module | Purpose | Status |
|---|---|---|---|
| `Organization` | Shared / Identity | Multi-tenant tenant boundary. | **[A. REQUIRED NOW]** |
| `Client` | CRM | Customer contact & communication channel. | **[A. REQUIRED NOW]** |
| `Site` | Projects / CRM | Property address, floor, elevator, access codes. | **[A. REQUIRED NOW]** |
| `Project` | Projects | Project container holding rooms and lifecycle states. | **[A. REQUIRED NOW]** |
| `Room` | Spatial Model | Canonical physical space (dimensions, ceiling, floor). | **[A. REQUIRED NOW]** |
| `Wall` | Spatial Model | Physical perimeter wall, lengths, heights, angles. | **[A. REQUIRED NOW]** |
| `Opening` | Spatial Model | Doors, windows, sills, niches, radiator projections. | **[A. REQUIRED NOW]** |
| `UtilityPoint` | Spatial Model | Sockets (230V/400V), water feeds, drains, HVAC. | **[A. REQUIRED NOW]** |
| `StructuralObstacle` | Spatial Model | Columns, beams, pipe risers, ceiling bulkheads. | **[A. REQUIRED NOW]** |
| `MeasurementSession` | Measurement | On-site visit tracking observations and tools used. | **[A. REQUIRED NOW]** |
| `SourceSketch` | Media & Provenance | Hand-drawn paper sketch with binary preservation. | **[A. REQUIRED NOW]** |
| `MediaAttachment` | Media | Binary photo/video reference with tag and caption. | **[A. REQUIRED NOW]** |
| `Provenance` | Shared / Audit | Tracks source, confidence score, and human verification. | **[A. REQUIRED NOW]** |
| `ValidationIssue` | Quality & Validation | Missing dimension alerts, collision risks, warnings. | **[A. REQUIRED NOW]** |
| `FurnitureDesign` | Furniture Design | Planned furniture layout aggregate for a room. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `FurnitureObject` | Furniture Design | Specific planned furniture piece (island, tall run). | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `FurnitureRequirement`| Furniture Design | Client functional requests (e.g. 60cm dishwasher). | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `MaterialDefinition` | Materials | Provider-neutral decor and board definition. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `SupplierProductMapping`| Materials | Mappings to supplier SKUs (e.g. Viyar product IDs). | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `MaterialSelection` | Materials | Project-level finish choices (carcass, fronts). | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `DetectedElement` | AI Safety | Provisional AI proposal requiring human confirmation. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `ProjectVersion` | Versioning | Immutable snapshot freeze of verified room + design. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `ProductionSpecification`| Production | Bill of materials, cutting dimensions, edge banding. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `PartItem` | Production | Individual panel cutting and edging instructions. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `MachiningInstruction`| Production | CNC drilling, hinge boring, and grooving operations. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `ExportJob` | Integrations | Outbound packaging job (.dxf, .xml, .project, JSON). | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `ExternalIdentifier` | Integrations | Bidirectional vendor ID mapping table. | **[B. PREPARE ARCHITECTURALLY NOW]** |
| `ClientSelfDesign` | Client Experience | Consumer-facing guided configurator session. | **[C. FUTURE ENTERPRISE]** |

---

## 5. Revised Relationship Across Core Models

```
┌─────────────────────────────────────────────────────────────┐
│                 CANONICAL ROOM / SPATIAL MODEL              │
│  Site ──► Room ──► [Walls, Openings, Utilities, Obstacles]  │
│             ▲                                               │
│             │ measured by                                   │
│  MeasurementSession ──► [Observations, Sketches, Photos]    │
└──────────────────────────────┬──────────────────────────────┘
                               │ provides verified space to
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FURNITURE DESIGN MODEL                    │
│  FurnitureDesign ──► [FurnitureObjects, Requirements]       │
│  (references Wall IDs, bounds along walls, appliance slots) │
│             │                                               │
│             │ uses                                          │
│             ▼                                               │
│  MaterialSelection ──► MaterialDefinition (Provider-Neutral)│
└──────────────────────────────┬──────────────────────────────┘
                               │ transformed into
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION MODEL                       │
│  ProductionSpecification ──► [PartItems, Machining, Edging] │
│  (maps internal materials to SupplierProductMappings)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ exported via
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONNECTOR / EXPORT                      │
│  ViyarPro (.project / .xml) | Generic DXF | Canonical JSON  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Proposed Module Boundaries (Modular Monolith)

1. **`shared`**: Multi-tenant anchors (`Organization`), `User`, `Provenance`, base result types.
2. **`crm`**: `Client`, communication preferences, relationship history.
3. **`projects`**: `Project`, `Site`, project-level lifecycle states.
4. **`spatial`** *(Core MVP v0.1)*: `Room`, `Wall`, `Opening`, `UtilityPoint`, `StructuralObstacle`.
5. **`measurement`** *(Core MVP v0.1)*: `MeasurementSession`, observation logging, completeness rules.
6. **`media`** *(Core MVP v0.1)*: `MediaAttachment`, `SourceSketch`, `IMediaStorageService` (IndexedDB Blobs).
7. **`design`** *(Phase 2)*: `FurnitureDesign`, `FurnitureObject`, `FurnitureRequirement`.
8. **`materials`** *(Phase 3)*: `MaterialDefinition`, `SupplierProductMapping`, `MaterialSelection`.
9. **`ai_safety`** *(Phase 3)*: `DetectedElement`, human verification pipeline, confidence thresholds.
10. **`production`** *(Phase 4)*: `ProductionSpecification`, `PartItem`, `MachiningInstruction`.
11. **`connectors`** *(Phase 4)*: `IProductionExportConnector`, `IMaterialCatalogConnector`.
12. **`versioning`** *(Cross-Cutting)*: `ProjectVersion`, immutable milestone snapshots.

---

## 7. Canonical Room Model Specification

```typescript
export interface Room {
  id: string;                         // Stable internal UUID
  organizationId: string;
  projectId: string;
  name: string;                       // e.g. "Main Kitchen"
  roomType: 'kitchen' | 'bathroom' | 'wardrobe_room' | 'living_room' | 'hallway' | 'other';
  floorLevelMm?: number;              // Datum offset from site benchmark (+0.000)
  ceilingHeightMm: number;            // Nominal ceiling height
  ceilingHeightMinMm?: number;        // Lowest point if ceiling slopes
  ceilingHeightMaxMm?: number;
  floorCondition: 'finished_tile' | 'finished_wood' | 'raw_screed' | 'slanted';
  walls: Wall[];
  structuralObstacles?: StructuralObstacle[];
  createdAt: string;
  updatedAt: string;
}

export interface Wall {
  id: string;
  roomId: string;
  identifier: string;                 // e.g. "Wall A"
  sequenceIndex: number;              // 0, 1, 2... clockwise around perimeter
  lengthBaseMm: number;               // Measured at floor
  lengthMiddleMm?: number;            // Measured at 1000mm height
  lengthTopMm?: number;               // Measured at ceiling
  heightLeftMm: number;
  heightRightMm: number;
  cornerAngleDeg?: number;            // Angle to next wall (e.g. 90.0°, 88.5°)
  plumbDeviationMm?: number;          // Tilt over 2000mm (+ lean out, - lean in)
  material: 'concrete' | 'brick' | 'drywall_single' | 'drywall_double' | 'aerated_concrete' | 'unknown';
  openings: Opening[];
  utilityPoints: UtilityPoint[];
  provenance: Provenance;
}
```

---

## 8. Provenance & AI Recognition Safety Model

### Provenance Tracking
Every physical measurement and detected element carries origin metadata:
```typescript
export interface Provenance {
  sourceType: 'manual_laser' | 'manual_tape' | 'photo_derived' | 'hand_drawn_sketch' | 'file_imported' | 'ai_detected' | 'user_corrected';
  sourceRefId?: string;               // References MediaAttachment.id or SourceSketch.id
  confidenceScore?: number;           // 0.00 to 1.00 (if AI detected)
  verificationStatus: 'unverified' | 'confirmed' | 'corrected' | 'rejected';
  verifiedBy?: string;                // Specialist User ID
  verifiedAt?: string;
  correctionNotes?: string;
}
```

### Three Decoupled State Machines
1. **Room Verification State**:
   $$\text{DRAFT} \to \text{MEASUREMENT\_IN\_PROGRESS} \to \text{AI\_PROCESSED} \to \text{HUMAN\_REVIEW\_REQUIRED} \to \mathbf{\text{ROOM\_VERIFIED}}$$
2. **Furniture Design State**:
   $$\text{CONCEPT} \to \text{IN\_REVIEW} \to \mathbf{\text{CLIENT\_APPROVED}} \to \text{DESIGN\_FROZEN}$$
3. **Production Export State**:
   $$\text{UNPREPARED} \to \text{SPEC\_GENERATED} \to \mathbf{\text{READY\_FOR\_EXPORT}} \to \text{EXPORTED}$$

> [!CAUTION]
> Production export strictly requires `roomVerificationState === 'ROOM_VERIFIED'`. AI-detected spatial elements cannot silently proceed to manufacturing.

---

## 9. Provider-Neutral Material Catalog Model

```
Tier 1: Manufacturer Material (EGGER H1180 ST37 Halifax Oak Natural)
  │
  ▼ mapped to
Tier 2: Supplier Product (Viyar Chipboard 18mm, SKU 59281)
  │
  ▼ selected for
Tier 3: Project Material Selection ("Lower Cabinet Fronts")
  │
  ▼ allocated to
Tier 4: Production Specification (Part #04, 716 x 596 x 18 mm + 1mm ABS edge)
```
- Core material records (`MaterialDefinition`) never mention Viyar or regional distributors.
- Mappings (`SupplierProductMapping`) are maintained in a separate relation, enabling multi-supplier sourcing.

---

## 10. Connector & Export Interfaces

```typescript
export interface IProductionExportConnector {
  readonly connectorId: string;       // e.g. "viyar_pro_file_exporter"
  readonly supportedFormats: string[];// [".project", ".dxf", ".xml", ".json"]
  generateExportPackage(spec: ProductionSpecification): Promise<ExportPackageResult>;
}

export interface IDesignSoftwareAdapter {
  exportRoomDxf(room: Room): Promise<Blob>;
  exportRoomJson(room: Room): Promise<string>;
}
```

### Unverified ViyarPro Integration Questions to Formally Confirm
1. Does Viyar officially support direct API access, or are `.project` / `.dxf` / `.xml` file imports the only standard route?
2. What is the official XML / schema definition for machining operations (hinge boring, grooves)?
3. What are Viyar's strict naming conventions for edge banding and grain orientation codes?

---

## 11. Database & Local-Storage Migration Impact

### Zero Destructive Migrations
- The IndexedDB database (`furniture_platform_db`) will add new object stores: `rooms`, `sites`, and `sketches`.
- The existing `measurements` and `furniture_objects` stores are preserved.
- When an existing measurement is opened, a migration adapter maps legacy embedded walls into the canonical `Room` entity without data loss.

---

## 12. Security & Tenant Isolation Impact
- Every aggregate root (`Client`, `Project`, `Site`, `Room`, `FurnitureDesign`, `ProductionSpecification`, `MediaAttachment`) carries an `organizationId`.
- Local IndexedDB storage operates for the active organization. In Phase 2, Supabase Row-Level Security (RLS) policies will enforce `auth.uid() -> organization_id` at the database level.

---

## 13. Versioning Approach
Instead of high-complexity event sourcing, we adopt **milestone snapshot versioning**:
- A `ProjectVersion` record freezes the complete state of `Room[]`, `FurnitureDesign`, and `MaterialSelection[]`.
- Stored as an immutable JSON snapshot upon reaching milestone gates:
  - Gate 1: `ROOM_VERIFIED` (Signed-off field measurement)
  - Gate 2: `DESIGN_FROZEN` (Client commercial approval)
  - Gate 3: `READY_FOR_EXPORT` (Production release)

---

## 14. Phased Evolution Plan

| Phase | Milestone Name | Scope |
|---|---|---|
| **Phase 1 (MVP v0.1)** | **Smart Room Capture** | Physical room, walls, openings, utilities, photos, sketches, completeness check, offline storage. |
| **Phase 2** | **Furniture Spatial Planning** | FurnitureDesign layer, zones, modules, CAD DXF/JSON export, desktop review. |
| **Phase 3** | **Materials & AI Safety Gate** | Provider-neutral material catalog, AI sketch/photo interpretation proposals with human review. |
| **Phase 4** | **Production & Manufacturing** | Part generation, edge banding, CNC instructions, ViyarPro export connectors. |
| **Phase 5** | **Client Experience & SaaS** | Multi-tenant admin, client guided configurator, cloud sync. |

---

## 15. Risks & Open Questions

1. **On-Site User Experience Friction**: Specialists have limited time on site. Room capture UI must require fewer than 3 taps per measurement.
2. **Room Polygon vs Local Wall Coordinates**: Utility points must be recorded as linear distance along a wall ($X$) and height from floor ($Y$) so the specialist does not need to compute global $(X, Y, Z)$ coordinates in their head.
3. **ViyarPro Format Verification**: We must verify Viyar's actual `.project` or `.xml` format with Firma YADIMA before writing export code.

---

## 16. Recommended Revised MVP v0.1 Backlog

- [ ] **Sprint 1: Canonical Spatial Domain**: Introduce `Room`, `Wall`, `Opening`, `UtilityPoint`, `Site` types alongside existing entities.
- [ ] **Sprint 2: Spatial Local-First Repositories**: Implement `IndexedDbRoomRepository` and backward-compatible migration adapter.
- [ ] **Sprint 3: Mobile Room Measurement UI**: Build touch-optimized room & wall capture forms with numeric keypads.
- [ ] **Sprint 4: Hand-Drawn Sketch & Media Capture**: Add dedicated sketch photo upload with annotation tagging.
- [ ] **Sprint 5: Spatial Completeness Engine**: Implement room-level completeness validation (missing utilities, out-of-square angles).
- [ ] **Sprint 6: Canonical JSON Export**: Generate clean room measurement package for designers.
- [ ] **Sprint 7 (Optional/Low Risk)**: Simple 2D schematic SVG floor plan preview derived from verified walls.

---

## 17. Architecture Decision Records (ADRs) Summary

- **ADR 010**: Three-Tier Domain Separation (Room vs Furniture Design vs Production).
- **ADR 011**: Canonical Internal Model with Decoupled External Identifiers.
- **ADR 012**: First-Class Hand-Drawn Sketches & Source Provenance Tracking.
- **ADR 013**: AI Detection Safety Gate & Decoupled Verification State Machines.
- **ADR 014**: 4-Tier Provider-Neutral Material Catalog Architecture.

---

### Implementation Gate
In accordance with your instructions, **no broad application code changes have been executed**. This document and its associated architecture files are submitted for your formal review and approval.
