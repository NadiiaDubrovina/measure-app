export interface SupplierProductQuery {
  category: 'board' | 'edge' | 'hardware' | 'facade' | 'countertop';
  searchQuery?: string;
  brand?: string;
}

export interface SupplierProduct {
  supplierId: string;
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
