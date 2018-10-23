import {Component, OnInit, Input, SimpleChanges, NgZone} from '@angular/core';
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
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {NeoService} from '../../services/neo.service';
import * as _ from 'underscore';

@Component({
  selector: 'exchange-tradehistory-sidepane-neo',
  templateUrl: './exchange-tradehistory-sidepane-neo.component.html',
  styleUrls: ['./exchange-tradehistory-sidepane-neo.component.css']
})
export class ExchangeTradehistorySidepaneNeoComponent implements OnInit {

  showSpinner: boolean = true;

  private orderBookRefreshTimer: any;
  public orderTransactions: Array<OrderTransaction> = new Array<OrderTransaction>();
  private tokenRenewalSubscription: Subscription;
  private refreshTimer: any;
  private sellOrders: any = [];
  private buyOrders: any = [];
  public orders: any;
  private selectedToken: any;
  private selectedTokenAddress: any;
  private selectedExchange: any;
  public selectedOfferToken: any;
  private selectedOfferTokenAddress: any;
  private selectedAccount: any;
  private marketBroadcastServiceSub: any;
  private savedWalletsServiceSub: any;

  constructor(private platformTokenService: PlatformTokenService,
              private http: Http,
              private notificationService: NotificationManagerService,
              private tokenService: TokenService,
              private marketBroadcastService: MarketBroadcastService,
              private savedWalletsService: SavedWalletsService,
              private neoService: NeoService,
              private zone: NgZone) {
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        var shouldRefresh = this.marketBroadcastService.getSelectedMarket() != this.selectedOfferTokenAddress
          || this.marketBroadcastService.getSelectedPlatformToken != this.selectedTokenAddress;
        this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken();
        this.selectedTokenAddress = this.selectedToken ? this.selectedToken.address : null;
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange();
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket();
        this.selectedOfferTokenAddress = this.selectedOfferToken ? this.selectedOfferToken.address : null;
        if (this.selectedAccount && this.selectedAccount.exchange == 'neo') {
          this.cleanRefresh();
        }
      }
    });
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.selectedAccount = this.savedWalletsService.getCurrentWallet();
        if (this.selectedAccount && this.selectedAccount.exchange == 'neo') {
          this.cleanRefresh();
        }
      }
    });

  }

  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();
  }

  cleanRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refresh();
    this.initiateAutoRefresh();
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
    if (!this.selectedToken || !this.selectedAccount)
      return;
    this.getSellOrder().then(res => {
      this.sellOrders = res['data'];
      this.getOrders();
    });
    this.getSellOrder().then(res => {
      this.buyOrders = res['data'];
      this.getOrders();
    });
  }

  getSellOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        offerAssetId: this.neoService.reverseHex(this.selectedTokenAddress),
        wantAssetId: this.neoService.reverseHex(this.selectedOfferTokenAddress),
        eventName: 'fulfilledSingleOrder',
      };
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
        .subscribe(
          res => {
            var d = res.json();
            resolve({data: d.data});
          },
          err => {
            reject(err);
          }
        );
    });
  }

  getBuyOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        offerAssetId: this.neoService.reverseHex(this.selectedOfferTokenAddress),
        wantAssetId: this.neoService.reverseHex(this.selectedTokenAddress),
        eventName: 'fulfilledSingleOrder',
      };
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
        .subscribe(
          res => {
            var d = res.json();
            resolve({data: d.data});
          },
          err => {
            reject(err);
          }
        );
    });
  }

  getOrders() {
    if (!this.selectedTokenAddress)
      return;
    var sellOrders = this.sellOrders.map(it => {
      return {
        offerAmount: it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount: it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type: 'Sell',
        status: 'Completed'
      };
    });
    var buyOrders = this.buyOrders.map(it => {
      return {
        offerAmount: it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount: it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type: 'Buy',
        status: 'Completed'
      };
    });
    let orders = sellOrders.concat(buyOrders);
    this.showSpinner = false;
    this.orders = _.uniq(orders);
  }
}
