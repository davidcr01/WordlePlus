import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RespondGamePage } from './respond-game.page';

const routes: Routes = [
  {
    path: '',
    component: RespondGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RespondGamePageRoutingModule {}
