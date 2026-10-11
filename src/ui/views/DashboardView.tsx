import React, { useState } from 'react';
import {
  Plus,
  Ruler,
  Users,
  FolderKanban,
  ChevronRight,
  Layers,
  FileSignature,
  Camera,
  CheckCircle2,
  MapPin,
  Phone
} from 'lucide-react';
import { Room } from '../../domain/types/spatial';
import { Project } from '../../domain/types/project';
import { Client } from '../../domain/types/client';
import { evaluateRoomCompleteness } from '../../domain/completeness/roomCompleteness';

interface DashboardViewProps {
  rooms: Room[];
  projects: Project[];
  clients: Client[];
  onStartNewMeasurement: () => void;
  onOpenRoom: (roomId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rooms,
  projects,
  clients,
  onStartNewMeasurement,
  onOpenRoom
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'projects' | 'clients'>('rooms');

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getClient = (clientId?: string) => {
    if (!clientId) return null;
    return clients.find(c => c.id === clientId);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-24">
      {/* Top Mobile Bar */}
      <header className="bg-stone-900 text-white px-5 pt-7 pb-6 rounded-b-[2rem] shadow-lg">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Firma YADIMA • Room-to-Production
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
                Smart Room Capture
              </h1>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-sm shadow-inner">
              YD
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onStartNewMeasurement}
            className="w-full py-4 px-4 rounded-2xl bg-amber-500 text-stone-950 font-extrabold text-sm shadow-xl hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Nowy Pomiar Pomieszczenia</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full px-4 pt-5 space-y-4 flex-1">
        {/* Metric / Navigation Pills */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'rooms'
                ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/10'
                : 'bg-stone-50/80 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Pokoje</span>
              <Ruler className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-stone-900">{rooms.length}</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'projects'
                ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/10'
                : 'bg-stone-50/80 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Projekty</span>
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-stone-900">{projects.length}</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'clients'
                ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/10'
                : 'bg-stone-50/80 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
              <span>Klienci</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-black text-stone-900">{clients.length}</div>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ROOMS (POMIARY POMIESZCZEŃ) */}
        {/* ========================================================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Pokoje w trakcie pomiaru ({rooms.length})
              </h2>
              <span className="text-[11px] text-stone-400 font-mono">Lokalne IndexedDB</span>
            </div>

            {rooms.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Ruler size={24} />
                </div>
                <h3 className="text-sm font-bold text-stone-800">Brak zapisanych pomiarów</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Rozpocznij pierwszy pomiar pomieszczenia na budowie, aby zarejestrować ściany, przyłącza i szkic.
                </p>
                <button
                  type="button"
                  onClick={onStartNewMeasurement}
                  className="px-4 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-sm hover:bg-amber-400 transition"
                >
                  + Rozpocznij Pomiar
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {rooms.map(room => {
                  const project = getProject(room.projectId);
                  const client = getClient(project?.clientId);
                  const completeness = evaluateRoomCompleteness(room);

                  return (
                    <div
                      key={room.id}
                      onClick={() => onOpenRoom(room.id)}
                      className="group bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-amber-500 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition">
                              {room.name}
                            </h3>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                              {room.roomType || 'Pokój'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500">
                            {project?.name || 'Projekt'} • {client ? `${client.firstName} ${client.lastName}` : 'Klient'}
                          </p>
                        </div>

                        {/* Completeness Badge */}
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            completeness.score >= 80
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : completeness.score >= 50
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {completeness.score >= 80 && <CheckCircle2 size={12} />}
                          <span>{completeness.score}%</span>
                        </div>
                      </div>

                      {/* Room Stats Pill Row */}
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600 font-mono">
                        <span className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded">
                          <Layers size={12} className="text-amber-600" />
                          Ściany: <b>{room.walls.length}</b>
                        </span>

                        <span className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded">
                          Otwory: <b>{room.openings.length}</b>
                        </span>

                        <span className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded">
                          Przyłącza: <b>{room.utilityPoints.length}</b>
                        </span>

                        {room.sketches.length > 0 && (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                            <FileSignature size={12} />
                            Szkic ({room.sketches.length})
                          </span>
                        )}

                        {room.media.length > 0 && (
                          <span className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded">
                            <Camera size={12} />
                            {room.media.length} zdjęć
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-stone-400">
                        <span>Sufit: {room.ceilingHeightMm} mm</span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-600 group-hover:translate-x-0.5 transition">
                          Otwórz pomiar <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJECTS */}
        {/* ========================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Projekty ({projects.length})
            </h2>
            <div className="space-y-2">
              {projects.map(p => {
                const client = getClient(p.clientId);
                const projectRooms = rooms.filter(r => r.projectId === p.id);

                return (
                  <div key={p.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">{p.name}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Klient: {client ? `${client.firstName} ${client.lastName}` : 'Brak klienta'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {p.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Pokoje w projekcie: <b>{projectRooms.length}</b></span>
                      {client?.address && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-400">
                          <MapPin size={11} /> {client.address.city}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CLIENTS */}
        {/* ========================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Klienci ({clients.length})
            </h2>
            <div className="space-y-2">
              {clients.map(c => {
                const clientProjects = projects.filter(p => p.clientId === c.id);

                return (
                  <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          {c.firstName} {c.lastName}
                        </h3>
                        <a
                          href={`tel:${c.phone}`}
                          className="text-xs font-mono text-amber-700 flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Phone size={11} /> {c.phone}
                        </a>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        Projekty: {clientProjects.length}
                      </span>
                    </div>

                    {c.address && (
                      <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
                        <MapPin size={11} className="text-stone-400" />
                        {c.address.street}, {c.address.city}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
