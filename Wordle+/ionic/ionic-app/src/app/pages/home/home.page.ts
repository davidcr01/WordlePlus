import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(private router: Router, private storageService: StorageService) { }

  ionViewDidEnter() {

    setTimeout(async () => {
      const token = await this.storageService.getAccessToken();
      
      if (!token) {
        // Redirigir al usuario a la página de inicio de sesión
        this.router.navigateByUrl('/login');
      } else {
        this.router.navigateByUrl('/tabs');
      }
    }, 4000);


  }

}
