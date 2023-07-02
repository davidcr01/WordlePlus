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
        const url = `${this.baseURL}/api/avatar/`;
        const accessToken = await this.storageService.getAccessToken();
        if (!accessToken) {
            return throwError('Access token not found');
        }
        const decryptedToken = this.encryptionService.decryptData(accessToken);
        const headers = new HttpHeaders({
            Authorization: `Token ${decryptedToken}`,
            'Content-Type': 'application/json'
        });
        const body = { image_data: imageData };
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
  }
