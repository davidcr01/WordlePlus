import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateGamePage } from './create-game.page';

const routes: Routes = [
  {
    path: '',
    component: CreateGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}
