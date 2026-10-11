import { FurnitureObjectTemplate } from './types';

export const otherTemplate: FurnitureObjectTemplate = {
  id: 'other',
  name: 'Custom / Other Furniture',
  description: 'Living room TV unit, home office desk, bookshelf, or custom joinery.',
  icon: 'Box',
  sections: [
    {
      id: 'general',
      title: 'General Space',
      shortLabel: 'General',
      icon: 'Maximize2',
      kind: 'parameters',
      weight: 20,
      fields: [
        {
          id: 'room_shape',
          label: 'Configuration',
          type: 'segmented',
          required: true,
          defaultValue: 'straight',
          options: [
            { value: 'straight', label: 'Straight' },
            { value: 'alcove', label: 'Alcove' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'ceiling_height_mm',
          label: 'Ceiling Height',
          type: 'numeric',
          unit: 'mm'
        }
      ]
    },
    {
      id: 'walls',
      title: 'Dimensions',
      shortLabel: 'Dimensions',
      icon: 'Ruler',
      kind: 'collection',
      entityType: 'wall',
      minItems: 1,
      weight: 35
    },
    {
      id: 'technical',
      title: 'Power & Cable Feeds',
      shortLabel: 'Utilities',
      icon: 'Zap',
      kind: 'collection',
      entityType: 'technical_point',
      weight: 20
    },
    {
      id: 'media',
      title: 'Photos',
      shortLabel: 'Photos',
      icon: 'Camera',
      kind: 'parameters',
      weight: 15
    },
    {
      id: 'notes',
      title: 'Notes',
      shortLabel: 'Notes',
      icon: 'FileText',
      kind: 'parameters',
      weight: 10
    }
  ]
};
