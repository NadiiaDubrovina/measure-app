# Product Roadmap & Phasing

## Overview
To deliver rapid value while ensuring long-term architectural stability, the platform roadmap is divided into 9 clear phases.

---

### Phase 1: Smart Measurement MVP (CURRENT)
- **Objective**: Replace handwritten measurement sheets with a mobile-first digital workflow on smartphone.
- **Deliverables**:
  - Offline-first web application (IndexedDB persistence).
  - Multi-object measurements (Kitchen, Bathroom Cabinet, Wardrobe, Other).
  - Hybrid `FurnitureObject` with provisional configuration templates.
  - Native binary `Blob` photo storage in IndexedDB (zero Base64 in JSON).
  - Deterministic completeness engine with actionable checklists.
  - Measurement summary view and structured JSON/printable export.

---

### Phase 2: Cloud Persistence, Authentication & Project CRM
- **Objective**: Centralized database and multi-device access for furniture teams.
- **Deliverables**:
  - Supabase integration (PostgreSQL with Row-Level Security, Supabase Auth).
  - Full Client database (addresses, contact methods, preferences, project history).
  - Multi-tenant organization support (`organization_id` enforcement).
  - Cloud media synchronization (Supabase Storage for high-res field photos).

---

### Phase 3: AI Measurement Analysis & Constructor Package
- **Objective**: Automated risk detection and constructor preparation.
- **Deliverables**:
  - LLM-assisted completeness analysis (identifying missing dimensions or clearances).
  - Computer vision photo analysis (verifying outlet locations against measured coordinates).
  - Automatic generation of "Questions for Client" and "Constructor Notes".
  - Voice memo transcription into structured notes.

---

### Phase 4: Designer / Constructor Integration
- **Objective**: Seamless handoff to CAD/CAM software.
- **Deliverables**:
  - Importers/exporters for popular furniture CAD tools (IMOS, bCAD, SketchUp).
  - 2D room dimension layout preview and wall elevation visualization.
  - Revision tracking for design changes.

---

### Phase 5: Supplier & Viyar Integration
- **Objective**: Automated materials sourcing and board cutting orders.
- **Deliverables**:
  - Viyar supplier adapter: board materials, edge bands, milling operations, Blum hardware.
  - Direct calculation of supplier part costs.
  - Generation and export of production files.

---

### Phase 6: Project Lifecycle Management
- **Objective**: Full end-to-end status tracking from order to warranty.
- **Deliverables**:
  - Dynamic project Kanban pipeline (`MEASURED` -> `DESIGN` -> `PRODUCTION` -> `INSTALLATION`).
  - Installation scheduling and installer punch-list checklist.
  - Post-installation warranty and complaint resolution tickets.

---

### Phase 7: Client Portal
- **Objective**: Transparent customer communication and self-service.
- **Deliverables**:
  - Client web login to view project progress, 3D renderings, and documents.
  - Digital quote approval and change requests.

---

### Phase 8: Guided Furniture Configurator
- **Objective**: Self-service client design tool.
- **Deliverables**:
  - Step-by-step room layout selection (dimensions, modules, finish styles).
  - Catalog-driven door styles, countertop materials, and handles.
  - Automatic conversion of client design into a platform `Project` ready for measurement.

---

### Phase 9: Real-Time Visualization & Dynamic Pricing Engine
- **Objective**: Interactive 3D and dynamic cost estimations.
- **Deliverables**:
  - WebGL / Three.js 3D room preview with realistic textures.
  - Multi-tiered pricing engine (materials + machining + margin + installation).
  - Instant budget estimates for client configurations.
