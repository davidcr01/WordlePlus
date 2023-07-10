import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  wordLength: number;
  tournaments: any[] = [];
  isLoading: boolean = false;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadTournaments();
  }

  async loadTournaments() {
    this.isLoading = true;
    (await this.apiService.getTournaments(this.wordLength))
      .subscribe(
        (data: any) => {
          console.log(data);
          this.tournaments = data.results;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error loading tournaments:', error);
          this.isLoading = false;
        }
      );
  }

  async joinTournament(idTournament: number) {
    (await this.apiService.createParticipation(idTournament)).subscribe(
      (response) => {
        this.toastService.showToast('You joined the tournament successfully!', 2000, 'top', 'success');
        console.log('Participation added successfully', response);
      },
      (error) => {
        if (error.status === 400) {
          this.toastService.showToast('You already participate in this tournament!', 2000, 'top', 'warning');
        } else {
          this.toastService.showToast('There was an error jonining to the tournament!', 2000, 'top', 'danger');
        }
        console.log('Participation could not be added', error);
    }
    );
  }
}
