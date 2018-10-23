import {Component, OnInit, NgZone} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {Constants} from '../../models/constants';
import {Headers, Http, RequestOptions} from '@angular/http';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';

@Component({
  selector: 'exchange-openorders-neo',
  templateUrl: './exchange-openorders-neo.component.html',
  styleUrls: ['./exchange-openorders-neo.component.css']
})
export class ExchangeOpenordersNeoComponent implements OnInit {

  showSpinner: boolean = true;

  private sellOrders: any = new Array<any>();
  private buyOrders: any = new Array<any>();
  public selectedTokenAddress: any;
  public selectedToken: any;
  public selectedExchange: any;
  public selectedOfferTokenAddress: any;
  public selectedOfferToken: any;
  public selectedWallet: any;
  public openOrders: any;
  public selectedAccount: any = null;
  private refreshTimer: any;
  private savedWalletsServiceSub: any;
  private marketBroadcastServiceSub: any;
  private trackTransactioTimer: any;

  constructor(private savedWalletsService: SavedWalletsService,
              private marketBroadcastService: MarketBroadcastService,
              private neoService: NeoService,
              private notificationService: NotificationManagerService,
              private http: Http,
              private zone: NgZone) {

  }

  ngOnInit() {
    this.savedWalletsServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
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
    this.marketBroadcastServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.selectedAccount = this.savedWalletsService.getCurrentWallet();
        if (this.selectedAccount && this.selectedAccount.exchange == 'neo') {
          this.cleanRefresh();
        }
      }
    });
  }

  cleanRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refresh();
    this.initiateAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = 0;
    this.savedWalletsServiceSub.unsubscribe();
    this.marketBroadcastServiceSub.unsubscribe();
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
    this.getSellOrder().then((res) => {
      this.sellOrders = res['data'];
      this.getUserOrders();
    });
    this.getBuyOrder().then((res) => {
      this.buyOrders = res['data'];
      this.getUserOrders();
    });
  }

  getSellOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress: this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId: this.neoService.reverseHex(this.selectedTokenAddress),
        wantAssetId: this.neoService.reverseHex(this.selectedOfferTokenAddress),
        status: 1,
        eventName: 'singleOrder',
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
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress: this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId: this.neoService.reverseHex(this.selectedOfferTokenAddress),
        wantAssetId: this.neoService.reverseHex(this.selectedTokenAddress),
        status: 1,
        eventName: 'singleOrder',
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

  getUserOrders() {
    if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
      this.openOrders = [];
      return;
    }

    let buyOrders = this.buyOrders.map(it => {
      return {
        offerAmount: it.payload.offerAmount / 100000000,
        wantAmount: it.payload.wantAmount / 100000000,
        type: 'Buy',
        cancel: () => {
          this.cancelOrder(it);
        }
      };
    });
    let sellOrders = this.sellOrders.map(it => {
      return {
        offerAmount: it.payload.offerAmount / 100000000,
        wantAmount: it.payload.wantAmount / 100000000,
        type: 'Sell',
        cancel: () => {
          this.cancelOrder(it);
        }
      };
    });
    let openOrders = sellOrders.concat(buyOrders);
    this.zone.run(() => {
      this.showSpinner = false;
      this.openOrders = openOrders;
    });

  }

  cancelOrder(order) {
    this.neoService.cancelSingleOrder(order.payload.orderHash).then((res) => {
      console.log('res', res);
      if (res['response']['txid']) {
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
        setTimeout(() => {
          this.trackTransaction(res['response']['txid']);
        }, 15000);
      } else {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
      }
    });
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
        this.refresh();
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 1000);
  }
}
