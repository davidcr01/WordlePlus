import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WordleDashboardComponent } from 'src/app/components/wordle-dashboard/wordle-dashboard.component';

import { ClassicWordlePageRoutingModule } from './classic-wordle-routing.module';

import { ClassicWordlePage } from './classic-wordle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassicWordlePageRoutingModule
  ],
  declarations: [ClassicWordlePage, WordleDashboardComponent]
})
export class ClassicWordlePageModule {}
