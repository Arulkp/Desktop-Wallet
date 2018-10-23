import { Component, OnInit, NgZone } from '@angular/core';
import {Web3Service} from '../../services/web3.service';
import {UserService} from '../../services/user.service';
import {Constants} from '../../models/constants';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {EthExchangeService} from '../../services/eth-exchange.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {PlatformTokenService} from '../../services/platform-token.service'
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import * as abi from 'human-standard-token-abi';


declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}


@Component({
  selector: 'exchange-depositewithdraw',
  templateUrl: './exchange-depositewithdraw.component.html',
  styleUrls: ['./exchange-depositewithdraw.component.css']
})
export class ExchangeDepositewithdrawComponent implements OnInit {

	public selectedPlatformToken : any;
	public selectedFund: string = 'ETH';
	public amountToDepositOrWithdraw = 0.0;
	public escrowEtherValue = 0.0;
	public selectedTokenEscrowValue: number = 0.0;
  public useWandxForFee: any = false;
  public authorizeWand: any = false;

  public authorizedAmount = 0.0
  public authorizedWandAmount = 0.0
  public authorize : boolean = false
  public ethWalletBalance : number = 0.0;
  public wandEscrowValue : number = 0.0;
  public platformTokenWalletBalance : number = 0.0;
  private subscription1 : any;
  private subscription2 : any;
  private subscription3 : any;
  private subscription4 : any;
  private subscription5 : any;
  private subscription6 : any;
  private subscription7 : any;
  private subscription8 : any;
  private subscription9 : any;
  private subscription10 : any;
  private subscription11 : any;
  constructor(
  	private web3Service : Web3Service,
		private userService : UserService,
    private zone : NgZone,
    private notificationService : NotificationManagerService,
    private exchangeService : EthExchangeService,
    private platformTokenService : PlatformTokenService,
    private marketBroadcastService : MarketBroadcastService,

  ) {
    this.onAuthorizeChange = this.onAuthorizeChange.bind(this)
    this.onAuthorizeWandChange = this.onAuthorizeWandChange.bind(this)
  }

  ngOnInit() {
    this.subscription1 = this.exchangeService.authorizedAmount$.subscribe(authorizedAmount => this.authorizedAmount = authorizedAmount)
    this.subscription2 = this.exchangeService.authorize$.subscribe(authorize => this.authorize = authorize)
    this.subscription3 = this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
    this.subscription4 = this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)
    this.subscription5 = this.platformTokenService.selectedPlatformToken$.subscribe(selectedToken => this.selectedPlatformToken = selectedToken)
    this.subscription6 = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        this.exchangeService.getEthBalanceForUser()
        this.exchangeService.getPlatformTokenBalanceForUser()
      }
    })
    this.subscription7 = this.exchangeService.authorizeWand$.subscribe(authorizeWand => this.authorizeWand = authorizeWand)
    this.subscription8 = this.exchangeService.ethWalletBalance$.subscribe(balance => this.ethWalletBalance = balance)
    this.subscription9 = this.exchangeService.platformTokenWalletBalance$.subscribe(balance => this.platformTokenWalletBalance = balance)
    this.subscription10 = this.exchangeService.wandEscrowValue$.subscribe(wandEscrowValue => this.wandEscrowValue = wandEscrowValue)
    this.subscription11 = this.exchangeService.authorizedWandAmount$.subscribe(authorizedWandAmount => this.authorizedWandAmount = authorizedWandAmount)
  }
  ngOnDestroy() {
    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
    this.subscription5.unsubscribe()
    this.subscription6.unsubscribe()
    this.subscription7.unsubscribe()
    this.subscription8.unsubscribe()
    this.subscription9.unsubscribe()
    this.subscription10.unsubscribe()
    this.subscription11.unsubscribe()
  }
  onAuthorizeChange(data) {
    this.exchangeService.onAuthorizeChange(data)
  }
  onAuthorizeWandChange(data) {
    this.exchangeService.onAuthorizeWandChange(data)
  }
  
  deposit() {
    if (this.amountToDepositOrWithdraw <= 0)
      return;
    // TODO : Ideally we should also check if the user has sufficient balance to execute tx
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    if (this.selectedFund === 'ETH') {
      web3.eth.getBalance(userAccount, (err, balance) => {
        balance = +web3.fromWei(balance.toString());
        if (this.amountToDepositOrWithdraw > parseFloat(balance)) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {
          instanceOrderTraderContract.deposit(userAccount, {
            'from': userAccount,
            'value': web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18)
          }, (err, data) => {
            if (data) {
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
              this.amountToDepositOrWithdraw = 0.0;
            }
            else {
              if (err.errorCode) {
                this.notificationService.showNotification(new MessageModel(MessageType.Error, `Deposit : ${err.message}`), MessageContentType.Text);
                return
              }
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Deposit failed'), MessageContentType.Text);
            }
          });
        }
      })
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
      // select the token address and decimals, do other sanity checks
      if (this.selectedFund === 'WAND') {
        var authorizedWandAmount = +web3.fromWei(this.authorizedWandAmount.toString());
        authorizedWandAmount = authorizedWandAmount * (10 ** (18 - Constants.WandxTokenDecimals));
        if (authorizedWandAmount < this.amountToDepositOrWithdraw || !this.authorizeWand) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Please authorize the Wand Token by turning it on for trading'), MessageContentType.Text);
          return;
        }
        selectedTokenAddress = Constants.WandxTokenAddress
        selectedTokenDecimal = Constants.WandxTokenDecimals
      } else if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        var authorizedAmount = +web3.fromWei(this.authorizedAmount.toString());
        authorizedAmount = authorizedWandAmount * (10 ** (18 - this.selectedPlatformToken.decimals));
        if (authorizedAmount < this.amountToDepositOrWithdraw || !this.authorize) {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, `Please authorize the ${this.selectedPlatformToken.symbol} Token by turning it on for trading`), MessageContentType.Text);
          return;
        }
        selectedTokenAddress = this.selectedPlatformToken.address
        selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else { /* no platform selected */
        return;
      }

      // check if the user has sufficient balance in wallet for the selected token
      var selectedTokenContract = web3.eth.contract(abi).at(selectedTokenAddress)
      selectedTokenContract.balanceOf(userAccount, (err, balance) => {
        let conversion = +web3.fromWei(balance.toString());
        conversion = conversion * (10 ** (18 - selectedTokenDecimal));
        if (this.amountToDepositOrWithdraw > conversion) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to deposit.'), MessageContentType.Text);
            return;
          });
        } else {
          instanceOrderTraderContract.depositTokens(userAccount, selectedTokenAddress, web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, selectedTokenDecimal), {'from': userAccount}, (err, data) => {
            if (data) {
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Deposit has been submitted to the blockchain. Please wait for confirmation.'), MessageContentType.Text);
              this.amountToDepositOrWithdraw = 0.0;
            }
            else {
              if (err.errorCode) {
                this.notificationService.showNotification(new MessageModel(MessageType.Error, `Deposit : ${err.message}`), MessageContentType.Text);
                return
              }
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Deposit failed'), MessageContentType.Text);
            }
          });
        }
      })
    }
  }

  withdraw() {
    if (this.amountToDepositOrWithdraw <= 0)
      return;
    // TODO : Ideally we should also check if the user has sufficient balance to execute tx
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    if (this.selectedFund == 'ETH') {
      if (this.amountToDepositOrWithdraw > this.escrowEtherValue) {
        this.zone.run(() => {
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
        });
        return;
      }
      instanceOrderTraderContract.withdrawTo(userAccount, web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, 18), {'from': userAccount}, (err, data) => {
        if (data) {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw successful, please wait for transaction to complete'), MessageContentType.Text);
          this.amountToDepositOrWithdraw = 0.0;
        }
        else {
          if (err.errorCode) {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, `Withdraw : ${err.message}`), MessageContentType.Text);
            return
          }
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Withdraw failed'), MessageContentType.Text);
        }
      });
    } else {
      var selectedTokenAddress;
      var selectedTokenDecimal;
      if (this.selectedFund == 'WAND'){
        if (this.amountToDepositOrWithdraw > this.wandEscrowValue) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
          });
          return;
        }
        selectedTokenAddress = Constants.WandxTokenAddress
        selectedTokenDecimal = Constants.WandxTokenDecimals
      } else if (this.selectedPlatformToken.symbol && this.selectedFund == this.selectedPlatformToken.symbol) {
        if (this.amountToDepositOrWithdraw > this.selectedTokenEscrowValue || !this.authorize) {
          this.zone.run(() => {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, 'You do not have sufficient balance to withdraw.'), MessageContentType.Text);
          });
          return;
        }
        selectedTokenAddress = this.selectedPlatformToken.address
        selectedTokenDecimal = this.selectedPlatformToken.decimals
      } else {
        return;
      }
      instanceOrderTraderContract.withdrawTokenTo(userAccount, selectedTokenAddress, web3Functions.toBaseUnitAmount(this.amountToDepositOrWithdraw, selectedTokenDecimal), {'from': userAccount}, (err, data) => {
        if (data) {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Withdraw successful, please wait for transaction to complete'), MessageContentType.Text);
          this.amountToDepositOrWithdraw = 0.0;
        }
        else {
          if (err.errorCode) {
            this.notificationService.showNotification(new MessageModel(MessageType.Error, `Withdraw : ${err.message}`), MessageContentType.Text);
            return
          }
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Withdraw failed'), MessageContentType.Text);
        }
      });
    }
  }
  
}
