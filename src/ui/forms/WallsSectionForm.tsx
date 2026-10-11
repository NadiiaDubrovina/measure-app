import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { FurnitureObject, getWalls, RepeatableItem } from '../../domain/types/furnitureObject';
import { WallPayload } from '../../domain/types/subEntities';
import { NumericInput } from '../components/NumericInput';
import { TouchCard } from '../components/TouchCard';

interface WallsSectionFormProps {
  object: FurnitureObject;
  onChange: (updated: FurnitureObject) => void;
}

export const WallsSectionForm: React.FC<WallsSectionFormProps> = ({
  object,
  onChange
}) => {
  const walls = getWalls(object);
  const [expandedId, setExpandedId] = useState<string | null>(walls[0]?.id || null);

  const handleAddWall = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLetter = letters[walls.length] || `${walls.length + 1}`;
    const ceilingHeight = (object.sections.general?.parameters?.ceiling_height_mm as number) || 2650;

    const newWallItem: RepeatableItem<WallPayload> = {
      id: `wall-${Date.now()}`,
      entityType: 'wall',
      payload: {
        identifier: `Wall ${nextLetter}`,
        lengthMm: 0,
        heightLeftMm: ceilingHeight,
        heightRightMm: ceilingHeight,
        cornerAngleDeg: 90.0,
        plumbDeviationMm: 0
      }
    };

    const updatedWalls = [...walls, newWallItem];
    onChange({
      ...object,
      sections: {
        ...object.sections,
        walls: {
          sectionId: 'walls',
          items: updatedWalls
        }
      }
    });
    setExpandedId(newWallItem.id);
  };

  const handleRemoveWall = (id: string) => {
    if (walls.length <= 1) return;
    const updatedWalls = walls.filter(w => w.id !== id);
    onChange({
      ...object,
      sections: {
        ...object.sections,
        walls: {
          sectionId: 'walls',
          items: updatedWalls
        }
      }
    });
  };

  const handleUpdateWallPayload = (id: string, patch: Partial<WallPayload>) => {
    const updatedWalls = walls.map(w =>
      w.id === id ? { ...w, payload: { ...w.payload, ...patch } } : w
    );
    onChange({
      ...object,
      sections: {
        ...object.sections,
        walls: {
          sectionId: 'walls',
          items: updatedWalls
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Perimeter Walls ({walls.length})
        </span>
        <button
          type="button"
          onClick={handleAddWall}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wall</span>
        </button>
      </div>

      <div className="space-y-3">
        {walls.map((wall, index) => {
          const isExpanded = expandedId === wall.id;
          const p = wall.payload;
          const isAngleRisk =
            p.cornerAngleDeg !== undefined &&
            (p.cornerAngleDeg < 88.5 || p.cornerAngleDeg > 91.5);

          return (
            <TouchCard key={wall.id} className="p-0 overflow-hidden">
              <div
                onClick={() => setExpandedId(isExpanded ? null : wall.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-stone-900 truncate block">
                      {p.identifier}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {p.lengthMm > 0 ? `${p.lengthMm} mm` : 'No length set'} • {p.cornerAngleDeg ?? 90}°
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAngleRisk && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>{p.cornerAngleDeg}° out of square</span>
                    </div>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 pt-1 border-t border-stone-100 space-y-4 bg-stone-50/30">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Wall Label</label>
                    <input
                      type="text"
                      value={p.identifier}
                      onChange={e => handleUpdateWallPayload(wall.id, { identifier: e.target.value })}
                      placeholder="e.g. Wall A (Main Sink Wall)"
                      className="w-full text-sm font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>

                  <NumericInput
                    label="Length at Base (Floor Level)"
                    value={p.lengthMm}
                    onChange={val => handleUpdateWallPayload(wall.id, { lengthMm: val || 0 })}
                    unit="mm"
                    placeholder="3200"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <NumericInput
                      label="Height Left"
                      value={p.heightLeftMm}
                      onChange={val => handleUpdateWallPayload(wall.id, { heightLeftMm: val || 0 })}
                      unit="mm"
                      placeholder="2650"
                    />
                    <NumericInput
                      label="Height Right"
                      value={p.heightRightMm}
                      onChange={val => handleUpdateWallPayload(wall.id, { heightRightMm: val || 0 })}
                      unit="mm"
                      placeholder="2650"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <NumericInput
                      label="Corner Angle"
                      value={p.cornerAngleDeg}
                      onChange={val => handleUpdateWallPayload(wall.id, { cornerAngleDeg: val })}
                      unit="°"
                      placeholder="90.0"
                      step={0.1}
                      quickPreset={[90]}
                    />
                    <NumericInput
                      label="Plumb Tilt (Deviation)"
                      value={p.plumbDeviationMm}
                      onChange={val => handleUpdateWallPayload(wall.id, { plumbDeviationMm: val })}
                      unit="mm"
                      placeholder="0"
                      quickPreset={[0]}
                      helperText="Deviation across 2m vertical"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-200/60">
                    <span className="text-xs text-stone-400">
                      ID: {wall.id.slice(-6)}
                    </span>
                    {walls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWall(wall.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Wall</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </TouchCard>
          );
        })}
      </div>
    </div>
  );
};
