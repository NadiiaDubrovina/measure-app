import { Measurement } from '../types/measurement';
import { Project } from '../types/project';
import { Client } from '../types/client';
import { MeasurementExportPackage } from '../types/exportPackage';

export interface IDesignSoftwareAdapter {
  readonly adapterName: string;
  generateExportPackage(
    measurement: Measurement,
    project: Project,
    client: Client
  ): Promise<MeasurementExportPackage>;
}
