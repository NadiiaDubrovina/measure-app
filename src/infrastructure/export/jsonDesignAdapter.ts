import { IDesignSoftwareAdapter } from '../../domain/ports/IDesignSoftwareAdapter';
import { Measurement } from '../../domain/types/measurement';
import { Project } from '../../domain/types/project';
import { Client } from '../../domain/types/client';
import { MeasurementExportPackage } from '../../domain/types/exportPackage';

export class JsonDesignSoftwareAdapter implements IDesignSoftwareAdapter {
  readonly adapterName = 'Structured CAD/CAM JSON Package Generator';

  async generateExportPackage(
    measurement: Measurement,
    project: Project,
    client: Client
  ): Promise<MeasurementExportPackage> {
    return {
      schemaVersion: '1.1',
      exportedAt: new Date().toISOString(),
      projectMetadata: {
        projectId: project.id,
        projectName: project.name,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`.trim(),
        clientPhone: client.phone,
        siteAddress: `${client.address.street}, ${client.address.city} ${client.address.postalCode}`.trim(),
        measuredAt: measurement.measurementDate,
        specialistName: measurement.specialistName
      },
      measurementMetadata: {
        measurementId: measurement.id,
        status: measurement.status,
        overallCompletenessPct: measurement.overallCompletenessPct,
        generalNotes: measurement.generalNotes
      },
      objects: measurement.objects.map(obj => ({
        id: obj.id,
        type: obj.objectTypeId,
        name: obj.name,
        sections: obj.sections,
        media: obj.media,
        notes: obj.notes,
        completenessReport: obj.completeness
      }))
    };
  }

  downloadAsJsonFile(pkg: MeasurementExportPackage, filename?: string): void {
    const jsonStr = JSON.stringify(pkg, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      filename ||
      `measurement-${pkg.projectMetadata.projectName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const designSoftwareAdapter = new JsonDesignSoftwareAdapter();
