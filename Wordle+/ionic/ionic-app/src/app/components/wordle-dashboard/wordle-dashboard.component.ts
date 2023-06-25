import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

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
  public letterRows: LetterBox[][];
  public keyboardLetters: string[];
  public firstRow: string[] = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  public secondRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  public thirdRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  private readonly MAX_GUESSES = 6;
  @Input() WORDS_LENGTH: number;
  private wordsOfDesiredLength: string[];
  private rightGuessString: string;
  private guessesRemaining: number;
  private currentGuess: string[];
  private nextLetter: number;
  private successColor: string;

  constructor(private toastController: ToastController, private http: HttpClient) { }

  ngOnInit(): void {
    this.generateWord();
    this.initGame();
    this.getSuccesseColor();
  }

  private initGame(): void {
    this.guessesRemaining = this.MAX_GUESSES;
    this.currentGuess = [];
    this.nextLetter = 0;

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
    this.http.get<any>('assets/words.json').subscribe(
      (wordsData) => {
        this.wordsOfDesiredLength = wordsData[this.WORDS_LENGTH];

        if (!this.wordsOfDesiredLength || this.wordsOfDesiredLength.length === 0) {
          throw new Error(`No words found for length ${this.WORDS_LENGTH}`);
        }

        this.rightGuessString = this.selectRandomWordByLength(this.WORDS_LENGTH);
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

    if (guessString.length !== this.WORDS_LENGTH) {
      this.showToast('Not enough letters!');
      return;
    }

    // Check if the word exists in the dictionary
    if (!this.wordsOfDesiredLength.includes(guessString)) {
      this.showToast('Word not in list!');
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
      setTimeout(() => {
        this.showToast('You won!');
        this.initGame();
      }, 250*this.WORDS_LENGTH+1000); 
    } else if (this.guessesRemaining === 0) {
      setTimeout(() => {
        this.showToast('You lost!');
        this.initGame();
      }, 250*this.WORDS_LENGTH+1000); 
    }

    this.currentGuess = [];
  }

  // Shows informative messages
  private showToast(message: string): void {
    this.toastController
      .create({
        message: message,
        duration: 2000,
        position: 'top',
      })
      .then((toast) => {
        toast.present();
      });
  }

  public handleKeyboardButtonClick(letter: string): void {
    if (letter === 'delete' || letter === 'backspace') {
      this.deleteLetter();
    } else if (letter === 'enter') {
      this.checkGuess();
    } else { // Controlling max number of letters in input
      if (this.currentGuess.length >= this.WORDS_LENGTH) {
        this.showToast('Max letters reached!');
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
