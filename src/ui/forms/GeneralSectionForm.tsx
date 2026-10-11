import React from 'react';
import { FurnitureObject, getSectionParameters } from '../../domain/types/furnitureObject';
import { FurnitureObjectTemplate } from '../../domain/templates/types';
import { NumericInput } from '../components/NumericInput';
import { SegmentedPicker } from '../components/SegmentedPicker';
import { TouchCard } from '../components/TouchCard';

interface GeneralSectionFormProps {
  object: FurnitureObject;
  template: FurnitureObjectTemplate;
  onChange: (updated: FurnitureObject) => void;
}

export const GeneralSectionForm: React.FC<GeneralSectionFormProps> = ({
  object,
  template,
  onChange
}) => {
  const generalSection = template.sections.find(s => s.id === 'general');
  const params = getSectionParameters<Record<string, any>>(object, 'general');

  const updateParam = (key: string, value: any) => {
    const updatedParams = { ...params, [key]: value };
    const updatedSections = {
      ...object.sections,
      general: {
        sectionId: 'general',
        parameters: updatedParams
      }
    };
    onChange({ ...object, sections: updatedSections });
  };

  const shapeField = generalSection?.fields?.find(f => f.id === 'room_shape');
  const ceilingField = generalSection?.fields?.find(f => f.id === 'ceiling_height_mm');
  const floorField = generalSection?.fields?.find(f => f.id === 'floor_condition');
  const wallMatField = generalSection?.fields?.find(f => f.id === 'wall_material');
  const tileStatusField = generalSection?.fields?.find(f => f.id === 'tile_status');
  const tileThickField = generalSection?.fields?.find(f => f.id === 'tile_thickness_mm');
  const baseboardField = generalSection?.fields?.find(f => f.id === 'baseboard_notes');

  return (
    <div className="space-y-4">
      <TouchCard>
        <div className="space-y-4">
          {shapeField && (
            <SegmentedPicker<string>
              label={shapeField.label}
              options={
                shapeField.options?.map(o => ({ value: o.value, label: o.label })) || [
                  { value: 'straight', label: 'Straight' },
                  { value: 'L_shape', label: 'L-Shape' }
                ]
              }
              value={params.room_shape || shapeField.defaultValue || 'straight'}
              onChange={val => updateParam('room_shape', val)}
              required={shapeField.required}
            />
          )}

          {ceilingField && (
            <NumericInput
              label={ceilingField.label}
              value={params.ceiling_height_mm}
              onChange={val => updateParam('ceiling_height_mm', val)}
              unit="mm"
              placeholder="2650"
              helperText={ceilingField.helperText || 'Measure at multiple points if ceiling might slope'}
              quickPreset={ceilingField.quickPresets || [2500, 2600, 2700, 2800]}
              required={ceilingField.required}
            />
          )}
        </div>
      </TouchCard>

      <TouchCard>
        <div className="space-y-4">
          {floorField && (
            <SegmentedPicker<string>
              label={floorField.label}
              options={
                floorField.options?.map(o => ({ value: o.value, label: o.label })) || [
                  { value: 'tiles_finished', label: 'Tiles Done' },
                  { value: 'screed', label: 'Raw Screed' }
                ]
              }
              value={params.floor_condition || floorField.defaultValue || 'tiles_finished'}
              onChange={val => updateParam('floor_condition', val)}
            />
          )}

          {tileStatusField && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide block">
                {tileStatusField.label}
              </label>
              <select
                value={params.tile_status || tileStatusField.defaultValue || 'finished'}
                onChange={e => updateParam('tile_status', e.target.value)}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900"
              >
                {tileStatusField.options?.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tileThickField && params.tile_status !== 'finished' && (
            <NumericInput
              label={tileThickField.label}
              value={params.tile_thickness_mm}
              onChange={val => updateParam('tile_thickness_mm', val)}
              unit="mm"
              placeholder="12"
              quickPreset={tileThickField.quickPresets}
              helperText={tileThickField.helperText}
            />
          )}

          {wallMatField && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide block">
                {wallMatField.label}
              </label>
              <select
                value={params.wall_material || wallMatField.defaultValue || 'brick'}
                onChange={e => updateParam('wall_material', e.target.value)}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900"
              >
                {wallMatField.options?.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {baseboardField && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide block">
                {baseboardField.label}
              </label>
              <input
                type="text"
                placeholder="e.g. Existing 80mm MDF baseboard to be removed"
                value={params.baseboard_notes || ''}
                onChange={e => updateParam('baseboard_notes', e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900"
              />
            </div>
          )}
        </div>
      </TouchCard>
    </div>
  );
};
