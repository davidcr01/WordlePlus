import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-classic-wordle',
  templateUrl: './classic-wordle.page.html',
  styleUrls: ['./classic-wordle.page.scss'],
})
export class ClassicWordlePage implements OnInit {

  public wordLength: number = 8;
  constructor() { }

  ngOnInit() {
  }

}
