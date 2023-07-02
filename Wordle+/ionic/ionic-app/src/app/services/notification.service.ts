import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: any[] = [];

  constructor(private apiService: ApiService, private storageService: StorageService) {}

  getNotifications(): Promise<any[]> {
    return new Promise(async (resolve) => {
      if (this.notifications.length > 0) {
        resolve(this.notifications);
      } else {
        const storedNotifications = await this.storageService.getNotifications();
        console.log(storedNotifications);
        if (storedNotifications) {
          this.notifications = storedNotifications;
          resolve(this.notifications);
        } else {
          (await this.apiService.getNotifications()).subscribe((apiNotifications: any[]) => {
            this.notifications = apiNotifications || [];
            this.storageService.setNotifications(this.notifications);
            resolve(this.notifications);
          });
        }
      }
    });
  }
  

  async refreshNotifications() {
    (await this.apiService.getNotifications()).subscribe((apiNotifications: any[]) => {
        this.notifications = apiNotifications || [];
        this.storageService.setNotifications(this.notifications);
        return this.notifications;
      });
  }

  async addNotification(notification: { text: string; link?: string }): Promise<void> {
    const newNotification = { text: notification.text, link: notification.link || '' };
    (await this.apiService.addNotification(newNotification)).subscribe(
      (response) => {
        console.log('Notification added successfully', response);
      },
      (error) => {
        console.log('Notification could not be added', error);
    }
    );

    const storedNotifications = await this.storageService.getNotifications() || [];
    const updatedNotifications = [...storedNotifications, newNotification];
    await this.storageService.setNotifications(updatedNotifications);
  }

  async clearNotifications(): Promise<void> {
    this.notifications = [];
    await this.storageService.clearNotifications();
  }
}
