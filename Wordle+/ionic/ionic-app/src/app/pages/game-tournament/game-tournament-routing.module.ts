import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameTournamentPage } from './game-tournament.page';

const routes: Routes = [
  {
    path: '',
    component: GameTournamentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameTournamentPageRoutingModule {}
