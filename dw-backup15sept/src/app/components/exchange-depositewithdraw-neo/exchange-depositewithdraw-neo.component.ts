import {Component, OnInit, OnDestroy} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {NeoService} from '../../services/neo.service';
import {Constants} from '../../models/constants';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';


@Component({
  selector: 'exchange-depositewithdraw-neo',
  templateUrl: './exchange-depositewithdraw-neo.component.html',
  styleUrls: ['./exchange-depositewithdraw-neo.component.css']
})
export class ExchangeDepositewithdrawNeoComponent implements OnInit, OnDestroy {

  public selectedTokenAddress: any;
  public selectedToken: any;
  public selectedExchange: any;
  public selectedOfferTokenAddress: any;
  public selectedOfferToken: any;
  public selectedWallet: any;
  public amountToDepositOrWithdraw: any = 0.0;
  public invalidDeposit = false;
  public invalidToken = false;
  private trackTransactioTimer: any;
  private selectedAccount: any;
  public balance: any;
  public tokenBalance: any;
  private trackDeposiTimer: any;
  public sellOrderData: any;
  private refreshTimer: any;
  public marketTokenBalance: any;
  public marketTokenBalanceIncontract: any;
  private selectedTokenForDeposit: any;
  private marketBroadcastServiceSub: any;
  private savedWalletsServiceSub: any;
  public depositBtnTrack: boolean = false;
  public withdrawBtnTrack: boolean = false;
  private networkcallTracker: boolean = false;

  constructor(private savedWalletsService: SavedWalletsService,
              private marketBroadcastService: MarketBroadcastService,
              private neoService: NeoService,
              private notificationService: NotificationManagerService) {
    this.networkcallTracker = false;
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        var shuoldRefeshPlatformToken = this.selectedToken != this.marketBroadcastService.getSelectedPlatformToken();
        var shuoldRefeshMarketToken = this.selectedOfferToken != this.marketBroadcastService.getSelectedMarket();
        this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken();
        this.selectedTokenAddress = this.selectedToken ? this.selectedToken.address : null;
        var previousExchange = this.selectedExchange;
        var previousSelectedTokenAddress = this.selectedTokenAddress;
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange();
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket();
        this.selectedOfferTokenAddress = this.selectedOfferToken ? this.selectedOfferToken.address : null;
        if (this.marketBroadcastService.getRefresh() === true) {
          this.refresh();
          console.log('changed in depo', this.marketBroadcastService.getSelectedPlatformToken());
        }
        if (this.selectedExchange == 'neo' && this.selectedTokenAddress) {
          if (this.networkcallTracker === false) {
            console.log('shouldRefresh', this.networkcallTracker);
            this.networkcallTracker = true;
            this.refresh();
          } else {
            console.log('shuoldRefeshPlatformToken', shuoldRefeshPlatformToken);
            if (shuoldRefeshPlatformToken === true) {
              this.refresh();
            }
            if (shuoldRefeshMarketToken === true) {
              console.log('shuoldRefeshMarketToken', shuoldRefeshMarketToken);
              this.refresh();
            }
          }
        } else {
          clearTimeout(this.refreshTimer);
        }
      }
    });
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        if (this.selectedToken == this.savedWalletsService.getCurrentWallet())
          return;
        this.selectedAccount = this.savedWalletsService.getCurrentWallet();
        console.log('savedWalletsServiceSub');
        //this.refresh();
        // this.initiateAutoRefresh()
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe();
    this.savedWalletsServiceSub.unsubscribe();
    clearTimeout(this.trackTransactioTimer);
  }

  refresh() {
    if (this.refreshTimer)
      clearTimeout(this.refreshTimer);
    this.getTokenbalance();
    this.getMarketTokenBalance();
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

  deposit() {
    this.invalidDeposit = false;
    this.invalidToken = false;
    if (!this.amountToDepositOrWithdraw) {
      this.invalidDeposit = true;
    }

    if (this.amountToDepositOrWithdraw < 0.00000001) {
      this.invalidDeposit = true;
    }

    if (!this.selectedTokenForDeposit) {
      this.invalidToken = true;
    }

    if (this.invalidDeposit || this.invalidToken) {
      return;
    }
    if (this.selectedTokenForDeposit === Constants.NEO_ASSET_ID || this.selectedTokenForDeposit === Constants.NEO_GAS_ASSET_ID) {
      if (parseFloat(this.amountToDepositOrWithdraw) > this.marketTokenBalance) {
        this.depositBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
        return;
      }
    } else {
      if (parseFloat(this.amountToDepositOrWithdraw) > this.tokenBalance) {
        this.depositBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
        return;
      }
    }
    this.depositBtnTrack = true;
    let value = parseFloat(this.amountToDepositOrWithdraw);
    let assetid = this.selectedTokenAddress;
    this.neoService.deposit(value, this.selectedTokenForDeposit).then((result) => {
      if (result['response']['txid']) {
        this.depositBtnTrack = true;
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
        setTimeout(() => {
          this.trackTransaction(result['response']['txid']);
        }, 15000);
      } else {
        this.depositBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
      }
    });
  }

  withdraw() {
    this.invalidDeposit = false;
    this.invalidToken = false;
    if (!this.amountToDepositOrWithdraw) {
      this.invalidDeposit = true;
    }
    if (this.amountToDepositOrWithdraw < 0.00000001) {
      this.invalidDeposit = true;
    }
    if (!this.selectedTokenForDeposit) {
      this.invalidToken = true;
    }

    if (this.invalidDeposit || this.invalidToken) {
      return;
    }
    if (this.selectedTokenForDeposit === Constants.NEO_ASSET_ID || this.selectedTokenForDeposit === Constants.NEO_GAS_ASSET_ID) {
      if (parseFloat(this.amountToDepositOrWithdraw) > this.marketTokenBalanceIncontract) {
        this.withdrawBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
        return;
      }
    } else {
      if (parseFloat(this.amountToDepositOrWithdraw) > this.balance) {
        this.withdrawBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance'), MessageContentType.Text);
        return;
      }
    }
    this.withdrawBtnTrack = true;
    let value = parseFloat(this.amountToDepositOrWithdraw);
    let assetid = this.selectedTokenAddress;
    this.neoService.awithdrawStageMark(this.selectedTokenForDeposit, value).then(result => {
      if (result) {
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Withdraw In progress'), MessageContentType.Text);
        setTimeout(() => {
          this.withDraw(this.selectedTokenForDeposit, value);
        }, 30000);
      } else {
        this.withdrawBtnTrack = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Withdraw Incomplete'), MessageContentType.Text);
      }
    });
  }

  private withDraw(selectedTokenAddress, value) {
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.withdrawStageWithdraw(selectedTokenAddress, value).then((res) => {
      if (res) {
        this.withdrawBtnTrack = false;
        clearTimeout(this.trackTransactioTimer);
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Withdraw Complete'), MessageContentType.Text);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.withDraw(selectedTokenAddress, value);
    }, 5000);
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      console.log(res);
      if (res['res'].hasOwnProperty('blocktime')) {
        this.depositBtnTrack = false;
        this.withdrawBtnTrack = false;
        console.log('confirm');
        if (this.trackDeposiTimer === true) {
          this.singleSellOrder(this.sellOrderData);
        }
        this.refresh();
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

  getMarketTokenBalance() {
    if (!this.selectedOfferTokenAddress)
      return;
    let assetid = this.selectedOfferTokenAddress;
    this.neoService.getNeondGas().then((res) => {
      if (assetid === Constants.NEO_GAS_ASSET_ID) {
        if (res['assets']['GAS']) {
          this.neoService.getBalance(Constants.NEO_GAS_ASSET_ID).then((result) => {
            this.marketTokenBalance = new BigNumber(res['assets']['GAS'].balance).toNumber();
            ;
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

  choose(event) {
    console.log('event', event);
    this.selectedTokenForDeposit = event.address;
  }

}
