import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { ApiService } from './services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService,
    private apiService: ApiService
  ) {}

  async canActivate(): Promise<boolean> {
    const accessToken = await this.storageService.getAccessToken();
    if (accessToken) {
      return (await this.apiService.checkTokenExpiration()).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && error.error) {
            this.storageService.destroyAll();
            this.router.navigate(['/login'], { queryParams: { expired: 'true' } });
          } else {
            console.error('Error al comprobar el token de acceso:', error);
          }
          return of(false);
        })
      ).toPromise();
    } else {
      this.storageService.destroyAll();
      this.router.navigate(['/login'], { queryParams: { expired: 'true' } });
      return false;
    }
  }
}
