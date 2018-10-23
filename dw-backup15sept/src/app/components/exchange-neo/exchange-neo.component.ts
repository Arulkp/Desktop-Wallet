import {Component, OnInit} from '@angular/core';
import {Constants} from '../../models/constants';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';

@Component({
  selector: 'exchange-neo',
  templateUrl: './exchange-neo.component.html',
  styleUrls: ['./exchange-neo.component.css']
})
export class ExchangeNeoComponent implements OnInit {
  public selectedWalletTab: string = 'depositewithdraw';
  public selectedOrdersTab: string = 'openorders';
  public selectedToken: any = '';
  public markets = [{name: 'NEO', address: Constants.NEO_ASSET_ID, symbol: 'NEO'}, {
    name: 'GAS',
    symbol: 'GAS',
    address: Constants.NEO_GAS_ASSET_ID
  }, {
    name: 'WANDNEO',
    symbol: 'WAND',
    address: '4c87396582bdc9daf8df0470f175c79021190b49'
  }];
  public selectedMarket: any = this.markets[0];
  private savedWalletsServiceSub: any;
  private marketBroadcastServiceSub: any;

  constructor(private marketBroadcastService: MarketBroadcastService,
              private savedWalletsService: SavedWalletsService,
              private neoService: NeoService) {
  }

  ngOnInit() {
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        var wallet = this.savedWalletsService.getCurrentWallet();
        if (wallet && wallet.isDecrypted && wallet.exchange == 'neo')
          this.neoService.setAccoutWithWIF(wallet.getWIF());
        this.handleMarketSelect();
      }
    });
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken();
    });
    this.handleMarketSelect();
  }

  ngOnDestroy() {
    if (this.savedWalletsServiceSub)
      this.savedWalletsServiceSub.unsubscribe();
    if (this.marketBroadcastServiceSub)
      this.marketBroadcastServiceSub.unsubscribe();
  }

  handleMarketSelect() {
    this.marketBroadcastService.setSelectedMarket(this.selectedMarket);
  }

  handleWalletChange() {
    var wallet = this.savedWalletsService.getCurrentWallet();
    if (!wallet || wallet.exchange != 'neo')
      return;
    // init account
  }

  setWalletTab(tab) {
    this.selectedWalletTab = tab;
  }

  setOrderTab(tab) {
    this.selectedOrdersTab = tab;
  }

}
