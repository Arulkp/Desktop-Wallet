import {Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import {BigNumber} from 'bignumber.js';
import {NeoService} from '../../services/neo.service';
import {Constants} from '../../models/constants';
import {SwitchThemeService} from '../../services/switch-theme.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {AmChart, AmChartsService} from '@amcharts/amcharts3-angular';
import {Router} from '@angular/router';
import {NeotokenService} from '../../services/neotoken.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {UpdatebasketqueueService} from '../../services/updatebasketqueue.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-neo-basket-new',
  templateUrl: './neo-basket-new.component.html',
  styleUrls: ['./neo-basket-new.component.css']
})
export class NeoBasketNewComponent implements OnInit, OnDestroy {
  public tokenList = [];
  public dropdownSettings = {};
  public selectedItems = [];
  public askingPrice: any;
  public askingToken: any;
  amChartPieOptions: Object = {};
  public accountAddress: any;
  public GAS: any;
  public NEO: any;
  public activeTab: any;
  public basketOrders = [];
  public loginModal: boolean = true;
  public WIF: any;
  public depositeBtn: boolean = false;
  public showChart: boolean = false;
  amChartPie: AmChart;
  public txid = [];
  private depositTokenTimer: any;
  private trackTransactioTimer: any;
  public updatebasket: any;
  public orderHash: any;
  public basketName: '';
  public basketAction: boolean = false;
  private originalTokenList: any;
  private originalAskingPrice: any;
  public republishStatus: any;
  public showSpinner: boolean = false;
  private NeotokenList: Subscription;
  private trackTransactionComplete: Subscription;

  constructor(private updatebasketqueueService: UpdatebasketqueueService, private savedWalletsService: SavedWalletsService, private neotokenService: NeotokenService, private router: Router, private AmCharts: AmChartsService, private neoService: NeoService, private zone: NgZone, readonly switchThemeService: SwitchThemeService, private notificationManagerService: NotificationManagerService) {
    this.neotokenService.getTokenDetail();
    this.NeotokenList = this.neotokenService.NeoTokenList$.subscribe((data) => this.neoTokenList(data));
    this.trackTransactionComplete = this.updatebasketqueueService.TransactionComplete$.subscribe((data) => this.transactionComplete(data));
    this.tokenList = this.neotokenService.getNeonTokenList();
    this.amChartPieOptions = {
      'type': 'pie',
      'theme': 'light',
      'dataProvider': [],
      'titleField': 'title',
      'valueField': 'value',
      'labelRadius': 0,
      'color': 'white',
      'responsive': true,
      'balloon': {
        'fixedPosition': true
      },
      'innerRadius': '60%',
      autoMargins: false,
      marginTop: 0,
      marginBottom: 10,
      marginLeft: 0,
      marginRight: 0,
      pullOutRadius: 0,
    };
  }

  neoTokenList(data) {
    if (data) {
      this.tokenList = data;
    }
  }

  transactionComplete(data) {
    console.log('data', data);
    if (data && data === 'complete') {
      this.zone.run(() => {
        this.router.navigateByUrl('/neoBasket/sell');
      });
    }
  }

  ngOnInit() {
    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        var wallet = this.savedWalletsService.getCurrentWallet();
        this.neoService.setAccoutWithWIF(wallet.getWIF());
        this.init();
      }
    });
    this.askingToken = Constants.NEO_GAS_ASSET_ID;
    this.selectedItems = [];
    this.republishStatus = 'create';
    this.dropdownSettings = {
      singleSelection: false,
      text: 'Select Token',
      enableSearchFilter: false,
      enableCheckAll: false
    };
    setTimeout(() => {
      if (this.neoService.getBasket()) {
        this.updatebasket = this.neoService.getBasket();
        this.askingPrice = this.updatebasket.askingPrice;
        this.originalAskingPrice = this.askingPrice;
        this.orderHash = this.updatebasket.orderHash;
        this.basketName = this.updatebasket.basketName;
        this.originalTokenList = this.updatebasket.tokens;
        this.republishStatus = this.neoService.getBasketUpdateStatus();
        this.tokenList.map((k) => {
          this.updatebasket.tokens.map((key, value) => {
            if (k.address === key.address) {
              this.selectedItems.push({
                id: k.id,
                name: key.name,
                address: key.address,
                itemName: key.name,
                symbol: key.name,
                quantity: key.value,
                Available: k.Available,
                Deposit: k.Deposit,
                enableDeposit: k.enableDeposit
              });
              console.log('selectedItems', this.selectedItems);
            }
          });
        });
      }
    }, 1000);

  }

  ngOnDestroy() {
    if (this.depositTokenTimer) {
      clearTimeout(this.depositTokenTimer);
    }
    if (this.trackTransactioTimer) {
      clearTimeout(this.trackTransactioTimer);
    }
    this.NeotokenList.unsubscribe();
    this.trackTransactionComplete.unsubscribe();
    this.tokenList = [];
    this.selectedItems = [];
  }

  onItemSelect(item: any) {
    console.log(item);
    if (this.selectedItems.length > 3 && this.updatebasket === undefined || this.updatebasket === null) {
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'More than three tokens not allowed'), MessageContentType.Text);
      return;
    }
  }

  OnItemDeSelect(item: any) {
    console.log(item);
    // if (this.updatebasket) {
    //   this.neoService.removeAssetFromBasket(this.orderHash, item.address).then((res) => {
    //     if (res['response']['txid']) {
    //       setTimeout(() => {
    //         this.trackTransaction(res['response']['txid']);
    //       }, 15000);
    //       this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
    //     } else {
    //       this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
    //     }
    //   });
    // }
  }


  onSelect(address) {
    this.askingToken = address;
    console.log(address);
    console.log('selec', this.selectedItems);
  }

  createBasket() {
    this.showSpinner = true;
    this.askingToken = Constants.NEO_GAS_ASSET_ID;
    let sellingAssets = '';
    let assetsAmounts = [];
    this.selectedItems.map((key, value) => {
      sellingAssets += this.neoService.getNeon().u.reverseHex(key.address);
      assetsAmounts.push(parseFloat(key.quantity) * 100000000);
      if (value === this.selectedItems.length - 1) {
        this.neoService.basketSellOrder(this.basketName, '1', this.selectedItems.length, sellingAssets, assetsAmounts, this.askingToken, parseFloat(this.askingPrice) * 100000000).then((res) => {
          if (res['response']['txid']) {
            this.basketAction = true;
            setTimeout(() => {
              this.trackTransaction(res['response']['txid']);
            }, 15000);
            this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
          } else {
            this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
          }
        });
      }
    });
  }

  closeModal() {
    this.loginModal = false;
  }

  init() {
    console.log('Calles');
    // this.neoService.setAccoutWithWIF(this.WIF);
    this.neoService.getNeondGas().then((res) => {
      if (res['assets']['GAS']) {
        this.GAS = new BigNumber(res['assets']['GAS'].balance).toNumber();
      }
      if (res['assets']['NEO']) {
        this.NEO = new BigNumber(res['assets']['NEO'].balance).toNumber();
      }
    });
    this.accountAddress = this.neoService.getAccountAddress();
    this.loginModal = false;
    this.tokenList.map((key) => {
      this.neoService.getTokenBalance(key.address, this.neoService.getCurrentUserScripthash()).then((res) => {
        this.neoService.getBalance(key.address).then((ress) => {
          key.Available = res['balance'];
          key.Deposit = ress;
          key.enableDeposit = false;
          key.itemName=key.symbol
        });
      });
    });
  }

  setVisibleTab(tab) {
    this.activeTab = tab;
  }

  getToken(token, length) {
    console.log(token, length);
    return new Promise((resolve, reject) => {
      let tokens = [];
      let divider = token.length / length;
      let flag = 0;
      for (let i = divider; i <= token.length; i += divider) {
        let tknAddress = token.slice(flag, i);
        let tkn = this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(tknAddress));
        tokens.push({'address': token.slice(flag, i), 'name': tkn[0].name});
        flag = i;
      }
      resolve({token: tokens});
    });
  }

  trackDeposit(id, flag) {
    this.tokenList.map((key) => {
      if (key.id === id) {
        if (flag === true) {
          key.enableDeposit = true;
        } else {
          key.enableDeposit = false;
        }
      }
    });
  }

  trackWithTokenBalance(id, address, requireBalance, balance, Available) {
    if (parseFloat(balance) === 0) {
      this.zone.run(() => {
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance of this Token on your address to create a Token Basket'), MessageContentType.Text);
        return;
      });
    } else if (parseFloat(requireBalance) > parseFloat(balance)) {
      if (parseFloat(requireBalance) > parseFloat(Available)) {
        this.trackDeposit(id, false);
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to create this Basket'), MessageContentType.Text);
        return;
      } else {
        this.depositeBtn = true;
        this.trackDeposit(id, true);
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'You do not have sufficient balance to create this Basket.Please Deposit token'), MessageContentType.Text);
        return;
      }
    } else {
      // if (this.updatebasket && requireBalance) {
      //   this.neoService.addAssetsTobasket(this.orderHash, address, parseFloat(requireBalance) * 100000000).then((res) => {
      //     if (res['response']['txid']) {
      //       setTimeout(() => {
      //         this.trackTransaction(res['response']['txid']);
      //       }, 15000);
      //       this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
      //     } else {
      //       this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
      //     }
      //   });
      // }
      this.trackDeposit(id, false);
    }
  }

  deposit(token) {
    console.log(token);
    this.neoService.deposit(parseFloat(token.quantity), token.address).then((res) => {
      // console.log('txid', res['response']['txid']);
      if (res['response']['txid']) {
        this.txid.push({txid: res['response']['txid'], status: false, id: token.id});
        setTimeout(() => {
          this.trackDepositConfirmation();
        }, 15000);
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
      }
    });
  }

  isPortfolioValid(): boolean {
    if (this.askingPrice === undefined || this.askingPrice === null)
      return false;
    if (this.basketName === undefined || this.basketName === null)
      return false;
    if (this.selectedItems.length <= 1 || this.selectedItems.length > 3 && this.updatebasket === undefined)
      return false;
    for (var i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].quantity <= 0 || this.selectedItems[i].quantity === undefined || this.selectedItems[i].Deposit === '0' || this.selectedItems[i].enableDeposit === true)
        return false;
    }
    if (this.txid.length > 0) {
      for (var i = 0; i < this.txid.length; i++) {
        if (this.txid[i].status === false)
          return false;
      }
    } else {
      return true;
    }
    return true;
  }

  private trackDepositConfirmation() {
    console.log('Called timer');
    if (this.depositTokenTimer)
      clearTimeout(this.depositTokenTimer);
    this.txid.map((key) => {
      this.neoService.trackTransaction(key.txid).then((res) => {
        if (res['res'].hasOwnProperty('blocktime')) {
          this.txid.map((k) => {
            if (k.txid === res['txid']) {
              this.zone.run(() => {
                console.log('confirm');
                this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
                k.status = true;
                this.trackDeposit(k.id, false);
                this.isPortfolioValid();
                this.trackTimer();
              });
            }
          });
        }
      });
    });
    this.depositTokenTimer = setTimeout(() => {
      this.trackDepositConfirmation();
    }, 1000);
  }

  trackTimer() {
    let i = 0;
    this.txid.map((key) => {
      if (key.status === true) {
        i++;
        if (i === this.txid.length) {
          if (this.depositTokenTimer)
            clearTimeout(this.depositTokenTimer);
        }
      }
    });
  }

  generatePieChartAtCreatePortFolio() {
    this.showChart = true;
    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart('piechartdiv', this.amChartPieOptions);
      let chartData = [];
      this.selectedItems.map((key) => {
        if (key['quantity'] > 0) {
          let temp = {};
          temp['title'] = key['name'];
          temp['value'] = key['quantity'];
          chartData.push(temp);
          this.AmCharts.updateChart(this.amChartPie, () => {
            this.amChartPie.dataProvider = chartData;
          });
        }
      });
    }, 100);
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      console.log(res);
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        if (this.basketAction === true) {
          this.router.navigateByUrl('/neoBasket/sell');
        }
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 5000);
  }

  placeOrder() {
    this.showSpinner = true;
    this.updatebasketqueueService.clearQueue();
    this.updatebasketqueueService.disableLiquidate();
    this.updatebasketqueueService.clearIndexQueue();
    if (this.republishStatus === 'publish') {
      this.updatebasketqueueService.setorderHash(this.orderHash);
      this.updatebasketqueueService.addPlaceOrderToqueue(this.askingToken, this.askingPrice);
    } else {
      console.log('selected token', this.selectedItems);
      console.log('original token', this.originalTokenList);
      this.updatebasketqueueService.setNewlList(this.selectedItems);
      this.updatebasketqueueService.setorderHash(this.orderHash);
      this.updatebasketqueueService.setOriginalList(this.originalTokenList);
      this.updatebasketqueueService.finalUpdate((res) => {
        this.updatebasketqueueService.generateQueue();
      });
    }
  }

}
