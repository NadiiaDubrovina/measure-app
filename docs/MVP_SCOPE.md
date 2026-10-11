# Revised MVP v0.1 Scope: Smart Room Capture

## 1. The Core MVP Hypothesis
> **Core Question**: Can a furniture measurement specialist capture a real physical room accurately, quickly, and conveniently enough on a smartphone that the resulting structured data becomes immediately useful for downstream furniture design and constructor verification?

---

## 2. In Scope for MVP v0.1 (Physical Room Capture)

| Feature Area | Included in MVP v0.1 | Technical Implementation |
|---|---|---|
| **Platform Target** | Mobile-first responsive web app (smartphone primary on site, tablet/desktop in office). | React 18, TailwindCSS, Touch-optimized UI (≥48px touch targets, numeric keypads). |
| **Local-First Durability** | 100% offline functionality in basements, raw concrete sites, or zero-connectivity zones. | IndexedDB repositories (`IMeasurementRepository`, `IRoomRepository`). |
| **Multi-Tenancy Readiness** | Single active local organization (Firma YADIMA), but all entities scoped by `organizationId`. | Domain aggregate roots carry `organizationId`. |
| **Customer & Project Flow** | Rapid customer, site address, and project selection or on-the-fly creation on site. | `Client`, `Site`, `Project` entities in local storage. |
| **Room Definition** | Create and manage one or more physical rooms per project (e.g. "Main Kitchen", "Master Bedroom"). | Dedicated `Room` entity (independent from furniture). |
| **Physical Wall Capture** | Record perimeter walls, lengths (base, mid, top), ceiling heights, corner angles, and tilt/plumb. | `Wall` entities with dimensional checks. |
| **Openings & Niches** | Record doors, windows, window sills, niches, radiator projections, and architectural bulkheads. | `Opening` entities mapped to wall references. |
| **Utility & Technical Feeds** | Record exact $(X, Y)$ locations of electrical sockets (230V/400V), water feeds, drains, gas, ventilation ducts. | `UtilityPoint` entities mapped to wall references. |
| **Hand-Drawn Sketches** | First-class sketch upload/photo capture. Preserves original drawing without discarding binary. | `SourceSketch` with metadata and binary reference. |
| **Room Photos & Media** | Multi-photo capture tagged by room, wall, or defect. Zero Base64 strings in JSON records. | Native binary `Blob` store in IndexedDB (`IMediaStorageService`). |
| **Completeness Engine** | Instant deterministic score (0–100%) and missing-critical-data alerts before leaving the property. | Weighted rule analyzer evaluating missing utilities, unclosed perimeters, and non-square corners. |
| **Provenance Tracking** | Track origin of every captured element (`manual_laser`, `photo`, `sketch_derived`, `user_correction`). | `Provenance` metadata embedded on spatial entities. |
| **Structured JSON Export** | Export canonical project & room measurement package for designers and constructors. | `IRoomExportAdapter` producing clean, versioned JSON. |
| **Schematic 2D Preview** | Simple derived SVG/Canvas 2D floor plan preview derived from verified wall dimensions (non-blocking). | Derived view rendered strictly from structured room data. |

---

## 3. Explicitly Deferred / Out of Scope for MVP v0.1

| Capability | Rationale for Exclusion in MVP v0.1 | Planned Phase |
|---|---|---|
| **Automated AI Recognition** | AI detection models must be trained and verified against real human data; human capture must work first. | Phase 3 |
| **Interactive 3D Room Viewer** | High development cost; 2D dimensional accuracy is what constructors need first. | Phase 2 / 3 |
| **Material Catalog & Decor Selection** | Premature before physical room data structure is established and field-tested. | Phase 3 |
| **Furniture Module CAD / Part Generation** | Downstream step that consumes verified room data; room capture must come first. | Phase 2 / 4 |
| **Live ViyarPro API Integration** | Official API access must be formally confirmed; file-based export adapter used first. | Phase 4 |
| **Panel Cutting / Nesting Optimization** | Belongs to manufacturing preparation, not site measurement capture. | Phase 4 |
| **Customer Self-Design Portal** | Specialist workflow must be proven with Firma YADIMA before opening to consumers. | Phase 5 |
| **Cloud Sync / Remote Supabase Backend** | Field UX and data validation must be perfected locally before cloud infrastructure costs. | Phase 2 |
