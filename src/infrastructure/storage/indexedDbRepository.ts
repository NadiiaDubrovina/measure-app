import { get, set } from 'idb-keyval';
import { IMeasurementRepository } from '../../domain/ports/IMeasurementRepository';
import { Client } from '../../domain/types/client';
import { Project } from '../../domain/types/project';
import { Measurement } from '../../domain/types/measurement';
import { Room, MeasurementSession } from '../../domain/types/spatial';
import {
  DEFAULT_ORG_ID,
  SEED_CLIENTS,
  SEED_PROJECTS,
  SEED_MEASUREMENTS,
  SEED_ROOMS,
  SEED_SESSIONS
} from './seedData';

const KEY_CLIENTS = 'fp_clients';
const KEY_PROJECTS = 'fp_projects';
const KEY_MEASUREMENTS = 'fp_measurements';
const KEY_ROOMS = 'fp_rooms';
const KEY_SESSIONS = 'fp_sessions';

export class IndexedDbMeasurementRepository implements IMeasurementRepository {
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const existingClients = await get<Client[]>(KEY_CLIENTS);
      if (!existingClients || existingClients.length === 0) {
        await set(KEY_CLIENTS, SEED_CLIENTS);
      }

      const existingProjects = await get<Project[]>(KEY_PROJECTS);
      if (!existingProjects || existingProjects.length === 0) {
        await set(KEY_PROJECTS, SEED_PROJECTS);
      }

      const existingRooms = await get<Room[]>(KEY_ROOMS);
      if (!existingRooms || existingRooms.length === 0) {
        await set(KEY_ROOMS, SEED_ROOMS);
      }

      const existingSessions = await get<MeasurementSession[]>(KEY_SESSIONS);
      if (!existingSessions || existingSessions.length === 0) {
        await set(KEY_SESSIONS, SEED_SESSIONS);
      }

      const existingMeasurements = await get<Measurement[]>(KEY_MEASUREMENTS);
      if (!existingMeasurements || existingMeasurements.length === 0) {
        await set(KEY_MEASUREMENTS, SEED_MEASUREMENTS);
      }
    } catch {
      // Fallback for environments where IndexedDB might be restricted
      if (!localStorage.getItem(KEY_CLIENTS)) {
        localStorage.setItem(KEY_CLIENTS, JSON.stringify(SEED_CLIENTS));
      }
      if (!localStorage.getItem(KEY_PROJECTS)) {
        localStorage.setItem(KEY_PROJECTS, JSON.stringify(SEED_PROJECTS));
      }
      if (!localStorage.getItem(KEY_ROOMS)) {
        localStorage.setItem(KEY_ROOMS, JSON.stringify(SEED_ROOMS));
      }
      if (!localStorage.getItem(KEY_SESSIONS)) {
        localStorage.setItem(KEY_SESSIONS, JSON.stringify(SEED_SESSIONS));
      }
      if (!localStorage.getItem(KEY_MEASUREMENTS)) {
        localStorage.setItem(KEY_MEASUREMENTS, JSON.stringify(SEED_MEASUREMENTS));
      }
    }

    this.isInitialized = true;
  }

  // --- Clients ---
  async getClients(organizationId: string = DEFAULT_ORG_ID): Promise<Client[]> {
    await this.ensureInitialized();
    try {
      const clients = (await get<Client[]>(KEY_CLIENTS)) || [];
      return clients.filter(c => c.organizationId === organizationId);
    } catch {
      const raw = localStorage.getItem(KEY_CLIENTS);
      const clients: Client[] = raw ? JSON.parse(raw) : [];
      return clients.filter(c => c.organizationId === organizationId);
    }
  }

  async getClientById(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<Client | null> {
    const clients = await this.getClients(organizationId);
    return clients.find(c => c.id === id) || null;
  }

  async saveClient(client: Client): Promise<void> {
    await this.ensureInitialized();
    try {
      const clients = (await get<Client[]>(KEY_CLIENTS)) || [];
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) {
        clients[index] = { ...client, updatedAt: new Date().toISOString() };
      } else {
        clients.unshift(client);
      }
      await set(KEY_CLIENTS, clients);
    } catch {
      const raw = localStorage.getItem(KEY_CLIENTS);
      const clients: Client[] = raw ? JSON.parse(raw) : [];
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) {
        clients[index] = { ...client, updatedAt: new Date().toISOString() };
      } else {
        clients.unshift(client);
      }
      localStorage.setItem(KEY_CLIENTS, JSON.stringify(clients));
    }
  }

  // --- Projects ---
  async getProjects(organizationId: string = DEFAULT_ORG_ID): Promise<Project[]> {
    await this.ensureInitialized();
    try {
      const projects = (await get<Project[]>(KEY_PROJECTS)) || [];
      return projects.filter(p => p.organizationId === organizationId);
    } catch {
      const raw = localStorage.getItem(KEY_PROJECTS);
      const projects: Project[] = raw ? JSON.parse(raw) : [];
      return projects.filter(p => p.organizationId === organizationId);
    }
  }

  async getProjectsByClient(clientId: string, organizationId: string = DEFAULT_ORG_ID): Promise<Project[]> {
    const projects = await this.getProjects(organizationId);
    return projects.filter(p => p.clientId === clientId);
  }

  async getProjectById(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<Project | null> {
    const projects = await this.getProjects(organizationId);
    return projects.find(p => p.id === id) || null;
  }

  async saveProject(project: Project): Promise<void> {
    await this.ensureInitialized();
    try {
      const projects = (await get<Project[]>(KEY_PROJECTS)) || [];
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projects[index] = { ...project, updatedAt: new Date().toISOString() };
      } else {
        projects.unshift(project);
      }
      await set(KEY_PROJECTS, projects);
    } catch {
      const raw = localStorage.getItem(KEY_PROJECTS);
      const projects: Project[] = raw ? JSON.parse(raw) : [];
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projects[index] = { ...project, updatedAt: new Date().toISOString() };
      } else {
        projects.unshift(project);
      }
      localStorage.setItem(KEY_PROJECTS, JSON.stringify(projects));
    }
  }

  // --- Rooms (Canonical Physical Space) ---
  async getRooms(organizationId: string = DEFAULT_ORG_ID): Promise<Room[]> {
    await this.ensureInitialized();
    try {
      const rooms = (await get<Room[]>(KEY_ROOMS)) || [];
      return rooms.filter(r => r.organizationId === organizationId);
    } catch {
      const raw = localStorage.getItem(KEY_ROOMS);
      const rooms: Room[] = raw ? JSON.parse(raw) : [];
      return rooms.filter(r => r.organizationId === organizationId);
    }
  }

  async getRoomsByProject(projectId: string, organizationId: string = DEFAULT_ORG_ID): Promise<Room[]> {
    const rooms = await this.getRooms(organizationId);
    return rooms.filter(r => r.projectId === projectId);
  }

  async getRoomById(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<Room | null> {
    const rooms = await this.getRooms(organizationId);
    return rooms.find(r => r.id === id) || null;
  }

  async saveRoom(room: Room): Promise<void> {
    await this.ensureInitialized();
    try {
      const rooms = (await get<Room[]>(KEY_ROOMS)) || [];
      const index = rooms.findIndex(r => r.id === room.id);
      if (index >= 0) {
        rooms[index] = { ...room, updatedAt: new Date().toISOString() };
      } else {
        rooms.unshift(room);
      }
      await set(KEY_ROOMS, rooms);
    } catch {
      const raw = localStorage.getItem(KEY_ROOMS);
      const rooms: Room[] = raw ? JSON.parse(raw) : [];
      const index = rooms.findIndex(r => r.id === room.id);
      if (index >= 0) {
        rooms[index] = { ...room, updatedAt: new Date().toISOString() };
      } else {
        rooms.unshift(room);
      }
      localStorage.setItem(KEY_ROOMS, JSON.stringify(rooms));
    }
  }

  async deleteRoom(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<void> {
    await this.ensureInitialized();
    try {
      const rooms = (await get<Room[]>(KEY_ROOMS)) || [];
      const updated = rooms.filter(r => !(r.id === id && r.organizationId === organizationId));
      await set(KEY_ROOMS, updated);
    } catch {
      const raw = localStorage.getItem(KEY_ROOMS);
      if (raw) {
        const rooms: Room[] = JSON.parse(raw);
        const updated = rooms.filter(r => !(r.id === id && r.organizationId === organizationId));
        localStorage.setItem(KEY_ROOMS, JSON.stringify(updated));
      }
    }
  }

  // --- Measurement Sessions ---
  async getSessionByRoom(roomId: string, organizationId: string = DEFAULT_ORG_ID): Promise<MeasurementSession | null> {
    await this.ensureInitialized();
    try {
      const sessions = (await get<MeasurementSession[]>(KEY_SESSIONS)) || [];
      return sessions.find(s => s.roomId === roomId && s.organizationId === organizationId) || null;
    } catch {
      const raw = localStorage.getItem(KEY_SESSIONS);
      const sessions: MeasurementSession[] = raw ? JSON.parse(raw) : [];
      return sessions.find(s => s.roomId === roomId && s.organizationId === organizationId) || null;
    }
  }

  async saveSession(session: MeasurementSession): Promise<void> {
    await this.ensureInitialized();
    try {
      const sessions = (await get<MeasurementSession[]>(KEY_SESSIONS)) || [];
      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        sessions[index] = { ...session, updatedAt: new Date().toISOString() };
      } else {
        sessions.unshift(session);
      }
      await set(KEY_SESSIONS, sessions);
    } catch {
      const raw = localStorage.getItem(KEY_SESSIONS);
      const sessions: MeasurementSession[] = raw ? JSON.parse(raw) : [];
      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        sessions[index] = { ...session, updatedAt: new Date().toISOString() };
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions));
    }
  }

  // --- Legacy Measurements (Preserved for compatibility) ---
  async getMeasurements(organizationId: string = DEFAULT_ORG_ID): Promise<Measurement[]> {
    await this.ensureInitialized();
    try {
      const measurements = (await get<Measurement[]>(KEY_MEASUREMENTS)) || [];
      return measurements.filter(m => m.organizationId === organizationId);
    } catch {
      const raw = localStorage.getItem(KEY_MEASUREMENTS);
      const measurements: Measurement[] = raw ? JSON.parse(raw) : [];
      return measurements.filter(m => m.organizationId === organizationId);
    }
  }

  async getMeasurementsByProject(projectId: string, organizationId: string = DEFAULT_ORG_ID): Promise<Measurement[]> {
    const measurements = await this.getMeasurements(organizationId);
    return measurements.filter(m => m.projectId === projectId);
  }

  async getMeasurementById(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<Measurement | null> {
    const measurements = await this.getMeasurements(organizationId);
    return measurements.find(m => m.id === id) || null;
  }

  async saveMeasurement(measurement: Measurement): Promise<void> {
    await this.ensureInitialized();
    try {
      const measurements = (await get<Measurement[]>(KEY_MEASUREMENTS)) || [];
      const index = measurements.findIndex(m => m.id === measurement.id);
      if (index >= 0) {
        measurements[index] = { ...measurement, updatedAt: new Date().toISOString() };
      } else {
        measurements.unshift(measurement);
      }
      await set(KEY_MEASUREMENTS, measurements);
    } catch {
      const raw = localStorage.getItem(KEY_MEASUREMENTS);
      const measurements: Measurement[] = raw ? JSON.parse(raw) : [];
      const index = measurements.findIndex(m => m.id === measurement.id);
      if (index >= 0) {
        measurements[index] = { ...measurement, updatedAt: new Date().toISOString() };
      } else {
        measurements.unshift(measurement);
      }
      localStorage.setItem(KEY_MEASUREMENTS, JSON.stringify(measurements));
    }
  }

  async deleteMeasurement(id: string, organizationId: string = DEFAULT_ORG_ID): Promise<void> {
    await this.ensureInitialized();
    try {
      const measurements = (await get<Measurement[]>(KEY_MEASUREMENTS)) || [];
      const updated = measurements.filter(m => !(m.id === id && m.organizationId === organizationId));
      await set(KEY_MEASUREMENTS, updated);
    } catch {
      const raw = localStorage.getItem(KEY_MEASUREMENTS);
      if (raw) {
        const measurements: Measurement[] = JSON.parse(raw);
        const updated = measurements.filter(m => !(m.id === id && m.organizationId === organizationId));
        localStorage.setItem(KEY_MEASUREMENTS, JSON.stringify(updated));
      }
    }
  }
}

export const repository = new IndexedDbMeasurementRepository();
