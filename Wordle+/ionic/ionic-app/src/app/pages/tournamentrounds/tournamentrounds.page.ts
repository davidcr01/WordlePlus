import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selectedSegment: number;
  currentRound: number;
  rounds: any[] = [];
  roundGames: any[] = [];
  lastRound: number;
  username: string;
  winnerTournamentUsername: string;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private storageService: StorageService, private router: Router) {}

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
        this.tournamentInfo = response;
        this.currentRound = response.current_round;
        this.selectedSegment = response.current_round;
      },
      (error) => {
        console.error('Error loading tournament info:', error);
        this.isLoading = true;
      }
    );
  }

  ionViewDidEnter() {
    this.loadTournamentInfo();
    this.loadTournamentRounds();
  }

  async loadTournamentRounds() {
    this.isLoading = true;
    (await this.apiService.getRounds(this.tournamentId)).subscribe(
      (data: any) => {
        this.rounds = data;
        this.lastRound = this.rounds.length;
        this.loadRoundGames(this.selectedSegment);
      },
      (error) => {
        this.router.navigate(['/tabs/tournaments']);
        console.error('Error loading tournament rounds:', error);
        this.isLoading = false;
      }
    );
  }

  async loadRoundGames(roundNumber: number) {
    this.isLoading = true;
    (await this.apiService.getGamesRound(this.tournamentId, roundNumber)).subscribe(
      async (data: any) => {
        this.roundGames = data;

        if (roundNumber === this.lastRound && this.roundGames[0].winner) {
          (await this.apiService.getPlayerData(this.roundGames[0].winner)).subscribe(
            (data: any) => {
              this.winnerTournamentUsername = data.user.username;
            },
            (error) => {
              console.error('Error loading winner username:', error);
              this.isLoading = false;
            }
          );
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading round games:', error);
        this.isLoading = false;
      }
    );
  }

  segmentChanged(event: any) {
    this.selectedSegment = Number(event.detail.value);
    const roundNumber = event.target.value;
    this.loadRoundGames(roundNumber);
  }

  isPlayerInGame(game: any) {
    return (game.player1 === this.username && game.player1_xp === 0) || (game.player2 === this.username && game.player2_xp === 0);
  }

  playGame(gameId: number) {
    this.router.navigate(['/game-tournament'], { queryParams: {idGame: gameId, tournamentId: this.tournamentId} });
  }

}
