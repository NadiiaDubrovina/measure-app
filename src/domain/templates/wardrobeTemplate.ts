import { FurnitureObjectTemplate } from './types';

export const wardrobeTemplate: FurnitureObjectTemplate = {
  id: 'wardrobe',
  name: 'Wardrobe / Closet',
  description: 'Built-in sliding or hinged wardrobes, alcove closets, and dressing rooms.',
  icon: 'Layers',
  sections: [
    {
      id: 'general',
      title: 'Enclosure & Plumb',
      shortLabel: 'General',
      icon: 'Maximize2',
      kind: 'parameters',
      weight: 20,
      fields: [
        {
          id: 'room_shape',
          label: 'Enclosure Type',
          type: 'segmented',
          required: true,
          defaultValue: 'alcove',
          options: [
            { value: 'alcove', label: 'Alcove / Niche' },
            { value: 'straight', label: 'Straight Wall' },
            { value: 'L_shape', label: 'Corner / L-Shape' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'ceiling_height_mm',
          label: 'Ceiling Height',
          type: 'numeric',
          unit: 'mm',
          required: true,
          quickPresets: [2500, 2600, 2700, 2800]
        },
        {
          id: 'baseboard_notes',
          label: 'Baseboard / Floor Skirting',
          type: 'text',
          helperText: 'Note if baseboard must be removed or notched'
        }
      ]
    },
    {
      id: 'walls',
      title: 'Niche / Wall Dimensions',
      shortLabel: 'Dimensions',
      icon: 'Ruler',
      kind: 'collection',
      entityType: 'wall',
      minItems: 1,
      weight: 35
    },
    {
      id: 'openings',
      title: 'Obstacles & Clearances',
      shortLabel: 'Obstacles',
      icon: 'DoorOpen',
      kind: 'collection',
      entityType: 'opening',
      weight: 15
    },
    {
      id: 'technical',
      title: 'Interior Outlets & LED Feeds',
      shortLabel: 'Utilities',
      icon: 'Zap',
      kind: 'collection',
      entityType: 'technical_point',
      weight: 15
    },
    {
      id: 'media',
      title: 'Photos',
      shortLabel: 'Photos',
      icon: 'Camera',
      kind: 'parameters',
      weight: 15
    }
  ],
  completenessRules: {
    checkCornerAngles: false
  }
};
