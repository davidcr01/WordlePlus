import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassicWordlePage } from './classic-wordle.page';

const routes: Routes = [
  {
    path: '',
    component: ClassicWordlePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassicWordlePageRoutingModule {}
