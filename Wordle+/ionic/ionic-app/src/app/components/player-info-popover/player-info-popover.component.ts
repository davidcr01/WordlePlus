import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-player-info-popover',
  templateUrl: './player-info-popover.component.html',
  styleUrls: ['./player-info-popover.component.scss'],
})
export class PlayerInfoPopoverComponent  implements OnInit {
  @Input() playerId: string;
  playerInfo: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPlayerData();
  }

  async loadPlayerData() {
    if (this.playerId) {
      (await this.apiService.getPlayerData(this.playerId)).subscribe(
        (response: any) => {
          this.playerInfo = response;
        },
        (error) => {
          console.error('Error retrieving player data:', error);
        }
      )
    }
  }
}