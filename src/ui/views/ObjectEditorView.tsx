import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Square,
  DoorOpen,
  Zap,
  Refrigerator,
  Camera,
  FileText,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FurnitureObject } from '../../domain/types/furnitureObject';
import { MediaTag } from '../../domain/types/subEntities';
import { getTemplateForType } from '../../domain/templates/registry';
import { CompletenessBadge } from '../components/CompletenessBadge';
import { GeneralSectionForm } from '../forms/GeneralSectionForm';
import { WallsSectionForm } from '../forms/WallsSectionForm';
import { OpeningsSectionForm } from '../forms/OpeningsSectionForm';
import { TechnicalSectionForm } from '../forms/TechnicalSectionForm';
import { AppliancesSectionForm } from '../forms/AppliancesSectionForm';
import { NotesSectionForm } from '../forms/NotesSectionForm';
import { PhotoUploader } from '../components/PhotoUploader';

interface ObjectEditorViewProps {
  object: FurnitureObject;
  onUpdateObject: (updated: FurnitureObject) => Promise<void>;
  onAttachPhoto: (file: File, tag: MediaTag, caption?: string) => Promise<void>;
  onRemovePhoto: (mediaId: string) => Promise<void>;
  onBackToOverview: () => void;
  isSaving?: boolean;
}

interface SectionTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const ObjectEditorView: React.FC<ObjectEditorViewProps> = ({
  object,
  onUpdateObject,
  onAttachPhoto,
  onRemovePhoto,
  onBackToOverview,
  isSaving
}) => {
  const template = getTemplateForType(object.objectTypeId);
  const [activeSectionId, setActiveSectionId] = useState<string>('general');
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

  // Build tabs dynamically according to template sections plus media & notes
  const tabs: SectionTab[] = [];

  // 1. Template-configured sections
  for (const sec of template.sections) {
    if (sec.id === 'general') {
      tabs.push({
        id: 'general',
        label: sec.title || 'General',
        icon: <SlidersHorizontal className="w-4 h-4" />
      });
    } else if (sec.id === 'walls') {
      const wallCount = object.sections.walls?.items?.length || 0;
      tabs.push({
        id: 'walls',
        label: sec.title || 'Walls & Angles',
        icon: <Square className="w-4 h-4" />,
        badge: wallCount
      });
    } else if (sec.id === 'openings') {
      const openCount = object.sections.openings?.items?.length || 0;
      tabs.push({
        id: 'openings',
        label: sec.title || 'Openings',
        icon: <DoorOpen className="w-4 h-4" />,
        badge: openCount
      });
    } else if (sec.id === 'technical_points' || sec.id === 'technical') {
      const techCount = (object.sections.technical_points?.items || object.sections.technical?.items)?.length || 0;
      tabs.push({
        id: 'technical',
        label: sec.title || 'Tech Points',
        icon: <Zap className="w-4 h-4" />,
        badge: techCount
      });
    } else if (sec.id === 'appliances') {
      const appCount = object.sections.appliances?.items?.length || 0;
      tabs.push({
        id: 'appliances',
        label: sec.title || 'Appliances',
        icon: <Refrigerator className="w-4 h-4" />,
        badge: appCount
      });
    } else {
      // Any other dynamic section from future templates
      tabs.push({
        id: sec.id,
        label: sec.title,
        icon: <SlidersHorizontal className="w-4 h-4" />
      });
    }
  }

  // 2. Photos Tab
  tabs.push({
    id: 'media',
    label: 'Photos',
    icon: <Camera className="w-4 h-4" />,
    badge: object.media?.length || 0
  });

  // 3. Notes Tab
  tabs.push({
    id: 'notes',
    label: 'Field Notes',
    icon: <FileText className="w-4 h-4" />,
    badge: object.notes?.length || 0
  });

  const activeIndex = tabs.findIndex(t => t.id === activeSectionId);

  const handlePrevSection = () => {
    if (activeIndex > 0) {
      setActiveSectionId(tabs[activeIndex - 1].id);
    }
  };

  const handleNextSection = () => {
    if (activeIndex < tabs.length - 1) {
      setActiveSectionId(tabs[activeIndex + 1].id);
    } else {
      onBackToOverview();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateObject({
      ...object,
      name: e.target.value
    });
  };

  const completeness = object.completeness || { score: 0, missing: [], warnings: [], ok: [] };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-28">
      {/* Top Mobile Bar */}
      <header className="bg-stone-900 text-white px-5 pt-6 pb-4 rounded-b-[2rem] shadow-md sticky top-0 z-30">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1 text-stone-400 hover:text-white transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>

            <div className="flex items-center gap-2">
              {isSaving ? (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Saving...
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-saved
                </span>
              )}

              <CompletenessBadge
                score={completeness.score}
                size="sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={object.name}
              onChange={handleNameChange}
              className="text-lg font-black tracking-tight text-white bg-transparent border-b border-stone-700 focus:border-emerald-400 focus:outline-none w-full py-0.5"
              placeholder="Furniture Object Name"
            />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-stone-800 text-stone-300 shrink-0">
              {template.name}
            </span>
          </div>

          {/* Quality Summary Strip (Tap to Expand Checklist) */}
          <button
            type="button"
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="w-full text-left bg-stone-800/80 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-700/60 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-300">Completeness Checklist:</span>
              <span className="text-xs font-black text-emerald-400">{completeness.score}%</span>
              {completeness.missing.length > 0 && (
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-0.5">
                  • {completeness.missing.length} missing
                </span>
              )}
              {completeness.warnings.length > 0 && (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
                  • {completeness.warnings.length} warnings
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-stone-400 underline">
              {isChecklistExpanded ? 'Hide' : 'Inspect'}
            </span>
          </button>
        </div>
      </header>

      {/* Expanded Completeness & Guardrail Checklist */}
      {isChecklistExpanded && (
        <div className="max-w-xl mx-auto w-full px-4 pt-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Measurement Guardrails & Validation
              </h3>
              <button
                type="button"
                onClick={() => setIsChecklistExpanded(false)}
                className="text-xs text-stone-400 hover:text-stone-700 font-bold"
              >
                Close
              </button>
            </div>

            {/* Missing items */}
            {completeness.missing.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Required Missing Data ({completeness.missing.length})
                </span>
                <ul className="space-y-1 pl-4">
                  {completeness.missing.map((msg, idx) => (
                    <li key={idx} className="text-xs text-stone-700 list-disc">
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {completeness.warnings.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Geometry & Fitting Warnings ({completeness.warnings.length})
                </span>
                <ul className="space-y-1 pl-4">
                  {completeness.warnings.map((msg, idx) => (
                    <li key={idx} className="text-xs text-stone-700 list-disc">
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verified OK checks */}
            {completeness.ok.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Items ({completeness.ok.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {completeness.ok.map((msg, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                    >
                      ✓ {msg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Section Tabs */}
      <nav className="max-w-xl mx-auto w-full px-4 pt-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map(tab => {
            const isActive = tab.id === activeSectionId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSectionId(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Active Form Body */}
      <main className="max-w-xl mx-auto w-full px-4 pt-4">
        {activeSectionId === 'general' && (
          <GeneralSectionForm
            object={object}
            template={template}
            onChange={onUpdateObject}
          />
        )}

        {activeSectionId === 'walls' && (
          <WallsSectionForm
            object={object}
            onChange={onUpdateObject}
          />
        )}

        {activeSectionId === 'openings' && (
          <OpeningsSectionForm
            object={object}
            onChange={onUpdateObject}
          />
        )}

        {activeSectionId === 'technical' && (
          <TechnicalSectionForm
            object={object}
            onChange={onUpdateObject}
          />
        )}

        {activeSectionId === 'appliances' && (
          <AppliancesSectionForm
            object={object}
            onChange={onUpdateObject}
          />
        )}

        {activeSectionId === 'media' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
            <PhotoUploader
              photos={object.media || []}
              onAttachFile={onAttachPhoto}
              onRemovePhoto={onRemovePhoto}
            />
          </div>
        )}

        {activeSectionId === 'notes' && (
          <NotesSectionForm
            object={object}
            onChange={onUpdateObject}
          />
        )}
      </main>

      {/* Sticky Bottom Wizard Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 p-3 z-20 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={handlePrevSection}
            className="py-3 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={onBackToOverview}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 underline"
          >
            All Objects
          </button>

          <button
            type="button"
            onClick={handleNextSection}
            className="py-3 px-5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>{activeIndex === tabs.length - 1 ? 'Save & Overview' : 'Next Section'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
