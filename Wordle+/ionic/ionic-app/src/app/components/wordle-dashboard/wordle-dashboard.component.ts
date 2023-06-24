import { Component, HostListener } from '@angular/core';
import { ToastController } from '@ionic/angular';

interface LetterBox {
  content: string;
  filled: boolean;
}

@Component({
  selector: 'app-wordle-dashboard',
  templateUrl: './wordle-dashboard.component.html',
  styleUrls: ['./wordle-dashboard.component.scss'],
})
export class WordleDashboardComponent {
  public letterRows: LetterBox[][];
  public keyboardLetters: string[];
  public firstRow: string[] = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  public secondRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  public thirdRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];


  private readonly MAX_GUESSES = 6;
  private readonly WORDS_LENGTH = 6;
  private readonly WORDS = ['applei', 'applee', 'applie'];
  private rightGuessString: string;
  private guessesRemaining: number;
  private currentGuess: string[];
  private nextLetter: number;
  private isDark: boolean

  constructor(private toastController: ToastController) {
    this.initGame();
  }

  private initGame(): void {
    this.guessesRemaining = this.MAX_GUESSES;
    this.currentGuess = [];
    this.nextLetter = 0;
    this.rightGuessString = this.WORDS[Math.floor(Math.random() * this.WORDS.length)];
    console.log(this.rightGuessString);

    this.letterRows = Array.from({ length: this.MAX_GUESSES }, () => Array.from({ length: this.WORDS_LENGTH }, () => ({
      content: '',
      filled: false
    })));

    this.keyboardLetters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
  }

  private shadeKeyBoard(letter: string, color: string): void {
    this.keyboardLetters = this.keyboardLetters.map((btnLetter) => {
      if (btnLetter === letter && color !== 'green') {
        return color;
      } else {
        return btnLetter;
      }
    });
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

    this.currentGuess.pop();
    this.nextLetter = Math.max(0, this.nextLetter - 1);
  }

  private checkGuess(): void {
    const currentRow = this.MAX_GUESSES - this.guessesRemaining;
    let guessString = '';

    for (const val of this.currentGuess) {
      guessString += val;
    }
    console.log(guessString);

    if (guessString.length !== this.WORDS_LENGTH) {
      this.showToast('Not enough letters!');
      return;
    }

    if (!this.WORDS.includes(guessString)) {
      this.showToast('Word not in list!');
      return;
    }

    const rightGuess = Array.from(this.rightGuessString);
    const letterColor = Array.from({ length: this.WORDS_LENGTH }, () => 'gray');

    // Check green
    for (let i = 0; i < this.WORDS_LENGTH; i++) {
      if (rightGuess[i] === this.currentGuess[i]) {
        letterColor[i] = 'green';
        rightGuess[i] = '#';
      }
    }

    // Check yellow
    // Checking guess letters that are not green
    for (let i = 0; i < this.WORDS_LENGTH; i++) {
      if (letterColor[i] !== 'green' && rightGuess.includes(this.currentGuess[i])) {
        letterColor[i] = 'orange';
        const index = rightGuess.indexOf(this.currentGuess[i]);
        rightGuess[index] = '#';
      }
    }

    // Update UI
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

    if (letterColor.every((color) => color === 'green')) {
      setTimeout(() => {
        this.showToast('You won!');
        this.initGame();
      }, 250*this.WORDS_LENGTH); 
    } else if (this.guessesRemaining === 0) {
      setTimeout(() => {
        this.showToast('You lost!');
        this.initGame();
      }, 250*this.WORDS_LENGTH); 
    }

    this.currentGuess = [];
  }

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
      const currentRow = 6 - this.guessesRemaining;
      const boxIndex = this.nextLetter;

      if (currentRow >= 0 && currentRow < this.letterRows.length && boxIndex >= 0 && boxIndex < this.letterRows[currentRow].length) {
        const box = this.letterRows[currentRow][boxIndex];
        box.content = letter;
        box.filled = true;
      }

      this.currentGuess.push(letter);
      this.shadeKeyBoard(letter, 'green');
      this.nextLetter++;
    }
  }

  // Allow using the keyboard
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
