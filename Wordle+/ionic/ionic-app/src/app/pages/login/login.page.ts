import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { EncryptionService } from '../../services/encryption.service';


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
    private http: HttpClient, 
    private router: Router,
    private storageService: StorageService,
    private encryptionService: EncryptionService
    ) {}

  ngOnInit() {
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

    this.http.post<any>('http://localhost:8080/api-token-auth/', credentials).subscribe(
      async (response) => {
        // Store the token in the local storage
        this.errorMessage = ''
        const encryptedToken = this.encryptionService.encryptData(response.token);
        await this.storageService.setAccessToken(encryptedToken);

        this.router.navigateByUrl('');
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