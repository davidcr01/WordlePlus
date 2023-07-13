import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-game-tournament',
  templateUrl: './game-tournament.page.html',
  styleUrls: ['./game-tournament.page.scss'],
})
export class GameTournamentPage implements OnInit {
  tournamentId: number;
  selfUsername: string;
  gameId: number;
  tournamentInfo: any;
  wordLength: number;
  selectedWord: string;

  player1: string; 
  player2: string;

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private storageService: StorageService,
    private router: Router, private alertController: AlertController) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.tournamentId = params['tournamentId'];
      this.gameId = params['idGame'];
      this.selfUsername = await this.storageService.getUsername();
      this.loadTournamentInfo();
    });
  }

  async loadTournamentInfo() {
    (await this.apiService.getTournamentInfo(this.tournamentId)).subscribe(
      (response) => {
        console.log(response);
        this.tournamentInfo = response;
        this.wordLength = response.word_length;
        console.log(this.wordLength);
        this.loadGameInfo();
      },
      (error) => {
        console.error('Error loading tournament info:', error);
      }
    );
  }

  async loadGameInfo() {
    (await this.apiService.getGame(this.gameId)).subscribe(
      (response) => {
        console.log(response);
        this.selectedWord = '';
        if (response.word) {
          this.selectedWord = response.word;
        }
        console.log(this.selectedWord);
        this.player1 = response.player1;
        this.player2 = response.player2;

        if (this.selfUsername === this.player1 && response.player1_xp !== 0) {
          this.showAlert("Ups!", "You already played this game!");
        } else if (this.selfUsername === this.player2 && response.player2_xp !== 0) {
          this.showAlert("Ups!", "You already played this game!");
        }
      },
      (error) => {
        console.log(error);
        this.showAlert("Ups!", "You can't play this game!");
      }
    );
  }

  async finishGame(time: number, xp: number, attempts: number, selectedWord: string) {
    let gameData: any = {};

    gameData = {
      player1_time: time,
      player1_xp: xp,
      player1_attempts: attempts,
      word: selectedWord,
    };

    if (this.selfUsername === this.player2) {
      gameData = {
        player2_time: time,
        player2_xp: xp,
        player2_attempts: attempts,
        word: selectedWord,
      };
    }

    (await this.apiService.resolveTournamentGame(this.gameId, gameData)).subscribe(
      (response) => {
        console.log('Game resolved successfully', response);
        if (response.message) {
          setTimeout( () => this.showAlert('Amazing!', 'Who will win?'), 2500);
        }
        else {
          if (response.winner === this.selfUsername) {
            setTimeout( () => this.showAlert('Congratulations!', 'You won! Amazing!'), 2500);
          } else {
            setTimeout( () => this.showAlert('Bad news!', 'You lost. Try next time!'), 2500);
          }
        }
      },
      (error) => {
        console.log('Game could not be resolved', error);
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/tournamentrounds'], { queryParams: { id: this.tournamentId } });
          },
        },
      ],
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role === 'backdrop') {
      this.router.navigate(['/tournamentrounds'], { queryParams: { id: this.tournamentId } });
    }
  }
}
