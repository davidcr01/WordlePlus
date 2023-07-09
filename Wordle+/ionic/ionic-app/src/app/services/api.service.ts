import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';

@Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    
    private readonly baseURL = 'http://localhost:8080'
    constructor(private http: HttpClient, private storageService: StorageService,
        private encryptionService: EncryptionService) { }

    async checkTokenExpiration(): Promise<Observable<any>> {
        const url = `${this.baseURL}/check-token-expiration/`;
        const accessToken = this.storageService.getAccessToken();
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({'Authorization': `Token ${decryptedToken}`});
        return this.http.get(url, {headers});
    }

    login(credentials: any): Observable<any> {
        const url = `${this.baseURL}/api-token-auth/`;
        return this.http.post(url, credentials);
    }

    createPlayer(userData: any): Observable<any> {
        const url = `${this.baseURL}/api/players/`;
        const body = { user: userData };
        return this.http.post(url, body);
    }
    
    createUser(userData: any): Observable<any> {
        let url = `${this.baseURL}/api/users/`;
        return this.http.post(url, userData);
    }

    async getPlayerData(playerId: string) {
        const url = `${this.baseURL}/api/players/${playerId}`;
        const accessToken = await this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.get(url, {headers});
    }

    async addClassicGame(gameData: any): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/classicwordles/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({'Authorization': `Token ${decryptedToken}`});

        return this.http.post(url, gameData, { headers });
    }

    async getAvatarImage(): Promise<Observable<any>> {
        const userId = await this.storageService.getUserID();
        const url = `${this.baseURL}/api/avatar/${userId}/`;
        const accessToken = await this.storageService.getAccessToken();
        if (!accessToken) {
          return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(accessToken);
        const headers = new HttpHeaders({ 'Authorization': `Token ${decryptedToken}` });
    
        return this.http.get<any>(url, { headers }).pipe(
            map(response => response.avatar)
          );
      }

    async saveAvatarImage(imageData: string): Promise<Observable<any>> {
        const userId = await this.storageService.getUserID();
        const url = `${this.baseURL}/api/avatar/${userId}/`;
        const accessToken = await this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        const body = { avatar: imageData };
        return this.http.post(url, body, { headers });
    }

    async getNotifications(limit: number = 5) {
        const url = `${this.baseURL}/api/notifications/?limit=${limit}`;
        const accessToken = await this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.get(url, {headers});
    }

    async addNotification(notification: { text: string, link: string }): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/notifications/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });

        return this.http.post(url, notification, { headers });
    }

    async getUserInfo(): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/users-info/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.get(url, { headers });
      }
    
      async updateUserInfo(userInfo: any): Promise<Observable<any>> {
        const url = `${this.baseURL}/api/users-info/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.patch(url, userInfo, { headers });
      }

      async getTournaments(wordLength?: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/tournaments/`;
        if (wordLength) {
            url += `?word_length=${wordLength}`;
          }

        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.get(url, { headers });
      }

      async getFriendList(): Promise<any[]> {
        let url = `${this.baseURL}/api/friendlist/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.get<any[]>(url, { headers }).toPromise();
      }

      async getFriendRequests(): Promise<any[]> {
        let url = `${this.baseURL}/api/friendrequest/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.get<any[]>(url, { headers }).toPromise();
      }

      async acceptFriendRequest(requestId: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/friendrequest/${requestId}/accept/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.post(url, null, { headers });
      }

      async sendFriendRequest(receiverId: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/friendrequest/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        const body = {"receiver_id": receiverId};
        return this.http.post(url, body, { headers });
      }

      async getAllPlayers(): Promise<Observable<string[]>> {
        let url = `${this.baseURL}/api/list-players/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
    
        return this.http.get<string[]>(url, { headers });
      }

      async createGame(gameData: any): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/games/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.post(url, gameData, { headers });
      }

      async getGame(idGame: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/games/${idGame}`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.get(url, { headers });
      }

      async resolveGame(idGame: number, gameData: any): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/games/${idGame}/`;
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found') as any;
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        return this.http.patch(url, gameData, { headers });
      }
  }
