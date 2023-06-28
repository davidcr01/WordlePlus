import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { StorageService } from './storage.service';
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
  }
