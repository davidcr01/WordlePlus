import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlayerInfoPopoverComponent } from 'src/app/components/player-info-popover/player-info-popover.component';
import { FriendlistPageRoutingModule } from './friendlist-routing.module';

import { FriendlistPage } from './friendlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendlistPageRoutingModule
  ],
  declarations: [FriendlistPage, PlayerInfoPopoverComponent]
})
export class FriendlistPageModule {}
