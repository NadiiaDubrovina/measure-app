import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FurnitureObject } from '../../domain/types/furnitureObject';
import { MeasurementNote } from '../../domain/types/subEntities';
import { TouchCard } from '../components/TouchCard';

interface NotesSectionFormProps {
  object: FurnitureObject;
  onChange: (updated: FurnitureObject) => void;
}

export const NotesSectionForm: React.FC<NotesSectionFormProps> = ({
  object,
  onChange
}) => {
  const [newNoteText, setNewNoteText] = useState('');

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: MeasurementNote = {
      id: `note-${Date.now()}`,
      authorName: 'Specialist',
      text: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    onChange({
      ...object,
      notes: [newNote, ...object.notes]
    });
    setNewNoteText('');
  };

  const handleRemoveNote = (id: string) => {
    onChange({
      ...object,
      notes: object.notes.filter(n => n.id !== id)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Field Notes ({object.notes.length})
        </span>
      </div>

      <TouchCard>
        <div className="space-y-2.5">
          <textarea
            rows={2}
            placeholder="Type field observation, client preference, or installer warning..."
            value={newNoteText}
            onChange={e => setNewNoteText(e.target.value)}
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!newNoteText.trim()}
              onClick={handleAddNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </TouchCard>

      {object.notes.length === 0 ? (
        <p className="text-center text-xs text-stone-400 py-4">No field notes yet</p>
      ) : (
        <div className="space-y-2">
          {object.notes.map(note => (
            <div
              key={note.id}
              className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-stone-900 leading-relaxed">
                  {note.text}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveNote(note.id)}
                  className="text-stone-300 hover:text-rose-600 p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold">
                <span>{note.authorName || 'Specialist'}</span>
                <span>•</span>
                <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
