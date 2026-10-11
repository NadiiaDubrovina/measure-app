# Architectural Decision Records (ADRs)

## ADR 001: Modular Monolith vs. Microservices
- **Status**: Accepted
- **Context**: The Furniture Platform will eventually handle CRM, measurements, CAD export, supplier ordering, and client configurator.
- **Decision**: Build as a Modular Monolith.
- **Rationale**: Microservices introduce operational overhead, deployment complexity, and distributed transaction issues that slow down early iteration. Strict domain boundaries within a single codebase allow easy extraction later if needed.

---

## ADR 002: Polymorphic `FurnitureObject` vs. Rigid Tables
- **Status**: Accepted
- **Context**: Furniture projects contain varied objects (kitchens, wardrobes, bathroom vanities).
- **Decision**: Model `FurnitureObject` as a polymorphic aggregate with configuration-driven templates rather than a dedicated table for each object type.
- **Rationale**: Hardcoding a `kitchen_measurements` table leads to rigid code that breaks when adding new furniture types. A polymorphic model with configuration templates allows adding furniture types without altering the core database schema.

---

## ADR 003: Repeatable Sub-Entities vs. Fixed Columns
- **Status**: Accepted
- **Context**: Rooms contain variable numbers of walls, windows, outlets, and appliances.
- **Decision**: Treat walls, openings, technical points, appliances, and media as normalized repeatable collections.
- **Rationale**: Fixed columns (`window_1`, `socket_2`) are an anti-pattern that fails in complex spaces and complicates dynamic rendering and completeness calculations.

---

## ADR 004: Local-First IndexedDB for Phase 1 MVP
- **Status**: Accepted
- **Context**: On-site measurements frequently occur in basements, concrete shells, or buildings with poor connectivity.
- **Decision**: Use a repository pattern backed by browser IndexedDB for Phase 1.
- **Rationale**: Guarantees zero latency, complete offline durability, and immediate usability without setting up remote database infrastructure or API keys. Switching to Supabase in Phase 2 requires changing only the repository implementation.

---

## ADR 005: Deterministic Completeness Engine vs. AI LLM in Phase 1
- **Status**: Accepted
- **Context**: Specialists need immediate feedback on whether a measurement is complete.
- **Decision**: Implement a deterministic weighted rules engine in Phase 1.
- **Rationale**: Rule-based checks are instant, 100% offline, explainable, and zero-cost. An `IAiMeasurementAnalysisEngine` interface is prepared so AI can complement or replace it in Phase 3 without UI changes.

---

## ADR 006: Ports & Adapters for External Ecosystems (Viyar, CAD)
- **Status**: Accepted
- **Context**: Integration with Viyar and CAD software is critical in the long term, but exact specifications are not yet verified.
- **Decision**: Isolate integrations behind `IDesignSoftwareAdapter` and `ISupplierAdapter` ports. Do not invent proprietary endpoints.
- **Rationale**: Prevents accidental coupling to speculative API designs and allows multiple supplier or CAD implementations in the future.

---

## ADR 007: Hybrid `FurnitureObject` Model vs. Rigid Properties
- **Status**: Accepted
- **Context**: Different furniture objects have wildly different physical measurement parameters. Hardcoding properties like `walls`, `appliances`, and `technical_points` directly onto `FurnitureObject` couples the core model to kitchen cabinetry assumptions.
- **Decision**: Adopt a Hybrid Model:
  1. `FurnitureObject` retains a neutral core identity (`id`, `measurementId`, `objectTypeId`, `name`, `status`, `completeness`, `media`, `notes`).
  2. Measurement sections and sub-entities are stored inside a flexible dictionary `sections: Record<string, SectionData>`.
  3. A compile-time `EntityTypeMap` registry preserves strong typing for known sub-entities (`WallPayload`, `OpeningPayload`, `TechnicalPointPayload`, etc.) while allowing new section types to be introduced without modifying the container structure.
- **Rationale**: Offers the agility of document-style dynamic sections while retaining TypeScript compile-time safety and IDE autocomplete.

---

## ADR 008: Native Binary Blob Storage for Media vs. Base64 Embedding
- **Status**: Accepted
- **Context**: Field measurements include multiple high-resolution photos of rooms, plumbing, and defects. Embedding them as Base64 strings inside domain records causes severe performance degradation, memory spikes, and 33% size inflation.
- **Decision**: Decouple media metadata from binary storage:
  1. `MediaAttachment` in the domain holds only metadata (`id`, `storageKey`, `mimeType`, `sizeBytes`, `tag`, `caption`).
  2. Binary data is stored in native `Blob` / `File` format via a dedicated `IMediaStorageService` port.
  3. Phase 1 stores native Blobs in a dedicated IndexedDB ObjectStore (`fp_media_blobs`). Phase 2 migrates to Supabase Storage or S3.
- **Rationale**: Keeps JSON records lightweight, prevents main thread freezing, and provides a direct migration path to cloud object storage.

---

## ADR 009: Provisional Status of Phase 1 Measurement Templates
- **Status**: Accepted
- **Context**: Field measurement procedures vary among craftsmen and have not yet been observed directly on-site with the professional installer.
- **Decision**: Formally categorize all Phase 1 templates (Kitchen, Bathroom Cabinet, Wardrobe) as provisional hypotheses. All field assumptions must be validated against real installer workflows before standardization.
- **Rationale**: Prevents premature optimization and over-engineering of fields that may differ in actual field practice.

---

## ADR 010: Three-Tier Domain Separation (Room vs Furniture Design vs Production)
- **Status**: Accepted
- **Context**: Conflating physical room reality (walls, windows, plumbing) with planned furniture (cabinet runs, modules) or manufacturing details (panel cutting, CNC drilling) creates rigid schemas that break when rooms contain multiple furniture pieces or when designs change without physical space changes.
- **Decision**: Enforce strict separation into three distinct canonical sub-domains:
  1. **Room / Spatial Model**: Physical space reality ("What exists in the physical space?"). Owned by `Room`, `Wall`, `Opening`, `UtilityPoint`.
  2. **Furniture Design Model**: Planned cabinetry and spatial requirements ("What do we want to build in this space?"). Owned by `FurnitureDesign`, `FurnitureObject`, `FurnitureRequirement`.
  3. **Production Model**: Manufacturing specifications ("How will the design be manufactured?"). Owned by `ProductionSpecification`, `PartItem`, `MachiningInstruction`.
- **Rationale**: Physical room dimensions remain stable ground truth even as furniture designs undergo client revisions. Production specifications can be regenerated for different suppliers without altering the approved spatial design.

---

## ADR 011: Canonical Internal Model with Decoupled External Identifiers
- **Status**: Accepted
- **Context**: Integrating with material suppliers (e.g. EGGER) and manufacturing hubs (e.g. Viyar / ViyarPro) risks polluting internal domain entities with vendor-specific IDs, schemas, and lifecycle constraints.
- **Decision**: All internal aggregates (`Project`, `Room`, `FurnitureObject`, `MaterialDefinition`, `ProductionSpecification`) use immutable internal UUIDs. External identifiers (e.g. Viyar material code `12345`, EGGER decor code `H1180 ST37`) are stored strictly in an `ExternalIdentifierMapping` table and accessed through adapter interfaces.
- **Rationale**: Guarantees complete vendor neutrality. If a supplier changes its API or SKU numbering, internal platform records remain completely unaffected.

---

## ADR 012: First-Class Hand-Drawn Sketches & Source Provenance Tracking
- **Status**: Accepted
- **Context**: On-site furniture specialists frequently scribble dimensions on hand-drawn paper plans. Discarding the sketch or treating it as an unindexed photo loses the primary audit source if a dimension is questioned later.
- **Decision**: Elevate hand-drawn sketches to first-class domain entities (`SourceSketch`). Every spatial measurement and detected element carries a `Provenance` block tracking its origin (`manual_laser`, `photo`, `hand_drawn_sketch`, `ai_detected`, `user_correction`), source reference, and human verification status.
- **Rationale**: Preserves an auditable paper trail from physical site to digital plan, enabling designers to verify questionable dimensions against the specialist's original sketch.

---

## ADR 013: AI Detection Safety Gate (Decoupled Verification State Machines)
- **Status**: Accepted
- **Context**: Future computer vision or multimodal AI may detect room boundaries, electrical points, and plumbing from photos or sketches. If AI detections silently become production data, manufacturing mistakes will occur.
- **Decision**: AI detections are treated as provisional proposals (`DetectedElement`). No AI detection may influence furniture design or production export without explicit human confirmation. Furthermore, project progress is governed by three decoupled state machines:
  1. `RoomVerificationState`: `DRAFT` -> `MEASUREMENT_IN_PROGRESS` -> `AI_PROCESSED` -> `HUMAN_REVIEW_REQUIRED` -> `ROOM_VERIFIED`.
  2. `FurnitureDesignState`: `CONCEPT` -> `IN_REVIEW` -> `CLIENT_APPROVED` -> `DESIGN_FROZEN`.
  3. `ProductionExportState`: `UNPREPARED` -> `SPEC_GENERATED` -> `READY_FOR_EXPORT` -> `EXPORTED`.
- **Rationale**: Prevents conflating spatial accuracy with client commercial approval. Guarantees that only human-verified physical dimensions are used for manufacturing exports.

---

## ADR 014: 4-Tier Provider-Neutral Material Catalog Architecture
- **Status**: Accepted
- **Context**: Directly binding a furniture cabinet to a specific supplier SKU (e.g. a specific Viyar stock item) breaks when switching suppliers or when a client specifies a generic manufacturer decor (e.g. EGGER Halifax Oak) that must be sourced across different regional distributors.
- **Decision**: Model materials across four distinct tiers:
  $$\text{Manufacturer Material} \to \text{Supplier Product} \to \text{Project Material Selection} \to \text{Production Specification}$$
- **Rationale**: Enables neutral client presentations and multi-supplier sourcing while retaining exact part-level bill-of-materials and cutting code at the production export stage.

