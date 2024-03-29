import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { EncryptionService } from '../../services/encryption.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    public formBuilder: FormBuilder, 
    private router: Router,
    private storageService: StorageService,
    private encryptionService: EncryptionService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private notificationStorage: NotificationService
    ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const expired = params['expired'];
      if (expired === 'true') {
        // Show expiratin message to user
        this.toastService.showToast('Your session has expired. Please log in again.', 4000, 'top');
      }
    });
    
    // Define the fields of the form
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    const credentials = {
      username: this.loginForm.get('username').value,
      password: this.loginForm.get('password').value,
    }

    this.apiService.login(credentials).subscribe(
      async (response) => {

        // Store the token in the local storage
        this.errorMessage = ''
        const encryptedToken = this.encryptionService.encryptData(response.token);

        await this.storageService.setAccessToken(encryptedToken);
        await this.storageService.setUserID(response.user_id);
        await this.storageService.setUsername(response.username);

        if (response.player_id !== null) {
          await this.storageService.setPlayerID(response.player_id);
          await this.storageService.setWins(response.wins);
          await this.storageService.setWinsPVP(response.wins_pvp);
          await this.storageService.setWinsTournament(response.wins_tournament);
          await this.storageService.setXP(response.xp);
          // Rank is calculated in the frontend
        }
        this.isLoading = false;
        this.router.navigate(['/tabs/main']);
      },
      (error) => {
        console.error('Log in error', error);
        this.errorMessage = 'Provided credentials are not correct'
      }
    );
  }

  goToAdminPage() {
    window.location.href = 'http://localhost:8080/admin/';
  }
}
