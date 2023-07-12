import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameTournamentPage } from './game-tournament.page';

describe('GameTournamentPage', () => {
  let component: GameTournamentPage;
  let fixture: ComponentFixture<GameTournamentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GameTournamentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
