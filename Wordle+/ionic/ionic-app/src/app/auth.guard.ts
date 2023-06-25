import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from './services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise<boolean>(async (resolve) => {
      // Checks if the access token exits in the Ionic Storage
      const accessToken = await this.storageService.getAccessToken();
      if (accessToken) {
        resolve(true); // User is logged in
      } else {
        this.router.navigate(['/login']); 
        resolve(false); 
      }
    });
  }
}
