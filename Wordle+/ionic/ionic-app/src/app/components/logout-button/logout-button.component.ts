import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss'],
})
export class LogoutButtonComponent {

  constructor(private storageService: StorageService, private router: Router) {}

  logout() {
    this.storageService.destroyAll();
    this.router.navigateByUrl('/login');
  }
}
