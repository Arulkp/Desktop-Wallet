import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {PlatformToken} from '../../models/platform-tokens';
import {Constants} from '../../models/constants';
import {TokenService} from '../../services/token.service';
import {PlatformTokenService} from '../../services/platform-token.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {OrderTransaction} from '../../models/order-transaction.model';
import {Subscription} from 'rxjs/Subscription';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service'
import {EthExchangeService} from '../../services/eth-exchange.service';


@Component({
  selector: 'exchange-tradehistory-sidepane',
  templateUrl: './exchange-tradehistory-sidepane.component.html',
  styleUrls: ['./exchange-tradehistory-sidepane.component.css']
})
export class ExchangeTradehistorySidepaneComponent implements OnInit {

  showSpinner: boolean = true;

	private orderBookRefreshTimer: any;
	private selectedPlatformToken : any;
	public orderTransactions: Array<OrderTransaction> = new Array<OrderTransaction>();
  private tokenRenewalSubscription: Subscription;
  private refreshTimer : any;
  private marketBroadcastServiceSub : any;
  private tokenServiceSub :any;
  private savedWalletsServiceSub : any;
  private forceRefreshSub : any;

  constructor(
		private platformTokenService: PlatformTokenService,
  	private http: Http,
  	private notificationService: NotificationManagerService,
  	private tokenService: TokenService,
    private savedWalletsService : SavedWalletsService,
    private marketBroadcastService : MarketBroadcastService,
    private exchangeService : EthExchangeService
  ) {
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        if (!this.tokenService.getToken()) {
          if (this.tokenServiceSub) {
            this.tokenServiceSub.unsubscribe()
          }
          this.tokenServiceSub = this.tokenService.token$.subscribe((data) => {
            if (data) {
              this.tokenServiceSub.unsubscribe()
              this.refresh()
              this.initiateAutoRefresh()
            }
          })
        } else {
          this.refresh()
          this.initiateAutoRefresh()
        }
      }
    })
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.orderTransactions = []
        this.showSpinner = true
        this.refresh()
        this.initiateAutoRefresh()
      }
    })
    this.forceRefreshSub = this.exchangeService.forceRefresh$.subscribe(() => {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = 0
      this.refresh()
      this.initiateAutoRefresh()
    })
  }
  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe()
    this.savedWalletsServiceSub.unsubscribe()
    this.forceRefreshSub.unsubscribe()
  }
  private initiateAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refresh();
      this.initiateAutoRefresh();
    }, 30000);
  }

  private refresh() {
    if (this.tokenService.getToken()) {
      this.getOrderTransactions();
    }
  }

  getOrderTransactions() {
    if (!this.selectedPlatformToken)
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'ordertransaction/all/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        this.showSpinner=false;
        this.orderTransactions = data.json();
      },
      err => {
        console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }
}
