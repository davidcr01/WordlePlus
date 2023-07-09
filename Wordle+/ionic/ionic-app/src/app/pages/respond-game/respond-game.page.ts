import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-respond-game',
  templateUrl: './respond-game.page.html',
  styleUrls: ['./respond-game.page.scss'],
})
export class RespondGamePage implements OnInit {
  idGame: number;
  selfUsername: string;
  opponentUsername: string;
  selectedWord: string;
  wordLength: number;

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private storageService: StorageService,
    private router: Router, private alertController: AlertController) {}

  async ngOnInit() {
    this.selfUsername = await this.storageService.getUsername();
    this.route.queryParams.subscribe((params) => {
      this.idGame = params['idGame'];
    });

    (await this.apiService.getGame(this.idGame)).subscribe(
      (response) => {
        console.log(response);
        this.selectedWord = response.word;
        this.opponentUsername = response.player1;
        this.wordLength = this.selectedWord.length;
      },
      (error) => {
        this.showAlert("Ups!", "You can't play this game!");
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
            this.router.navigate(['/tabs/main']);
          },
        },
      ],
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role === 'backdrop') {
      this.router.navigate(['/tabs/main']);
    }
  }

  async finishGame(time: number, xp: number, attempts: number, selectedWord: string) {
    const gameData = {
      player2_time: time,
      player2_xp: xp,
      player2_attempts: attempts,
    };

    (await this.apiService.resolveGame(this.idGame, gameData)).subscribe(
      (response) => {
        console.log('Game resolved successfully', response);
        console.log(response.winner, this.selfUsername);
        if (response.winner === this.selfUsername) {
          this.showAlert('Congratulations!', 'You won! Amazing!');
          
        } else {
          this.showAlert('Bad news!', 'You lost. Try next time!');
        }
        // Handle success and navigate to appropriate page
      },
      (error) => {
        console.log('Game could not be resolved', error);
        // Handle error
      }
    );
  }
}
