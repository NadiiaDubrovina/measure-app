import React, { useState } from 'react';
import { useRoomMeasurementSession } from '../../application/useRoomMeasurementSession';
import { OpeningType, UtilityType, WallMaterial } from '../../domain/types/spatial';
import { SketchUploader } from '../components/SketchUploader';
import { PhotoUploader } from '../components/PhotoUploader';
import { Room2DPreview } from '../components/Room2DPreview';
import {
  ArrowLeft,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Layers,
  DoorOpen,
  Zap,
  FileSignature,
  Camera,
  Settings,
  ArrowRight
} from 'lucide-react';

interface RoomCaptureViewProps {
  roomId: string;
  projectName?: string;
  clientName?: string;
  onBack: () => void;
  onGoToReview: () => void;
}

type TabType = 'walls' | 'openings' | 'utilities' | 'sketches' | 'photos' | 'info';

export const RoomCaptureView: React.FC<RoomCaptureViewProps> = ({
  roomId,
  projectName = 'Projekt',
  clientName = 'Klient',
  onBack,
  onGoToReview
}) => {
  const {
    room,
    loading,
    isSaving,
    lastSavedAt,
    completeness,
    updateRoomInfo,
    addWall,
    updateWall,
    removeWall,
    addOpening,
    removeOpening,
    addUtilityPoint,
    removeUtilityPoint,
    attachPhoto,
    removePhoto,
    attachSketch,
    removeSketch
  } = useRoomMeasurementSession(roomId);

  const [activeTab, setActiveTab] = useState<TabType>('walls');

  // --- Fast Wall Entry State (<3 taps) ---
  const getNextWallIdentifier = () => {
    const count = room?.walls.length || 0;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `Ściana ${letters[count] || count + 1}`;
  };

  const [wallId, setWallId] = useState<string | null>(null);
  const [wallIdentifier, setWallIdentifier] = useState(getNextWallIdentifier());
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('2650');
  const [wallAngle, setWallAngle] = useState('90.0');
  const [wallMiddleLength, setWallMiddleLength] = useState('');
  const [wallMaterial, setWallMaterial] = useState<WallMaterial>('concrete');
  const [wallNotes, setWallNotes] = useState('');
  const [showWallForm, setShowWallForm] = useState(false);

  // --- Fast Opening Entry State ---
  const [openingType, setOpeningType] = useState<OpeningType>('window');
  const [openingWallId, setOpeningWallId] = useState('');
  const [openingDistance, setOpeningDistance] = useState('');
  const [openingWidth, setOpeningWidth] = useState('1200');
  const [openingHeight, setOpeningHeight] = useState('1450');
  const [openingSill, setOpeningSill] = useState('850');
  const [openingProjection, setOpeningProjection] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [showOpeningForm, setShowOpeningForm] = useState(false);

  // --- Fast Utility Point Entry State ---
  const [utilType, setUtilType] = useState<UtilityType>('socket_230v');
  const [utilWallId, setUtilWallId] = useState('');
  const [utilDistance, setUtilDistance] = useState('');
  const [utilHeight, setUtilHeight] = useState('1100');
  const [utilNotes, setUtilNotes] = useState('');
  const [showUtilForm, setShowUtilForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-stone-600">Wczytywanie pomiaru pomieszczenia...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-sm text-center">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-stone-900">Nie znaleziono pomieszczenia</h2>
          <p className="text-xs text-stone-500 mt-1 mb-4">Wybierz inne pomieszczenie lub utwórz nowe.</p>
          <button
            onClick={onBack}
            className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Wróć do pulpitu
          </button>
        </div>
      </div>
    );
  }

  // Handle Save Wall
  const handleSaveWall = (addNext: boolean = false) => {
    const lengthNum = parseFloat(wallLength);
    if (!lengthNum || lengthNum <= 0) return;

    const angleNum = wallAngle ? parseFloat(wallAngle) : undefined;
    const heightNum = wallHeight ? parseFloat(wallHeight) : room.ceilingHeightMm;
    const midNum = wallMiddleLength ? parseFloat(wallMiddleLength) : undefined;

    if (wallId) {
      updateWall(wallId, {
        identifier: wallIdentifier,
        lengthMm: lengthNum,
        lengthMiddleMm: midNum,
        heightLeftMm: heightNum,
        heightRightMm: heightNum,
        cornerAngleDeg: angleNum,
        material: wallMaterial,
        notes: wallNotes.trim() || undefined
      });
      setWallId(null);
      setShowWallForm(false);
    } else {
      addWall({
        identifier: wallIdentifier || getNextWallIdentifier(),
        sequenceIndex: room.walls.length,
        lengthMm: lengthNum,
        lengthMiddleMm: midNum,
        heightLeftMm: heightNum,
        heightRightMm: heightNum,
        cornerAngleDeg: angleNum,
        material: wallMaterial,
        notes: wallNotes.trim() || undefined
      });

      if (addNext) {
        // Fast Add Next: Auto-increment Wall name, keep height/angle defaults, clear length
        const nextLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nextIdx = room.walls.length + 1;
        setWallIdentifier(`Ściana ${nextLetters[nextIdx] || nextIdx + 1}`);
        setWallLength('');
        setWallMiddleLength('');
        setWallNotes('');
      } else {
        setShowWallForm(false);
        setWallLength('');
        setWallMiddleLength('');
        setWallNotes('');
      }
    }
  };

  // Handle Save Opening
  const handleSaveOpening = (addNext: boolean = false) => {
    const distNum = parseFloat(openingDistance) || 0;
    const widthNum = parseFloat(openingWidth) || 900;
    const heightNum = parseFloat(openingHeight) || 1200;
    const sillNum = openingSill ? parseFloat(openingSill) : undefined;
    const projNum = openingProjection ? parseFloat(openingProjection) : undefined;

    const selectedWall = room.walls.find(w => w.id === openingWallId) || room.walls[0];

    addOpening({
      wallId: selectedWall?.id,
      wallIdentifier: selectedWall?.identifier,
      type: openingType,
      distanceFromCornerMm: distNum,
      widthMm: widthNum,
      heightMm: heightNum,
      sillHeightMm: sillNum,
      projectionDepthMm: projNum,
      notes: openingNotes.trim() || undefined
    });

    if (addNext) {
      setOpeningDistance('');
      setOpeningNotes('');
    } else {
      setShowOpeningForm(false);
      setOpeningDistance('');
      setOpeningNotes('');
    }
  };

  // Handle Save Utility
  const handleSaveUtility = (addNext: boolean = false) => {
    const distNum = parseFloat(utilDistance) || 0;
    const heightNum = parseFloat(utilHeight) || 1100;
    const selectedWall = room.walls.find(w => w.id === utilWallId) || room.walls[0];

    addUtilityPoint({
      wallId: selectedWall?.id,
      wallIdentifier: selectedWall?.identifier,
      type: utilType,
      distanceFromCornerMm: distNum,
      heightFromFloorMm: heightNum,
      notes: utilNotes.trim() || undefined
    });

    if (addNext) {
      setUtilDistance('');
      setUtilNotes('');
    } else {
      setShowUtilForm(false);
      setUtilDistance('');
      setUtilNotes('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-28">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-30 bg-stone-900 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition active:scale-95"
              title="Powrót do pulpitu"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-stone-100 leading-tight">
                  {room.name}
                </h1>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {room.roomType || 'Pomieszczenie'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate max-w-[200px]">
                {projectName} • {clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Autosave badge */}
            <div className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
              {isSaving ? (
                <span className="text-amber-400 animate-pulse">Zapisywanie...</span>
              ) : lastSavedAt ? (
                <span className="text-emerald-400">✓ Zapisano</span>
              ) : null}
            </div>

            {/* Completeness Badge */}
            <button
              onClick={onGoToReview}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
                completeness.score >= 80
                  ? 'bg-emerald-500 text-white'
                  : completeness.score >= 50
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}
            >
              <span>{completeness.score}%</span>
            </button>
          </div>
        </div>

        {/* Scrollable Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setActiveTab('walls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'walls'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Layers size={14} /> Ściany ({room.walls.length})
          </button>

          <button
            onClick={() => setActiveTab('openings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'openings'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <DoorOpen size={14} /> Otwory ({room.openings.length})
          </button>

          <button
            onClick={() => setActiveTab('utilities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'utilities'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Zap size={14} /> Przyłącza ({room.utilityPoints.length})
          </button>

          <button
            onClick={() => setActiveTab('sketches')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'sketches'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileSignature size={14} /> Szkic z natury ({room.sketches.length})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'photos'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Camera size={14} /> Zdjęcia ({room.media.length})
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              activeTab === 'info'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Settings size={14} /> Pokój & Sufit
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-3 max-w-xl mx-auto w-full space-y-4">
        {/* ========================================================= */}
        {/* TAB 1: WALLS (ŚCIANY) */}
        {/* ========================================================= */}
        {activeTab === 'walls' && (
          <div className="space-y-4">
            {/* Quick 2D Schematic */}
            <Room2DPreview room={room} />

            {/* List of Captured Walls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Zmierzone ściany ({room.walls.length})
                </h3>
                {!showWallForm && (
                  <button
                    onClick={() => {
                      setWallId(null);
                      setWallIdentifier(getNextWallIdentifier());
                      setWallLength('');
                      setShowWallForm(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition"
                  >
                    <Plus size={14} /> Dodaj ścianę
                  </button>
                )}
              </div>

              {room.walls.length === 0 && !showWallForm && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center">
                  <Layers size={32} className="text-amber-600 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-stone-800">Brak zmierzonych ścian</p>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Zacznij od pierwszej ściany (np. Ściana A z podejściem wody).
                  </p>
                  <button
                    onClick={() => {
                      setWallIdentifier('Ściana A');
                      setShowWallForm(true);
                    }}
                    className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95"
                  >
                    + Dodaj Ścianę A (z natury)
                  </button>
                </div>
              )}

              {room.walls.map(w => (
                <div
                  key={w.id}
                  className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{w.identifier}</span>
                      {w.cornerAngleDeg !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            w.cornerAngleDeg < 88.5 || w.cornerAngleDeg > 91.5
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          Kąt: {w.cornerAngleDeg}°
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-stone-600 mt-1 font-mono">
                      <span>Długość: <b className="text-stone-900">{w.lengthMm} mm</b></span>
                      {w.heightLeftMm && (
                        <span>Wysokość: {w.heightLeftMm} mm</span>
                      )}
                      {w.lengthMiddleMm && (
                        <span>Środek: {w.lengthMiddleMm} mm</span>
                      )}
                    </div>
                    {w.notes && (
                      <p className="text-[11px] text-stone-500 mt-1 italic">{w.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setWallId(w.id);
                        setWallIdentifier(w.identifier);
                        setWallLength(w.lengthMm.toString());
                        setWallHeight(w.heightLeftMm?.toString() || '2650');
                        setWallAngle(w.cornerAngleDeg?.toString() || '90.0');
                        setWallMiddleLength(w.lengthMiddleMm?.toString() || '');
                        setWallMaterial(w.material || 'concrete');
                        setWallNotes(w.notes || '');
                        setShowWallForm(true);
                      }}
                      className="p-2 text-stone-500 hover:text-stone-800 rounded-lg"
                      title="Edytuj"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeWall(w.id)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg"
                      title="Usuń"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fast Add/Edit Wall Form (< 3 taps) */}
            {showWallForm && (
              <div className="bg-white border-2 border-amber-500/80 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    {wallId ? 'Edytuj ścianę' : 'Szybki pomiar ściany'}
                  </h4>
                  <button
                    onClick={() => setShowWallForm(false)}
                    className="text-stone-400 text-xs hover:text-stone-700"
                  >
                    Anuluj
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Identyfikator ściany
                    </label>
                    <input
                      type="text"
                      value={wallIdentifier}
                      onChange={e => setWallIdentifier(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl font-bold bg-stone-50"
                      placeholder="np. Ściana A"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Kąt narożnika (°)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        value={wallAngle}
                        onChange={e => setWallAngle(e.target.value)}
                        className="w-full text-xs px-2 py-2 border border-stone-300 rounded-xl font-mono text-center font-bold"
                        placeholder="90.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Length Input (Primary Touch Target) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-900">
                      Długość przy posadzce (mm) *
                    </label>
                    <span className="text-[10px] text-stone-400">Główny wymiar lasera</span>
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={wallLength}
                    onChange={e => setWallLength(e.target.value)}
                    placeholder="np. 3450"
                    className="w-full text-xl font-mono font-bold px-3 py-3 border-2 border-stone-800 rounded-xl focus:border-amber-600 focus:outline-none bg-stone-50 text-stone-900"
                  />
                  {/* Quick Preset buttons */}
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 text-[11px]">
                    {[2400, 2800, 3000, 3200, 3450, 3600].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setWallLength(val.toString())}
                        className="px-2.5 py-1 rounded bg-stone-100 text-stone-700 font-mono hover:bg-stone-200"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Wall Heights & Bowing Check */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">
                      Wysokość ściany (mm)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={wallHeight}
                      onChange={e => setWallHeight(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl font-mono bg-stone-50"
                      placeholder="2650"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">
                      Długość na wys. 1000mm
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={wallMiddleLength}
                      onChange={e => setWallMiddleLength(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl font-mono bg-stone-50"
                      placeholder="opcjonalny brzuszek"
                    />
                  </div>
                </div>

                {/* Action Buttons (<3 Taps!) */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveWall(true)}
                    className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-700 transition active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>Zapisz & Dodaj Następną</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveWall(false)}
                    className="px-4 py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition active:scale-95"
                  >
                    Zapisz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OPENINGS (OTWORY & ELEMENTY STAŁE) */}
        {/* ========================================================= */}
        {activeTab === 'openings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Otwory i przeszkody ({room.openings.length})
              </h3>
              {!showOpeningForm && (
                <button
                  onClick={() => setShowOpeningForm(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95"
                >
                  <Plus size={14} /> Dodaj element
                </button>
              )}
            </div>

            {/* Existing Openings List */}
            {room.openings.length === 0 && !showOpeningForm && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500">
                <DoorOpen size={32} className="mx-auto mb-2 text-stone-400" />
                <p className="text-sm font-semibold text-stone-800">Brak zarejestrowanych otworów</p>
                <p className="text-xs text-stone-500 mt-1 mb-3">
                  Wprowadź okna, drzwi, wnęki lub grzejniki kolidujące z zabudową.
                </p>
                <button
                  onClick={() => setShowOpeningForm(true)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  + Dodaj okno lub drzwi
                </button>
              </div>
            )}

            {room.openings.map(op => (
              <div
                key={op.id}
                className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                      {op.type === 'window' ? 'Okno' : op.type === 'door' ? 'Drzwi' : op.type === 'radiator' ? 'Grzejnik' : op.type}
                    </span>
                    <span className="text-xs font-semibold text-stone-700">
                      {op.wallIdentifier || 'Ściana'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-stone-600 mt-1">
                    Od narożnika: <b>{op.distanceFromCornerMm} mm</b> | Wymiary: <b>{op.widthMm} × {op.heightMm} mm</b>
                    {op.sillHeightMm !== undefined && (
                      <span className="block text-[11px] text-stone-500">Wys. parapetu: {op.sillHeightMm} mm</span>
                    )}
                    {op.projectionDepthMm !== undefined && (
                      <span className="block text-[11px] text-amber-700">Wysunięcie grzejnika: {op.projectionDepthMm} mm</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeOpening(op.id)}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Fast Add Opening Form */}
            {showOpeningForm && (
              <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Nowy element ścienny
                  </h4>
                  <button onClick={() => setShowOpeningForm(false)} className="text-xs text-stone-400">
                    Anuluj
                  </button>
                </div>

                {/* Quick Type Selector */}
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'window', label: 'Okno' },
                    { id: 'door', label: 'Drzwi' },
                    { id: 'radiator', label: 'Grzejnik' },
                    { id: 'niche', label: 'Wnęka' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOpeningType(t.id as OpeningType)}
                      className={`py-2 rounded-xl text-center transition ${
                        openingType === t.id
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Target Wall Selection */}
                {room.walls.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Na której ścianie?
                    </label>
                    <select
                      value={openingWallId || room.walls[0].id}
                      onChange={e => setOpeningWallId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      {room.walls.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.identifier} ({w.lengthMm} mm)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Odległość od narożnika (mm) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={openingDistance}
                      onChange={e => setOpeningDistance(e.target.value)}
                      placeholder="np. 800"
                      className="w-full text-sm font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Szerokość (mm) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={openingWidth}
                      onChange={e => setOpeningWidth(e.target.value)}
                      className="w-full text-sm font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Wysokość (mm)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={openingHeight}
                      onChange={e => setOpeningHeight(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                      placeholder="1450"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {openingType === 'radiator' ? 'Wysunięcie (mm)' : 'Wysokość parapetu (mm)'}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={openingType === 'radiator' ? openingProjection : openingSill}
                      onChange={e =>
                        openingType === 'radiator'
                          ? setOpeningProjection(e.target.value)
                          : setOpeningSill(e.target.value)
                      }
                      className="w-full text-xs font-mono px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                      placeholder="np. 850"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveOpening(true)}
                    className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow active:scale-95"
                  >
                    Zapisz i dodaj kolejny
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveOpening(false)}
                    className="px-4 py-2.5 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold active:scale-95"
                  >
                    Zapisz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: UTILITIES (PRZYŁĄCZA) */}
        {/* ========================================================= */}
        {activeTab === 'utilities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Przyłącza i instalacje ({room.utilityPoints.length})
              </h3>
              {!showUtilForm && (
                <button
                  onClick={() => setShowUtilForm(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95"
                >
                  <Plus size={14} /> Dodaj punkt
                </button>
              )}
            </div>

            {/* Existing Utilities */}
            {room.utilityPoints.length === 0 && !showUtilForm && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500">
                <Zap size={32} className="mx-auto mb-2 text-stone-400" />
                <p className="text-sm font-semibold text-stone-800">Brak punktów instalacyjnych</p>
                <p className="text-xs text-stone-500 mt-1 mb-3">
                  Zaznacz wodę, odpływ, gniazda 230V lub siłę 400V.
                </p>
                <button
                  onClick={() => setShowUtilForm(true)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  + Dodaj podejście wody lub prądu
                </button>
              </div>
            )}

            {room.utilityPoints.map(u => (
              <div
                key={u.id}
                className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded font-mono ${
                        u.type.includes('water')
                          ? 'bg-sky-100 text-sky-800'
                          : u.type.includes('drain')
                          ? 'bg-purple-100 text-purple-800'
                          : u.type === 'socket_400v'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
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
                    <span className="text-xs font-semibold text-stone-700">
                      {u.wallIdentifier || 'Ściana'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-600 mt-1">
                    Narożnik: <b>{u.distanceFromCornerMm} mm</b> | Wys. posadzka: <b>{u.heightFromFloorMm} mm</b>
                  </p>
                </div>

                <button
                  onClick={() => removeUtilityPoint(u.id)}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Fast Add Utility Form */}
            {showUtilForm && (
              <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Nowy punkt instalacji
                  </h4>
                  <button onClick={() => setShowUtilForm(false)} className="text-xs text-stone-400">
                    Anuluj
                  </button>
                </div>

                {/* Quick Type Chips */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  {[
                    { id: 'water_cold', label: 'Woda zimna', defaultH: '550' },
                    { id: 'water_hot', label: 'Woda ciepła', defaultH: '550' },
                    { id: 'drain_pipe', label: 'Odpływ 50mm', defaultH: '450' },
                    { id: 'socket_400v', label: 'Siła 400V', defaultH: '600' },
                    { id: 'socket_230v', label: 'Gniazdo 230V', defaultH: '1100' },
                    { id: 'switch', label: 'Włącznik', defaultH: '1050' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setUtilType(t.id as UtilityType);
                        setUtilHeight(t.defaultH);
                      }}
                      className={`py-2 px-1 rounded-xl text-center text-[11px] truncate transition ${
                        utilType === t.id
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Wall Select */}
                {room.walls.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Ściana
                    </label>
                    <select
                      value={utilWallId || room.walls[0].id}
                      onChange={e => setUtilWallId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      {room.walls.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.identifier} ({w.lengthMm} mm)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Odległość od rogu (mm) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={utilDistance}
                      onChange={e => setUtilDistance(e.target.value)}
                      placeholder="np. 1200"
                      className="w-full text-sm font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Wysokość od posadzki (mm) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={utilHeight}
                      onChange={e => setUtilHeight(e.target.value)}
                      className="w-full text-sm font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
                      placeholder="np. 550"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveUtility(true)}
                    className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow active:scale-95"
                  >
                    Zapisz i dodaj kolejne
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveUtility(false)}
                    className="px-4 py-2.5 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold active:scale-95"
                  >
                    Zapisz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HAND-DRAWN SKETCH (SZKIC Z NATURY) */}
        {/* ========================================================= */}
        {activeTab === 'sketches' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <p className="font-bold">Odręczny szkic z natury (Pierwszorzędne źródło prawdy)</p>
              <p className="mt-0.5 text-amber-800">
                Sfotografuj papierowy rysunek z budowy. Zostanie zachowany w pełnej rozdzielczości jako wzorzec audytowy dla konstruktora.
              </p>
            </div>

            <SketchUploader
              sketches={room.sketches}
              onAttach={attachSketch}
              onRemove={removeSketch}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PHOTOS (ZDJĘCIA) */}
        {/* ========================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600">
              <p className="font-bold text-stone-800">Dokumentacja fotograficzna z budowy</p>
              <p className="mt-0.5">
                Zdjęcia zapisywane są bezpośrednio w natywnym magazynie przeglądarki (IndexedDB Blob).
              </p>
            </div>

            <PhotoUploader
              media={room.media}
              onAttach={attachPhoto}
              onRemove={removePhoto}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ROOM & CEILING INFO (POKÓJ I SUFIT) */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ustawienia i parametry pomieszczenia
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nazwa pomieszczenia
              </label>
              <input
                type="text"
                value={room.name}
                onChange={e => updateRoomInfo({ name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl font-bold"
                placeholder="np. Główna Kuchnia"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Wysokość nominalna sufitu (mm) *
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={room.ceilingHeightMm}
                onChange={e => updateRoomInfo({ ceilingHeightMm: parseInt(e.target.value) || 0 })}
                className="w-full text-base font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-stone-50"
              />
              <div className="flex gap-1.5 mt-2">
                {[2500, 2600, 2650, 2700, 2800, 3000].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateRoomInfo({ ceilingHeightMm: h })}
                    className="px-2 py-1 text-[11px] rounded bg-stone-100 font-mono hover:bg-stone-200 text-stone-700"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Stan posadzki
              </label>
              <select
                value={room.floorCondition}
                onChange={e => updateRoomInfo({ floorCondition: e.target.value as any })}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl bg-white"
              >
                <option value="finished_tile">Płytki / gres ułożony (poziom zero)</option>
                <option value="finished_wood">Panele / parkiet gotowy</option>
                <option value="raw_screed">Wylewka surowa (brak wykończenia)</option>
                <option value="slanted">Posadzka z widocznym spadkiem</option>
                <option value="other">Inny stan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notatki specjalisty z budowy
              </label>
              <textarea
                rows={3}
                value={room.notes || ''}
                onChange={e => updateRoomInfo({ notes: e.target.value })}
                placeholder="Dodatkowe uwagi: wnoszenie mebli schodami, kod do klatki, grubość tynku..."
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 px-4 py-3 shadow-2xl backdrop-blur-md bg-stone-900/95">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                completeness.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <div className="text-left">
              <span className="text-xs font-bold text-white block">
                Kompletność: {completeness.score}%
              </span>
              <span className="text-[10px] text-stone-400 block">
                {completeness.missing.length > 0
                  ? `Braki: ${completeness.missing.length}`
                  : 'Wszystkie krytyczne dane'}
              </span>
            </div>
          </div>

          <button
            onClick={onGoToReview}
            className="py-2.5 px-4 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold shadow hover:bg-amber-400 transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Weryfikacja & Raport</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
};
