import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { WordleDashboardModule } from 'src/app/wordle-dashboard/wordle-dashboard.module';

import { GameTournamentPageRoutingModule } from './game-tournament-routing.module';

import { GameTournamentPage } from './game-tournament.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WordleDashboardModule,
    GameTournamentPageRoutingModule
  ],
  declarations: [GameTournamentPage]
})
export class GameTournamentPageModule {}
