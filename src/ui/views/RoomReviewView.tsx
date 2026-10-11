import React, { useState } from 'react';
import { useRoomMeasurementSession } from '../../application/useRoomMeasurementSession';
import { Room2DPreview } from '../components/Room2DPreview';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Check,
  Edit3,
  Building,
  User,
  MapPin,
  Calendar,
  Layers,
  DoorOpen,
  Zap,
  Camera,
  FileSignature,
  FileCode
} from 'lucide-react';

interface RoomReviewViewProps {
  roomId: string;
  projectName?: string;
  clientName?: string;
  clientPhone?: string;
  siteAddress?: string;
  onBackToEdit: () => void;
  onDone: () => void;
}

export const RoomReviewView: React.FC<RoomReviewViewProps> = ({
  roomId,
  projectName = 'Projekt',
  clientName = 'Klient',
  clientPhone = '+48 ...',
  siteAddress = 'ul. Marszałkowska 10/4, Warszawa',
  onBackToEdit,
  onDone
}) => {
  const {
    room,
    session,
    completeness,
    updateSessionStatus,
    exportCanonicalJson
  } = useRoomMeasurementSession(roomId);

  const [isExporting, setIsExporting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);

  if (!room) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <p className="text-sm text-stone-500">Wczytywanie podsumowania...</p>
      </div>
    );
  }

  const handleComplete = async () => {
    await updateSessionStatus('COMPLETED');
    setCompleteSuccess(true);
    setTimeout(() => {
      onDone();
    }, 1200);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportCanonicalJson();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-900 text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="p-2 -ml-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition active:scale-95"
            title="Powrót do edycji"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-stone-100 leading-tight">
              Weryfikacja Pomiaru Pomieszczenia
            </h1>
            <p className="text-[11px] text-stone-400">
              {room.name} • {session?.status === 'COMPLETED' ? 'ZATWIERDZONY' : 'SZKIC'}
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold shadow hover:bg-amber-400 active:scale-95 transition"
        >
          <Download size={14} />
          <span>Eksport JSON</span>
        </button>
      </header>

      {/* Body Container */}
      <main className="flex-1 p-3 max-w-xl mx-auto w-full space-y-4">
        {/* 1. Completeness & Verification Status Banner */}
        <div
          className={`rounded-2xl p-4 shadow-sm border ${
            completeness.isReadyForDesign
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
              : 'bg-stone-900 text-stone-100 border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  completeness.score >= 80
                    ? 'bg-emerald-500 text-white'
                    : completeness.score >= 50
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-700 text-stone-200'
                }`}
              >
                {completeness.score}%
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {completeness.isReadyForDesign
                    ? 'Pomiar zweryfikowany — gotowy do projektowania'
                    : 'Wymaga uzupełnienia danych'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Firma YADIMA • Raport kontrolny z natury
                </p>
              </div>
            </div>

            <button
              onClick={onBackToEdit}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold underline"
            >
              <Edit3 size={13} /> Edytuj
            </button>
          </div>

          {/* Missing critical items */}
          {completeness.missing.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-wider">
                <AlertCircle size={13} /> Braki krytyczne ({completeness.missing.length}):
              </span>
              {completeness.missing.map((msg, i) => (
                <p key={i} className="text-xs text-stone-300 pl-4 border-l-2 border-red-500/60">
                  {msg}
                </p>
              ))}
            </div>
          )}

          {/* Warnings */}
          {completeness.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle size={13} /> Ostrzeżenia jakościowe ({completeness.warnings.length}):
              </span>
              {completeness.warnings.map((msg, i) => (
                <p key={i} className="text-xs text-stone-300 pl-4 border-l-2 border-amber-500/60">
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* 2. Schematic 2D Derived Floor Plan */}
        <Room2DPreview room={room} />

        {/* 3. Client, Project, Site & Session Context Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2">
            Kontekst inwestycji & Sesja pomiarowa
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 flex items-center gap-1 text-[11px] mb-0.5">
                <User size={12} /> Klient:
              </span>
              <p className="font-bold text-stone-900">{clientName}</p>
              <p className="text-stone-500 font-mono text-[11px]">{clientPhone}</p>
            </div>

            <div>
              <span className="text-stone-400 flex items-center gap-1 text-[11px] mb-0.5">
                <Building size={12} /> Projekt:
              </span>
              <p className="font-bold text-stone-900">{projectName}</p>
              <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                {session?.status || 'DRAFT'}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-stone-400 flex items-center gap-1 text-[11px] mb-0.5">
                <MapPin size={12} /> Adres budowy (Site):
              </span>
              <p className="text-stone-800 font-medium">{siteAddress}</p>
            </div>

            <div>
              <span className="text-stone-400 flex items-center gap-1 text-[11px] mb-0.5">
                <Calendar size={12} /> Data pomiaru:
              </span>
              <p className="text-stone-800 font-mono font-medium">
                {session?.measurementDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>

            <div>
              <span className="text-stone-400 text-[11px] block mb-0.5">Mierzył specjalista:</span>
              <p className="text-stone-800 font-medium">
                {session?.specialistName || 'Dima (Firma YADIMA)'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Spatial Summary (Walls, Openings, Utilities, Obstacles) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-600" /> Ściany pomieszczenia ({room.walls.length})
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              Sufit: <b>{room.ceilingHeightMm} mm</b>
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {room.walls.map(w => (
              <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900">{w.identifier}</span>
                  <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                    Długość: <b>{w.lengthMm} mm</b>
                    {w.heightLeftMm && ` | Wysokość: ${w.heightLeftMm} mm`}
                  </div>
                </div>
                {w.cornerAngleDeg !== undefined && (
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-stone-100 text-stone-700">
                    {w.cornerAngleDeg}°
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Openings Summary */}
          <div className="pt-3 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
              <DoorOpen size={14} className="text-sky-600" /> Otwory & Przeszkody ({room.openings.length})
            </h4>
            {room.openings.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Brak otworów</p>
            ) : (
              <div className="space-y-1.5">
                {room.openings.map(op => (
                  <div
                    key={op.id}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-800">
                        {op.type === 'window' ? 'Okno' : op.type === 'door' ? 'Drzwi' : op.type === 'radiator' ? 'Grzejnik' : op.type}
                      </span>
                      <span className="text-stone-500 ml-1">({op.wallIdentifier || 'Ściana'})</span>
                      <p className="text-[11px] font-mono text-stone-600">
                        Od rogu: {op.distanceFromCornerMm} mm | {op.widthMm} × {op.heightMm} mm
                        {op.sillHeightMm !== undefined && ` | Parapet: ${op.sillHeightMm} mm`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilities Summary */}
          <div className="pt-3 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> Przyłącza & Instalacje ({room.utilityPoints.length})
            </h4>
            {room.utilityPoints.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Brak punktów instalacji</p>
            ) : (
              <div className="space-y-1.5">
                {room.utilityPoints.map(u => (
                  <div
                    key={u.id}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-stone-800">
                        {u.type === 'water_cold'
                          ? 'Woda zimna'
                          : u.type === 'water_hot'
                          ? 'Woda ciepła'
                          : u.type === 'drain_pipe'
                          ? 'Odpływ'
                          : u.type === 'socket_400v'
                          ? 'Siła 400V'
                          : u.type === 'socket_230v'
                          ? 'Gniazdo 230V'
                          : u.type}
                      </span>
                      <span className="text-stone-500 text-[11px] ml-1">({u.wallIdentifier})</span>
                      <p className="text-[11px] text-stone-600">
                        Narożnik: {u.distanceFromCornerMm} mm | Wys. posadzka: {u.heightFromFloorMm} mm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Hand-Drawn Sketches & Photos Summary */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
            Dokumentacja wizualna & Szkice
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                <FileSignature size={14} />
                <span>Szkice odręczne ({room.sketches.length})</span>
              </div>
              <p className="text-[11px] text-amber-700">
                {room.sketches.length > 0
                  ? `Zapisano ${room.sketches.length} szkic(y) z natury`
                  : 'Brak wgranego szkicu z natury'}
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-stone-800 font-bold mb-1">
                <Camera size={14} />
                <span>Zdjęcia z budowy ({room.media.length})</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {room.media.length > 0
                  ? `${room.media.length} zdjęć w IndexedDB`
                  : 'Brak zdjęć'}
              </p>
            </div>
          </div>
        </div>

        {/* 6. General Notes */}
        {room.notes && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              Notatki ogólne
            </h4>
            <p className="text-xs text-stone-700 whitespace-pre-wrap">{room.notes}</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 px-4 py-3 shadow-2xl backdrop-blur-md bg-stone-900/95">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={onBackToEdit}
            className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
          >
            <Edit3 size={14} />
            <span>Edytuj</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
            title="Pobierz czysty kanoniczny JSON"
          >
            <FileCode size={14} />
            <span>JSON</span>
          </button>

          <button
            onClick={handleComplete}
            disabled={completeSuccess}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow transition active:scale-95 flex items-center justify-center gap-1.5 ${
              completeSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
            }`}
          >
            {completeSuccess ? (
              <>
                <Check size={16} />
                <span>Pomiar zatwierdzony!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Zatwierdź i Zakończ Pomiar</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};
