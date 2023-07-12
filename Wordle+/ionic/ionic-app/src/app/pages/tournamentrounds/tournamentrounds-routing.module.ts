import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentroundsPage } from './tournamentrounds.page';

const routes: Routes = [
  {
    path: '',
    component: TournamentroundsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TournamentroundsPageRoutingModule {}
