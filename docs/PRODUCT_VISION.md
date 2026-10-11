# Room-to-Production Platform — Product Vision

## 1. Executive Summary
**Room-to-Production Platform** is an independent digital operating thread for the custom furniture manufacturing and architectural millwork industry. 

Its mission is to transform real-world physical room information:
- Manual & laser measurements
- Room photos and videos
- Hand-drawn sketches & scribbled dimensions
- Customer requirements & constraints

into a **VERIFIED, CANONICAL digital representation of physical space** that powers downstream:
- Furniture design & spatial planning
- Material selection from provider-neutral catalogs
- Risk analysis & engineering validation
- Production preparation (panel cutting, edge banding, CNC machining)
- External manufacturing integrations (e.g. Viyar / ViyarPro, EGGER, CAD/CAM)

The first real user, design partner, and pilot testing company is **Firma YADIMA**.

---

## 2. The Core Problem
Custom, made-to-measure furniture commands high transaction values ($3,000 to $50,000+) but suffers from thin profit margins due to systemic handoff disconnects:
1. **Field Measurement Errors Discovered in Production**: Missing electrical feeds, unrecorded plumbing heights, out-of-square wall angles, or radiator projections discovered only during on-site installation, forcing expensive emergency re-cutting of cabinet fronts or cabinet box modifications.
2. **Loss of Source Provenance**: The "why" behind site dimensions is lost when paper sketches and unorganized phone photos fail to reach the CAD constructor.
3. **Double-Entry & Supplier Inefficiencies**: Manual transcription of dimensions and hardware into supplier software (like ViyarPro) generates costly clerical errors.
4. **Tight Coupling to Vendor Tools**: Existing software locks furniture makers into proprietary CAD systems or single-vendor ecosystems.

The platform eliminates these failure modes by capturing **ground-truth room reality at the point of origin**, verifying it before design begins, and carrying that verified digital thread straight through to manufacturing.

---

## 3. The Three Core Pillars of the Platform

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│   ROOM / SPATIAL MODEL  │      │  FURNITURE DESIGN MODEL │      │    PRODUCTION MODEL     │
│                         │      │                         │      │                         │
│  "What exists in the    │ ───► │  "What do we want to    │ ───► │  "How will the design   │
│   physical space?"      │      │   build in this space?" │      │   be manufactured?"     │
│                         │      │                         │      │                         │
│  - Site & Room          │      │  - Furniture Zones      │      │  - Panels & Parts       │
│  - Walls & Angles       │      │  - Cabinets & Modules   │      │  - Cutting Dimensions   │
│  - Openings & Niches    │      │  - Spatial Placement    │      │  - Edging Specifications│
│  - Utilities & Feeds    │      │  - Appliance Selection  │      │  - Drilling & Machining │
│  - Sketches & Photos    │      │  - Materials & Finishes │      │  - Supplier Mappings    │
│  - Verified Reality     │      │  - Customer Options     │      │  - Machine Code / Export│
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

1. **Room / Spatial Model**: Physical space ground truth. Completely independent of any furniture intended for the space.
2. **Furniture Design Model**: Planned cabinetry, modules, functional zones, appliances, and selected finishes.
3. **Production Model**: Millimeter-accurate manufacturing specifications, panel optimization, edge banding, and CNC instructions.

---

## 4. Canonical Internal Model & Ecosystem Neutrality
The platform strictly maintains **sovereignty over its internal domain data**:
- All projects, rooms, walls, furniture elements, and production specifications have immutable, internal UUIDs.
- External systems (EGGER, ViyarPro, AutoCAD, SketchUp, IMOS) are integrated via **isolated outward-facing adapters**.
- External identifiers (e.g. Viyar material codes, CAD block handles) are stored strictly as reference mappings and **never become primary internal keys**.

---

## 5. Potential Ecosystem Integrations (Long-Term Horizon)
1. **Material Manufacturers**: Direct decor & texture metadata (e.g. EGGER, Kronospan, Swiss Krono).
2. **Production & Processing Hubs**: Automated part imports and cutting orders (e.g. Viyar / ViyarPro).
3. **CAD/CAM & Constructor Systems**: Clean, structured geometric interchange (DXF, STEP, IFC, JSON).
4. **Visualization Engines**: Photorealistic client rendering pipelines.
5. **Customer Self-Design Interface**: Guided client configurator for initial lead qualification.
