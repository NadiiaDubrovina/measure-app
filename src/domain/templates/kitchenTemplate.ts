import { FurnitureObjectTemplate } from './types';

export const kitchenTemplate: FurnitureObjectTemplate = {
  id: 'kitchen',
  name: 'Kitchen',
  description: 'Full custom kitchen cabinetry with cooking zone, wet zone, and integrated appliances.',
  icon: 'ChefHat',
  sections: [
    {
      id: 'general',
      title: 'General & Construction',
      shortLabel: 'General',
      icon: 'Maximize2',
      kind: 'parameters',
      weight: 15,
      fields: [
        {
          id: 'room_shape',
          label: 'Room Configuration',
          type: 'segmented',
          required: true,
          defaultValue: 'L_shape',
          options: [
            { value: 'straight', label: 'Straight' },
            { value: 'L_shape', label: 'L-Shape' },
            { value: 'U_shape', label: 'U-Shape' },
            { value: 'island', label: 'With Island' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'ceiling_height_mm',
          label: 'Ceiling Height',
          type: 'numeric',
          unit: 'mm',
          required: true,
          quickPresets: [2500, 2600, 2700, 2800],
          helperText: 'Take multiple measurements if uneven'
        },
        {
          id: 'floor_condition',
          label: 'Floor Readiness',
          type: 'segmented',
          defaultValue: 'tiles_finished',
          options: [
            { value: 'tiles_finished', label: 'Tiles Done' },
            { value: 'screed', label: 'Raw Screed' },
            { value: 'level', label: 'Level' },
            { value: 'slanted', label: 'Slanted' }
          ]
        },
        {
          id: 'wall_material',
          label: 'Wall Construction',
          type: 'select',
          defaultValue: 'brick',
          options: [
            { value: 'brick', label: 'Solid Brick / Ceramic Block' },
            { value: 'concrete', label: 'Reinforced Concrete' },
            { value: 'aerated_concrete', label: 'Aerated Concrete (Ytong)' },
            { value: 'drywall_single', label: 'Single Drywall' },
            { value: 'drywall_double', label: 'Double Drywall' }
          ]
        },
        {
          id: 'baseboard_notes',
          label: 'Baseboard / Skirting Notes',
          type: 'text'
        }
      ]
    },
    {
      id: 'walls',
      title: 'Perimeter Walls & Angles',
      shortLabel: 'Walls',
      icon: 'Ruler',
      kind: 'collection',
      entityType: 'wall',
      minItems: 1,
      weight: 25
    },
    {
      id: 'openings',
      title: 'Openings & Obstacles',
      shortLabel: 'Openings',
      icon: 'DoorOpen',
      kind: 'collection',
      entityType: 'opening',
      weight: 10
    },
    {
      id: 'technical',
      title: 'Technical Utilities',
      shortLabel: 'Utilities',
      icon: 'Zap',
      kind: 'collection',
      entityType: 'technical_point',
      weight: 20
    },
    {
      id: 'appliances',
      title: 'Appliances & Sink',
      shortLabel: 'Appliances',
      icon: 'Refrigerator',
      kind: 'collection',
      entityType: 'appliance',
      weight: 15
    },
    {
      id: 'media',
      title: 'Photos & References',
      shortLabel: 'Photos',
      icon: 'Camera',
      kind: 'parameters',
      weight: 10
    },
    {
      id: 'notes',
      title: 'Field Notes',
      shortLabel: 'Notes',
      icon: 'FileText',
      kind: 'parameters',
      weight: 5
    }
  ],
  completenessRules: {
    requiredEntityTypes: ['water_cold', 'drain_pipe'],
    requiredAppliances: ['hob', 'oven', 'refrigerator', 'sink'],
    checkCornerAngles: true
  }
};
