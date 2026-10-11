import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  Wall,
  Opening,
  UtilityPoint,
  StructuralObstacle,
  SourceSketch,
  MeasurementSession,
  MeasurementSessionStatus,
  RoomCompletenessReport
} from '../domain/types/spatial';
import { MediaTag, MediaAttachment } from '../domain/types/subEntities';
import { IndexedDbMeasurementRepository } from '../infrastructure/storage/indexedDbRepository';
import { IndexedDbMediaStorageService } from '../infrastructure/storage/indexedDbMediaStorage';
import { evaluateRoomCompleteness } from '../domain/completeness/roomCompleteness';
import { buildCanonicalRoomExportPackage, downloadJsonFile } from '../domain/export/roomJsonExporter';
import { DEFAULT_ORG_ID } from '../infrastructure/storage/seedData';

const repo = new IndexedDbMeasurementRepository();
const mediaStorage = new IndexedDbMediaStorageService();

export function useRoomMeasurementSession(roomId?: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<MeasurementSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load active Room and its session
  const loadRoom = useCallback(async () => {
    if (!roomId) {
      setRoom(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const foundRoom = await repo.getRoomById(roomId, DEFAULT_ORG_ID);
      if (foundRoom) {
        setRoom(foundRoom);
        let foundSession = await repo.getSessionByRoom(foundRoom.id, DEFAULT_ORG_ID);
        if (!foundSession) {
          foundSession = {
            id: `session-${Date.now()}`,
            organizationId: DEFAULT_ORG_ID,
            projectId: foundRoom.projectId,
            roomId: foundRoom.id,
            specialistName: 'Dima (Firma YADIMA)',
            measurementDate: new Date().toISOString().split('T')[0],
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await repo.saveSession(foundSession);
        }
        setSession(foundSession);
      } else {
        setRoom(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Failed to load room session:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Continuous Autosave
  const triggerAutoSave = useCallback((updatedRoom: Room, updatedSession?: MeasurementSession) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await repo.saveRoom(updatedRoom);
        if (updatedSession) {
          await repo.saveSession(updatedSession);
        }
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 400); // 400ms debounce
  }, []);

  // Update room metadata
  const updateRoomInfo = useCallback((updates: Partial<Room>) => {
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  // Wall operations
  const addWall = useCallback((wallData: Omit<Wall, 'id' | 'roomId'>) => {
    setRoom(prev => {
      if (!prev) return null;
      const newWall: Wall = {
        id: `wall-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomId: prev.id,
        ...wallData,
        sequenceIndex: wallData.sequenceIndex ?? prev.walls.length
      };
      const updated: Room = {
        ...prev,
        walls: [...prev.walls, newWall],
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const updateWall = useCallback((wallId: string, updates: Partial<Wall>) => {
    setRoom(prev => {
      if (!prev) return null;
      const updatedWalls = prev.walls.map(w => (w.id === wallId ? { ...w, ...updates } : w));
      const updated: Room = {
        ...prev,
        walls: updatedWalls,
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const removeWall = useCallback((wallId: string) => {
    setRoom(prev => {
      if (!prev) return null;
      const updatedWalls = prev.walls.filter(w => w.id !== wallId);
      const updated: Room = {
        ...prev,
        walls: updatedWalls,
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  // Opening operations
  const addOpening = useCallback((openingData: Omit<Opening, 'id' | 'roomId'>) => {
    setRoom(prev => {
      if (!prev) return null;
      const newOpening: Opening = {
        id: `opening-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomId: prev.id,
        ...openingData
      };
      const updated: Room = {
        ...prev,
        openings: [...prev.openings, newOpening],
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const updateOpening = useCallback((openingId: string, updates: Partial<Opening>) => {
    setRoom(prev => {
      if (!prev) return null;
      const updatedOpenings = prev.openings.map(o => (o.id === openingId ? { ...o, ...updates } : o));
      const updated: Room = {
        ...prev,
        openings: updatedOpenings,
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const removeOpening = useCallback((openingId: string) => {
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        openings: prev.openings.filter(o => o.id !== openingId),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  // Utility Point operations
  const addUtilityPoint = useCallback((utilData: Omit<UtilityPoint, 'id' | 'roomId'>) => {
    setRoom(prev => {
      if (!prev) return null;
      const newPoint: UtilityPoint = {
        id: `util-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomId: prev.id,
        ...utilData
      };
      const updated: Room = {
        ...prev,
        utilityPoints: [...prev.utilityPoints, newPoint],
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const updateUtilityPoint = useCallback((utilId: string, updates: Partial<UtilityPoint>) => {
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        utilityPoints: prev.utilityPoints.map(u => (u.id === utilId ? { ...u, ...updates } : u)),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const removeUtilityPoint = useCallback((utilId: string) => {
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        utilityPoints: prev.utilityPoints.filter(u => u.id !== utilId),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  // Structural Obstacle operations
  const addObstacle = useCallback((obsData: Omit<StructuralObstacle, 'id' | 'roomId'>) => {
    setRoom(prev => {
      if (!prev) return null;
      const newObs: StructuralObstacle = {
        id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomId: prev.id,
        ...obsData
      };
      const updated: Room = {
        ...prev,
        structuralObstacles: [...prev.structuralObstacles, newObs],
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const removeObstacle = useCallback((obsId: string) => {
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        structuralObstacles: prev.structuralObstacles.filter(o => o.id !== obsId),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  // Media / Photo Operations (Native Blob in IndexedDB)
  const attachPhoto = useCallback(async (file: Blob | File, tag: MediaTag = 'room_overview', caption?: string) => {
    if (!room) return;
    try {
      const attachment: MediaAttachment = await mediaStorage.saveMediaBlob(file, {
        organizationId: room.organizationId,
        tag,
        caption,
        fileName: file instanceof File ? file.name : undefined
      });

      setRoom(prev => {
        if (!prev) return null;
        const updated: Room = {
          ...prev,
          media: [...prev.media, attachment],
          updatedAt: new Date().toISOString()
        };
        triggerAutoSave(updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to attach photo:', err);
    }
  }, [room, triggerAutoSave]);

  const removePhoto = useCallback(async (mediaId: string) => {
    if (!room) return;
    const mediaItem = room.media.find(m => m.id === mediaId);
    if (mediaItem) {
      await mediaStorage.deleteMediaBlob(mediaItem.storageKey);
    }
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        media: prev.media.filter(m => m.id !== mediaId),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [room, triggerAutoSave]);

  // Hand-Drawn Sketch Operations (Native Blob in IndexedDB)
  const attachSketch = useCallback(async (file: Blob | File, title?: string, notes?: string) => {
    if (!room) return;
    try {
      const attachment: MediaAttachment = await mediaStorage.saveMediaBlob(file, {
        organizationId: room.organizationId,
        tag: 'defect', // stored as primary visual documentation
        caption: title || 'Hand-drawn measurement sketch',
        fileName: file instanceof File ? file.name : 'sketch.jpg'
      });

      const newSketch: SourceSketch = {
        id: `sketch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomId: room.id,
        mediaAttachmentId: attachment.id,
        storageKey: attachment.storageKey,
        storageProvider: attachment.storageProvider,
        title: title || 'Szkic pomiarowy (Hand Sketch)',
        notes,
        createdAt: new Date().toISOString()
      };

      setRoom(prev => {
        if (!prev) return null;
        const updated: Room = {
          ...prev,
          sketches: [...prev.sketches, newSketch],
          updatedAt: new Date().toISOString()
        };
        triggerAutoSave(updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to attach sketch:', err);
    }
  }, [room, triggerAutoSave]);

  const removeSketch = useCallback(async (sketchId: string) => {
    if (!room) return;
    const sketchItem = room.sketches.find(s => s.id === sketchId);
    if (sketchItem) {
      await mediaStorage.deleteMediaBlob(sketchItem.storageKey);
    }
    setRoom(prev => {
      if (!prev) return null;
      const updated: Room = {
        ...prev,
        sketches: prev.sketches.filter(s => s.id !== sketchId),
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(updated);
      return updated;
    });
  }, [room, triggerAutoSave]);

  // Session operations
  const updateSessionStatus = useCallback(async (status: MeasurementSessionStatus) => {
    setSession(prev => {
      if (!prev || !room) return null;
      const updated: MeasurementSession = {
        ...prev,
        status,
        updatedAt: new Date().toISOString()
      };
      triggerAutoSave(room, updated);
      return updated;
    });
  }, [room, triggerAutoSave]);

  // Export Canonical JSON
  const exportCanonicalJson = useCallback(async () => {
    if (!room) return;
    const client = await repo.getClientById(
      (await repo.getProjectById(room.projectId))?.clientId || '',
      room.organizationId
    );
    const project = await repo.getProjectById(room.projectId, room.organizationId);

    const exportPackage = buildCanonicalRoomExportPackage(room, client, project, session);
    const safeRoomName = room.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `Room_${safeRoomName}_Canonical_${new Date().toISOString().split('T')[0]}.json`;
    downloadJsonFile(filename, exportPackage);
  }, [room, session]);

  // Real-time completeness report
  const completeness: RoomCompletenessReport = room
    ? evaluateRoomCompleteness(room)
    : { score: 0, isReadyForDesign: false, missing: [], warnings: [], completed: [] };

  return {
    room,
    session,
    loading,
    isSaving,
    lastSavedAt,
    completeness,
    updateRoomInfo,
    addWall,
    updateWall,
    removeWall,
    addOpening,
    updateOpening,
    removeOpening,
    addUtilityPoint,
    updateUtilityPoint,
    removeUtilityPoint,
    addObstacle,
    removeObstacle,
    attachPhoto,
    removePhoto,
    attachSketch,
    removeSketch,
    updateSessionStatus,
    exportCanonicalJson,
    refresh: loadRoom
  };
}
