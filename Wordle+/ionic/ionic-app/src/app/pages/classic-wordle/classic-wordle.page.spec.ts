import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassicWordlePage } from './classic-wordle.page';

describe('ClassicWordlePage', () => {
  let component: ClassicWordlePage;
  let fixture: ComponentFixture<ClassicWordlePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClassicWordlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
