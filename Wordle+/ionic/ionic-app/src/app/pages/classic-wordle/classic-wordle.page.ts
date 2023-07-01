import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-classic-wordle',
  templateUrl: './classic-wordle.page.html',
  styleUrls: ['./classic-wordle.page.scss'],
})
export class ClassicWordlePage implements OnInit {

  public wordLength: number;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.wordLength = parseInt(params.get('length'), 10);
    });
  }

}
