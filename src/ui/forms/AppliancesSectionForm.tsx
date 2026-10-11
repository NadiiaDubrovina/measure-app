import React, { useState } from 'react';
import { Plus, Trash2, Refrigerator, ChevronDown, ChevronUp } from 'lucide-react';
import { FurnitureObject, getAppliances, RepeatableItem } from '../../domain/types/furnitureObject';
import { AppliancePayload, ApplianceType, ApplianceStatus } from '../../domain/types/subEntities';
import { NumericInput } from '../components/NumericInput';
import { SegmentedPicker } from '../components/SegmentedPicker';
import { TouchCard } from '../components/TouchCard';

interface AppliancesSectionFormProps {
  object: FurnitureObject;
  onChange: (updated: FurnitureObject) => void;
}

const APPLIANCE_TYPES: Array<{ value: ApplianceType; label: string }> = [
  { value: 'hob', label: 'Cooktop / Hob' },
  { value: 'oven', label: 'Built-in Oven' },
  { value: 'hood', label: 'Extractor Hood' },
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'sink', label: 'Sink / Basin' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'washing_machine', label: 'Washing Machine' },
  { value: 'dryer', label: 'Tumble Dryer' },
  { value: 'wine_cooler', label: 'Wine Cooler' },
  { value: 'other', label: 'Other Appliance' }
];

export const AppliancesSectionForm: React.FC<AppliancesSectionFormProps> = ({
  object,
  onChange
}) => {
  const appliances = getAppliances(object);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddAppliance = (type: ApplianceType = 'hob') => {
    const is60 = ['hob', 'oven', 'dishwasher'].includes(type);
    const newAppItem: RepeatableItem<AppliancePayload> = {
      id: `app-${Date.now()}`,
      entityType: 'appliance',
      payload: {
        type,
        status: 'purchasing_new',
        brandModel: '',
        widthMm: is60 ? 595 : type === 'refrigerator' ? 600 : type === 'sink' ? 540 : 600,
        depthMm: is60 ? 550 : 550,
        heightMm: type === 'oven' ? 595 : type === 'dishwasher' ? 815 : type === 'refrigerator' ? 1775 : undefined
      }
    };

    const updated = [...appliances, newAppItem];
    onChange({
      ...object,
      sections: {
        ...object.sections,
        appliances: {
          sectionId: 'appliances',
          items: updated
        }
      }
    });
    setExpandedId(newAppItem.id);
  };

  const handleRemoveAppliance = (id: string) => {
    const updated = appliances.filter(a => a.id !== id);
    onChange({
      ...object,
      sections: {
        ...object.sections,
        appliances: {
          sectionId: 'appliances',
          items: updated
        }
      }
    });
  };

  const handleUpdateAppliance = (id: string, patch: Partial<AppliancePayload>) => {
    const updated = appliances.map(a =>
      a.id === id ? { ...a, payload: { ...a.payload, ...patch } } : a
    );
    onChange({
      ...object,
      sections: {
        ...object.sections,
        appliances: {
          sectionId: 'appliances',
          items: updated
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Appliances & Fixtures ({appliances.length})
        </span>

        <button
          type="button"
          onClick={() => handleAddAppliance('hob')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Fast preset buttons for kitchen */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { type: 'hob' as const, label: '+ Hob' },
          { type: 'oven' as const, label: '+ Oven' },
          { type: 'hood' as const, label: '+ Hood' },
          { type: 'sink' as const, label: '+ Sink' },
          { type: 'dishwasher' as const, label: '+ Dishwasher' },
          { type: 'refrigerator' as const, label: '+ Fridge' }
        ].map(p => (
          <button
            key={p.type}
            type="button"
            onClick={() => handleAddAppliance(p.type)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {appliances.length === 0 ? (
        <TouchCard className="text-center py-8">
          <Refrigerator className="w-8 h-8 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-semibold text-stone-700">No appliances or fixtures added</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Add built-in or freestanding appliances to ensure cut-out and ventilation clearances.
          </p>
        </TouchCard>
      ) : (
        <div className="space-y-3">
          {appliances.map(app => {
            const isExpanded = expandedId === app.id;
            const p = app.payload;
            const def = APPLIANCE_TYPES.find(t => t.value === p.type);

            return (
              <TouchCard key={app.id} className="p-0 overflow-hidden">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {p.type[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-stone-900 truncate block">
                        {def?.label || p.type} {p.brandModel ? `— ${p.brandModel}` : ''}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {p.widthMm ? `${p.widthMm}mm wide` : 'No size'} • {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-stone-100 space-y-3.5 bg-stone-50/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700">Appliance Type</label>
                        <select
                          value={p.type}
                          onChange={e => handleUpdateAppliance(app.id, { type: e.target.value as ApplianceType })}
                          className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                        >
                          {APPLIANCE_TYPES.map(t => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700">Brand / Model</label>
                        <input
                          type="text"
                          placeholder="e.g. Bosch SMV46"
                          value={p.brandModel || ''}
                          onChange={e => handleUpdateAppliance(app.id, { brandModel: e.target.value })}
                          className="w-full text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                        />
                      </div>
                    </div>

                    <SegmentedPicker<ApplianceStatus>
                      label="Procurement Status"
                      options={[
                        { value: 'existing', label: 'Existing' },
                        { value: 'purchasing_new', label: 'Client Buying' },
                        { value: 'supplied_by_us', label: 'We Supply' }
                      ]}
                      value={p.status}
                      onChange={val => handleUpdateAppliance(app.id, { status: val })}
                    />

                    <div className="grid grid-cols-3 gap-2.5">
                      <NumericInput
                        label="Width"
                        value={p.widthMm}
                        onChange={val => handleUpdateAppliance(app.id, { widthMm: val })}
                        unit="mm"
                        placeholder="600"
                        quickPreset={[450, 600, 900]}
                      />
                      <NumericInput
                        label="Depth"
                        value={p.depthMm}
                        onChange={val => handleUpdateAppliance(app.id, { depthMm: val })}
                        unit="mm"
                        placeholder="550"
                      />
                      <NumericInput
                        label="Height"
                        value={p.heightMm}
                        onChange={val => handleUpdateAppliance(app.id, { heightMm: val })}
                        unit="mm"
                        placeholder="815"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Notes / Cut-out Specs</label>
                      <input
                        type="text"
                        placeholder="e.g. Needs flush mounting or special hinge clearance"
                        value={p.notes || ''}
                        onChange={e => handleUpdateAppliance(app.id, { notes: e.target.value })}
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end border-t border-stone-200/60">
                      <button
                        type="button"
                        onClick={() => handleRemoveAppliance(app.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Appliance</span>
                      </button>
                    </div>
                  </div>
                )}
              </TouchCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
