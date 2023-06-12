import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(public formBuilder: FormBuilder) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      staff_code: ['', [Validators.pattern('^[0-9]+$')]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.successMessage = '';
      this.errorMessage = 'Please fill the form correctly';
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