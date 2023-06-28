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

  async destroyAll() {
    if (this._storage) {
      await this._storage.clear();
    }
  }

  // Tokens
  async setAccessToken(token: string) {
    await this._storage?.set('access_token', token);
  }

  async getAccessToken(): Promise<string | null> {
    return await this._storage?.get('access_token') || null;
  }

  async removeAccessToken() {
    await this._storage?.remove('access_token');
  }

  // User ID
  async setUserID(user_id: string) {
    await this._storage?.set('user_id', user_id);
  }

  async getUserrID(): Promise<string | null> {
    return await this._storage?.get('user_id') || null;
  }

  async removeUserrID() {
    await this._storage?.remove('user_id');
  }

  // Player ID
  async setPlayerID(player_id: string) {
    await this._storage?.set('player_id', player_id);
  }

  async getPlayerID(): Promise<string | null> {
    return await this._storage?.get('player_id') || null;
  }

  async removePlayerID() {
    await this._storage?.remove('player_id');
  }
}
