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

  // User ID
  async setUserID(user_id: string) {
    await this._storage?.set('user_id', user_id);
  }

  async getUserID(): Promise<string | null> {
    return await this._storage?.get('user_id') || null;
  }

  // Player ID
  async setPlayerID(player_id: string) {
    await this._storage?.set('player_id', player_id);
  }

  async getPlayerID(): Promise<string | null> {
    return await this._storage?.get('player_id') || null;
  }

  // Username
  async setUsername(username: string) {
    await this._storage?.set('username', username);
  }

  async getUsername(): Promise<string | null> {
    return await this._storage?.get('username') || null;
  }

  // Wins
  async setWins(wins: number) {
    await this._storage?.set('wins', wins);
  }

  async getWins(): Promise<number> {
    const wins = await this._storage?.get('wins');
    return wins !== null ? parseInt(wins, 10) : 0;
  }

  async incrementWins() {
    const currentWins = await this.getWins();
    const newWins = currentWins ? currentWins + 1 : 1;
    await this._storage?.set('wins', newWins);
  }

  // Wins PVP
  async setWinsPVP(winsPvp: number) {
    await this._storage?.set('wins_pvp', winsPvp);
  }

  async getWinsPVP(): Promise<number> {
    const winsPvp = await this._storage?.get('wins_pvp');
    return winsPvp !== null ? parseInt(winsPvp, 10) : 0;
  }

  async incrementWinsPVP() {
    const currentWinsPVP = await this.getWinsPVP();
    const newWinsPVP = currentWinsPVP ? currentWinsPVP + 1 : 1;
    await this._storage?.set('wins_pvp', newWinsPVP);
  }

  // Wins Tournament
  async setWinsTournament(winsTournament: number) {
    await this._storage?.set('wins_tournament', winsTournament);
  }

  async getWinsTournament(): Promise<number | null> {
    const winsTournament = await this._storage?.get('wins_tournament');
    return winsTournament !== null ? parseInt(winsTournament, 10) : 0;
  }

  async incrementWinsTournament() {
    const currentWinsTournament = await this.getWinsTournament();
    const newWinsTournament = currentWinsTournament ? currentWinsTournament + 1 : 1;
    await this._storage?.set('wins_tournament', newWinsTournament);
  }

 // XP
  async setXP(xP: number) {
    await this._storage?.set('xp', xP);

    let rank = '';

    if (xP >= 0 && xP < 2000) {
      rank = 'IRON';
    } else if (xP >= 2000 && xP < 5000) {
      rank = 'BRONZE';
    } else if (xP >= 5000 && xP < 9000) {
      rank = 'SILVER';
    } else if (xP >= 9000 && xP < 14000) {
      rank = 'GOLD';
    } else if (xP >= 10400) {
      rank = 'PLATINUM';
    }
    await this._storage?.set('rank', rank);
  }

  async getXP(): Promise<number> {
    const xP = await this._storage?.get('xp');
    return xP !== null ? parseInt(xP, 10) : 0;
  }

  async incrementXP(value: number) {
    const currentXP = await this.getXP();
    const newXP = currentXP ? currentXP + value : value;
    await this._storage?.set('xp', newXP);
  }

  // Rank

  async getRank(): Promise<string | null> {
    return await this._storage?.get('rank') || null;
  }  
}
