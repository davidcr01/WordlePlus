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

    // USERS
    /////////////////////////////////////////////////////////////////
    login(credentials: any): Observable<any> {
        const url = `${this.baseURL}/api-token-auth/`;
        return this.http.post(url, credentials);
    }
    
    createUser(userData: any): Observable<any> {
        let url = `${this.baseURL}/api/users/`;
        return this.http.post(url, userData);
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

    // AVATARS
    /////////////////////////////////////////////////////////////////
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

    // PLAYERS
    /////////////////////////////////////////////////////////////////
    createPlayer(userData: any): Observable<any> {
        const url = `${this.baseURL}/api/players/`;
        const body = { user: userData };
        return this.http.post(url, body);
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

    // CLASSIC WORDLES
    /////////////////////////////////////////////////////////////////
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

    // NOTIFICATIONS
    /////////////////////////////////////////////////////////////////
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

      // TOURNAMENTS
      /////////////////////////////////////////////////////////////////
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

      async getTournamentInfo(idTournament: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/tournaments/${idTournament}/tournament_info/`;
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

      async getMyTournaments(): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/tournaments/player_tournaments/`;
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

      async createParticipation(idTournament: number): Promise<Observable<any>> {
        let url = `${this.baseURL}/api/participations/`;
        const tournament = {'tournament_id': idTournament};
        const accessToken = this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(await accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });

        return this.http.post(url, tournament, { headers });
        }

        async getRounds(idTournament: number): Promise<Observable<any>> {
            let url = `${this.baseURL}/api/tournaments/${idTournament}/tournament_rounds/`;
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

        async getGamesRound(idTournament: number, roundNumber: number): Promise<Observable<any>> {
            let url = `${this.baseURL}/api/tournaments/${idTournament}/round_games/${roundNumber}`;
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

        async resolveTournamentGame(idGame: number, gameData: any): Promise<Observable<any>> {
            let url = `${this.baseURL}/api/games/${idGame}/tournament/`;
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


      // FRIENDS
      /////////////////////////////////////////////////////////////////
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

      // GAMES
      /////////////////////////////////////////////////////////////////
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

      async getPendingPVPGames(): Promise<any[]> {
        let url = `${this.baseURL}/api/games/pending_games/`;
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

      async getCompletedPVPGames(): Promise<any[]> {
        let url = `${this.baseURL}/api/games/completed_games/`;
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
  }
