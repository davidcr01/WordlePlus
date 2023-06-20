import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit{
  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isStaff: boolean = false;

  constructor(public formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // Define the fields of the form
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      staff_code: ['', [Validators.pattern('^[0-9]+$')]]
    });
  }

  // Executed when clicking in the submit button
  onSubmit() {
    if (this.registerForm.invalid) {
      this.successMessage = '';
      this.errorMessage = 'Please fill the form correctly.';
      return;
    }

    const userData = {
      username: this.registerForm.get('username').value,
      email: this.registerForm.get('email').value,
      first_name: this.registerForm.get('first_name').value,
      last_name: this.registerForm.get('last_name').value,
      password: this.registerForm.get('password').value,
    };

    const staffCode = this.registerForm.get('staff_code').value;

    // Case of registering a player. The 'staff_code' field is not added
    if (staffCode === '') {
      this.createUser('http://localhost/api/players/', { user: userData });
    } 
    else { // Case of registering an admin. 'staff_code' field is added
      userData['staff_code'] = staffCode;
      this.createUser('http://localhost/api/users/', userData);
    }
  }

  createUser(url: string, body: any) {
    this.isLoading = true;

    this.http.post(url, body)
      .subscribe(
        (response) => {
          console.log('User created successfully', response);
          this.successMessage = 'User created successfully';
          this.errorMessage = '';
          this.registerForm.reset();
          this.isLoading = false;
        },
        (error) => {
          const errorContent = error.error;
          this.successMessage = '';

          // Thrown errors could be of the staff code or the username
          if (errorContent.staff_code) {
            this.errorMessage = errorContent.staff_code;
          } else if (errorContent.username) { // Case of creating an admin
            this.errorMessage = errorContent.username;
          } else if (errorContent.user && errorContent.user.username) { // Case of creating a player
            this.errorMessage = errorContent.user.username[0];
          } else {
            this.errorMessage = 'Error creating user';
          }
          this.isLoading = false;
        }
      );
  }
}