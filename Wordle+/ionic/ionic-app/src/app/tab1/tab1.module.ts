import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { LogoutButtonComponent } from '../components/logout-button/logout-button.component';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { WordsPopoverComponent } from '../components/words-popover/words-popover.component';
import { NotificationsPopoverComponent } from '../components/notifications-popover/notifications-popover.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page, LogoutButtonComponent, WordsPopoverComponent, NotificationsPopoverComponent]
})
export class Tab1PageModule {}
