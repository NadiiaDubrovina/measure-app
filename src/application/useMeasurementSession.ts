import { useState, useCallback, useEffect } from 'react';
import { repository } from '../infrastructure/storage/indexedDbRepository';
import { mediaStorageService } from '../infrastructure/storage/indexedDbMediaStorage';
import { Measurement, MeasurementStatus } from '../domain/types/measurement';
import { FurnitureObject } from '../domain/types/furnitureObject';
import { MediaTag } from '../domain/types/subEntities';
import {
  evaluateObjectCompleteness,
  calculateOverallMeasurementCompleteness
} from '../domain/completeness/completenessEngine';
import { getTemplateForType } from '../domain/templates/registry';
import { DEFAULT_ORG_ID } from '../infrastructure/storage/seedData';
import { designSoftwareAdapter } from '../infrastructure/export/jsonDesignAdapter';
import { MeasurementExportPackage } from '../domain/types/exportPackage';

export function useMeasurementSession(initialMeasurementId?: string) {
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const loadMeasurement = useCallback(async (id: string) => {
    const loaded = await repository.getMeasurementById(id, DEFAULT_ORG_ID);
    if (loaded) {
      setMeasurement(loaded);
      if (loaded.objects.length > 0) {
        setActiveObjectId(loaded.objects[0].id);
      }
    }
    return loaded;
  }, []);

  useEffect(() => {
    if (initialMeasurementId) {
      loadMeasurement(initialMeasurementId);
    }
  }, [initialMeasurementId, loadMeasurement]);

  const startNewMeasurement = async (params: {
    projectId: string;
    specialistName?: string;
    generalNotes?: string;
  }): Promise<Measurement> => {
    const newMeasurement: Measurement = {
      id: `meas-${Date.now()}`,
      organizationId: DEFAULT_ORG_ID,
      projectId: params.projectId,
      specialistId: 'user-specialist-01',
      specialistName: params.specialistName || 'Furniture Specialist',
      measurementDate: new Date().toISOString(),
      status: 'IN_PROGRESS',
      generalNotes: params.generalNotes || '',
      overallCompletenessPct: 0,
      objects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await repository.saveMeasurement(newMeasurement);
    setMeasurement(newMeasurement);
    setActiveObjectId(null);
    setLastSavedAt(new Date());
    return newMeasurement;
  };

  const addFurnitureObject = async (
    typeId: string,
    customName?: string
  ): Promise<FurnitureObject> => {
    if (!measurement) throw new Error('No active measurement session');

    const template = getTemplateForType(typeId);
    const countOfType = measurement.objects.filter(o => o.objectTypeId === typeId).length;
    const defaultName = countOfType > 0 ? `${template.name} ${countOfType + 1}` : template.name;

    // Initialize dynamic sections according to the template
    const initialSections: Record<string, any> = {};
    for (const sec of template.sections) {
      if (sec.kind === 'parameters') {
        const defaultParams: Record<string, any> = {};
        sec.fields?.forEach(f => {
          if (f.defaultValue !== undefined) {
            defaultParams[f.id] = f.defaultValue;
          }
        });
        initialSections[sec.id] = {
          sectionId: sec.id,
          parameters: defaultParams
        };
      } else if (sec.kind === 'collection') {
        initialSections[sec.id] = {
          sectionId: sec.id,
          items: sec.entityType === 'wall' ? [
            {
              id: `wall-${Date.now()}-1`,
              entityType: 'wall',
              payload: {
                identifier: 'Wall A (Main)',
                lengthMm: 0,
                heightLeftMm: 2650,
                heightRightMm: 2650,
                cornerAngleDeg: 90.0,
                plumbDeviationMm: 0
              }
            }
          ] : []
        };
      }
    }

    const initialObj: FurnitureObject = {
      id: `obj-${Date.now()}`,
      measurementId: measurement.id,
      objectTypeId: typeId,
      name: customName?.trim() || defaultName,
      status: 'DRAFT',
      sections: initialSections,
      media: [],
      notes: [],
      completeness: { score: 0, missing: [], warnings: [], ok: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    initialObj.completeness = evaluateObjectCompleteness(initialObj);

    const updatedObjects = [...measurement.objects, initialObj];
    const overallScore = calculateOverallMeasurementCompleteness({
      ...measurement,
      objects: updatedObjects
    });

    const updatedMeasurement: Measurement = {
      ...measurement,
      objects: updatedObjects,
      overallCompletenessPct: overallScore,
      updatedAt: new Date().toISOString()
    };

    setIsSaving(true);
    await repository.saveMeasurement(updatedMeasurement);
    setMeasurement(updatedMeasurement);
    setActiveObjectId(initialObj.id);
    setIsSaving(false);
    setLastSavedAt(new Date());

    return initialObj;
  };

  const updateFurnitureObject = async (updatedObject: FurnitureObject): Promise<void> => {
    if (!measurement) return;

    // Recalculate completeness
    const withCompleteness: FurnitureObject = {
      ...updatedObject,
      completeness: evaluateObjectCompleteness(updatedObject),
      updatedAt: new Date().toISOString()
    };

    const newObjects = measurement.objects.map(obj =>
      obj.id === withCompleteness.id ? withCompleteness : obj
    );

    const overallScore = calculateOverallMeasurementCompleteness({
      ...measurement,
      objects: newObjects
    });

    const updatedMeasurement: Measurement = {
      ...measurement,
      objects: newObjects,
      overallCompletenessPct: overallScore,
      updatedAt: new Date().toISOString()
    };

    setMeasurement(updatedMeasurement);
    setIsSaving(true);
    try {
      await repository.saveMeasurement(updatedMeasurement);
      setLastSavedAt(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const attachMediaBlob = async (
    objectId: string,
    file: Blob | File,
    tag: MediaTag,
    caption?: string
  ): Promise<void> => {
    if (!measurement) return;
    const targetObj = measurement.objects.find(o => o.id === objectId);
    if (!targetObj) return;

    // Save native binary blob into IndexedDB ObjectStore
    const attachment = await mediaStorageService.saveMediaBlob(file, {
      organizationId: measurement.organizationId,
      tag,
      caption
    });

    // Update domain object with metadata reference only (zero Base64)
    const updatedObj: FurnitureObject = {
      ...targetObj,
      media: [...targetObj.media, attachment]
    };

    await updateFurnitureObject(updatedObj);
  };

  const removeMediaAttachment = async (objectId: string, mediaId: string): Promise<void> => {
    if (!measurement) return;
    const targetObj = measurement.objects.find(o => o.id === objectId);
    if (!targetObj) return;

    const attachment = targetObj.media.find(m => m.id === mediaId);
    if (attachment) {
      await mediaStorageService.deleteMediaBlob(attachment.storageKey);
    }

    const updatedObj: FurnitureObject = {
      ...targetObj,
      media: targetObj.media.filter(m => m.id !== mediaId)
    };

    await updateFurnitureObject(updatedObj);
  };

  const removeFurnitureObject = async (objectId: string): Promise<void> => {
    if (!measurement) return;

    const filtered = measurement.objects.filter(obj => obj.id !== objectId);
    const overallScore = calculateOverallMeasurementCompleteness({
      ...measurement,
      objects: filtered
    });

    const updatedMeasurement: Measurement = {
      ...measurement,
      objects: filtered,
      overallCompletenessPct: overallScore,
      updatedAt: new Date().toISOString()
    };

    setMeasurement(updatedMeasurement);
    if (activeObjectId === objectId) {
      setActiveObjectId(filtered.length > 0 ? filtered[0].id : null);
    }

    setIsSaving(true);
    await repository.saveMeasurement(updatedMeasurement);
    setIsSaving(false);
    setLastSavedAt(new Date());
  };

  const updateMeasurementStatus = async (status: MeasurementStatus): Promise<void> => {
    if (!measurement) return;

    const updated: Measurement = {
      ...measurement,
      status,
      updatedAt: new Date().toISOString()
    };

    setMeasurement(updated);
    await repository.saveMeasurement(updated);
    setLastSavedAt(new Date());
  };

  const generateExport = async (): Promise<MeasurementExportPackage | null> => {
    if (!measurement) return null;
    const project = await repository.getProjectById(measurement.projectId, DEFAULT_ORG_ID);
    if (!project) return null;
    const client = await repository.getClientById(project.clientId, DEFAULT_ORG_ID);
    if (!client) return null;

    return designSoftwareAdapter.generateExportPackage(measurement, project, client);
  };

  const downloadExportJson = async (): Promise<void> => {
    const pkg = await generateExport();
    if (pkg) {
      designSoftwareAdapter.downloadAsJsonFile(pkg);
    }
  };

  const activeObject = measurement?.objects.find(o => o.id === activeObjectId) || null;

  return {
    measurement,
    activeObject,
    activeObjectId,
    setActiveObjectId,
    isSaving,
    lastSavedAt,
    loadMeasurement,
    startNewMeasurement,
    addFurnitureObject,
    updateFurnitureObject,
    attachMediaBlob,
    removeMediaAttachment,
    removeFurnitureObject,
    updateMeasurementStatus,
    generateExport,
    downloadExportJson
  };
}
