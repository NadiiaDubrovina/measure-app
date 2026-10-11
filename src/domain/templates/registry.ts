import { FurnitureObjectTemplate } from './types';
import { kitchenTemplate } from './kitchenTemplate';
import { bathroomTemplate } from './bathroomTemplate';
import { wardrobeTemplate } from './wardrobeTemplate';
import { otherTemplate } from './otherTemplate';

export const TEMPLATE_REGISTRY: Record<string, FurnitureObjectTemplate> = {
  kitchen: kitchenTemplate,
  bathroom_cabinet: bathroomTemplate,
  wardrobe: wardrobeTemplate,
  hallway: {
    ...wardrobeTemplate,
    id: 'hallway',
    name: 'Hallway / Entryway Furniture',
    description: 'Coat hooks, shoe storage, mirror paneling, and benches.',
    icon: 'DoorClosed'
  },
  living_room: {
    ...otherTemplate,
    id: 'living_room',
    name: 'Living Room / TV Console',
    description: 'Media consoles, acoustic slats, shelving, and backlighting.',
    icon: 'Tv'
  },
  other: otherTemplate
};

export function getTemplateForType(typeId: string): FurnitureObjectTemplate {
  return TEMPLATE_REGISTRY[typeId] || otherTemplate;
}

export function getAllTemplates(): FurnitureObjectTemplate[] {
  return Object.values(TEMPLATE_REGISTRY);
}
