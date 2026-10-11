import { FurnitureObject } from './furnitureObject';

export interface MeasurementExportPackage {
  schemaVersion: '1.1';
  exportedAt: string;
  projectMetadata: {
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    siteAddress: string;
    measuredAt: string;
    specialistName: string;
  };
  measurementMetadata: {
    measurementId: string;
    status: string;
    overallCompletenessPct: number;
    generalNotes?: string;
  };
  objects: Array<{
    id: string;
    type: string;
    name: string;
    sections: FurnitureObject['sections'];
    media: FurnitureObject['media'];
    notes: FurnitureObject['notes'];
    completenessReport: FurnitureObject['completeness'];
  }>;
}
