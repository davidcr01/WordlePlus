import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(public formBuilder: FormBuilder, private http: HttpClient, private router: Router) {}

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

    this.http.post<any>('http://localhost/api-auth/', credentials).subscribe(
      (response) => {
        console.log(response)
        // Store the token in the local storage
        localStorage.setItem('access_token', response.access_token);

        this.router.navigateByUrl('');
      },
      (error) => {
        console.error('Log in error', error);
        this.errorMessage = 'Provided credentials are not correct'
      }
    );
  }

}
