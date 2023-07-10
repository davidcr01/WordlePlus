import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  selectedSegment: string = 'classic-wordles';
  pendingPvpGames: any[] = [];

  constructor(private apiService: ApiService, private toastService: ToastService,
    private router: Router) { }

  ngOnInit() {
  }

  // Method that loads the pending games when the "Pending" window is clicked
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  
    if (this.selectedSegment === 'pending-pvp-games') {
      this.loadPendingPvpGames();
    }
  }

  async loadPendingPvpGames() {
    try {
      this.pendingPvpGames = await this.apiService.getPendingPVPGames();
    } catch (error) {
      this.toastService.showToast("Error loading pending games", 2000, 'top', 'danger');
    }
  }

  respondGame(idGame: string){
    // Refresh pending games and redirect
    this.loadPendingPvpGames();
    this.router.navigate(['/respond-game'], { queryParams: { idGame: idGame } });
  }

}
