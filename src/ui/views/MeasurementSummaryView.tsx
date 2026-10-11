import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Home,
  Utensils,
  Bath,
  DoorClosed,
  Tv,
  Box
} from 'lucide-react';
import { Measurement, MeasurementStatus } from '../../domain/types/measurement';
import { MediaAttachment } from '../../domain/types/subEntities';
import { mediaStorageService } from '../../infrastructure/storage/indexedDbMediaStorage';
import {
  getWalls,
  getOpenings,
  getTechnicalPoints,
  getAppliances,
  getSectionParameters
} from '../../domain/types/furnitureObject';
import { getTemplateForType } from '../../domain/templates/registry';

interface MeasurementSummaryViewProps {
  measurement: Measurement;
  projectName: string;
  clientName: string;
  onBackToOverview: () => void;
  onBackToDashboard: () => void;
  onDownloadJson: () => Promise<void>;
  onStatusChange: (status: MeasurementStatus) => Promise<void>;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  kitchen: <Utensils className="w-5 h-5 text-amber-600" />,
  bathroom_cabinet: <Bath className="w-5 h-5 text-sky-600" />,
  wardrobe: <DoorClosed className="w-5 h-5 text-indigo-600" />,
  hallway: <DoorClosed className="w-5 h-5 text-violet-600" />,
  living_room: <Tv className="w-5 h-5 text-rose-600" />,
  other: <Box className="w-5 h-5 text-stone-600" />
};

function SummaryPhotoThumbnail({ photo }: { photo: MediaAttachment }) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    mediaStorageService.getMediaUrl(photo.storageKey).then(resolved => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [photo.storageKey]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 h-28 group">
      {url ? (
        <img src={url} alt={photo.caption || photo.fileName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
          Loading...
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-1.5 left-2 right-2 text-white">
        <span className="text-[9px] uppercase font-extrabold px-1 rounded bg-black/50">
          {photo.tag}
        </span>
        <p className="text-[11px] font-medium truncate leading-tight mt-0.5">
          {photo.caption || photo.fileName}
        </p>
      </div>
    </div>
  );
}

export const MeasurementSummaryView: React.FC<MeasurementSummaryViewProps> = ({
  measurement,
  projectName,
  clientName,
  onBackToOverview,
  onBackToDashboard,
  onDownloadJson,
  onStatusChange
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<MeasurementStatus>(measurement.status);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await onDownloadJson();
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusToggle = async () => {
    const nextStatus: MeasurementStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    setCurrentStatus(nextStatus);
    await onStatusChange(nextStatus);
  };

  const allMissing = measurement.objects.flatMap(o =>
    (o.completeness?.missing || []).map(msg => ({ objectName: o.name, message: msg }))
  );
  const allWarnings = measurement.objects.flatMap(o =>
    (o.completeness?.warnings || []).map(msg => ({ objectName: o.name, message: msg }))
  );
  const totalPhotos = measurement.objects.reduce((sum, o) => sum + (o.media?.length || 0), 0);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-28 print:bg-white print:pb-0">
      {/* Top Mobile Bar (Hidden in Print) */}
      <header className="bg-stone-900 text-white px-5 pt-6 pb-6 rounded-b-[2rem] shadow-md print:hidden">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                title="Print Summary"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
                title="Home Dashboard"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>{clientName}</span>
              <span>•</span>
              <span className="text-stone-300">{projectName}</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white mt-1">
              Measurement Summary & Handoff
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Measured by {measurement.specialistName} on {new Date(measurement.measurementDate).toLocaleDateString()}
            </p>
          </div>

          {/* Status & Quick Action Ribbon */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                currentStatus === 'COMPLETED'
                  ? 'bg-emerald-500 text-stone-950 hover:bg-emerald-400'
                  : 'bg-stone-800 text-amber-400 border border-stone-700 hover:bg-stone-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: {currentStatus}</span>
            </button>

            <span className="text-xs font-extrabold text-stone-300">
              Overall Completeness: <span className="text-emerald-400">{measurement.overallCompletenessPct}%</span>
            </span>
          </div>
        </div>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:block p-6 border-b border-stone-300">
        <h1 className="text-2xl font-black text-stone-900">Custom Furniture Measurement Report</h1>
        <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-stone-700">
          <div>
            <p><span className="font-bold">Client:</span> {clientName}</p>
            <p><span className="font-bold">Project:</span> {projectName}</p>
          </div>
          <div>
            <p><span className="font-bold">Date:</span> {new Date(measurement.measurementDate).toLocaleDateString()}</p>
            <p><span className="font-bold">Specialist:</span> {measurement.specialistName}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full px-4 pt-5 space-y-5 print:px-6">
        {/* Quality & Guardrails Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Constructor Quality Guardrails
            </h2>
            <span className="text-xs font-bold text-stone-500">
              {measurement.objects.length} Object(s) • {totalPhotos} Photo(s)
            </span>
          </div>

          {allMissing.length === 0 && allWarnings.length === 0 ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-extrabold">All Quality Checks Passed:</span> All critical wall dimensions, angles, and technical points have been marked. Ready for CAD layout generation.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {allMissing.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Missing Required Fields ({allMissing.length}):</span>
                  </div>
                  <ul className="text-xs text-rose-800 list-disc pl-5 space-y-0.5">
                    {allMissing.map((m, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{m.objectName}:</span> {m.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {allWarnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Non-standard Tolerances / Angle Warnings ({allWarnings.length}):</span>
                  </div>
                  <ul className="text-xs text-amber-800 list-disc pl-5 space-y-0.5">
                    {allWarnings.map((w, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{w.objectName}:</span> {w.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Objects Detailed Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 px-1">
            Objects & Room Geometry
          </h2>

          {measurement.objects.map((obj) => {
            const template = getTemplateForType(obj.objectTypeId);
            const walls = getWalls(obj);
            const openings = getOpenings(obj);
            const techPoints = getTechnicalPoints(obj);
            const appliances = getAppliances(obj);
            const generalParams = getSectionParameters<Record<string, any>>(obj, 'general');

            return (
              <div
                key={obj.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-5 print:break-inside-avoid"
              >
                {/* Object Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center">
                      {TEMPLATE_ICONS[obj.objectTypeId] || <Box className="w-5 h-5 text-stone-600" />}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900">{obj.name}</h3>
                      <p className="text-xs font-medium text-stone-500">{template.name}</p>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-stone-100 text-stone-800">
                    {obj.completeness?.score || 0}% Complete
                  </span>
                </div>

                {/* General Parameters */}
                {generalParams && Object.keys(generalParams).length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      General Parameters
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(generalParams).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold text-stone-800">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Walls Table */}
                {walls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Walls & Corner Angles ({walls.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 font-bold text-[11px]">
                            <th className="py-2 pr-3">Wall</th>
                            <th className="py-2 px-2 text-right">Length (mm)</th>
                            <th className="py-2 px-2 text-right">Height L (mm)</th>
                            <th className="py-2 px-2 text-right">Height R (mm)</th>
                            <th className="py-2 px-2 text-right">Angle (°)</th>
                            <th className="py-2 pl-2 text-right">Plumb Tilt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {walls.map(w => (
                            <tr key={w.id} className="font-semibold text-stone-800">
                              <td className="py-2 pr-3 font-bold">{w.payload.identifier}</td>
                              <td className="py-2 px-2 text-right font-black">{w.payload.lengthMm}</td>
                              <td className="py-2 px-2 text-right">{w.payload.heightLeftMm}</td>
                              <td className="py-2 px-2 text-right">{w.payload.heightRightMm}</td>
                              <td className={`py-2 px-2 text-right ${Math.abs((w.payload.cornerAngleDeg ?? 90) - 90) > 1.5 ? 'text-amber-700 font-black' : ''}`}>
                                {w.payload.cornerAngleDeg ?? 90}°
                              </td>
                              <td className="py-2 pl-2 text-right">{w.payload.plumbDeviationMm} mm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Openings & Obstacles */}
                {openings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Openings & Obstacles ({openings.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {openings.map(op => (
                        <div key={op.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-bold text-stone-900 block capitalize">{op.payload.type.replace(/_/g, ' ')} ({op.payload.wallRef})</span>
                            <span className="text-[11px] text-stone-500">
                              Corner dist: {op.payload.distanceFromCornerMm}mm • Size: {op.payload.widthMm}x{op.payload.heightMm}mm
                            </span>
                          </div>
                          {op.payload.projectionDepthMm !== undefined && op.payload.projectionDepthMm > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                              +{op.payload.projectionDepthMm}mm depth
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Points */}
                {techPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Technical Feeds & Outlets ({techPoints.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {techPoints.map(tp => (
                        <div key={tp.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-bold text-stone-900 block">{tp.payload.type.replace(/_/g, ' ')}</span>
                            <span className="text-[11px] text-stone-500">
                              Corner dist: {tp.payload.distanceFromCornerMm}mm • Floor: {tp.payload.heightFromFloorMm}mm
                            </span>
                          </div>
                          {tp.payload.diameterMm && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                              Ø {tp.payload.diameterMm}mm
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appliances */}
                {appliances.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Appliances ({appliances.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {appliances.map(app => (
                        <div key={app.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 uppercase text-[11px]">
                              {app.payload.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                              {app.payload.status}
                            </span>
                          </div>
                          <p className="text-stone-600 font-medium">
                            {app.payload.brandModel || ''} ({app.payload.widthMm || 0}x{app.payload.heightMm || 0}x{app.payload.depthMm || 0}mm)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos Preview */}
                {obj.media && obj.media.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Photos & Visual Documentation ({obj.media.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {obj.media.map(photo => (
                        <SummaryPhotoThumbnail key={photo.id} photo={photo} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Field Notes */}
                {obj.notes && obj.notes.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Specialist Notes ({obj.notes.length})
                    </h4>
                    <div className="space-y-1 pl-2 border-l-2 border-stone-300">
                      {obj.notes.map(note => (
                        <p key={note.id} className="text-xs text-stone-700 italic">
                          "{note.text}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar for Exporting (Hidden in Print) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 p-4 z-20 shadow-lg print:hidden">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToOverview}
            className="py-3.5 px-4 rounded-2xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
          >
            Edit Objects
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileCode className="w-4 h-4" />
            <span>{isExporting ? 'Generating JSON...' : 'Download Constructor Package (JSON)'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
