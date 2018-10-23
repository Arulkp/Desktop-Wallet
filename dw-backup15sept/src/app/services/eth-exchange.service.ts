import { Injectable, NgZone } from '@angular/core';
import {NotificationManagerService} from './notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../models/message.model';
import {Web3Service} from './web3.service';
import {UserService} from './user.service';
import {Constants} from '../models/constants';
import {SavedWalletsService} from './saved-wallets.service'
import {PlatformToken} from '../models/platform-tokens';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {PlatformTokenService} from './platform-token.service'
import {MarketBroadcastService} from './market-broadcast.service'
import * as abi from 'human-standard-token-abi';

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}


@Injectable()
export class EthExchangeService {

	// this will all the common functions use by exchange
	private _selectedPlatformToken :  PlatformToken;
	private _escrowEtherValue : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _selectedTokenEscrowValue :  BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _wandEscrowValue :  BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _authorizedAmount : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _authorizedWandAmount : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private _authorize : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
	private _authorizeWand :  BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  private _ethWalletBalance : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _platformTokenWalletBalance : BehaviorSubject<number> = new BehaviorSubject<number>(0);
	private refreshTimer : any
  private _forceRefresh : Subject<boolean> = new Subject<boolean>();

	public escrowEtherValue$  = this._escrowEtherValue.asObservable()
	public selectedTokenEscrowValue$ = this._selectedTokenEscrowValue.asObservable()
	public wandEscrowValue$ = this._wandEscrowValue.asObservable()
	public authorizedAmount$  = this._authorizedAmount.asObservable()
  public authorizedWandAmount$  = this._authorizedWandAmount.asObservable()
	public authorize$  = this._authorize.asObservable()
	public authorizeWand$  = this._authorizeWand.asObservable()
  public ethWalletBalance$ = this._ethWalletBalance.asObservable()
  public platformTokenWalletBalance$ = this._platformTokenWalletBalance.asObservable()
  public forceRefresh$ = this._forceRefresh.asObservable()
	private i = 0

  constructor(
  	private web3Service : Web3Service,
  	private userService : UserService,
  	private notificationService : NotificationManagerService,
  	private savedWalletsService : SavedWalletsService,
  	private platformTokenService : PlatformTokenService,
    private marketBroadcastService : MarketBroadcastService,
  	private zone : NgZone

  ) {
  	this.getEtherEscrowValue = this.getEtherEscrowValue.bind(this)
		this.getSelectedTokenEscrowValue = this.getSelectedTokenEscrowValue.bind(this)
		this.checkAllowance = this.checkAllowance.bind(this)
		this.checkWandAllowance = this.checkWandAllowance.bind(this)
		this.onAuthorizeChange = this.onAuthorizeChange.bind(this)
		this.onAuthorizeWandChange = this.onAuthorizeWandChange.bind(this)
		this.completeRefresh = this.completeRefresh.bind(this)

  	this.platformTokenService.selectedPlatformToken$.subscribe((value) => {
  		if (value) {
  			this._selectedPlatformToken = value
        this.completeRefresh()
  		}
  	})
    this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this._selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        var selectedExchange = this.marketBroadcastService.getSelectedExchange()
        if (this._selectedPlatformToken && selectedExchange == 'eth') {
          this.completeRefresh()
        } else {
          clearTimeout(this.refreshTimer);
        }
        // this.refresh()
        // this.initiateAutoRefresh()
      }
    })
  }
  private initiateAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.completeRefresh()
    }, 30000);
  }
  completeRefresh() {
  	if (!this._selectedPlatformToken)
  		return;
  	this.refresh();
    this.initiateAutoRefresh();
  }
  setForceRefresh(forceRefresh) {
    this._forceRefresh.next(forceRefresh)
  }
  refresh() {
  	this.getEtherEscrowValue()
		this.getSelectedTokenEscrowValue()
		this.checkWandAllowance()
		this.checkAllowance()
    this.getEthBalanceForUser()
    this.getPlatformTokenBalanceForUser()
  }
  getEtherEscrowValue() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    instanceOrderTraderContract.balanceOf(userAccount, (err, data) => {
      console.log('data', data);
      if (data)
        this._escrowEtherValue.next(+web3.fromWei(data));
      else
        this._escrowEtherValue.next(0.0);
    });
  }
  getWandEscrowValue() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddress);
    instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddress, (err, data) => {
      if (data){
        let conversion = +web3.fromWei(data.toString());
        conversion = conversion * (10 ** (18 - Constants.WandxTokenDecimals));
        this._wandEscrowValue.next(conversion);
      }
      else
        this._wandEscrowValue.next(0.0);
    });
  }
  getSelectedTokenEscrowValue() {
    if (
      !this._selectedPlatformToken || !this._selectedPlatformToken.address) {
      return this._selectedTokenEscrowValue.next(0);
    }

    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    console.log('current address', this._selectedPlatformToken.address);
    instanceOrderTraderContract.balanceOfToken(userAccount, this._selectedPlatformToken.address, (err, data) => {
      if (data) {
        console.log('web 3', web3.fromWei(data.toString()));
        let conversion = +web3.fromWei(data.toString());
        conversion = conversion * (10 ** (18 - this._selectedPlatformToken.decimals));
        this._selectedTokenEscrowValue.next(conversion);
        this.checkAllowance();
      }
    });
  }
  getEthBalanceForUser() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    if ( !userAccount || !userAccount.length)
      return
    let web3 = this.web3Service.getWeb3();
    let userAddress = web3.eth.coinbase
    web3.eth.getBalance(userAddress, (err, balance) => {
      let conversion = +web3.fromWei(balance.toString());
      this._ethWalletBalance.next(conversion);
    })
  }
  getPlatformTokenBalanceForUser() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    if ( !userAccount || !this._selectedPlatformToken)
      return
    let web3 = this.web3Service.getWeb3();
    let userAddress = web3.eth.coinbase
    var selectedTokenContract = web3.eth.contract(abi).at(this._selectedPlatformToken.address)
    selectedTokenContract.balanceOf(userAddress, (err, balance) => {
      let conversion = +web3.fromWei(balance.toString());
      conversion = conversion * (10 ** (18 - this._selectedPlatformToken.decimals));
      this._platformTokenWalletBalance.next(conversion);
    })
  }
  checkAllowance() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    if ( !userAccount || !userAccount.length)
      return
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(this._selectedPlatformToken.address);
    instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddress, (err, data) => {
      this._authorizedAmount.next(data);
      if (data >= 25000000) {
        this._authorize.next(true);
      }
      else {
        this._authorize.next(false);
      }
    });
  }
  checkWandAllowance() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    if ( !userAccount || !userAccount.length)
      return
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddress);
    instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddress, (err, data) => {
      this._authorizedWandAmount.next(data);
      if (data >= 25000000) {
        this._authorizeWand.next(true);
      }
      else {
        this._authorizeWand.next(false);
      }
    });
  }
  onAuthorizeChange(data) {
    if (this._selectedPlatformToken.address === '') {
      return;
    }
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(this._selectedPlatformToken.address);

    if (data) {
      instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, web3Functions.toBaseUnitAmount(100000000, this._selectedPlatformToken.decimals), {'from': userAccount}, (err, data) => {
        if (data) {
          this.zone.run(() => {
            this._authorize.next(true);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
            this._authorize.next(false);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not enabled'), MessageContentType.Text);
        }
      });
    }
    else {
      instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, 0, {'from': userAccount}, (err, data) => {
        if (data) {
          this.zone.run(() => {
            this._authorize.next(false);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
            this._authorize.next(true);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not disabled'), MessageContentType.Text);
        }
      });
    }
  }

  onAuthorizeWandChange(data) {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.WandxTokenAddress);

    if (data) {
      instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, web3Functions.toBaseUnitAmount(100000000, 18), {'from': userAccount}, (err, data) => {
        if (data) {
          this.zone.run(() => {
            this._authorizeWand.next(true);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
            this._authorizeWand.next(false);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not enabled'), MessageContentType.Text);
        }
      });
    }
    else {
      instanceOrderTraderContract.approve(Constants.OrderBookContractAddress, 0, {'from': userAccount}, (err, data) => {
        if (data) {
          this.zone.run(() => {
            this._authorizeWand.next(false);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction has been submitted, might take a while, please wait.'), MessageContentType.Text);
        }
        else {
          this.zone.run(() => {
            this._authorizeWand.next(true);
          });
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Not disabled'), MessageContentType.Text);
        }
      });
    }
  }


}
