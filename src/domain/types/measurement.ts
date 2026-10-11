import { FurnitureObject } from './furnitureObject';

export type MeasurementStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';

export interface Measurement {
  id: string;
  organizationId: string;
  projectId: string;
  specialistId: string;
  specialistName: string;
  measurementDate: string; // ISO string
  status: MeasurementStatus;
  generalNotes?: string;
  overallCompletenessPct: number;
  objects: FurnitureObject[];
  createdAt: string;
  updatedAt: string;
}
