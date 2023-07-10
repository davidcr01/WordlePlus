import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';
import { WordleDashboardModule } from 'src/app/wordle-dashboard/wordle-dashboard.module';
import { ClassicWordlePageRoutingModule } from './classic-wordle-routing.module';
import { ApiService } from 'src/app/services/api.service';
import { ClassicWordlePage } from './classic-wordle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    ClassicWordlePageRoutingModule,
    WordleDashboardModule
  ],
  declarations: [ClassicWordlePage],
  providers: [ApiService]

})
export class ClassicWordlePageModule {}
