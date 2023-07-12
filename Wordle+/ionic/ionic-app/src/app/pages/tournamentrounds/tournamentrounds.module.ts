import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingModule } from 'src/app/loading/loading.module';
import { IonicModule } from '@ionic/angular';

import { TournamentroundsPageRoutingModule } from './tournamentrounds-routing.module';

import { TournamentroundsPage } from './tournamentrounds.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TournamentroundsPageRoutingModule,
    LoadingModule
  ],
  declarations: [TournamentroundsPage]
})
export class TournamentroundsPageModule {}
