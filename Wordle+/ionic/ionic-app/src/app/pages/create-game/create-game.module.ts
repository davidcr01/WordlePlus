import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './create-game-routing.module';

import { CreateGamePage } from './create-game.page';
import { WordleDashboardModule } from 'src/app/wordle-dashboard/wordle-dashboard.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
    WordleDashboardModule
  ],
  declarations: [CreateGamePage]
})
export class CreateGamePageModule {}
