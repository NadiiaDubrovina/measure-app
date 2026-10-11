# Measurement Domain & Configuration Engine

## 1. Core Architectural Principle: Provisional Templates
**CRITICAL ARCHITECTURAL DIRECTIVE**: All measurement templates and field lists currently implemented in Phase 1 (Kitchen, Bathroom Cabinet, Wardrobe, etc.) are **provisional field hypotheses**. They have not yet been battle-tested with an active professional furniture installer in the field.

Therefore:
1. The domain architecture must **never depend** on a static list of fields or hardcoded object properties.
2. Templates are declarative configuration objects that can be adjusted, reorganized, or extended in minutes without modifying database tables or core domain structures.
3. Completeness rules are configuration-driven rather than hardcoded logic.

---

## 2. Dynamic Template & Section Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 FurnitureObjectTemplate                     │
│  - id: 'kitchen' | 'wardrobe' | 'bathroom_cabinet' | ...    │
│  - name: string                                             │
│  - icon: string                                             │
│  - sections: SectionDefinition[]                            │
│  - completenessRules: CompletenessRuleDefinition[]          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Scalar Parameter Section    │    │  Repeatable Collection Sec.  │
│  - section_type: 'parameters'│    │  - section_type: 'collection'│
│  - fields: FieldDefinition[] │    │  - entity_type: 'wall' | ... │
│  - e.g. room shape, ceiling  │    │  - min_items, max_items      │
└──────────────────────────────┘    └──────────────────────────────┘
```

### Template Definition Schema

```typescript
export type SectionKind = 'parameters' | 'collection';

export interface FieldDefinition {
  id: string;                         // e.g. "ceiling_height_mm"
  label: string;                      // e.g. "Ceiling Height"
  type: 'numeric' | 'select' | 'text' | 'boolean' | 'segmented';
  unit?: string;                      // e.g. "mm", "°"
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  quickPresets?: number[];            // e.g. [2500, 2600, 2700, 2800]
  helperText?: string;
}

export interface SectionDefinition {
  id: string;                         // e.g. "general", "walls", "utilities"
  title: string;
  shortLabel: string;
  icon: string;
  kind: SectionKind;
  weight: number;                     // Weight for completeness calculation
  // If kind === 'parameters':
  fields?: FieldDefinition[];
  // If kind === 'collection':
  entityType?: 'wall' | 'opening' | 'technical_point' | 'appliance' | 'custom_item';
  minItems?: number;
}

export interface FurnitureObjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: SectionDefinition[];
  completenessRules?: {
    requiredEntityTypes?: string[];   // e.g. ['water_cold', 'drain_pipe']
    requiredAppliances?: string[];
    angleCheckEnabled?: boolean;
  };
}
```

---

## 3. Initial Provisional Templates (Field Hypotheses)

### A. Kitchen Hypothesis
- **Hypothesized Sections**:
  - `general` (parameters: room shape, ceiling height, floor condition, wall construction)
  - `walls` (collection: walls with corner angles, lengths, plumb deviations)
  - `openings` (collection: windows with sill heights, radiators with projection depth)
  - `technical` (collection: 400V stove feed, 230V sockets, cold/hot water, drain, exhaust duct)
  - `appliances` (collection: cooktop, oven, hood, dishwasher, fridge, sink)
  - `media` & `notes`

### B. Bathroom Cabinet Hypothesis
- **Hypothesized Sections**:
  - `general` (parameters: alcove width, tile boundary height, floor level)
  - `walls` (collection: boundary dimensions)
  - `technical` (collection: hot/cold water, drain pipe height/diameter, mirror light wire)
  - `appliances` (collection: basin type, faucet type, siphon clearance)
  - `media` & `notes`

### C. Wardrobe Hypothesis
- **Hypothesized Sections**:
  - `general` (parameters: alcove vs straight, crown molding, baseboard depth)
  - `walls` (collection: widths at bottom/mid/top, ceiling slope, depth)
  - `openings` (collection: door swings, bulkheads)
  - `technical` (collection: enclosed outlets, switches, LED transformer feed)
  - `media` & `notes`

---

## 4. Measurement Assumptions Requiring Validation with the Specialist

Before freezing any template structure, the following 8 critical assumptions must be reviewed with the furniture installer:

| Assumption ID | Measurement Area | Initial System Hypothesis | What Must Be Validated with Specialist |
|---|---|---|---|
| **VAL-01** | **Datum & Coordinate Origin** | Technical points & openings are measured as `distanceFromCornerMm` along Wall A. | Do specialists measure from the nearest corner, from a single global origin (e.g. Room 0,0), or relative to adjacent cabinetry modules? |
| **VAL-02** | **Vertical Reference Datum** | Heights are measured from the floor at the point of measurement (`heightFromFloorMm`). | If the room has an unfinished screed or uneven floor slope, do installers measure from the physical floor or use a laser level reference line (e.g. +1.000m datum mark on wall)? |
| **VAL-03** | **Corner Angles & Squareness** | Specialists measure corner angles in degrees (e.g. 88.5°) using a digital angle gauge. | Do they actually carry digital angle finders, or do they measure the diagonal hypotenuse (3-4-5 triangle method)? |
| **VAL-04** | **Wall Bowing / Twist** | Wall length is measured primarily at the base, with optional middle/top checks. | For wardrobes and tall cabinetry, is measuring 3 widths (floor, 1.2m, ceiling) and 2 depths standard, or is a single width plus plumb check enough? |
| **VAL-05** | **Appliance Knowledge on Site** | Specialists record specific appliance models and exact dimensions during measurement. | How often does the homeowner already have exact appliance models purchased vs needing standard 600mm / 450mm module placeholders? |
| **VAL-06** | **Plumbing Trap & Waste Pipe** | Drain height is measured to the center of the pipe outlet. | Do installers need center-to-floor, bottom-to-floor, or pipe projection distance from the wall (to avoid drawer bottom interference)? |
| **VAL-07** | **Room Perimeter vs Object Walls** | Each Furniture Object defines its own walls. | If a kitchen and a hallway wardrobe are in the same open space, is it faster to measure the full room perimeter once, or measure each furniture zone independently? |
| **VAL-08** | **Window Sill & Sash Clearance** | Windows record sill height and radiator projection. | Do specialists need the window sash opening radius / handle clearance to prevent faucets from blocking the window? |

---

## 5. Deterministic Completeness Engine

The completeness engine evaluates templates flexibly by iterating over defined sections:

$$\text{Score} = \frac{\sum_{s \in \text{Sections}} \text{Weight}_s \times \text{Completeness}(s)}{\sum_{s \in \text{Sections}} \text{Weight}_s} \times 100\%$$

- **For `parameters` sections**: Ratio of required fields populated.
- **For `collection` sections**: Ratio of minimum items met + presence of required entity types (e.g. water feed).
- **Quality Warnings**: Explicit checks for out-of-square angles ($<88.5^\circ$ or $>91.5^\circ$), plumb deviations, or missing sill heights.
