import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service';

@Component({
  selector: 'exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  public selectedExchange : any = "";
  public selectedWallet : any = "";
  private marketBroadcastServiceSub : any;
  constructor(
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService: SavedWalletsService,
    private zone : NgZone
  ) {}

  ngOnInit(): void {

    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        let w = this.savedWalletsService.getCurrentWallet();
        this.selectedWallet = w
      }
    });
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'exchangeWillChange') {
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange()
      }
    });
  }

  ngOnDestroy(): void {
  }

}

