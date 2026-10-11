import React, { useRef, useState, useEffect } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { MediaAttachment, MediaTag } from '../../domain/types/subEntities';
import { mediaStorageService } from '../../infrastructure/storage/indexedDbMediaStorage';

interface PhotoUploaderProps {
  photos?: MediaAttachment[];
  media?: MediaAttachment[];
  onAttachFile?: (file: File, tag: MediaTag, caption?: string) => Promise<void>;
  onAttach?: (file: Blob | File, tag: MediaTag, caption?: string) => Promise<void>;
  onRemovePhoto?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const TAG_LABELS: Record<MediaTag, string> = {
  room_overview: 'Overall Room',
  wall: 'Wall / Angle',
  opening: 'Window / Obstacle',
  technical: 'Plumbing / Power',
  appliance: 'Appliance',
  defect: 'Risk / Defect'
};

function PhotoThumbnail({ photo, onRemove }: { photo: MediaAttachment; onRemove: () => void }) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    mediaStorageService.getMediaUrl(photo.storageKey).then(resolvedUrl => {
      if (active) setUrl(resolvedUrl);
    });
    return () => {
      active = false;
    };
  }, [photo.storageKey]);

  return (
    <div className="group relative bg-stone-100 rounded-xl overflow-hidden border border-stone-200 shadow-xs">
      {url ? (
        <img
          src={url}
          alt={photo.caption || photo.fileName}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-stone-200 animate-pulse text-xs text-stone-400">
          Loading...
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-2 left-2 right-2 text-white">
        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 backdrop-blur mb-1">
          {TAG_LABELS[photo.tag] || photo.tag}
        </span>
        <p className="text-xs font-medium truncate leading-tight">
          {photo.caption || photo.fileName}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
        aria-label="Remove photo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  media,
  onAttachFile,
  onAttach,
  onRemovePhoto,
  onRemove
}) => {
  const photoList = photos || media || [];
  const doAttach = onAttachFile || onAttach;
  const doRemove = onRemovePhoto || onRemove;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTag, setSelectedTag] = useState<MediaTag>('room_overview');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setTempPreviewUrl(objectUrl);
    e.target.value = '';
  };

  const handleConfirmPhoto = async () => {
    if (!selectedFile || !doAttach) return;

    try {
      setIsUploading(true);
      await doAttach(selectedFile, selectedTag, caption.trim() || TAG_LABELS[selectedTag]);
      if (tempPreviewUrl) {
        URL.revokeObjectURL(tempPreviewUrl);
      }
      setSelectedFile(null);
      setTempPreviewUrl(null);
      setCaption('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (tempPreviewUrl) {
      URL.revokeObjectURL(tempPreviewUrl);
    }
    setSelectedFile(null);
    setTempPreviewUrl(null);
    setCaption('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 tracking-wide">
          Photos & Visual References ({photoList.length})
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Add Photo</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {photoList.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-stone-800">Tap to capture or select photo</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Photos are stored locally as native binary Blobs (no heavy Base64)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photoList.map(photo => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onRemove={() => doRemove?.(photo.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-all active:bg-stone-50"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-semibold">More Photos</span>
          </button>
        </div>
      )}

      {/* Confirmation modal before saving binary */}
      {selectedFile && tempPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Tag & Save Photo</h3>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-44 rounded-xl overflow-hidden bg-stone-900">
              <img src={tempPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Photo Tag</label>
              <select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value as MediaTag)}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.entries(TAG_LABELS).map(([tagKey, label]) => (
                  <option key={tagKey} value={tagKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Caption / Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Wall A plumb tilt at upper corner"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleConfirmPhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm disabled:opacity-50"
              >
                {isUploading ? 'Saving...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
