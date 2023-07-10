import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RespondGamePage } from './respond-game.page';

describe('RespondGamePage', () => {
  let component: RespondGamePage;
  let fixture: ComponentFixture<RespondGamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RespondGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
