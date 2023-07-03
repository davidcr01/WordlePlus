import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  avatarPreview: string | null = null;
  @ViewChild('avatarInput', { static: false }) avatarInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.userInfoForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      avatar: [null]
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
    const avatarUrl = await this.storageService.getAvatarUrl();
    console.log(avatarUrl);
    if (avatarUrl) {
      this.avatarPreview = avatarUrl;
    }
  }

  async saveUserInfo() {
    if (this.userInfoForm.valid) {
      const email = this.userInfoForm.get('email').value;
      const firstName = this.userInfoForm.get('firstName').value;
      const lastName = this.userInfoForm.get('lastName').value;
      const body = {
        email: email,
        first_name: firstName,
        last_name: lastName
      };
      (await this.apiService.updateUserInfo(body)).subscribe(
        () => {
          this.toastService.showToast('Information updated successfully!', 2000, 'top');
          this.router.navigate(['/tabs/settings']);
        },
        (error) => {
          this.toastService.showToast('An error occurred', 2000, 'top');
          console.error('Error saving the information:', error);
        }
      );
    } else {
      console.error('Invalid form');
    }
  }

  async uploadAvatar() {
    const file = this.avatarInput.nativeElement.files[0];
    if (file) {
      console.log(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarData = reader.result as string;
        console.log(avatarData);
        this.saveAvatar(avatarData);
      };
      reader.readAsDataURL(file);
    }
  }

  async saveAvatar(avatarData: string) {
    try {
      await (await this.apiService.saveAvatarImage(avatarData)).toPromise();
      this.storageService.setAvatarUrl(avatarData);
      this.toastService.showToast('Avatar updated successfully!', 2000, 'top');
      this.getUserInfo(); // Refresh user info to update avatar preview
      this.router.navigate(['/tabs/main'], { queryParams: { avatar: 'true' } });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  }

  readAndPreviewAvatar(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
