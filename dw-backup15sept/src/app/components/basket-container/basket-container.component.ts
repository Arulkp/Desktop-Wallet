import {Component, OnInit, OnDestroy} from '@angular/core';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';

@Component({
  selector: 'app-basket-container',
  templateUrl: './basket-container.component.html',
  styleUrls: ['./basket-container.component.css']
})
export class BasketContainerComponent implements OnInit, OnDestroy {

  public selectedExchange: any = "";
  private marketBroadcastServiceSub : any;  

  constructor(
    private marketBroadcastService: MarketBroadcastService,
  ) {}

  ngOnInit(): void {

    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'exchangeWillChange') {
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange()
      }
    });
  }

  ngOnDestroy(): void {
    if(this.marketBroadcastServiceSub) {
      this.marketBroadcastServiceSub.unsubscribe()
    }
  }

}
