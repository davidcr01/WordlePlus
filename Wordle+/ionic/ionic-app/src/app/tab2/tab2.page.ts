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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadTournaments();
  }

  async loadTournaments() {
    (await this.apiService.getTournaments(this.wordLength))
      .subscribe(
        (data: any) => {
          console.log(data);
          this.tournaments = data.results;
        },
        (error) => {
          console.error('Error loading tournaments:', error);
        }
      );
  }
}
