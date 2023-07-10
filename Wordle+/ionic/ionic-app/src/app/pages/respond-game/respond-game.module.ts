import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WordleDashboardModule } from 'src/app/wordle-dashboard/wordle-dashboard.module';
import { RespondGamePageRoutingModule } from './respond-game-routing.module';

import { RespondGamePage } from './respond-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WordleDashboardModule,
    RespondGamePageRoutingModule
  ],
  declarations: [RespondGamePage]
})
export class RespondGamePageModule {}
