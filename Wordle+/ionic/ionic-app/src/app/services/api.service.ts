import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class ApiService {
    
    private readonly baseURL = 'http://localhost:8080'
    constructor(private http: HttpClient) { }
  
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
  
  
  }
