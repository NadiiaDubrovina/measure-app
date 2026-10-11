import { Client } from '../types/client';
import { Project } from '../types/project';
import { Measurement } from '../types/measurement';
import { Room, MeasurementSession } from '../types/spatial';

export interface IMeasurementRepository {
  // Clients
  getClients(organizationId: string): Promise<Client[]>;
  getClientById(id: string, organizationId: string): Promise<Client | null>;
  saveClient(client: Client): Promise<void>;

  // Projects
  getProjects(organizationId: string): Promise<Project[]>;
  getProjectsByClient(clientId: string, organizationId: string): Promise<Project[]>;
  getProjectById(id: string, organizationId: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;

  // Rooms (Canonical Physical Space)
  getRooms(organizationId: string): Promise<Room[]>;
  getRoomsByProject(projectId: string, organizationId: string): Promise<Room[]>;
  getRoomById(id: string, organizationId: string): Promise<Room | null>;
  saveRoom(room: Room): Promise<void>;
  deleteRoom(id: string, organizationId: string): Promise<void>;

  // Measurement Sessions
  getSessionByRoom(roomId: string, organizationId: string): Promise<MeasurementSession | null>;
  saveSession(session: MeasurementSession): Promise<void>;

  // Legacy Measurements (Preserved for compatibility)
  getMeasurements(organizationId: string): Promise<Measurement[]>;
  getMeasurementsByProject(projectId: string, organizationId: string): Promise<Measurement[]>;
  getMeasurementById(id: string, organizationId: string): Promise<Measurement | null>;
  saveMeasurement(measurement: Measurement): Promise<void>;
  deleteMeasurement(id: string, organizationId: string): Promise<void>;
}
