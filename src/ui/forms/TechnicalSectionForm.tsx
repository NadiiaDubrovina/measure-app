import React, { useState } from 'react';
import { Plus, Trash2, Zap, Droplet, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import { FurnitureObject, getTechnicalPoints, getWalls, RepeatableItem } from '../../domain/types/furnitureObject';
import { TechnicalPointPayload, TechnicalPointType } from '../../domain/types/subEntities';
import { NumericInput } from '../components/NumericInput';
import { TouchCard } from '../components/TouchCard';

interface TechnicalSectionFormProps {
  object: FurnitureObject;
  onChange: (updated: FurnitureObject) => void;
}

const TECHNICAL_TYPES: Array<{
  value: TechnicalPointType;
  label: string;
  category: 'water' | 'electric' | 'gas' | 'hvac';
  icon: React.ReactNode;
}> = [
  { value: 'water_cold', label: 'Cold Water Feed', category: 'water', icon: <Droplet className="w-3.5 h-3.5 text-blue-500" /> },
  { value: 'water_hot', label: 'Hot Water Feed', category: 'water', icon: <Droplet className="w-3.5 h-3.5 text-red-500" /> },
  { value: 'drain_pipe', label: 'Waste Drain Pipe', category: 'water', icon: <Droplet className="w-3.5 h-3.5 text-stone-500" /> },
  { value: 'socket_230v', label: '230V Socket (Standard)', category: 'electric', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
  { value: 'socket_400v', label: '400V Three-Phase (Hob)', category: 'electric', icon: <Zap className="w-3.5 h-3.5 text-rose-500" /> },
  { value: 'ventilation_duct', label: 'Ventilation Duct (Hood)', category: 'hvac', icon: <Wind className="w-3.5 h-3.5 text-teal-500" /> },
  { value: 'gas_pipe', label: 'Gas Supply Valve', category: 'gas', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
  { value: 'light_switch', label: 'Light Switch / Relay', category: 'electric', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
  { value: 'thermostat', label: 'Room Thermostat', category: 'electric', icon: <Zap className="w-3.5 h-3.5 text-purple-500" /> }
];

export const TechnicalSectionForm: React.FC<TechnicalSectionFormProps> = ({
  object,
  onChange
}) => {
  const techPoints = getTechnicalPoints(object);
  const walls = getWalls(object);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddPoint = (type: TechnicalPointType = 'socket_230v') => {
    const defaultWall = walls[0]?.payload.identifier || 'Wall A';
    const isWaterOrDrain = type.startsWith('water') || type === 'drain_pipe';
    const newPointItem: RepeatableItem<TechnicalPointPayload> = {
      id: `tech-${Date.now()}`,
      entityType: 'technical_point',
      payload: {
        wallRef: defaultWall,
        type,
        distanceFromCornerMm: 1200,
        heightFromFloorMm: isWaterOrDrain ? 550 : type === 'socket_400v' ? 600 : 1100,
        diameterMm: type === 'drain_pipe' ? 50 : type === 'ventilation_duct' ? 150 : undefined,
        isRelocatable: false
      }
    };

    const updated = [...techPoints, newPointItem];
    onChange({
      ...object,
      sections: {
        ...object.sections,
        technical: {
          sectionId: 'technical',
          items: updated
        }
      }
    });
    setExpandedId(newPointItem.id);
  };

  const handleQuickAddWaterGroup = () => {
    const defaultWall = walls[0]?.payload.identifier || 'Wall A';
    const now = Date.now();
    const group: Array<RepeatableItem<TechnicalPointPayload>> = [
      {
        id: `tech-${now}-1`,
        entityType: 'technical_point',
        payload: {
          wallRef: defaultWall,
          type: 'water_cold',
          distanceFromCornerMm: 1400,
          heightFromFloorMm: 550,
          isRelocatable: false,
          notes: 'Under-sink cold feed'
        }
      },
      {
        id: `tech-${now}-2`,
        entityType: 'technical_point',
        payload: {
          wallRef: defaultWall,
          type: 'water_hot',
          distanceFromCornerMm: 1480,
          heightFromFloorMm: 550,
          isRelocatable: false,
          notes: 'Under-sink hot feed'
        }
      },
      {
        id: `tech-${now}-3`,
        entityType: 'technical_point',
        payload: {
          wallRef: defaultWall,
          type: 'drain_pipe',
          distanceFromCornerMm: 1440,
          heightFromFloorMm: 500,
          diameterMm: 50,
          isRelocatable: false,
          notes: 'PVC 50mm drain'
        }
      }
    ];

    onChange({
      ...object,
      sections: {
        ...object.sections,
        technical: {
          sectionId: 'technical',
          items: [...techPoints, ...group]
        }
      }
    });
  };

  const handleRemovePoint = (id: string) => {
    const updated = techPoints.filter(tp => tp.id !== id);
    onChange({
      ...object,
      sections: {
        ...object.sections,
        technical: {
          sectionId: 'technical',
          items: updated
        }
      }
    });
  };

  const handleUpdatePoint = (id: string, patch: Partial<TechnicalPointPayload>) => {
    const updated = techPoints.map(tp =>
      tp.id === id ? { ...tp, payload: { ...tp.payload, ...patch } } : tp
    );
    onChange({
      ...object,
      sections: {
        ...object.sections,
        technical: {
          sectionId: 'technical',
          items: updated
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Technical Connections ({techPoints.length})
        </span>

        <button
          type="button"
          onClick={() => handleAddPoint('socket_230v')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Point</span>
        </button>
      </div>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={handleQuickAddWaterGroup}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100 transition-colors"
        >
          + Water & Drain Group
        </button>
        <button
          type="button"
          onClick={() => handleAddPoint('socket_400v')}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100 transition-colors"
        >
          + 400V Hob Power
        </button>
        <button
          type="button"
          onClick={() => handleAddPoint('ventilation_duct')}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100 transition-colors"
        >
          + Hood Duct
        </button>
      </div>

      {techPoints.length === 0 ? (
        <TouchCard className="text-center py-8">
          <Zap className="w-8 h-8 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-semibold text-stone-700">No technical connections added</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Record cold/hot water, drain pipes, 230V/400V sockets, and exhaust ducts.
          </p>
        </TouchCard>
      ) : (
        <div className="space-y-3">
          {techPoints.map(tp => {
            const isExpanded = expandedId === tp.id;
            const p = tp.payload;
            const def = TECHNICAL_TYPES.find(t => t.value === p.type);

            return (
              <TouchCard key={tp.id} className="p-0 overflow-hidden">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : tp.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      {def?.icon || <Zap className="w-3.5 h-3.5 text-stone-600" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-stone-900 truncate block">
                        {def?.label || p.type} ({p.wallRef})
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        Corner: {p.distanceFromCornerMm}mm • Height: {p.heightFromFloorMm}mm
                        {p.diameterMm ? ` • ⌀${p.diameterMm}mm` : ''}
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
                        <label className="text-xs font-semibold text-stone-700">Connection Type</label>
                        <select
                          value={p.type}
                          onChange={e => handleUpdatePoint(tp.id, { type: e.target.value as TechnicalPointType })}
                          className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                        >
                          {TECHNICAL_TYPES.map(t => (
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
                          onChange={e => handleUpdatePoint(tp.id, { wallRef: e.target.value })}
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
                        label="Distance From Left Corner"
                        value={p.distanceFromCornerMm}
                        onChange={val => handleUpdatePoint(tp.id, { distanceFromCornerMm: val || 0 })}
                        unit="mm"
                        placeholder="1200"
                      />
                      <NumericInput
                        label="Height From Finished Floor"
                        value={p.heightFromFloorMm}
                        onChange={val => handleUpdatePoint(tp.id, { heightFromFloorMm: val || 0 })}
                        unit="mm"
                        placeholder="550"
                      />
                    </div>

                    {(p.type === 'drain_pipe' || p.type === 'ventilation_duct') && (
                      <NumericInput
                        label="Pipe / Duct Diameter (⌀)"
                        value={p.diameterMm}
                        onChange={val => handleUpdatePoint(tp.id, { diameterMm: val })}
                        unit="mm"
                        placeholder={p.type === 'drain_pipe' ? '50' : '150'}
                        quickPreset={p.type === 'drain_pipe' ? [32, 40, 50] : [100, 125, 150]}
                      />
                    )}

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">Can be relocated?</span>
                        <span className="text-[11px] text-stone-500">Is plumbing/electric modification planned?</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={p.isRelocatable}
                        onChange={e => handleUpdatePoint(tp.id, { isRelocatable: e.target.checked })}
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Specific Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Under sink, dedicated breaker"
                        value={p.notes || ''}
                        onChange={e => handleUpdatePoint(tp.id, { notes: e.target.value })}
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-2"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end border-t border-stone-200/60">
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(tp.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Connection</span>
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
