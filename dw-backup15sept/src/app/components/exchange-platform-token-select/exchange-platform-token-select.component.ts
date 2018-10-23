import { Component, OnInit, Input } from '@angular/core';
import {PlatformTokenService} from '../../services/platform-token.service'
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service'

@Component({
  selector: 'exchange-platform-token-select',
  templateUrl: './exchange-platform-token-select.component.html',
  styleUrls: ['./exchange-platform-token-select.component.css']
})
export class ExchangePlatformTokenSelectComponent implements OnInit {

	public  platformTokens: any;
	public selectedToken: any = "";
  private previousSelected : any;
  private platformTokenSub1 : any;
  private platformTokenSub2 : any;
  private savedWalletsServiceSub : any;
  constructor(
    private platformTokenService : PlatformTokenService,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
  ) {
  	this.handleTokenSelect = this.handleTokenSelect.bind(this)
  }
  handleTokenSelect() {
    if (this.previousSelected && this.previousSelected.id == this.selectedToken.id)
      return
    this.previousSelected = this.selectedToken
    this.marketBroadcastService.setSelectedPlatformToken(this.selectedToken)
  }
  ngOnInit() {
    this.platformTokenSub1 = this.platformTokenService.selectedPlatformToken$.subscribe((token) => {
      this.selectedToken = token
    })
    this.platformTokenSub2 = this.platformTokenService.platformTokens$.subscribe((tokens) => {
      this.platformTokens = tokens
      if (!this.selectedToken && this.platformTokens && this.platformTokens.length) {
        this.selectedToken = this.platformTokens[0]
        this.handleTokenSelect()
      }
    })
    // this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
    //   if (status == 'currentWalletChanged') {
    //     var selectedWallet = this.savedWalletsService.getCurrentWallet()
    //     if (this.selectedToken && selectedWallet && selectedWallet.exchange == 'eth')
    //       this.marketBroadcastService.setSelectedPlatformToken(this.selectedToken)
    //   }
    // })
  }
  ngOnDestroy() {
    this.platformTokenSub1.unsubscribe()
    this.platformTokenSub2.unsubscribe()
    // this.savedWalletsServiceSub.unsubscribe()
  }

}
