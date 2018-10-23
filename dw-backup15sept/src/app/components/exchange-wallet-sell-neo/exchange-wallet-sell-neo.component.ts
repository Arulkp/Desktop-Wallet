import {Component, OnInit} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {NgForm} from '@angular/forms';
import {Constants} from '../../models/constants';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {Http} from '@angular/http';
import {NotificationManagerService} from '../../services/notification-manager.service';

@Component({
  selector: 'exchange-wallet-sell-neo',
  templateUrl: './exchange-wallet-sell-neo.component.html',
  styleUrls: ['./exchange-wallet-sell-neo.component.css']
})
export class ExchangeWalletSellNeoComponent implements OnInit {

  public priceToSell = 0.0;
  public amountToSell = 0.0;
  public buyerFee: any = 0.0;

  public selectedTokenAddress: any;
  public selectedToken: any;
  public selectedExchange: any;
  public selectedOfferTokenAddress: any;
  public selectedOfferToken: any;
  public selectedWallet: any;
  public selectedAccount: any;
  public isSellSummaryModalVisible: any = false;
  public balance: any;
  public tokenBalance: any;
  private trackDeposiTimer: any;
  private trackTransactioTimer: any;
  private sellOrderData: any;
  private marketBroadcastServiceSub: any;
  private selectTokenchange: any;
  private savedWalletsServiceSub: any;
  private networkcallTracker: boolean = false;

  constructor(private savedWalletsService: SavedWalletsService,
              private marketBroadcastService: MarketBroadcastService,
              private neoService: NeoService,
              private notificationService: NotificationManagerService,
              private http: Http,) {
    this.networkcallTracker = false;
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        var shouldRefresh = this.marketBroadcastService.getSelectedMarket() != this.selectedOfferTokenAddress || this.marketBroadcastService.getSelectedPlatformToken != this.selectedTokenAddress;
        var shuoldRefeshPlatformToken = this.selectedToken != this.marketBroadcastService.getSelectedPlatformToken();
        var shuoldRefeshMarketToken = this.selectedOfferToken != this.marketBroadcastService.getSelectedMarket();
        this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken();
        this.selectedTokenAddress = this.selectedToken ? this.selectedToken.address : null;
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange();
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket();
        this.selectedOfferTokenAddress = this.selectedOfferToken ? this.selectedOfferToken.address : null;
        if (this.marketBroadcastService.getRefresh() === true) {
          this.getCoinStats();
          this.getTokenbalance();
        }
        if (this.networkcallTracker === false) {
          console.log('shouldRefresh', this.networkcallTracker);
          this.networkcallTracker = true;
          this.getCoinStats();
          this.getTokenbalance();
        } else {
          console.log('shuoldRefeshPlatformToken', shuoldRefeshPlatformToken);
          if (shuoldRefeshPlatformToken === true) {
            this.getTokenbalance();
          }
          if (shuoldRefeshMarketToken === true) {
            console.log('shuoldRefeshMarketToken', shuoldRefeshMarketToken);
            this.getCoinStats();
          }
        }
      }
    });
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.selectedAccount = this.savedWalletsService.getCurrentWallet();
        // this.refresh()
        // this.initiateAutoRefresh()
      }
    });
    this.neoService.getSellerFee().then((res) => {
      console.log('Res getSellerFee', res);
      this.buyerFee = res;
    });
  }

  ngOnDestroy() {
    this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();

  }

  getTokenbalance() {
    if (!this.selectedTokenAddress)
      return;
    this.neoService.getBalance(this.selectedTokenAddress).then((res) => {
      console.log('got balance', res);
      this.balance = res;
    });
    this.neoService.getTokenBalance(this.selectedTokenAddress, this.neoService.getCurrentUserScripthash()).then((res) => {
      this.tokenBalance = res['balance'];
    });
  }

  getSellTotalValue() {
    return this.priceToSell * this.amountToSell;
  }

  private singleSellOrder(data) {
    this.trackDeposiTimer = false;
    this.neoService.singleSellOrder(data.selectedTokenAddress, data.sellamount, data.selectedOfferTokenAddress, data.sellprice).then((res) => {
      console.log('res', res);
      if (res['response']['txid']) {
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
        setTimeout(() => {
          this.trackTransaction(res['response']['txid']);
        }, 15000);
      }
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
          this.singleSellOrder(this.sellOrderData);
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

  onSubmitSell(form: NgForm) {
    console.log(typeof form.controls.sellprice.value);
    if (form.controls.sellamount.value < 0.00000001) {
      form.controls.sellamount.setErrors({min: true});
      form.controls.sellamount.markAsTouched();
    }
    if (form.controls.sellprice.value < 0.00000001) {
      form.controls.sellprice.setErrors({min: true});
      form.controls.sellprice.markAsTouched();
    }
    if (!form.touched || !form.valid) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in order form'), MessageContentType.Text);
      return;
    }
    if (!this.selectedOfferTokenAddress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please select offer Token'), MessageContentType.Text);
      return;
    } else {
      this.neoService.getBalance(this.selectedTokenAddress).then((res) => {
        if (res) {
          if (parseFloat(res.toString()) === 0 || parseFloat(res.toString()) < this.getSellTotalValue()) {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
            this.neoService.deposit(this.selectedTokenAddress, parseFloat(form.controls.sellamount.value)).then((result) => {
              if (res['response']['txid']) {
                this.trackDeposiTimer = true;
                this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Deposit Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
                setTimeout(() => {
                  this.trackTransaction(res['response']['txid']);
                }, 15000);
              } else {
                this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
              }
            });
          } else {
            this.neoService.singleSellOrder(this.selectedTokenAddress, parseFloat(form.controls.sellamount.value) * 100000000, this.selectedOfferTokenAddress, this.getSellTotalValue() * 100000000).then((res) => {
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
        }
      });
    }
  }

  getCoinStats() {
    if (!this.selectedToken || !this.selectedOfferToken)
      return;
    this.http.get(`${Constants.CryptoCompareUrl}?fsym=${this.selectedToken.symbol}&tsym=${this.selectedOfferToken.symbol}&limit=60&aggregate=3&e=CCCAGG`).subscribe(
      data => {
        var jsonData = data.json();
        if (jsonData.Response === 'Success') {
          var dataLength = jsonData.Data.length;
          var tokenData = jsonData.Data[dataLength - 1];
          this.priceToSell = tokenData.close;
        }
        else {
          this.priceToSell = 0.0;
        }
      },
      err => {
        console.log(err);
      }
    );
  }
}

