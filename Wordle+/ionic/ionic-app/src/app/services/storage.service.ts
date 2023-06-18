import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async setAccessToken(token: string) {
    await this._storage?.set('access_token', token);
  }

  async getAccessToken(): Promise<string | null> {
    return await this._storage?.get('access_token') || null;
  }

  async removeAccessToken() {
    await this._storage?.remove('access_token');
  }
}
