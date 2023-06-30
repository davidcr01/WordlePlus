import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

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
  backgroundImage: string;

  constructor(
    private router: Router, 
    private storageService: StorageService
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
    this.rank = await this.storageService.getRank();
    this.rankImage = this.getRankImage(this.rank);
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
      return '';
    }
  }
}
