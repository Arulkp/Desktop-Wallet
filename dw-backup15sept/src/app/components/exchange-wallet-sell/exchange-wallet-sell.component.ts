import { Component, OnInit, Input, NgZone, SimpleChanges } from '@angular/core';
import {SellOrder} from '../../models/order.model';
import {UUID} from 'angular2-uuid';
import {Constants} from '../../models/constants';
import {Web3Service} from '../../services/web3.service';
import {TokenService} from '../../services/token.service';
import {UserService} from '../../services/user.service';
import {RequestOptions, Headers} from '@angular/http';
import {Http} from '@angular/http';
import {ChartService} from '../../services/chart.service';
import {NgForm} from '@angular/forms';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {EthExchangeService} from '../../services/eth-exchange.service'
import {PlatformTokenService} from '../../services/platform-token.service'
import {PlatformToken} from '../../models/platform-tokens';
import {MarketBroadcastService} from '../../services/market-broadcast.service'

declare namespace web3Functions {

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'exchange-wallet-sell',
  templateUrl: './exchange-wallet-sell.component.html',
  styleUrls: ['./exchange-wallet-sell.component.css']
})
export class ExchangeWalletSellComponent implements OnInit {

	public selectedPlatformToken : any;
	public escrowEtherValue = 0.0;
  public wandEscrowValue = 0.0;
  public amountToSell: number = 0.0;
  public priceToSell: number = 0;
  public selectedTokenEscrowValue: number = 0.0;
  public useWandxForFee: boolean = false;
  public isSellSummaryModalVisible : boolean = false;
  public authorize : boolean = false
  public authorizeWand : boolean = false
  public usd : number = 0.0;
  public USDValue : string = ''
  public authorizedAmount: number = 0.0;
  public ethWalletBalance : number = 0.0;
  public platformTokenWalletBalance : number = 0.0;
  private refreshTimer : any;
  private marketBroadcastServiceSub : any;
  public selectedOfferToken;
  private subscription1 : any;
  private subscription2 : any;
  private subscription3 : any;
  private subscription4 : any;
  private subscription5 : any;
  private subscription6 : any;
  private subscription7 : any;
  private subscription8 : any;
  constructor(
  	private web3Service : Web3Service,
    private tokenService : TokenService,
    private userService : UserService,
    private http : Http,
    private chartService : ChartService,
    private zone : NgZone,
    private notificationService : NotificationManagerService,
    private exchangeService : EthExchangeService,
    private platformTokenService : PlatformTokenService,
    private marketBroadcastService : MarketBroadcastService,
  ) {
    this.getSellTotalValue = this.getSellTotalValue.bind(this)
    this.getSellExchangeFee = this.getSellExchangeFee.bind(this)
    this.showSellSummaryModal = this.showSellSummaryModal.bind(this)
    this.placeSellOrder = this.placeSellOrder.bind(this)
    this.onSubmitSell = this.onSubmitSell.bind(this)
    this.createSellOrder = this.createSellOrder.bind(this)

    this.subscription1 = this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
    this.subscription2 = this.exchangeService.wandEscrowValue$.subscribe(wandEscrowValue => this.wandEscrowValue = wandEscrowValue)
    this.subscription3 = this.exchangeService.authorize$.subscribe(authorize => this.authorize = authorize)
    this.subscription4 = this.exchangeService.authorizeWand$.subscribe(authorizeWand => this.authorizeWand = authorizeWand)
    this.subscription5 = this.exchangeService.authorizedAmount$.subscribe(authorizedAmount => this.authorizedAmount = authorizedAmount)
    // this.platformTokenService.selectedPlatformToken$.subscribe(selectedToken => this.selectedPlatformToken = selectedToken)
    this.subscription6 = this.exchangeService.ethWalletBalance$.subscribe(balance => this.ethWalletBalance = balance)
    this.subscription7 = this.exchangeService.platformTokenWalletBalance$.subscribe(balance => this.platformTokenWalletBalance = balance)
    this.subscription8 = this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)

  }
  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken();
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket()
        this.getCoinStats();
        this.exchangeService.getEthBalanceForUser()
        this.exchangeService.getPlatformTokenBalanceForUser()
      }
    })
    this.chartService.setUSD((err, result) => {
      if (!err) {
        this.usd = this.chartService.getUSD();
      }
    });
  }
  ngOnDestroy() {
    this.marketBroadcastServiceSub.unsubscribe()
    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
    this.subscription5.unsubscribe()
    this.subscription6.unsubscribe()
    this.subscription7.unsubscribe()
    this.subscription8.unsubscribe()
  }
  onAuthorizeChange(data) {
    this.exchangeService.onAuthorizeChange(data)
  }
  onAuthorizeWandChange(data) {
    this.exchangeService.onAuthorizeWandChange(data)
  }
  getSellTotalValue(): number {
    this.usd = this.chartService.getUSD();
    let amountToSell = this.amountToSell
    let priceToSell = this.priceToSell
    if (amountToSell === 0 || priceToSell === 0)
      return 0;
    this.USDValue = ((amountToSell * priceToSell) * this.usd).toFixed(4) + ' USD';
    return amountToSell * priceToSell;
  }
  getSellExchangeFee(): number {
    let amountToSell = this.amountToSell
    let priceToSell = this.priceToSell
    if (amountToSell === 0 || priceToSell === 0)
      return 0;
    if (this.useWandxForFee) {
      return amountToSell * priceToSell * Constants.WandxExchangeFeeRate;
    }
    return amountToSell * priceToSell * Constants.EthExchangeFeeRate;
  }

  showSellSummaryModal() {
    this.isSellSummaryModalVisible = true
  }
  placeSellOrder() {
    this.isSellSummaryModalVisible = false;
    this.createSellOrder();
  }
  onSubmitSell(form : NgForm) {
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
    if (this.selectedPlatformToken.address === '') {
      console.log('Invalid token address');
      return;
    }
    if (this.selectedTokenEscrowValue < this.amountToSell) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance in Funds tab to create a sell order for ' + this.selectedPlatformToken.symbol), MessageContentType.Text);
      return;
    }
    var exchangeFee = this.getSellExchangeFee();
    if (this.useWandxForFee) {
      if (this.wandEscrowValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient wand balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    else {
      if (this.escrowEtherValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient ether balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    this.showSellSummaryModal();
  }
  checkAllowance() {
    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.TokenAbi);
    var instanceOrderTraderContract = orderTraderContract.at(this.selectedPlatformToken.address);
    instanceOrderTraderContract.allowance(userAccount, Constants.OrderBookContractAddress, (err, data) => {
      this.authorizedAmount = data;
      if (data >= 25000000) {
        this.authorize = true;
      }
      else {
        this.authorize = false;
      }
    });
  }

  private getSelectedTokenEscrowValue() {
    if (
      this.selectedPlatformToken === undefined || this.selectedPlatformToken === null ||
      this.selectedPlatformToken.address === undefined || this.selectedPlatformToken.address === null ||
      this.selectedPlatformToken.address === ''
    )
      return;

    let userAccount = this.userService.getCurrentUser().UserAccount;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    console.log('current address', this.selectedPlatformToken.address);
    instanceOrderTraderContract.balanceOfToken(userAccount, this.selectedPlatformToken.address, (err, data) => {
      if (data) {
        console.log('web 3', web3.fromWei(data.toString()));
        let conversion = +web3.fromWei(data.toString());
        conversion = conversion * (10 ** (18 - this.selectedPlatformToken.decimals));
        this.selectedTokenEscrowValue = conversion;
        this.checkAllowance();
      }
    });
  }
  createSellOrder() {
    if (this.selectedPlatformToken.address === '') {
      console.log('Invalid token address');
      return;
    }
    if (this.selectedTokenEscrowValue < this.amountToSell) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient balance in  escrow to create a buy order for ' + this.selectedPlatformToken.symbol), MessageContentType.Text);
      return;
    }
    var exchangeFee = this.getSellExchangeFee();
    if (this.useWandxForFee) {
      if (this.wandEscrowValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient wand balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    else {
      if (this.escrowEtherValue < exchangeFee) {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Insufficient ether balance to pay exchange fee.'), MessageContentType.Text);
        return;
      }
    }
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    var orderID = UUID.UUID().toString();
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var price = this.priceToSell;
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Creating the order, please click on The Sign button on the popup window.'), MessageContentType.Text);
    web3.eth.getBlockNumber((err, data) => {
      if (data) {
        let creationBlock = data;
        let sellVolume = web3Functions.toBaseUnitAmount(this.amountToSell, this.selectedPlatformToken.decimals);
        let sellPrice = web3Functions.toBaseUnitAmount(price, 18);
        let userAccount = this.userService.getCurrentUser().UserAccount;
        let buyTokenAddress = this.selectedPlatformToken.address;
        let sellTokenAddress = Constants.EtherTokenAddress;
        let sellerFeeTokenAddress = Constants.EtherTokenAddress;
        if (this.useWandxForFee) {
          sellerFeeTokenAddress = Constants.WandxTokenAddress;
        }
        instanceOrderTraderContract.orderHash(
          buyTokenAddress, sellTokenAddress, sellVolume, sellPrice,
          creationBlock + Constants.BlockExpirationWindow, userAccount, 1, sanitizedOrderId,
          sellerFeeTokenAddress,
          (err, result) => {
            if (result) {
              let orderHash = result;
              var payload = {
                jsonrpc: '2.0',
                method: 'eth_sign',
                params: [userAccount, orderHash]
              };
              web3.currentProvider.sendAsync(
                payload,
                (err, result) => {
                  if (result) {
                    let signature = result.result;
                    let ecSignature = web3Functions.extractECSignature(signature, orderHash, userAccount);
                    if (web3Functions.clientVerifySign(ecSignature, orderHash, userAccount)) {
                      instanceOrderTraderContract.verifySignature(userAccount, orderHash, ecSignature.v, ecSignature.r, ecSignature.s, (err, result) => {
                        if (result) {
                          let headers = new Headers({
                            'content-type': 'application/json',
                            'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                            'Token': this.tokenService.getToken().Jwt
                          });
                          let requestOptions = new RequestOptions({headers: headers});
                          let sellOrder = new SellOrder();

                          sellOrder.Id = orderID;
                          sellOrder.SellingTokenId = this.selectedPlatformToken.id;
                          sellOrder.SellingVolume = this.amountToSell;
                          sellOrder.CreationBlock = creationBlock;
                          sellOrder.CreationVolume = this.amountToSell;
                          sellOrder.ExpiringBlock = creationBlock + Constants.BlockExpirationWindow;
                          sellOrder.SellerHash = orderHash;
                          sellOrder.SellerSign = signature;
                          sellOrder.SellerAccountId = userAccount;
                          sellOrder.Status = 'CREATED';
                          sellOrder.TargetTokenId = Constants.EtherTokenId;

                          if (this.useWandxForFee) {
                            sellOrder.FeeTokenId = Constants.WandxTokenId;
                          }
                          else {
                            sellOrder.FeeTokenId = Constants.EtherTokenId;
                          }

                          sellOrder.TargetVolume = price;

                          this.http.post(Constants.ServiceURL + 'Order/sell/create', sellOrder, requestOptions).subscribe(
                            data => {
                              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Order created successfully'), MessageContentType.Text);
                              this.amountToSell = 0.0
                              this.getCoinStats()
                              this.exchangeService.setForceRefresh(true)
                            },
                            err => {
                              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
                            }
                          );
                        }
                        else {
                          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to verify signature'), MessageContentType.Text);
                        }
                      });
                    }
                  }
                  else {
                    this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
                  }
                }
              );
            }
            else {
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
          }
        );
      }
      else {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get block number'), MessageContentType.Text);
      }
    });
  }
  getCoinStats() {
    if (!this.selectedPlatformToken || !this.selectedOfferToken)
      return;
    this.http.get(`${Constants.CryptoCompareUrl}?fsym=${this.selectedPlatformToken.symbol}&tsym=${this.selectedOfferToken.symbol}&limit=60&aggregate=3&e=CCCAGG`).subscribe(
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
