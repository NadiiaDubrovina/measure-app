import { useState, useEffect, useCallback } from 'react';
import { repository } from '../infrastructure/storage/indexedDbRepository';
import { Client } from '../domain/types/client';
import { Project } from '../domain/types/project';
import { Measurement } from '../domain/types/measurement';
import { Room } from '../domain/types/spatial';
import { DEFAULT_ORG_ID } from '../infrastructure/storage/seedData';

export function useClientsAndProjects() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [c, p, r, m] = await Promise.all([
        repository.getClients(DEFAULT_ORG_ID),
        repository.getProjects(DEFAULT_ORG_ID),
        repository.getRooms(DEFAULT_ORG_ID),
        repository.getMeasurements(DEFAULT_ORG_ID)
      ]);
      setClients(c);
      setProjects(p);
      setRooms(r);
      setMeasurements(m);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createClient = async (data: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      organizationId: DEFAULT_ORG_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await repository.saveClient(newClient);
    await refresh();
    return newClient;
  };

  const createProject = async (data: { clientId: string; name: string; notes?: string }): Promise<Project> => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      organizationId: DEFAULT_ORG_ID,
      clientId: data.clientId,
      name: data.name,
      status: 'MEASUREMENT_SCHEDULED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await repository.saveProject(newProject);
    await refresh();
    return newProject;
  };

  const createRoom = async (data: {
    projectId: string;
    name: string;
    roomType?: string;
    ceilingHeightMm?: number;
  }): Promise<Room> => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      organizationId: DEFAULT_ORG_ID,
      projectId: data.projectId,
      name: data.name,
      roomType: data.roomType || 'kitchen',
      ceilingHeightMm: data.ceilingHeightMm || 2600,
      floorCondition: 'finished_tile',
      walls: [],
      openings: [],
      utilityPoints: [],
      structuralObstacles: [],
      sketches: [],
      media: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await repository.saveRoom(newRoom);
    await refresh();
    return newRoom;
  };

  const createClientAndProject = async (clientData: any, projectName: string): Promise<string> => {
    const client = await createClient(clientData);
    const project = await createProject({
      clientId: client.id,
      name: projectName
    });
    return project.id;
  };

  return {
    clients,
    projects,
    rooms,
    measurements,
    loading,
    refresh,
    createClient,
    createProject,
    createRoom,
    createClientAndProject
  };
}
