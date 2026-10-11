export type ProjectStatus =
  | 'NEW_LEAD'
  | 'MEASUREMENT_SCHEDULED'
  | 'MEASURED'
  | 'DESIGN'
  | 'WAITING_FOR_CLIENT'
  | 'PRICE_ESTIMATION'
  | 'READY_FOR_ORDER'
  | 'ORDERED'
  | 'IN_PRODUCTION'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERY'
  | 'INSTALLATION'
  | 'COMPLAINT'
  | 'COMPLETED'
  | 'CLOSED';

export interface Project {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
