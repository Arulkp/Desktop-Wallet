import {Component, OnInit} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {NgForm} from '@angular/forms';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {Http} from '@angular/http';
import {Constants} from '../../models/constants';

@Component({
  selector: 'exchange-wallet-buy-neo',
  templateUrl: './exchange-wallet-buy-neo.component.html',
  styleUrls: ['./exchange-wallet-buy-neo.component.css']
})
export class ExchangeWalletBuyNeoComponent implements OnInit {

  public priceToBuy = 0.0;
  public amountToBuy = 0.0;
  public sellerFee: any = 0.0;
  public isBuySummaryModalVisible: any = false;

  public selectedTokenAddress: any;
  public selectedToken: any;
  public selectedExchange: any;
  public selectedOfferTokenAddress: any;
  public selectedOfferToken: any;
  public selectedWallet: any;
  public selectedAccount: any;
  private buyData: any;
  public balance: any;
  public tokenBalance: any;
  private trackTransactioTimer: any;
  private trackDeposiTimer: any;
  public marketTokenBalance: any;
  public marketTokenBalanceIncontract: any;
  private marketBroadcastServiceSub: any;
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
        var shouldRefresh = this.marketBroadcastService.getSelectedMarket() != this.selectedOfferTokenAddress
          || this.marketBroadcastService.getSelectedPlatformToken != this.selectedTokenAddress;
        var shuoldRefeshPlatformToken = this.selectedToken != this.marketBroadcastService.getSelectedPlatformToken();
        var shuoldRefeshMarketToken = this.selectedOfferToken != this.marketBroadcastService.getSelectedMarket();
        this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken();
        this.selectedTokenAddress = this.selectedToken ? this.selectedToken.address : null;
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange();
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket();
        this.selectedOfferTokenAddress = this.selectedOfferToken ? this.selectedOfferToken.address : null;
        this.getCoinStats();
        if (this.marketBroadcastService.getRefresh() === true) {
          this.getTokenbalance();
          this.getMarketTokenBalance();
        }
        if (this.networkcallTracker === false) {
          console.log('shouldRefresh', this.networkcallTracker);
          this.networkcallTracker = true;
          this.getCoinStats();
          this.getTokenbalance();
          this.getMarketTokenBalance();
        } else {
          console.log('shuoldRefeshPlatformToken', shuoldRefeshPlatformToken);
          if (shuoldRefeshPlatformToken === true) {
            this.getTokenbalance();
          }
          if (shuoldRefeshMarketToken === true) {
            console.log('shuoldRefeshMarketToken', shuoldRefeshMarketToken);
            this.getMarketTokenBalance();
          }
        }
      }
    });
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status === 'currentWalletChanged') {
        this.selectedAccount = this.savedWalletsService.getCurrentWallet();
      }
    });
    this.neoService.getSellerFee().then((res) => {
      console.log('Res getSellerFee', res);
      this.sellerFee = res;
    });
  }

  getTokenbalance() {
    if (!this.selectedTokenAddress)
      return;
    this.neoService.getBalance(this.selectedTokenAddress).then((res) => {
      this.balance = res;
    });
    this.neoService.getTokenBalance(this.selectedTokenAddress, this.neoService.getCurrentUserScripthash()).then((res) => {
      this.tokenBalance = res['balance'];
    });
  }

  getBuyTotalValue() {
    // this.usd = this.chartService.getUSD();
    // this.USDValue = ((amountToBuy * priceToBuy) * this.usd).toFixed(4) + ' USD';

    return this.priceToBuy * this.amountToBuy;

  }

  ngOnDestroy() {
    this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();
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

  onSubmitBuy(form: NgForm) {
    if (form.controls.buyamount.value < 0.00000001) {
      form.controls.buyamount.setErrors({min: true});
      form.controls.buyamount.markAsTouched();
    }
    if (form.controls.buyprice.value < 0.00000001) {
      form.controls.buyprice.setErrors({min: true});
      form.controls.buyprice.markAsTouched();
    }
    if (!form.touched || !form.valid) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in order form'), MessageContentType.Text);
      return;
    }
    if (!this.selectedOfferTokenAddress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please select offer Token'), MessageContentType.Text);
      return;
    } else {
      this.buyData = {
        selectedOfferTokenAddress: this.selectedOfferTokenAddress,
        sellamount: form.controls.buyamount.value,
        selectedTokenAddress: this.selectedTokenAddress,
        sellprice: form.controls.buyprice.value
      };
      this.neoService.getBalance(this.selectedOfferTokenAddress).then((res) => {
        console.log('blanace', res);
        console.log(res === 0 || res < this.getBuyTotalValue());
        if (res < parseFloat(form.controls.buyamount.value) * parseFloat(form.controls.buyprice.value)) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
          return;
        } else {
          this.neoService.singleSellOrder(this.selectedOfferTokenAddress, this.getBuyTotalValue() * 100000000, this.selectedTokenAddress, parseFloat(form.controls.buyamount.value) * 100000000).then((res) => {
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
          this.priceToBuy = tokenData.close;
        }
        else {
          this.priceToBuy = 0.0;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  getMarketTokenBalance() {
    if (!this.selectedOfferTokenAddress)
      return;
    let assetid = this.selectedOfferTokenAddress;
    this.neoService.getNeondGas().then((res) => {
      if (assetid === Constants.NEO_GAS_ASSET_ID) {
        if (res['assets']['GAS']) {
          this.neoService.getBalance(Constants.NEO_GAS_ASSET_ID).then((result) => {
            this.marketTokenBalance = new BigNumber(res['assets']['GAS'].balance).toNumber();
            this.marketTokenBalanceIncontract = result;
          });
        } else {
          this.marketTokenBalance = 0;
          this.marketTokenBalanceIncontract = 0;
        }
      } else {
        if (res['assets']['NEO']) {
          this.neoService.getBalance(Constants.NEO_ASSET_ID).then((result) => {
            this.marketTokenBalance = new BigNumber(res['assets']['NEO'].balance).toNumber();
            this.marketTokenBalanceIncontract = result;
          });
        } else {
          this.marketTokenBalance = 0;
          this.marketTokenBalanceIncontract = 0;
        }
      }
    });

  }

}
