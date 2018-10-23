import {Component, OnInit, NgZone} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {NeotokenService} from '../../services/neotoken.service';
import {Constants} from '../../models/constants';
import {Headers, Http, RequestOptions} from '@angular/http';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';

@Component({
  selector: 'exchange-orderbook-sidepane-neo',
  templateUrl: './exchange-orderbook-sidepane-neo.component.html',
  styleUrls: ['./exchange-orderbook-sidepane-neo.component.css']
})
export class ExchangeOrderbookSidepaneNeoComponent implements OnInit {

  showSpinner: boolean = true;

  public sellOrders: any = new Array<any>();
  public buyOrders: any = new Array<any>();
  public selectedTokenAddress: any;
  public selectedToken: any;
  public selectedExchange: any;
  public selectedOfferTokenAddress: any;
  public selectedOfferToken: any;
  public selectedWallet: any;
  private finalList: any;
  private markets: any;
  private tradeTokenList: any;
  public selectedAccount: any;
  private refreshTimer: any;
  private trackTransactioTimer: any;
  private trackDeposiTimer: any;
  private buyData: any;
  public isSellModalVisible: any = false;
  public isBuyModalVisible: any = false;

  public fillOrderDetail: any;
  public fullFil: boolean = false;
  private marketBroadcastServiceSub: any;
  private savedWalletsServiceSub: any;
  flag: any;

  constructor(private savedWalletsService: SavedWalletsService,
              private marketBroadcastService: MarketBroadcastService,
              private neoService: NeoService,
              private neotokenService: NeotokenService,
              private http: Http,
              private notificationService: NotificationManagerService,
              private zone: NgZone) {
    this.markets = [{
      name: 'NEO',
      address: Constants.NEO_ASSET_ID,
      symbol: 'NEO'
    }, {
      name: 'GAS',
      symbol: 'GAS',
      address: Constants.NEO_GAS_ASSET_ID
    }];

    this.finalList = this.neotokenService.getNeonTokenList();
    this.tradeTokenList = this.finalList.slice();
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

  cleanRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refresh();
    this.initiateAutoRefresh();
  }

  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();
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
      if (!this.selectedAccount) {
        this.sellOrders = [];
        return;
      }
      if (!this.selectedAccount.getAccountAddress) {
        console.log(this.selectedAccount);
        console.log(this.selectedExchange);
      }
      let sellOrders = res['data'];
      sellOrders = sellOrders.filter(it => {
        return it.payload.sellerAddress !== this.neoService.reverseHex(this.selectedAccount.getAccountAddress());
      });
      sellOrders = sellOrders.map(it => {
        return {
          offerAmount: it.payload.offerAmount / 100000000,
          wantAmount: it.payload.wantAmount / 100000000,
          offerAssetId: it.payload.offerAssetId,
          wantAssetId: it.payload.wantAssetId,
          orderHash: it.payload.orderHash,
          availableAmount: it.payload.availableAmount / 100000000,
          type: 'Sell',
          cancel: () => {
            this.cancelOrder(it);
          }
        };
      });
      this.buyOrders = sellOrders;
    });
    this.getBuyOrder().then((res) => {
      if (!this.selectedAccount) {
        this.buyOrders = [];
        return;
      }
      console.log(this.selectedAccount);
      console.log(this.selectedToken);
      let buyOrders = res['data'];
      buyOrders = buyOrders.filter(it => {
        return it.payload.sellerAddress !== this.neoService.reverseHex(this.selectedAccount.getAccountAddress());
      });
      buyOrders = buyOrders.map(it => {
        return {
          offerAmount: it.payload.offerAmount / 100000000,
          wantAmount: it.payload.wantAmount / 100000000,
          offerAssetId: it.payload.offerAssetId,
          wantAssetId: it.payload.wantAssetId,
          orderHash: it.payload.orderHash,
          availableAmount: it.payload.availableAmount / 100000000,
          type: 'Buy',
          cancel: () => {
            this.cancelOrder(it);
          }
        };
      });
      this.sellOrders = buyOrders;
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
        status: 1,
        eventName: 'singleOrder',
      };
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
        .subscribe(
          res => {
            this.showSpinner = false;
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
        status: 1,
        eventName: 'singleOrder',
      };
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
        .subscribe(
          res => {
            this.showSpinner = false;
            var d = res.json();
            resolve({data: d.data});
          },
          err => {
            reject(err);
          }
        );
    });
  }

  fullFilOrder(flag, d) {
    if (flag === 'buy') {
      this.flag = 'buy';
      var offerToken = this.finalList.filter((token) => this.neoService.reverseHex(token.address) === d.offerAssetId);
      if (!offerToken.length) {
        offerToken = this.markets.filter((token) => this.neoService.reverseHex(token.address) === d.offerAssetId);
      }
      var wantToken = this.tradeTokenList.filter((token) => this.neoService.reverseHex(token.address) === d.wantAssetId);
      if (!wantToken.length) {
        wantToken = this.markets.filter((token) => this.neoService.reverseHex(token.address) === d.wantAssetId);
      }
      d.offerTokenName = offerToken[0].name;
      d.wantTokenName = wantToken[0].name;
      this.neoService.getBalance(this.neoService.reverseHex(d.wantAssetId)).then((res) => {
        console.log('got balance', res);
        d.wantBalance = res;
        d.sellAmount = d.wantAmount;
        this.fillOrderDetail = d;
        this.fullFil = true;
        console.log(d);
      });
    } else {
      this.flag = 'sell';
      var offerToken = this.finalList.filter((token) => this.neoService.reverseHex(token.address) === d.offerAssetId);
      if (!offerToken.length) {
        offerToken = this.markets.filter((token) => this.neoService.reverseHex(token.address) === d.offerAssetId);
      }
      var wantToken = this.tradeTokenList.filter((token) => this.neoService.reverseHex(token.address) === d.wantAssetId);
      if (!wantToken.length) {
        wantToken = this.markets.filter((token) => this.neoService.reverseHex(token.address) === d.wantAssetId);
      }
      d.offerTokenName = offerToken[0].name;
      d.wantTokenName = wantToken[0].name;
      this.neoService.getBalance(this.neoService.reverseHex(d.wantAssetId)).then((res) => {
        console.log('got balance', res);
        d.wantBalance = res;
        d.sellAmount = d.wantAmount;
        this.fillOrderDetail = d;
        this.fullFil = true;
        console.log(d);
      });
    }
  }

  closeFullFill() {
    this.fullFil = false;
  }

  cancelOrder(order) {
    // To implement
  }

  fullfill(fill) {
    this.closeFullFill();
    console.log('fill', fill);
    this.neoService.fulfillSingleOffer(fill.orderHash, parseFloat(fill['availableAmount']) * 100000000).then((res) => {
      console.log('Res', res);
      this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
      setTimeout(() => {
        this.trackTransaction(res['response']['txid']);
      }, 15000);
    });
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      console.log(res);
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        if (this.trackDeposiTimer === true) {
          this.singleSellOrder(this.buyData);
        }
        // this.refresh();
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 5000);
  }

  private singleSellOrder(data) {
    this.trackDeposiTimer = false;
    this.neoService.singleSellOrder(data.selectedTokenAddress, data.sellamount, data.selectedOfferTokenAddress, data.sellprice).then((res) => {
      console.log('res', res);
      this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
      setTimeout(() => {
        this.trackTransaction(res['response']['txid']);
      }, 15000);
    });
  }

}
