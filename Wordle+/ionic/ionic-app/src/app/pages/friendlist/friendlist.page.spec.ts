import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendlistPage } from './friendlist.page';

describe('FriendlistPage', () => {
  let component: FriendlistPage;
  let fixture: ComponentFixture<FriendlistPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FriendlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
