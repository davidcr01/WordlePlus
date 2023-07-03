import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditUserPageRoutingModule } from './edit-user-routing.module';

import { EditUserPage } from './edit-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditUserPageRoutingModule
  ],
  declarations: [EditUserPage]
})
export class EditUserPageModule {}
