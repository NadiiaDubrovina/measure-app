export type SectionKind = 'parameters' | 'collection';

export interface FieldDefinition {
  id: string; // e.g. "ceiling_height_mm"
  label: string;
  type: 'numeric' | 'select' | 'text' | 'boolean' | 'segmented';
  unit?: string; // e.g. "mm", "°"
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  quickPresets?: number[];
  helperText?: string;
}

export interface SectionDefinition {
  id: string; // e.g. "general", "walls", "technical", "appliances", "media", "notes"
  title: string;
  shortLabel: string;
  icon: string;
  kind: SectionKind;
  weight: number; // Weight in completeness calculation
  fields?: FieldDefinition[]; // If kind === 'parameters'
  entityType?: 'wall' | 'opening' | 'technical_point' | 'appliance'; // If kind === 'collection'
  minItems?: number;
}

export interface FurnitureObjectTemplate {
  id: string; // e.g. 'kitchen', 'bathroom_cabinet', 'wardrobe', 'other'
  name: string;
  description: string;
  icon: string;
  sections: SectionDefinition[];
  completenessRules?: {
    requiredEntityTypes?: string[]; // e.g. ['water_cold', 'drain_pipe']
    requiredAppliances?: string[];
    checkCornerAngles?: boolean;
  };
}
