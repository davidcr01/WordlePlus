import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  selectedSegment: string = 'classic-wordles';
  pendingPvpGames: any[] = [];
  completedPvpGames: any[] = [];
  playerId: string;
  username: string;
  isLoading: boolean = true;

  constructor(private apiService: ApiService, private toastService: ToastService,
    private router: Router, private storageService: StorageService) { }

  async ngOnInit() {
    this.playerId = await this.storageService.getPlayerID();
    this.username = await this.storageService.getUsername();
  }

  // Method that loads the pending games when the "Pending" window is clicked
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  
    if (this.selectedSegment === 'pending-pvp-games') {
      this.loadPendingPvpGames();
    }
    if (this.selectedSegment === 'completed-pvp-games') {
      this.loadCompletedPvpGames();
    }
  }

  async loadPendingPvpGames() {
    this.isLoading = true;
    try {
      this.pendingPvpGames = await this.apiService.getPendingPVPGames();
    } catch (error) {
      this.toastService.showToast("Error loading pending games", 2000, 'top', 'danger');
    }
    this.isLoading = false;
  }

  async loadCompletedPvpGames() {
    this.isLoading = true;
    try {
      this.completedPvpGames = await this.apiService.getCompletedPVPGames();
      console.log(this.completedPvpGames);
    } catch (error) {
      this.toastService.showToast("Error loading completed games", 2000, 'top', 'danger');
    }
    this.isLoading = false;
  }

  getPlayerTime(game: any): number {
    return game.player1 === this.username ? game.player1_time : game.player2_time;
  }
  
  getOpponentTime(game: any): number {
    return game.player1 === this.username ? game.player2_time : game.player1_time;
  }
  
  getPlayerXP(game: any): number {
    return game.player1 === this.username ? game.player1_xp : game.player2_xp;
  }
  
  getOpponentXP(game: any): number {
    return game.player1 === this.username ? game.player2_xp : game.player1_xp;
  }
  
  


  respondGame(idGame: string){
    // Refresh pending games and redirect
    this.loadPendingPvpGames();
    this.router.navigate(['/respond-game'], { queryParams: { idGame: idGame } });
  }

}
