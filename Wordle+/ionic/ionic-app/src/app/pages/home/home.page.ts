import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(private router: Router) { }

  ionViewDidEnter() {

    setTimeout(() => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        // Redirigir al usuario a la página de inicio de sesión
        this.router.navigateByUrl('/login');
      } else {
        this.router.navigateByUrl('/tabs');
      }
    }, 2000);


  }

}
