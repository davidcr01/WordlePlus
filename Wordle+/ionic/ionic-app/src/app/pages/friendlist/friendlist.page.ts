import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { PopoverController } from '@ionic/angular';
import { WordsPopoverComponent } from 'src/app/components/words-popover/words-popover.component';


@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.page.html',
  styleUrls: ['./friendlist.page.scss'],
})
export class FriendlistPage implements OnInit {

  friendList: any[];
  friendRequests: any[];
  playerUsernames: string[];
  filteredPlayers: string[];
  selectedSegment: string;
  showResults: boolean = false;

  constructor(private apiService: ApiService, private toastService: ToastService, 
    private popoverController: PopoverController) {}

  ngOnInit() {
    this.getAllPlayers();
  }

  async ionViewWillEnter() {
    this.selectedSegment = 'friends';
    this.loadFriendList(); 
  }

  // Popover of word length selection
  async handleSelectionPopover(event: any, playerId: number, username: string) {
    const popover = await this.popoverController.create({
      component: WordsPopoverComponent,
      event: event,
      dismissOnSelect: true,
      componentProps: {
        playerId: playerId,
        username: username
      }
    });
    
    await popover.present();
  }

  // Method that gets all the players of the backend. Only the usernames
  async getAllPlayers() {
    (await this.apiService.getAllPlayers()).subscribe(
      (players: string[]) => {
        this.playerUsernames = players;
      },
      (error) => {
        console.error('Error retrieving players:', error);
      }
    );
  }

  // Method that send a friend request when clicking the add button
  async sendFriendRequest(playerId: number) {
    this.showResults = false;
    (await this.apiService.sendFriendRequest(playerId)).subscribe(
      async (response) => {
        this.toastService.showToast("Request was sent successfully!", 2000, 'top', 'success');
      },
      async (error) => {
        console.error('Error sending friend request:', error);
        let message = "Error sending request";
        if (error.error.error === 'Friend request already sent') {
          message = error.error.error
        }
        this.toastService.showToast(message, 2000, 'top', 'danger');
      }
    );
  }

  // Search for the players with some coincidence with the introduced username
  searchPlayers(event: any) {
    const username = event.target.value;
    this.showResults = true;
    if (!username) {
      this.filteredPlayers = [];
      return;
    }
    if (typeof username === 'string') {
      const filteredPlayers = this.playerUsernames.filter(player => {
      return player['username'].toLowerCase().includes(username.toLowerCase());
      });
      this.filteredPlayers = filteredPlayers;
    }
  }

  // Method that loads the friend list of the player
  async loadFriendList() {
    try {
      const friends = await this.apiService.getFriendList() as any;
      this.friendList = friends.map(item => item.friend);
    } catch (error) {
      console.error('Error loading friend list:', error);
      this.toastService.showToast("Error loading friend list", 2000, 'top', 'danger');
    }
  }

  // Method that loads the friend requests of the player
  async loadFriendRequests() {
    try {
      this.friendRequests = await this.apiService.getFriendRequests();
    } catch (error) {
      this.toastService.showToast("Error loading friend requests", 2000, 'top', 'danger');
    }
  }

  // Method that loads the request when the "Request" window is clicked
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  
    if (this.selectedSegment === 'requests') {
      this.loadFriendRequests();
    }
  }

  playWithFriend(friendId: number) {
    
  }

  viewFriendInfo(friendId: number) {
    
  }

  async acceptFriendRequest(requestId: number) {
    (await this.apiService.acceptFriendRequest(requestId)).subscribe(
      async (response) => {
        console.log('Friend request accepted successfully', response);
        this.loadFriendRequests();
        this.loadFriendList();
        this.toastService.showToast("Request was accepted successfully!", 2000, 'top', 'success');
      },
      async (error) => {
        console.error('Error accepting friend request:', error);
        let message = "Error sending request";
        this.toastService.showToast(message, 2000, 'top', 'danger');
      }
    );
  }
  
  rejectFriendRequest(requestId: number) {
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
