import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';
import { PopoverController } from '@ionic/angular';
import { WordsPopoverComponent } from '../components/words-popover/words-popover.component';
import { NotificationsPopoverComponent } from '../components/notifications-popover/notifications-popover.component';
import { NotificationService } from '../services/notification.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  username: string;
  victoriesClassic: number;
  victoriesPvp: number;
  victoriesTournaments: number;
  rank: string;
  rankImage: string;
  xP: number;
  backgroundImage: string;
  avatarImage: string;

  constructor(
    private route: ActivatedRoute, 
    private storageService: StorageService,
    private apiService: ApiService,
    public popoverController: PopoverController,
    private notificationService: NotificationService
  ) {}

  // Change background img depending on the width
  async ngOnInit() {
    if (window.innerWidth <= 767) {
      this.backgroundImage = '../../assets/background_wordle_vertical.png';
    } else {
      this.backgroundImage = '../../assets/background_wordle_horizontal.png';
    }

    // Only fetchs the avatar if necessary
    const storedAvatarUrl = await this.storageService.getAvatarUrl();
    if (storedAvatarUrl) {
      this.avatarImage = storedAvatarUrl;
    } else {
      await this.loadAvatarImage();
    }

    // Optional param to update the player info: useful when
    // finishing a game
    this.route.queryParams.subscribe(async params => {
      const refresh = params['refresh'];
      if (refresh === 'true') {
        await this.ionViewWillEnter();
      }
    });
  }

  async ionViewWillEnter() {
    this.username = await this.storageService.getUsername();    
    this.victoriesClassic = await this.storageService.getWins();
    this.victoriesPvp = await this.storageService.getWinsPVP();
    this.victoriesTournaments = await this.storageService.getWinsTournament();
    this.xP = await this.storageService.getXP();
    this.rank = await this.storageService.getRank();
    this.rankImage = await this.getRankImage(this.rank);

    this.notificationService.refreshNotifications();
  }

  // Popover of word length selection
  async handleSelectionPopover(event: any) {
    const popover = await this.popoverController.create({
      component: WordsPopoverComponent,
      event: event,
      dismissOnSelect: true,
    });
    
    await popover.present();
  }

  // Popover of notifications
  async handleNotificationsPopover(event: any) {
    const popover = await this.popoverController.create({
      component: NotificationsPopoverComponent,
      event: event,
      dismissOnSelect: true
    });
    
    await popover.present();
    
  }

  async loadAvatarImage() {
    (await this.apiService.getAvatarImage()).subscribe(
      image => {
        if (image) {
          this.avatarImage = 'data:image/png;base64,' + image;
          this.storageService.setAvatarUrl(this.avatarImage);
        } else {
          this.avatarImage = '../../assets/avatar.png'; // Default avatar image
        }
      },
      error => {
        console.error('Error loading avatar image:', error);
        this.avatarImage = '../../assets/avatar.png';
      }
    );
  }

  getRankImage(rank: string): string {
    if (rank === 'IRON') {
      return '../../assets/ranks/iron.png';
    } else if (rank === 'BRONZE') {
      return '../../assets/ranks/bronze.png';
    } else if (rank === 'SILVER') {
      return '../../assets/ranks/silver.png';
    } else if (rank === 'GOLD') {
      return '../../assets/ranks/gold.png';
    } else if (rank === 'PLATINUM') {
      return '../../assets/ranks/platinum.png';
    } else {
      return '../../assets/ranks/admin.png';
    }
  }
}
