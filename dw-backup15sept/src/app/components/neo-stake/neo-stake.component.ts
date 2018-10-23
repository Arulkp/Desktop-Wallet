import {Component, OnDestroy, OnInit} from '@angular/core';
import {NeoService} from '../../services/neo.service';
import {NavigationService} from '../../services/nav.service';
import {Router} from '@angular/router';
import {BigNumber} from 'bignumber.js';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {Constants} from '../../models/constants';
import {Headers, Http, RequestOptions} from '@angular/http';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-neo-stake',
  templateUrl: './neo-stake.component.html',
  styleUrls: ['./neo-stake.component.css']
})
export class NeoStakeComponent implements OnInit, OnDestroy {
  public tokenBalance: any;
  public amount: any;
  public currebtBucket: any;
  public mystake = [];
  public mystakeWithDraw = [];
  public withDrawlStake: any;
  public err: boolean = false;
  public withDrawAmount: any;
  public profit: any;
  public trackTransactioTimer: any;
  public claimDepostFlag: boolean = false;
  public userStake: boolean = false;
  public totalStake: boolean = false;
  public withdrawError: boolean = false;
  public withTransactionTracking: boolean = false;
  public depositTransactionTracking: boolean = false;
  public depsit: boolean = false;
  private trackTransactioTimers: any;
  private savedWalletsServiceSub: Subscription;

  constructor(private http: Http, private savedWalletsService: SavedWalletsService, private notificationManagerService: NotificationManagerService, private navService: NavigationService, private router: Router, private neoService: NeoService) {

  }

  ngOnInit(): void {
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status === 'currentWalletChanged') {
        var wallet = this.savedWalletsService.getCurrentWallet();
        if (wallet && wallet.isDecrypted && wallet.exchange === 'neo') {
          this.neoService.setAccoutWithWIF(wallet.getWIF());
          this.getStakeOrder();
          this.getStakeWithdraw();
          this.getStakeDetail();
        }
      }
    });

  }

  getStakeDetail() {
    this.neoService.getTokenBalance(Constants.WAND_NEO_ASSET_ID, this.neoService.getCurrentUserScripthash()).then((res) => {
      console.log('res', res);
      this.tokenBalance = res['balance'];
    });
    // this.neoService.getProfitBalance(Constants.WAND_NEO_ASSET_ID).then((res) => {
    //   console.log('res', res);
    //   this.profit = res;
    // });
  }

  ngOnDestroy(): void {
    this.savedWalletsServiceSub.unsubscribe();
  }

  deposit() {
    if (!this.amount || this.amount <= 0) {
      this.err = true;
      return;
    }
    this.depsit = true;
    this.err = false;
    if (parseFloat(this.amount) > parseFloat(this.tokenBalance)) {
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Insufficient balance'), MessageContentType.Text);
      return;
    }
    this.depositTransactionTracking = true;
    this.neoService.stakeWandx(this.amount * 100000000).then((res) => {
      console.log('Res', res);
      if (res['response']['txid']) {
        this.depositTransactionTracking = true;
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
        setTimeout(() => {
          this.trackTransaction(res['response']['txid']);
        }, 15000);
      } else {
        this.depositTransactionTracking = false;
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
      }
    });
  }

  claimProfit() {
    this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction In progress'), MessageContentType.Text);
    this.neoService.syncUpTotalStake().then((res) => {
      this.claimDepostFlag = false;
      this.totalStake = true;
      if (res['response']['txid']) {
        setTimeout(() => {
          this.trackTransaction(res['response']['txid']);
        }, 15000);
      }
    });

  }

  syncUserStake() {
    setTimeout(() => {
      this.neoService.syncUpUserStake().then((res) => {
        this.totalStake = false;
        this.userStake = true;
        if (res['response']['txid']) {
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        }
      });
    }, 30000);
  }

  syncUpFeeCollection() {
    this.userStake = false;
    setTimeout(() => {
      this.neoService.syncUpFeeCollection(Constants.NEO_GAS_ASSET_ID).then((res) => {
        this.claimDepostFlag = true;
        console.log('r', res);
        if (res['response']['txid']) {
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        }
      });
    }, 30000);
  }

  getFeeCollection() {
    this.neoService.getFeeCollection(Constants.NEO_GAS_ASSET_ID).then((res) => {
      console.log('getFeeCollection', res);
    });
  }

  claim() {
    this.claimDepostFlag = false;
    setTimeout(() => {
      this.neoService.claimProfits(Constants.NEO_GAS_ASSET_ID).then((res) => {
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Claim profit In progress'), MessageContentType.Text);
        console.log(res['response']['txid']);
        if (res['response']['txid']) {
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        }
      });
    }, 30000);
  }

  withDraw() {
    if (this.withDrawAmount === undefined || this.withDrawAmount === null || this.withDrawAmount === 0) {
      this.withdrawError = true;
      return;
    } else {
      this.withTransactionTracking = true;
      let value = parseFloat(this.withDrawAmount);
      this.neoService.withdrawStakeStageMark(Constants.WAND_NEO_ASSET_ID, value).then(result => {
        console.log('after', result);
        if (result) {
          this.withTransactionTracking = true;
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Withdraw In progress'), MessageContentType.Text);
          setTimeout(() => {
            this.withDrawTrack(Constants.WAND_NEO_ASSET_ID, value);
          }, 30000);
        } else {
          this.withTransactionTracking = false;
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Withdraw Incomplete'), MessageContentType.Text);
        }
      });
    }
  }

  private withDrawTrack(selectedTokenAddress, value) {
    if (this.trackTransactioTimers)
      clearTimeout(this.trackTransactioTimers);
    this.neoService.withdrawStakeStageWithdraw(selectedTokenAddress, value).then((res) => {
      if (res) {
        clearTimeout(this.trackTransactioTimers);
        this.withTransactionTracking = false;
        this.getStakeOrder();
        this.getStakeDetail();
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Withdraw Complete'), MessageContentType.Text);
      }
    });
    this.trackTransactioTimers = setTimeout(() => {
      this.withDrawTrack(selectedTokenAddress, value);
    }, 5000);
  }

  getStakeOrder() {
    let headers = new Headers({
      'content-type': 'application/json',
    });
    let requestOptions = new RequestOptions({headers: headers});
    var query = {
      'eventName': 'stakeDeposit',
      'address': this.neoService.reverseHex(this.neoService.getCurrentUserScripthash()),
    };
    this.http.post(Constants.NEO_SERVER_URL_STAKE, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json();
          console.log('stake', d);
          this.mystake = d.data;
        },
      );
  }

  getStakeWithdraw() {
    let headers = new Headers({
      'content-type': 'application/json',
    });
    let requestOptions = new RequestOptions({headers: headers});
    var query = {
      'eventName': 'stakewithdraw',
      'address': this.neoService.reverseHex(this.neoService.getCurrentUserScripthash()),
    };
    this.http.post(Constants.NEO_SERVER_URL_STAKE, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json();
          console.log('stake', d);
          this.mystakeWithDraw = d.data;
        },
      );
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        this.getStakeDetail();
        if (this.totalStake === true) {
          this.syncUserStake();
        }
        if (this.userStake === true) {
          this.syncUpFeeCollection();
        }
        if (this.claimDepostFlag === true) {
          this.claim();
        }
        if (this.depsit === true) {
          this.getStakeDetail();
          this.depsit = false;
        }
        this.getStakeOrder();
        this.depositTransactionTracking = false;
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 5000);
  }
}
