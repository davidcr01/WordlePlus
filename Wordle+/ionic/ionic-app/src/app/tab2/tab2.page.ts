import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  wordLength: number;
  tournaments: any[] = [];
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

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
}
