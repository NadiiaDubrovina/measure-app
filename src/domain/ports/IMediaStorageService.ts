import { MediaAttachment, MediaTag } from '../types/subEntities';

export interface IMediaStorageService {
  readonly providerName: string;

  saveMediaBlob(
    file: Blob | File,
    metadata: {
      organizationId: string;
      tag: MediaTag;
      caption?: string;
      fileName?: string;
    }
  ): Promise<MediaAttachment>;

  getMediaBlob(storageKey: string): Promise<Blob | null>;

  getMediaUrl(storageKey: string): Promise<string>;

  revokeMediaUrl(url: string): void;

  deleteMediaBlob(storageKey: string): Promise<void>;
}
