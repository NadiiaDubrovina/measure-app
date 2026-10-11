# Future Integrations & Adapter Architecture

## 1. Architectural Guardrails
**CRITICAL PRINCIPLE**: No external API formats (Viyar, CAD systems, AI services) may be invented or coupled directly to the core domain. All external communications must pass through strictly defined **Ports** (TypeScript interfaces) implemented by **Adapters**.

---

## 2. Ports & Adapters Overview

```
                        ┌──────────────────────────────┐
                        │      Core Domain Model       │
                        └──────────────┬───────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  IDesignAdapter  │          │ ISupplierAdapter │          │  IAiAnalyzer     │
│      (Port)      │          │      (Port)      │          │      (Port)      │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                             │
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ JsonDesignAdapter│          │  ViyarAdapter    │          │DeterministicCheck│
│  (Structured P1) │          │  (Future Phase 5)│          │  (Phase 1 Engine)│
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

---

## 3. Design Software Integration (`IDesignSoftwareAdapter`)

### The Problem
Furniture projects transition from on-site measurement to professional CAD/CAM constructors (e.g., IMOS, bCAD, SketchUp, Cabinet Vision). Each software uses different formats (DXF, XML, JSON, CSV).

### The Port
```typescript
export interface MeasurementExportPackage {
  schemaVersion: '1.0';
  projectMetadata: {
    projectId: string;
    projectName: string;
    clientName: string;
    siteAddress: string;
    measuredAt: string;
    specialistName: string;
  };
  objects: Array<{
    id: string;
    type: string;
    name: string;
    generalParameters: Record<string, unknown>;
    walls: unknown[];
    openings: unknown[];
    technicalPoints: unknown[];
    appliances: unknown[];
    mediaLinks: Array<{ storageKey: string; tag: string; caption?: string }>;
    notes: string[];
    completenessScore: number;
    riskWarnings: string[];
  }>;
}

export interface IDesignSoftwareAdapter {
  exportPackage(measurement: unknown): Promise<MeasurementExportPackage>;
}
```

### Phase 1 Implementation
- `JsonDesignAdapter`: Produces clean, validated JSON conforming to `MeasurementExportPackage`. This enables immediate import into CAD automation scripts or manual review by constructors without waiting for proprietary vendor SDKs.

---

## 4. Supplier & Materials Integration: Viyar (`ISupplierAdapter`)

### The Problem
Viyar is a leading Eastern European supplier and manufacturing ecosystem for board cutting, edge banding, milling, hardware (Blum, Hettich), and facades. Integrating with Viyar requires mapping platform parts to Viyar catalog codes and production orders.

### The Port
```typescript
export interface SupplierProductQuery {
  category: 'board' | 'edge' | 'hardware' | 'facade' | 'countertop';
  searchQuery?: string;
  brand?: string;
}

export interface SupplierProduct {
  supplierId: string;         // e.g. "viyar-12345"
  name: string;
  sku: string;
  priceEstimateNet: number;
  currency: string;
  inStock: boolean;
}

export interface BillOfMaterialsItem {
  partName: string;
  materialSupplierId: string;
  dimensionsMm: { length: number; width: number; thickness: number };
  edgeBandingSides: { top?: string; bottom?: string; left?: string; right?: string };
  millingOperations?: string[];
  quantity: number;
}

export interface ISupplierAdapter {
  readonly supplierName: string;
  searchCatalog(query: SupplierProductQuery): Promise<SupplierProduct[]>;
  validateBOM(items: BillOfMaterialsItem[]): Promise<{ valid: boolean; errors: string[] }>;
  exportProductionOrder?(items: BillOfMaterialsItem[]): Promise<{ orderRef: string }>;
}
```

### Phase 1 Guardrail
No fake Viyar API endpoints are called or mocked in Phase 1. The architecture defines the `ISupplierAdapter` contract so that when Viyar's exact specification is investigated in Phase 5, a `ViyarAdapter` can be plugged in cleanly.

---

## 5. Future AI Measurement Analysis (`IAiMeasurementAnalysisEngine`)

```typescript
export interface MeasurementRiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  anomaliesDetected: Array<{
    severity: 'critical' | 'warning' | 'info';
    location: string;
    message: string;
    suggestedAction: string;
  }>;
  questionsForClient: string[];
  questionsForConstructor: string[];
}

export interface IAiMeasurementAnalysisEngine {
  analyze(measurement: unknown): Promise<MeasurementRiskAssessment>;
}
```
In Phase 1, `DeterministicCompletenessAnalyzer` fulfills the interface. In Phase 3, an AI micro-service / model call can be introduced behind the same interface.
