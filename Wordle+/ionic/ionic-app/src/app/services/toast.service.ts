import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async showToast(message: string, duration: number = 2000, position: 'top' | 'bottom' | 'middle' = 'bottom', color: string = "dark") {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position,
      color: color
    });
    toast.present();
  }

}
