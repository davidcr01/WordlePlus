import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {
  userInfo: any = {};
  userInfoForm: FormGroup;

  constructor(private apiService: ApiService,
    private storageService: StorageService, 
    private router: Router,
    private toastService: ToastService,
    private formBuilder: FormBuilder) {
      this.userInfoForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', [Validators.required, Validators.maxLength(20)]],
        lastName: ['', [Validators.required, Validators.maxLength(20)]],
      });
    }

  ngOnInit() {
    this.getUserInfo();
  }

  async getUserInfo() {
    (await this.apiService.getUserInfo()).subscribe((response: any) => {
      this.userInfo = response;
      this.userInfoForm.patchValue({
        email: this.userInfo.email,
        firstName: this.userInfo.first_name,
        lastName: this.userInfo.last_name,
      });
    });
  }

  async saveUserInfo() {
    if (this.userInfoForm.valid) {
      const email = this.userInfoForm.get('email').value;
      const firstName = this.userInfoForm.get('firstName').value;
      const lastName = this.userInfoForm.get('lastName').value;
      const body = {
        'email': email,
        'first_name': firstName,
        'last_name': lastName
      };

      (await this.apiService.updateUserInfo(body)).subscribe(
        () => {
          this.toastService.showToast('Information updated succesfully!', 2000, 'top');
          this.router.navigate(['/tabs/settings']);
        },
        (error) => {
            this.toastService.showToast('An error was generated', 2000, 'top');
          console.error('Error saving the information:', error);
        }
      );
    } else {
      console.error('Formulario inválido');
    }
  }
}
