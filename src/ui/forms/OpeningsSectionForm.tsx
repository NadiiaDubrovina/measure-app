import React, { useState } from 'react';
import { Trash2, DoorOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { FurnitureObject, getOpenings, getWalls, RepeatableItem } from '../../domain/types/furnitureObject';
import { OpeningPayload, OpeningType } from '../../domain/types/subEntities';
import { NumericInput } from '../components/NumericInput';
import { TouchCard } from '../components/TouchCard';

interface OpeningsSectionFormProps {
  object: FurnitureObject;
  onChange: (updated: FurnitureObject) => void;
}

const OPENING_TYPES: Array<{ value: OpeningType; label: string }> = [
  { value: 'window', label: 'Window' },
  { value: 'door', label: 'Door / Passage' },
  { value: 'radiator', label: 'Radiator / Heater' },
  { value: 'niche', label: 'Wall Niche / Alcove' },
  { value: 'structural_beam', label: 'Beam / Pillar' },
  { value: 'pipe_riser', label: 'Pipe Shaft / Box' }
];

export const OpeningsSectionForm: React.FC<OpeningsSectionFormProps> = ({
  object,
  onChange
}) => {
  const openings = getOpenings(object);
  const walls = getWalls(object);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddOpening = (type: OpeningType = 'window') => {
    const defaultWall = walls[0]?.payload.identifier || 'Wall A';
    const newOpeningItem: RepeatableItem<OpeningPayload> = {
      id: `op-${Date.now()}`,
      entityType: 'opening',
      payload: {
        wallRef: defaultWall,
        type,
        widthMm: type === 'window' ? 1200 : type === 'radiator' ? 800 : 900,
        heightMm: type === 'window' ? 1400 : type === 'radiator' ? 600 : 2100,
        distanceFromCornerMm: 500,
        sillHeightMm: type === 'window' ? 850 : type === 'radiator' ? 150 : 0,
        projectionDepthMm: type === 'radiator' ? 120 : 0
      }
    };

    const updated = [...openings, newOpeningItem];
    onChange({
      ...object,
      sections: {
        ...object.sections,
        openings: {
          sectionId: 'openings',
          items: updated
        }
      }
    });
    setExpandedId(newOpeningItem.id);
  };

  const handleRemoveOpening = (id: string) => {
    const updated = openings.filter(o => o.id !== id);
    onChange({
      ...object,
      sections: {
        ...object.sections,
        openings: {
          sectionId: 'openings',
          items: updated
        }
      }
    });
  };

  const handleUpdateOpening = (id: string, patch: Partial<OpeningPayload>) => {
    const updated = openings.map(o =>
      o.id === id ? { ...o, payload: { ...o.payload, ...patch } } : o
    );
    onChange({
      ...object,
      sections: {
        ...object.sections,
        openings: {
          sectionId: 'openings',
          items: updated
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Openings & Obstacles ({openings.length})
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAddOpening('window')}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            + Window
          </button>
          <button
            type="button"
            onClick={() => handleAddOpening('radiator')}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            + Radiator
          </button>
          <button
            type="button"
            onClick={() => handleAddOpening('door')}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            + Opening
          </button>
        </div>
      </div>

      {openings.length === 0 ? (
        <TouchCard className="text-center py-8">
          <DoorOpen className="w-8 h-8 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-semibold text-stone-700">No openings or obstacles added</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Add windows, doors, radiators, or niches on measured walls.
          </p>
        </TouchCard>
      ) : (
        <div className="space-y-3">
          {openings.map(op => {
            const isExpanded = expandedId === op.id;
            const p = op.payload;
            const typeLabel = OPENING_TYPES.find(t => t.value === p.type)?.label || p.type;

            return (
              <TouchCard key={op.id} className="p-0 overflow-hidden">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : op.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {p.type[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-stone-900 truncate block">
                        {typeLabel} ({p.wallRef})
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {p.widthMm} × {p.heightMm} mm • {p.distanceFromCornerMm}mm from corner
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
                        <label className="text-xs font-semibold text-stone-700">Type</label>
                        <select
                          value={p.type}
                          onChange={e => handleUpdateOpening(op.id, { type: e.target.value as OpeningType })}
                          className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                        >
                          {OPENING_TYPES.map(t => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700">Located On Wall</label>
                        <select
                          value={p.wallRef}
                          onChange={e => handleUpdateOpening(op.id, { wallRef: e.target.value })}
                          className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                        >
                          {walls.map(w => (
                            <option key={w.id} value={w.payload.identifier}>
                              {w.payload.identifier}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <NumericInput
                        label="Width"
                        value={p.widthMm}
                        onChange={val => handleUpdateOpening(op.id, { widthMm: val || 0 })}
                        unit="mm"
                        placeholder="1200"
                      />
                      <NumericInput
                        label="Height"
                        value={p.heightMm}
                        onChange={val => handleUpdateOpening(op.id, { heightMm: val || 0 })}
                        unit="mm"
                        placeholder="1400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <NumericInput
                        label="Distance From Left Corner"
                        value={p.distanceFromCornerMm}
                        onChange={val => handleUpdateOpening(op.id, { distanceFromCornerMm: val || 0 })}
                        unit="mm"
                        placeholder="600"
                      />
                      <NumericInput
                        label="Sill Height (From Floor)"
                        value={p.sillHeightMm}
                        onChange={val => handleUpdateOpening(op.id, { sillHeightMm: val })}
                        unit="mm"
                        placeholder="850"
                        helperText="Crucial for window/countertop clash"
                      />
                    </div>

                    {p.type === 'radiator' && (
                      <NumericInput
                        label="Projection Into Room (Depth)"
                        value={p.projectionDepthMm}
                        onChange={val => handleUpdateOpening(op.id, { projectionDepthMm: val })}
                        unit="mm"
                        placeholder="120"
                        helperText="Distance from wall to outer face of radiator"
                      />
                    )}

                    <div className="pt-2 flex items-center justify-end border-t border-stone-200/60">
                      <button
                        type="button"
                        onClick={() => handleRemoveOpening(op.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Opening</span>
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
