import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.page.html',
  styleUrls: ['./friendlist.page.scss'],
})
export class FriendlistPage implements OnInit {

  friendList: any[];

  constructor(private apiService: ApiService, private toastController: ToastController) {}

  ngOnInit() {
    this.loadFriendList();
  }

  async loadFriendList() {
    try {
      const friends = await this.apiService.getFriendlist() as any;
      this.friendList = friends.map(item => item.friend);
      console.log(this.friendList)
    } catch (error) {
      console.error('Error loading friend list:', error);
      const toast = await this.toastController.create({
        message: 'Error loading friend list',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  playWithFriend(friendId: number) {
    
  }

  viewFriendInfo(friendId: number) {
    
  }

  
  async removeFriend(friendId: number) {
  /*
    try {
      await this.apiService.removeFriend(friendId);
      await this.loadFriendList();
      const toast = await this.toastController.create({
        message: 'Friend removed successfully',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error removing friend:', error);
      const toast = await this.toastController.create({
        message: 'Error removing friend',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  */
  }
  

}
