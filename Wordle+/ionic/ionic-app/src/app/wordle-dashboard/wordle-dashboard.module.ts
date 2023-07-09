import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordleDashboardComponent } from '../components/wordle-dashboard/wordle-dashboard.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [WordleDashboardComponent],
  exports: [WordleDashboardComponent]
})
export class WordleDashboardModule { }
