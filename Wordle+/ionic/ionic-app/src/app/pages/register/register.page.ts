import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      staffCode: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Simulate registration API call
    setTimeout(() => {
      console.log('Registration successful');
      this.successMessage = 'Registration successful';
      this.errorMessage = '';

      // Reset the form and show success message
      this.registerForm.reset();
      this.isLoading = false;
    }, 2000);
  }
}
