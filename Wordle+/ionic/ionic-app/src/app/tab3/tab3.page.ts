import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  selectedFilter: string = 'wins';
  players: any[] = [];
  isLoading: boolean = false;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit() {
    this.loadPlayers();
  }

  async loadPlayers() {
    this.isLoading = true;
    try {
      this.players = await this.apiService.getPlayersRanking(this.selectedFilter) as any;
      console.log(this.players);
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading friend list:', error);
      this.toastService.showToast("Error loading ranking", 2000, 'top', 'danger');
      this.isLoading = false;
    }
  }
}
