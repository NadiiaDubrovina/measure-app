import { IMediaStorageService } from '../../domain/ports/IMediaStorageService';
import { MediaAttachment, MediaTag } from '../../domain/types/subEntities';

const DB_NAME = 'furniture_platform_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

export class IndexedDbMediaStorageService implements IMediaStorageService {
  readonly providerName = 'local_indexeddb';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeObjectUrls = new Map<string, string>();

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveMediaBlob(
    file: Blob | File,
    metadata: {
      organizationId: string;
      tag: MediaTag;
      caption?: string;
      fileName?: string;
    }
  ): Promise<MediaAttachment> {
    const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const storageKey = `blobs/${id}`;

    const db = await this.getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, storageKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const attachment: MediaAttachment = {
      id,
      organizationId: metadata.organizationId,
      storageKey,
      storageProvider: 'local_indexeddb',
      fileName: metadata.fileName || `${id}.jpg`,
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size,
      tag: metadata.tag,
      caption: metadata.caption,
      createdAt: new Date().toISOString()
    };

    return attachment;
  }

  async getMediaBlob(storageKey: string): Promise<Blob | null> {
    try {
      const db = await this.getDb();
      return new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(storageKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async getMediaUrl(storageKey: string): Promise<string> {
    // Check if we already have an active object URL for this key
    if (this.activeObjectUrls.has(storageKey)) {
      return this.activeObjectUrls.get(storageKey)!;
    }

    const blob = await this.getMediaBlob(storageKey);
    if (blob) {
      const url = URL.createObjectURL(blob);
      this.activeObjectUrls.set(storageKey, url);
      return url;
    }

    // Fallback placeholder SVG if blob is not found (e.g. seed data)
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="#f4ede1"><rect width="400" height="300" fill="#f5f5f4"/><text x="50%" y="45%" text-anchor="middle" fill="#78716c" font-size="14" font-weight="bold" font-family="sans-serif">Measurement Photo Reference</text><text x="50%" y="55%" text-anchor="middle" fill="#a8a29e" font-size="11" font-family="sans-serif">${storageKey}</text></svg>`;
    const fallbackBlob = new Blob([fallbackSvg], { type: 'image/svg+xml' });
    const fallbackUrl = URL.createObjectURL(fallbackBlob);
    this.activeObjectUrls.set(storageKey, fallbackUrl);
    return fallbackUrl;
  }

  revokeMediaUrl(storageKey: string): void {
    const url = this.activeObjectUrls.get(storageKey);
    if (url) {
      URL.revokeObjectURL(url);
      this.activeObjectUrls.delete(storageKey);
    }
  }

  async deleteMediaBlob(storageKey: string): Promise<void> {
    this.revokeMediaUrl(storageKey);
    try {
      const db = await this.getDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(storageKey);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore if already deleted
    }
  }
}

export const mediaStorageService = new IndexedDbMediaStorageService();
