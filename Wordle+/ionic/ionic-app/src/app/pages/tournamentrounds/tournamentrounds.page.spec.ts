import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentroundsPage } from './tournamentrounds.page';

describe('TournamentroundsPage', () => {
  let component: TournamentroundsPage;
  let fixture: ComponentFixture<TournamentroundsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TournamentroundsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
