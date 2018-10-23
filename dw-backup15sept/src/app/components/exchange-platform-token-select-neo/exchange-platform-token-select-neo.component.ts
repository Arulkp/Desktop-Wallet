import {Component, OnInit, OnDestroy} from '@angular/core';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {NeotokenService} from '../../services/neotoken.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'exchange-platform-token-select-neo',
  templateUrl: './exchange-platform-token-select-neo.component.html',
  styleUrls: ['./exchange-platform-token-select-neo.component.css']
})
export class ExchangePlatformTokenSelectNeoComponent implements OnInit, OnDestroy {
  private previousSelected: any;
  private selectedMarket: Subscription;
  public tokenLists: Array<any> = this.neotokenService.getNeonTokenList();
  public tokenList: Array<any>;
  public selectedToken: any = this.tokenLists[0];

  constructor(private marketBroadcastService: MarketBroadcastService,
              private neoService: NeoService, private neotokenService: NeotokenService) {
    //this.getTokenDetail = this.getTokenDetail.bind(this);
    //this.getTokenDetail();
  }


  ngOnInit() {
    this.handleTokenSelect();
    this.selectedMarket = this.marketBroadcastService.selectedMarket$.subscribe((selectedMarket) => {
      console.log('selectedMarket', selectedMarket);
      if (selectedMarket.name === 'WANDNEO') {
        this.tokenList = this.tokenLists.filter((key) => key.symbol.toLowerCase() !== selectedMarket.name.toLowerCase());
      } else {
        this.tokenList = this.tokenLists;
      }
    });
  }

  ngOnDestroy() {
    this.selectedMarket.unsubscribe();
    // clearTimeout(this.refreshTimer);
    // this.refreshTimer = 0;
  }

  handleTokenSelect() {
    if (this.previousSelected && this.previousSelected.id == this.selectedToken.id)
      return;
    this.previousSelected = this.selectedToken;
    this.marketBroadcastService.setSelectedPlatformToken(this.selectedToken);
  }

}
