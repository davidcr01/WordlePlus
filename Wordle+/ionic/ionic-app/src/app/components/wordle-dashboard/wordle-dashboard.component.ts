import { Component, HostListener, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/app/services/storage.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';


interface LetterBox {
  content: string;
  filled: boolean;
}

@Component({
  selector: 'app-wordle-dashboard',
  templateUrl: './wordle-dashboard.component.html',
  styleUrls: ['./wordle-dashboard.component.scss'],
})
export class WordleDashboardComponent implements OnInit {
  // For 1vs1 games
  @Output() gameFinished: EventEmitter<any> = new EventEmitter();
  @Input() isMultiplayer: boolean;

  public letterRows: LetterBox[][];
  public keyboardLetters: string[];
  public firstRow: string[] = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  public secondRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  public thirdRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  private readonly MAX_GUESSES = 6;
  @Input() WORDS_LENGTH: number;
  private wordsOfDesiredLength: string[];
  @Input() rightGuessString?: string;
  private guessesRemaining: number;
  private currentGuess: string[];
  private nextLetter: number;
  private successColor: string;
  private startTime: number;

  constructor(
    private http: HttpClient, 
    private storageService: StorageService,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.generateWord();
    this.initGame();
    this.getSuccesseColor();
  }

  private initGame(): void {
    this.guessesRemaining = this.MAX_GUESSES;
    this.currentGuess = [];
    this.nextLetter = 0;
    this.startTime = Date.now();

    this.letterRows = Array.from({ length: this.MAX_GUESSES }, () => Array.from({ length: this.WORDS_LENGTH }, () => ({
      content: '',
      filled: false
    })));

    this.keyboardLetters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
  }

  // Gets the success color, defined by the variable --ion-color-purple
  private getSuccesseColor(): void {
    const root = document.documentElement;
    this.successColor = getComputedStyle(root).getPropertyValue('--ion-color-purple').trim();
  }

  // Reads the JSON file of words and select a random one with a specified length
  private generateWord(): void {
    console.log(this.WORDS_LENGTH);
    console.log(this.rightGuessString);
    this.http.get<any>('assets/words.json').subscribe(
      (wordsData) => {
        this.wordsOfDesiredLength = wordsData[this.WORDS_LENGTH];

        if (!this.wordsOfDesiredLength || this.wordsOfDesiredLength.length === 0) {
          throw new Error(`No words found for length ${this.WORDS_LENGTH}`);
        }

        // If it has not a value, then it has not been passed by parameter
        if (!this.rightGuessString) {
          this.rightGuessString = this.selectRandomWordByLength(this.WORDS_LENGTH);
        }
      },
      (error) => {
        throw new Error(`Failed to load words data: ${error.message}`);
      }
    );
  }

  // Select a word from the list of words of desired length
  private selectRandomWordByLength(length: number): string {
    const wordsOfDesiredLength = this.wordsOfDesiredLength;
  
    if (wordsOfDesiredLength && wordsOfDesiredLength.length > 0) {
      const randomIndex = Math.floor(Math.random() * wordsOfDesiredLength.length);
      const selectedWord = wordsOfDesiredLength[randomIndex];
      console.log(selectedWord);
      return selectedWord;
    } else {
      throw new Error(`No words found for length ${length}`);
    }
  }

  // Deletes the written letters
  private deleteLetter(): void {
    const currentRow = this.MAX_GUESSES - this.guessesRemaining;
    const boxIndex = Math.max(0, this.nextLetter - 1);

    // Access to legal position of the matrix
    if (currentRow >= 0 && currentRow < this.letterRows.length && boxIndex >= 0 && boxIndex < this.letterRows[currentRow].length) {
      const box = this.letterRows[currentRow][boxIndex];
      box.content = '';
      box.filled = false;
    }

    // Delete the letter from the word
    this.currentGuess.pop();
    this.nextLetter = Math.max(0, this.nextLetter - 1);
  }

  // Checks the introduced input
  private checkGuess(): void {
    const currentRow = this.MAX_GUESSES - this.guessesRemaining;
    let guessString = '';

    // Descompose the word in letters
    for (const val of this.currentGuess) {
      guessString += val;
    }

    console.log(guessString.length);
    console.log(this.WORDS_LENGTH);
    if (guessString.length !== this.WORDS_LENGTH) {
      this.toastService.showToast('Not enough letters!');
      return;
    }

    // Check if the word exists in the dictionary
    if (!this.wordsOfDesiredLength.includes(guessString)) {
      this.toastService.showToast('Word not in list!');
      return;
    }

    const rightGuess = Array.from(this.rightGuessString);
    const letterColor = Array.from({ length: this.WORDS_LENGTH }, () => 'gray');

    // Check success letters
    for (let i = 0; i < this.WORDS_LENGTH; i++) {
      if (rightGuess[i] === this.currentGuess[i]) {
        letterColor[i] = this.successColor;
        rightGuess[i] = '#';
      }
    }

    // Check yellow
    // Checking guess letters that are not success color
    for (let i = 0; i < this.WORDS_LENGTH; i++) {
      if (letterColor[i] !== this.successColor && rightGuess.includes(this.currentGuess[i])) {
        letterColor[i] = 'orange';
        const index = rightGuess.indexOf(this.currentGuess[i]);
        rightGuess[index] = '#';
      }
    }

    // Update UI. Animation of coloring
    const row = document.querySelector('.game-board').children[currentRow] as HTMLElement;

    for (let i = 0; i < this.WORDS_LENGTH; i++) {
      const box = row.children[i] as HTMLElement;
      const delay = 250 * i;

      setTimeout(() => {
        this.animateCSS(box, 'flipInX');
        box.style.backgroundColor = letterColor[i];
      }, delay);
    }

    this.nextLetter = 0;
    this.guessesRemaining--;

    if (this.rightGuessString === guessString) {
      this.handleEndgame(true);
    } else if (this.guessesRemaining === 0) {
      this.handleEndgame(false);
    }

    this.currentGuess = [];
  }

  private async handleEndgame(won: boolean) {
    const playerId = await this.storageService.getPlayerID();
    const timeConsumed = this.calculateTimeConsumed();
    const attempsConsumed = this.MAX_GUESSES - this.guessesRemaining;
    const xP = this.calculateExperience(timeConsumed, attempsConsumed, this.WORDS_LENGTH, won);


    if (playerId !== null) {
      const body = {
        word: this.rightGuessString,
        attempts: attempsConsumed,
        time_consumed: timeConsumed,
        win: won,
        xp_gained: xP,
      };
      // Case of multiplayer game
      if (this.isMultiplayer) {
        const gameFinishedEvent = {
          time: timeConsumed,
          xp: xP,
          attempts: attempsConsumed,
          selectedWord: this.rightGuessString,
        };
        this.gameFinished.emit(gameFinishedEvent);
      } else {
        // Case of classic game
        (await this.apiService.addClassicGame(body)).subscribe(
          (response) => {
            console.log('Game added successfully', response);
          },
          (error) => {
            console.log('Game could not be added', error);
        });
        this.storageService.incrementXP(xP);

        if (won) {
          setTimeout(() => {
            this.toastService.showToast(`You won! You gained ${xP}`, 3000, 'top');
            this.storageService.incrementWins();
          }, 250 * this.WORDS_LENGTH + 3000);
        } else {
          setTimeout(() => {
            this.toastService.showToast(`You lost! You gained ${xP}`, 3000, 'top');
          }, 250 * this.WORDS_LENGTH + 3000);
        }
        setTimeout(() => {
          this.router.navigate(['/tabs/main'], { queryParams: { refresh: 'true' } });
        }, 3000)
      }
    }
  }

  private calculateTimeConsumed(): number {
    const endTime = Date.now();
    const timeInSeconds = Math.floor((endTime - this.startTime) / 1000);
    return timeInSeconds;
  }
  
  private calculateExperience(timeDiffInSeconds: number, numGuesses: number, wordLength: number, hasWon: boolean): number {
    const baseExperience = 100; 
    const timeMultiplier = 10; 
    const guessesMultiplier = 5;
    const lengthMultiplier = 10; 
    const lossExperienceMultiplier = 0.5;
  
    const timeExperience = baseExperience - timeDiffInSeconds * timeMultiplier;
    const guessesExperience = baseExperience - numGuesses * guessesMultiplier;
    const lengthExperience = baseExperience + wordLength * lengthMultiplier;
  
    let totalExperience = timeExperience + guessesExperience + lengthExperience;
  
    if (!hasWon) {
      totalExperience *= lossExperienceMultiplier;
    }
  
    return totalExperience > 0 ? totalExperience : 0;
  }  

  public handleKeyboardButtonClick(letter: string): void {
    if (letter === 'delete' || letter === 'backspace') {
      this.deleteLetter();
    } else if (letter === 'enter') {
      this.checkGuess();
    } else { // Controlling max number of letters in input
      if (this.currentGuess.length >= this.WORDS_LENGTH) {
        this.toastService.showToast('Max letters reached!', 2000, 'top');
        return;
      }
      const currentRow = this.MAX_GUESSES - this.guessesRemaining;
      const boxIndex = this.nextLetter;

      // Access to legal position of the matrix
      if (currentRow >= 0 && currentRow < this.letterRows.length && boxIndex >= 0 && boxIndex < this.letterRows[currentRow].length) {
        const box = this.letterRows[currentRow][boxIndex];
        box.content = letter;
        box.filled = true;
      }

      this.currentGuess.push(letter);
      this.nextLetter++;
    }
  }  

  // Allows using the keyboard
  @HostListener('window:keyup', ['$event'])
  handleKeyboardKeyUp(event: KeyboardEvent): void {
    const pressedKey = event.key.toUpperCase();
    event.stopPropagation();

    if (/^[A-Z]$/.test(pressedKey) || pressedKey === 'DELETE' ||  pressedKey === 'BACKSPACE' || pressedKey === 'ENTER') {
      event.preventDefault();

      // Calls the existing function of the virtual keyboard
      this.handleKeyboardButtonClick(pressedKey.toLowerCase());
    }
  }
  
  // Animate the boxes when user inputs a word
  animateCSS(element, animation, prefix = 'animate__') {
    return new Promise((resolve, reject) => {
      const animationName = `${prefix}${animation}`;
      const node = element;
      node.style.setProperty('--animate-duration', '0.3s');

      node.classList.add(`${prefix}animated`, animationName);

      function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve('Animation ended');
      }

      node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
  }
}
