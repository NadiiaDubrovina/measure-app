export interface ClientAddress {
  street: string;
  city: string;
  postalCode: string;
  apartment?: string;
  floor?: number;
  hasElevator: boolean;
  accessNotes?: string;
}

export type CommunicationChannel = 'phone' | 'whatsapp' | 'telegram' | 'email';

export interface Client {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  preferredChannel: CommunicationChannel;
  address: ClientAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
