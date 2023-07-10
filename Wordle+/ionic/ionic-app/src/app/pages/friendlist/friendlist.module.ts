import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordsPopoverComponent } from 'src/app/components/words-popover/words-popover.component';
import { IonicModule } from '@ionic/angular';

import { FriendlistPageRoutingModule } from './friendlist-routing.module';

import { FriendlistPage } from './friendlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendlistPageRoutingModule
  ],
  declarations: [FriendlistPage]
})
export class FriendlistPageModule {}
