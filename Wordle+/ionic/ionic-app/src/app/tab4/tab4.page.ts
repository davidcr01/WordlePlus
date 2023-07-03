import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {

  constructor(private storageService: StorageService, private router: Router) {}

  logout() {
    this.storageService.destroyAll();
    this.router.navigateByUrl('/login');
  }

  editPersonalInfo() {
    this.router.navigate(['/edit-user']);
  }
}
