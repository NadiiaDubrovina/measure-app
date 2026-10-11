import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  Camera,
  Layers,
  Sparkles,
  Utensils,
  Bath,
  DoorClosed,
  Tv,
  Box,
  CheckCircle2
} from 'lucide-react';
import { Measurement } from '../../domain/types/measurement';
import { CompletenessBadge } from '../components/CompletenessBadge';
import { TouchCard } from '../components/TouchCard';
import { getAllTemplates, getTemplateForType } from '../../domain/templates/registry';
import { getWalls, getTechnicalPoints, getAppliances } from '../../domain/types/furnitureObject';

interface MeasurementOverviewViewProps {
  measurement: Measurement;
  projectName: string;
  clientName: string;
  onBackToDashboard: () => void;
  onSelectObject: (objectId: string) => void;
  onAddObject: (typeId: string, customName?: string) => Promise<any>;
  onRemoveObject: (objectId: string) => Promise<void>;
  onProceedToSummary: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  kitchen: <Utensils className="w-5 h-5 text-amber-600" />,
  bathroom_cabinet: <Bath className="w-5 h-5 text-sky-600" />,
  wardrobe: <DoorClosed className="w-5 h-5 text-indigo-600" />,
  hallway: <DoorClosed className="w-5 h-5 text-violet-600" />,
  living_room: <Tv className="w-5 h-5 text-rose-600" />,
  other: <Box className="w-5 h-5 text-stone-600" />
};

export const MeasurementOverviewView: React.FC<MeasurementOverviewViewProps> = ({
  measurement,
  projectName,
  clientName,
  onBackToDashboard,
  onSelectObject,
  onAddObject,
  onRemoveObject,
  onProceedToSummary,
  isSaving,
  lastSavedAt
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('kitchen');
  const [customNameInput, setCustomNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const templates = getAllTemplates();

  const handleOpenAddModal = () => {
    setSelectedTemplateId('kitchen');
    setCustomNameInput('');
    setIsAddModalOpen(true);
  };

  const handleCreateObject = async () => {
    setIsSubmitting(true);
    try {
      const newObj = await onAddObject(selectedTemplateId, customNameInput.trim() || undefined);
      setIsAddModalOpen(false);
      if (newObj && newObj.id) {
        onSelectObject(newObj.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteObject = async (objectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onRemoveObject(objectId);
    setDeleteConfirmId(null);
  };

  const totalPhotos = measurement.objects.reduce((sum, obj) => sum + (obj.media?.length || 0), 0);
  const totalWalls = measurement.objects.reduce((sum, obj) => sum + getWalls(obj).length, 0);
  const totalWarnings = measurement.objects.reduce(
    (sum, obj) => sum + (obj.completeness?.warnings?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-28">
      {/* Top Mobile Bar */}
      <header className="bg-stone-900 text-white px-5 pt-6 pb-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Visits List</span>
            </button>

            <div className="flex items-center gap-2">
              {isSaving ? (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Saving...
                </span>
              ) : lastSavedAt ? (
                <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Saved locally
                </span>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>{clientName}</span>
              <span>•</span>
              <span className="text-stone-300">{projectName}</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white mt-1">
              On-Site Measurement
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-stone-800/80 backdrop-blur rounded-2xl p-3.5 border border-stone-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Completeness
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">
                  {measurement.overallCompletenessPct}%
                </span>
                <span className="text-xs text-stone-400 font-medium">overall</span>
              </div>
            </div>

            <div className="h-8 w-px bg-stone-700" />

            <div className="text-center">
              <span className="text-[11px] font-semibold text-stone-400">Objects</span>
              <p className="text-sm font-black text-stone-100">{measurement.objects.length}</p>
            </div>

            <div className="h-8 w-px bg-stone-700" />

            <div className="text-center">
              <span className="text-[11px] font-semibold text-stone-400">Walls</span>
              <p className="text-sm font-black text-stone-100">{totalWalls}</p>
            </div>

            <div className="h-8 w-px bg-stone-700" />

            <div className="text-center">
              <span className="text-[11px] font-semibold text-stone-400">Photos</span>
              <p className="text-sm font-black text-stone-100">{totalPhotos}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Objects List Container */}
      <main className="max-w-xl mx-auto w-full px-4 pt-5 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">Furniture Objects</h2>
            <p className="text-xs text-stone-500">Measure room geometry, technical feeds & appliances</p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Object</span>
          </button>
        </div>

        {/* Warnings Banner if any */}
        {totalWarnings > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">{totalWarnings} geometry warning(s) detected:</span> Deviations from 90° or non-level heights should be verified before CAD handoff.
            </div>
          </div>
        )}

        {/* Objects List */}
        {measurement.objects.length === 0 ? (
          <div className="border-2 border-dashed border-stone-200 rounded-3xl p-8 text-center space-y-3 bg-stone-50/50">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-stone-900">No objects added yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Add each furniture item you are measuring on-site (e.g. Kitchen, Wardrobe, Vanity).
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-sm hover:bg-stone-800 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Object</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {measurement.objects.map((obj) => {
              const template = getTemplateForType(obj.objectTypeId);
              const walls = getWalls(obj);
              const techPoints = getTechnicalPoints(obj);
              const appliances = getAppliances(obj);
              const photoCount = obj.media?.length || 0;
              const isDeleting = deleteConfirmId === obj.id;

              return (
                <TouchCard
                  key={obj.id}
                  onClick={() => onSelectObject(obj.id)}
                  className="space-y-3 hover:border-emerald-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {TEMPLATE_ICONS[obj.objectTypeId] || <Box className="w-5 h-5 text-stone-600" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors">
                            {obj.name}
                          </h3>
                        </div>
                        <p className="text-[11px] font-semibold text-stone-500">
                          {template.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CompletenessBadge
                        score={obj.completeness?.score || 0}
                        size="sm"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(isDeleting ? null : obj.id);
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete object"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Banner */}
                  {isDeleting && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-rose-800">
                        Delete this object and all measurements?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200/60 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteObject(obj.id, e)}
                          className="px-2.5 py-1 text-xs font-extrabold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-entity Counters Pills */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-stone-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      <span>{walls.length} Walls</span>
                    </span>

                    {techPoints.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        <span>{techPoints.length} Tech Points</span>
                      </span>
                    )}

                    {appliances.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <span>{appliances.length} Appliances</span>
                      </span>
                    )}

                    {photoCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Camera className="w-3 h-3" />
                        <span>{photoCount}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 bg-stone-100/70 px-2 py-0.5 rounded-md">
                        <Camera className="w-3 h-3" />
                        <span>0 photos</span>
                      </span>
                    )}

                    <div className="ml-auto flex items-center text-xs font-extrabold text-stone-700 group-hover:text-emerald-600 transition-colors">
                      <span>Measure</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </TouchCard>
              );
            })}
          </div>
        )}

        {/* General Notes Card */}
        <TouchCard className="space-y-2 bg-stone-50/80 border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
              Specialist Field Notes
            </span>
            <span className="text-[11px] text-stone-400">{measurement.specialistName}</span>
          </div>
          <p className="text-xs text-stone-700 italic">
            {measurement.generalNotes || 'No visit-level notes recorded yet.'}
          </p>
        </TouchCard>
      </main>

      {/* Sticky Bottom Bar for Finalizing */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 p-4 z-20 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="p-3.5 rounded-2xl bg-stone-100 text-stone-800 font-bold hover:bg-stone-200 active:scale-95 transition-all"
            title="Add another object"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onProceedToSummary}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-stone-950 text-white font-extrabold text-sm shadow-md hover:bg-stone-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Review & Finalize Visit</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
              {measurement.overallCompletenessPct}%
            </span>
          </button>
        </div>
      </footer>

      {/* Modal: Add Furniture Object */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Add Furniture Object</h3>
                <p className="text-xs text-stone-500">Select template to apply provisional measurement fields</p>
              </div>
            </div>

            {/* Template Selector Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {templates.map(tmpl => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-stone-100">
                        {TEMPLATE_ICONS[tmpl.id] || <Box className="w-4 h-4 text-stone-600" />}
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-900 leading-tight">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                        {tmpl.sections.length} sections
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Custom Label (Optional)</label>
              <input
                type="text"
                value={customNameInput}
                onChange={e => setCustomNameInput(e.target.value)}
                placeholder="e.g. Master Bathroom Vanity, Kitchen L-Shape"
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateObject}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating...' : 'Start Measuring'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
