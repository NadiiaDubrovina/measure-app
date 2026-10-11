import React, { useState, useEffect, useRef } from 'react';
import { SourceSketch } from '../../domain/types/spatial';
import { IndexedDbMediaStorageService } from '../../infrastructure/storage/indexedDbMediaStorage';
import { Camera, Upload, Trash2, Maximize2, X, FileText } from 'lucide-react';

interface SketchUploaderProps {
  sketches: SourceSketch[];
  onAttach: (file: File, title?: string, notes?: string) => Promise<void>;
  onRemove: (sketchId: string) => Promise<void>;
}

const mediaService = new IndexedDbMediaStorageService();

export const SketchUploader: React.FC<SketchUploaderProps> = ({
  sketches,
  onAttach,
  onRemove
}) => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [selectedSketch, setSelectedSketch] = useState<SourceSketch | null>(null);
  const [sketchTitle, setSketchTitle] = useState('');
  const [sketchNotes, setSketchNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load blob object URLs for all sketches
  useEffect(() => {
    let isMounted = true;

    async function loadUrls() {
      const newUrls: Record<string, string> = {};
      for (const sketch of sketches) {
        try {
          const url = await mediaService.getMediaUrl(sketch.storageKey);
          if (url) newUrls[sketch.id] = url;
        } catch (e) {
          console.error('Failed to load sketch URL:', e);
        }
      }
      if (isMounted) setUrls(newUrls);
    }

    loadUrls();

    return () => {
      isMounted = false;
      // Revoke URLs on unmount
      Object.values(urls).forEach(url => mediaService.revokeMediaUrl(url));
    };
  }, [sketches]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onAttach(file, sketchTitle.trim() || undefined, sketchNotes.trim() || undefined);
      setSketchTitle('');
      setSketchNotes('');
    } catch (err) {
      console.error('Sketch upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="sketch-file-input"
        />

        <div className="mb-3">
          <label htmlFor="sketch-file-input" className="cursor-pointer block">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-sm">
              <Camera size={26} />
            </div>
            <p className="text-sm font-semibold text-stone-800">
              {isUploading ? 'Zapisywanie szkicu...' : 'Sfotografuj lub wgraj szkic odręczny'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Rysunek z wymiarami z natury (papier, notes, karton)
            </p>
          </label>
        </div>

        {/* Optional note fields before taking photo */}
        <div className="flex flex-col gap-2 max-w-sm mx-auto text-left">
          <input
            type="text"
            placeholder="Tytuł szkicu (np. Rzut kuchni z wymiarami lasera)"
            value={sketchTitle}
            onChange={e => setSketchTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
          <input
            type="text"
            placeholder="Opcjonalna notatka do szkicu..."
            value={sketchNotes}
            onChange={e => setSketchNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>

        <div className="mt-3 flex justify-center gap-2">
          <label
            htmlFor="sketch-file-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm hover:bg-stone-800 transition active:scale-95"
          >
            <Upload size={14} /> Wybierz plik / Zrób zdjęcie
          </label>
        </div>
      </div>

      {/* Uploaded Sketches Grid */}
      {sketches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Zapisane szkice pomiarowe ({sketches.length})
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sketches.map(sketch => {
              const url = urls[sketch.id];

              return (
                <div
                  key={sketch.id}
                  className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
                >
                  <div
                    className="relative aspect-[4/3] bg-stone-100 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedSketch(sketch)}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={sketch.title || 'Szkic'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <FileText size={28} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSketch(sketch);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>

                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-stone-900 truncate">
                        {sketch.title || 'Szkic pomiarowy'}
                      </p>
                      {sketch.notes && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {sketch.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                      <span>{new Date(sketch.createdAt).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => onRemove(sketch.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded active:scale-95"
                        title="Usuń szkic"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedSketch && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedSketch(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
            <button
              onClick={() => setSelectedSketch(null)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
            >
              <X size={22} />
            </button>
          </div>

          <div
            className="max-w-3xl max-h-[80vh] w-full flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {urls[selectedSketch.id] && (
              <img
                src={urls[selectedSketch.id]}
                alt={selectedSketch.title || 'Szkic'}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />
            )}
            <div className="mt-3 text-center text-white">
              <h3 className="text-base font-semibold">{selectedSketch.title || 'Szkic pomiarowy'}</h3>
              {selectedSketch.notes && (
                <p className="text-sm text-stone-300 mt-1 max-w-lg">{selectedSketch.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
