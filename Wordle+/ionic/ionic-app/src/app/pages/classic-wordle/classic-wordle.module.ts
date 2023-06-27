import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';
import { WordleDashboardComponent } from 'src/app/components/wordle-dashboard/wordle-dashboard.component';

import { ClassicWordlePageRoutingModule } from './classic-wordle-routing.module';
import { ApiService } from 'src/app/services/api.service';
import { ClassicWordlePage } from './classic-wordle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    ClassicWordlePageRoutingModule
  ],
  declarations: [ClassicWordlePage, WordleDashboardComponent],
  providers: [ApiService]

})
export class ClassicWordlePageModule {}
