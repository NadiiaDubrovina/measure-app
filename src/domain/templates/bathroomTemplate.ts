import { FurnitureObjectTemplate } from './types';

export const bathroomTemplate: FurnitureObjectTemplate = {
  id: 'bathroom_cabinet',
  name: 'Bathroom Cabinet / Vanity',
  description: 'Under-sink cabinetry, mirror medicine units, and tall linen towers.',
  icon: 'Bath',
  sections: [
    {
      id: 'general',
      title: 'Niche & Tile Status',
      shortLabel: 'General',
      icon: 'Maximize2',
      kind: 'parameters',
      weight: 20,
      fields: [
        {
          id: 'room_shape',
          label: 'Mounting Style',
          type: 'segmented',
          required: true,
          defaultValue: 'straight',
          options: [
            { value: 'straight', label: 'Flat Wall' },
            { value: 'alcove', label: 'Between Walls (Alcove)' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'tile_status',
          label: 'Wall Tiles Status',
          type: 'select',
          defaultValue: 'finished',
          options: [
            { value: 'finished', label: 'Tiles Finished (Measure exact surface)' },
            { value: 'planned', label: 'Raw Wall (Tiles to be added later)' },
            { value: 'partial', label: 'Tile border / splash zone' }
          ]
        },
        {
          id: 'tile_thickness_mm',
          label: 'Tile + Adhesive Thickness',
          type: 'numeric',
          unit: 'mm',
          quickPresets: [10, 12, 15],
          helperText: 'Deduct from raw wall width if tiles are not yet installed'
        }
      ]
    },
    {
      id: 'walls',
      title: 'Cabinet Width & Boundaries',
      shortLabel: 'Dimensions',
      icon: 'Ruler',
      kind: 'collection',
      entityType: 'wall',
      minItems: 1,
      weight: 25
    },
    {
      id: 'technical',
      title: 'Plumbing & Mirror Lighting',
      shortLabel: 'Utilities',
      icon: 'Zap',
      kind: 'collection',
      entityType: 'technical_point',
      weight: 30
    },
    {
      id: 'appliances',
      title: 'Sink & Siphon Fixture',
      shortLabel: 'Basin',
      icon: 'Droplet',
      kind: 'collection',
      entityType: 'appliance',
      weight: 15
    },
    {
      id: 'media',
      title: 'Photos',
      shortLabel: 'Photos',
      icon: 'Camera',
      kind: 'parameters',
      weight: 10
    }
  ],
  completenessRules: {
    requiredEntityTypes: ['water_cold', 'water_hot', 'drain_pipe'],
    requiredAppliances: ['sink']
  }
};
