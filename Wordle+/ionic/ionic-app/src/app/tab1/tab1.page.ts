import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';

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
    private router: Router, 
    private storageService: StorageService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if (window.innerWidth <= 767) {
      this.backgroundImage = '../../assets/background_wordle_vertical.png';
    } else {
      this.backgroundImage = '../../assets/background_wordle_horizontal.png';
    }
  }

  async ionViewWillEnter() {
    this.username = await this.storageService.getUsername();
    this.victoriesClassic = await this.storageService.getWins();
    this.victoriesPvp = await this.storageService.getWinsPVP();
    this.victoriesTournaments = await this.storageService.getWinsTournament();
    this.xP = await this.storageService.getXP();
    this.rank = await this.storageService.getRank();
    this.rankImage = this.getRankImage(this.rank);
    const storedAvatarUrl = await this.storageService.getAvatarUrl();

    if (storedAvatarUrl) {
      this.avatarImage = storedAvatarUrl;
    } else {
      this.loadAvatarImage();
    }
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
