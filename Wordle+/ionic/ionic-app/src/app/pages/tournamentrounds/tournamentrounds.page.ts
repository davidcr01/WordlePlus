import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-tournamentrounds',
  templateUrl: './tournamentrounds.page.html',
  styleUrls: ['./tournamentrounds.page.scss'],
})
export class TournamentroundsPage implements OnInit {
  tournamentId: number;
  tournamentInfo: any;
  selectedSegment: number = 1;
  currentRound: number;
  rounds: any[] = [];
  roundGames: any[] = [];
  username: string;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private storageService: StorageService) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.tournamentId = params['id'];
      this.username = await this.storageService.getUsername();
      this.loadTournamentRounds();
    });
  }
    

  async loadTournamentInfo() {
    this.isLoading = true;
    (await this.apiService.getTournamentInfo(this.tournamentId)).subscribe(
      (response) => {
        console.log(response);
        console.log(response.current_round);
        this.tournamentInfo = response;
        this.currentRound = response.current_round;
        this.selectedSegment = response.current_round;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading tournament info:', error);
        this.isLoading = true;
      }
    );
  }

  ionViewDidEnter() {
    this.loadTournamentInfo();
  }

  async loadTournamentRounds() {
    this.isLoading = true;
    (await this.apiService.getRounds(this.tournamentId)).subscribe(
      (data: any) => {
        this.rounds = data;
        this.loadRoundGames(this.selectedSegment);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading tournament rounds:', error);
        this.isLoading = false;
      }
    );
  }

  async loadRoundGames(roundNumber: number) {
    this.isLoading = true;
    (await this.apiService.getGamesRound(this.tournamentId, roundNumber)).subscribe(
      (data: any) => {
        console.log(data);
        this.roundGames = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading round games:', error);
        this.isLoading = false;
      }
    );
  }

  segmentChanged(event: any) {
    const roundNumber = event.target.value;
    this.loadRoundGames(roundNumber);
  }

  isPlayerInGame(game: any) {
    return game.player1 === this.username || game.player2 === this.username;
  }

  playGame(gameId: number) {
    // Handle the "Play" button click event
  }

}
