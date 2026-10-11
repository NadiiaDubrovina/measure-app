import React, { useState } from 'react';
import { X, ArrowRight, Building, User, MapPin, Layers } from 'lucide-react';
import { Client } from '../../domain/types/client';
import { Project } from '../../domain/types/project';

interface ClientProjectModalProps {
  clients: Client[];
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onStartRoomCapture: (roomId: string) => void;
  onCreateClient: (data: any) => Promise<Client>;
  onCreateProject: (data: { clientId: string; name: string; notes?: string }) => Promise<Project>;
  onCreateRoom: (data: { projectId: string; name: string; roomType?: string; ceilingHeightMm?: number }) => Promise<any>;
}

export const ClientProjectModal: React.FC<ClientProjectModalProps> = ({
  clients,
  projects,
  isOpen,
  onClose,
  onStartRoomCapture,
  onCreateClient,
  onCreateProject,
  onCreateRoom
}) => {
  const [tab, setTab] = useState<'select' | 'new'>('select');

  // Existing selection state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [roomName, setRoomName] = useState('Główna Kuchnia');
  const [roomType, setRoomType] = useState('kitchen');
  const [ceilingHeight, setCeilingHeight] = useState('2650');

  // New Client & Project fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Warszawa');
  const [newProjectName, setNewProjectName] = useState('Kuchnia i zabudowa');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const clientProjects = projects.filter(p => p.clientId === selectedClientId);

  // Handle starting measurement with existing client/project
  const handleStartExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    try {
      setIsSubmitting(true);
      let targetProjectId = selectedProjectId;

      // If client has no projects yet or none selected, create one
      if (!targetProjectId) {
        const client = clients.find(c => c.id === selectedClientId);
        const newProj = await onCreateProject({
          clientId: selectedClientId,
          name: `${client?.lastName || 'Nowy'} - Projekt Zabudowy`
        });
        targetProjectId = newProj.id;
      }

      const newRoom = await onCreateRoom({
        projectId: targetProjectId,
        name: roomName.trim() || 'Kuchnia',
        roomType,
        ceilingHeightMm: parseInt(ceilingHeight) || 2600
      });

      onStartRoomCapture(newRoom.id);
      onClose();
    } catch (err) {
      console.error('Failed to start room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle creating new client + project + room in one smooth step
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) return;

    try {
      setIsSubmitting(true);
      const newClient = await onCreateClient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        preferredChannel: 'whatsapp',
        address: {
          street: street.trim() || 'ul. Marszałkowska 10',
          city: city.trim() || 'Warszawa',
          postalCode: '00-001',
          hasElevator: true
        }
      });

      const newProj = await onCreateProject({
        clientId: newClient.id,
        name: newProjectName.trim() || 'Nowy Projekt Wnętrza'
      });

      const newRoom = await onCreateRoom({
        projectId: newProj.id,
        name: roomName.trim() || 'Główna Kuchnia',
        roomType,
        ceilingHeightMm: parseInt(ceilingHeight) || 2600
      });

      onStartRoomCapture(newRoom.id);
      onClose();
    } catch (err) {
      console.error('Failed to create new flow:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div>
            <h2 className="text-base font-bold">Nowy Pomiar Pomieszczenia</h2>
            <p className="text-xs text-stone-400">Wybierz lub utwórz klienta i pomieszczenie</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('select')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              tab === 'select'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Istniejący klient
          </button>
          <button
            type="button"
            onClick={() => setTab('new')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              tab === 'new'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            + Nowy klient & budowa
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
          {tab === 'select' ? (
            <form onSubmit={handleStartExisting} className="space-y-4">
              {/* Select Client */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <User size={13} /> Wybierz klienta
                </label>
                {clients.length === 0 ? (
                  <p className="text-xs text-stone-500">Brak zapisanych klientów. Przejdź do zakładki Nowy klient.</p>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={e => {
                      setSelectedClientId(e.target.value);
                      setSelectedProjectId('');
                    }}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select Project */}
              {selectedClientId && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Building size={13} /> Projekt / Inwestycja
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="">+ Utwórz nowy projekt dla tego klienta</option>
                    {clientProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Room Definition */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Layers size={14} />
                  <span>Pomieszczenie do zmierzenia</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nazwa pomieszczenia
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    placeholder="np. Główna Kuchnia, Garderoba"
                    className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  />
                  <div className="flex gap-1.5 mt-1.5 text-[11px]">
                    {['Kuchnia', 'Łazienka', 'Garderoba', 'Korytarz', 'Salon'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setRoomName(preset);
                          if (preset === 'Kuchnia') setRoomType('kitchen');
                          else if (preset === 'Łazienka') setRoomType('bathroom');
                          else if (preset === 'Garderoba') setRoomType('wardrobe_room');
                          else setRoomType('other');
                        }}
                        className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 font-medium hover:bg-amber-200"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nominalna wysokość sufitu (mm)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ceilingHeight}
                    onChange={e => setCeilingHeight(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-stone-300 rounded-xl bg-white"
                    placeholder="2650"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedClientId}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Tworzenie pomiaru...' : 'Rozpocznij Pomiar Pomieszczenia'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-3">
              {/* New Client Form */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Imię *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jan"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Nazwisko</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Kowalski"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+48 500 000 000"
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Ulica i numer
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="ul. Marszałkowska 10/4"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">Miasto</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Warszawa"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Nazwa projektu</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Kuchnia i garderoba"
                  className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Room Definition */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-2">
                <label className="block text-[11px] font-bold text-amber-900">Pierwsze pomieszczenie</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="np. Główna Kuchnia"
                  className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-xl bg-white"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] text-stone-600 mb-0.5">Wysokość sufitu (mm)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={ceilingHeight}
                      onChange={e => setCeilingHeight(e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !firstName || !phone}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2 mt-2"
              >
                <span>{isSubmitting ? 'Zapisywanie...' : 'Utwórz i Rozpocznij Pomiar'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
