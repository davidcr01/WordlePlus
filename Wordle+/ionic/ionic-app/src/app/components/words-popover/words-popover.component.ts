import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-words-popover',
  templateUrl: './words-popover.component.html',
  styleUrls: ['./words-popover.component.scss'],
})
export class WordsPopoverComponent  implements OnInit {
  wordLengths = [4,5,6,7,8];
  constructor() { }

  ngOnInit() {}
  

}
