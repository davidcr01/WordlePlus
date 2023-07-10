import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-words-popover',
  templateUrl: './words-popover.component.html',
  styleUrls: ['./words-popover.component.scss'],
})
export class WordsPopoverComponent  implements OnInit {
  @Input() playerId?: number;
  @Input() username?: string;
  wordLengths = [4,5,6,7,8];
  constructor(private router: Router) { }

  ngOnInit() {}
  
  navigateToGame(length: number) {
    if (this.playerId) {
      this.router.navigate(['/create-game'], { queryParams: {length: length, opponentId: this.playerId, opponentUsername: this.username} });
    } else {
      this.router.navigate([`/classic-wordle/${length}`]);
    }
  }

}
