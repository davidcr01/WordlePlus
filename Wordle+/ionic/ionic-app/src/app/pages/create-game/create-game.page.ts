import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {
  opponentId: number;
  opponentUsername: string;
  selfUsername: string;
  wordLength: number;

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private toastService: ToastService, private router: Router, private storageService: StorageService) {}

  async ngOnInit() {
    this.selfUsername = await this.storageService.getUsername();
    this.route.queryParams.subscribe((params) => {
      this.opponentId = params['opponentId'];
      this.opponentUsername = params['opponentUsername'];
      this.wordLength = parseInt(params['length'],10);
    });
  }

  async finishGame(time: number, xp: number, attempts: number, selectedWord: string) {
    const gameData = {
      player2: this.opponentId,
      player1_time: time,
      player1_xp: xp,
      player1_attempts: attempts,
      word: selectedWord,
    };
    
    (await this.apiService.createGame(gameData)).subscribe(
      (response) => {
        console.log('Game registered successfully', response);
        this.toastService.showToast('Game registered successfully! Who will win?', 2000, 'top', 'success');
        setTimeout(() =>this.router.navigate(['/tabs/main'], { queryParams: { refresh: 'true' } }), 2500);
      },
      (error) => {
        console.error('Error creating game:', error);
      }
    );
  }
}
