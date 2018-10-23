import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {BuyOrder, SellOrder} from '../../models/order.model';
import {Http} from '@angular/http';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageModel, MessageType, MessageContentType} from '../../models/message.model';
import {PlatformTokenService} from '../../services/platform-token.service';
import {TokenService} from '../../services/token.service';
import {Subscription} from 'rxjs/Subscription';
import {UUID} from 'angular2-uuid';
import {PlatformToken} from '../../models/platform-tokens';
import {Constants} from '../../models/constants';
import {Web3Service} from '../../services/web3.service';
import {UserService} from '../../services/user.service';
import {RequestOptions, Headers} from '@angular/http';
import {OrderTransaction} from '../../models/order-transaction.model';
import {NgForm} from '@angular/forms';
import {BigNumber} from 'bignumber.js';
import {EthExchangeService} from '../../services/eth-exchange.service'
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {SavedWalletsService} from '../../services/saved-wallets.service';

declare namespace web3Functions {


  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

}

@Component({
  selector: 'exchange-orderbook-sidepane',
  templateUrl: './exchange-orderbook-sidepane.component.html',
  styleUrls: ['./exchange-orderbook-sidepane.component.css']
})
export class ExchangeOrderbookSidepaneComponent implements OnInit {

  showSpinner: boolean = true;

	public buyOrders: Array<BuyOrder> = new Array<BuyOrder>();
  public sellOrders: Array<SellOrder> = new Array<SellOrder>();
  private currentBlockNumber = 0;
  private refreshTimer: any;
  public sourceTokens: Array<PlatformToken> = new Array<PlatformToken>();
  public selectedSourceTokenSymbol: string = '';
  private paramToken: string = 'WAND';

  public selectedPlatformToken: PlatformToken = new PlatformToken();
  public selectedTokenEscrowValue: number = 0.0;
  public selectedBuyOrder: BuyOrder = new BuyOrder();
  public selectedSellOrder: SellOrder = new SellOrder();
  public isBuyModalVisible: boolean = false;
  public isSellModalVisible: boolean = false;
  public useWandxForBuyFee: boolean = false;
  public useWandxForSellFee: boolean = false;
  public buyErrorMessage: string = '';
  public sellErrorMessage: string = '';
  public escrowEtherValue = 0.0;

  private marketBroadcastServiceSub :any;
  private tokenServiceSub :any;
  private savedWalletsServiceSub : any;

  constructor(
  	private http: Http,
  	private notificationService: NotificationManagerService,
  	private tokenService: TokenService,
    private platformTokenService: PlatformTokenService,
    private web3Service: Web3Service,
    private userService: UserService,
    private zone: NgZone,
    private exchangeService : EthExchangeService,
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService : SavedWalletsService,
  ) {
      this.initiateAutoRefresh = this.initiateAutoRefresh.bind(this)
      this.refresh = this.refresh.bind(this)
      this.getBuyOrders = this.getBuyOrders.bind(this)
      this.getSellOrders = this.getSellOrders.bind(this)
      this.showBuyModal = this.showBuyModal.bind(this)
      this.showSellModal = this.showSellModal.bind(this)
      this.buyOrder = this.buyOrder.bind(this)
      this.sellOrder = this.sellOrder.bind(this)
      this.getSellerFeeValueForBuy = this.getSellerFeeValueForBuy.bind(this)
      this.getBuyerFeeValueForBuy = this.getBuyerFeeValueForBuy.bind(this)
      this.getSellerFeeValueForSell = this.getSellerFeeValueForSell.bind(this)
      this.getBuyerFeeValueForSell = this.getBuyerFeeValueForSell.bind(this)
      this.updateCurrentEthBlockNumber = this.updateCurrentEthBlockNumber.bind(this)
      this.exchangeService.escrowEtherValue$.subscribe(escrowEtherValue => this.escrowEtherValue = escrowEtherValue)
      this.exchangeService.selectedTokenEscrowValue$.subscribe(selectedTokenEscrowValue => this.selectedTokenEscrowValue = selectedTokenEscrowValue)
  }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedPlatformToken = this.marketBroadcastService.getSelectedPlatformToken()
        if (!this.tokenService.getToken()) {
          if (this.tokenServiceSub) {
            this.tokenServiceSub.unsubscribe()
          }
          this.tokenServiceSub = this.tokenService.token$.subscribe((data) => {
            if (data) {
              this.tokenServiceSub.unsubscribe()
              this.refresh()
              this.initiateAutoRefresh()
            }
          })
        } else {
          this.refresh()
          this.initiateAutoRefresh()
        }
      }
    })
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        this.buyOrders = []
        this.sellOrders = []
        this.showSpinner = true
        this.refresh()
        this.initiateAutoRefresh()
      }
    })
  }
  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe()
    this.savedWalletsServiceSub.unsubscribe()
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
    if (this.tokenService.getToken()) {
      this.getBuyOrders();
      this.getSellOrders();
    }
    
  }
  updateCurrentEthBlockNumber() {
    let web3 = this.web3Service.getWeb3();
    web3.eth.getBlockNumber((err, data) => {
      if (data) {
        this.currentBlockNumber = data;
      }
    });
  }
  getBuyOrders() {
    if (!this.selectedPlatformToken || !this.tokenService.getToken())
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'order/buy/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        // BuyingTokenId
        // BuyingVolume
        // Status
        var d = data.json();
        d = d.filter((buyOrder) => {
          return buyOrder.ExpiringBlock > this.currentBlockNumber;
        });
        d.sort((a, b) => {
          // sort buy orders in ascending order
          return a.SellingVolume - b.SellingVolume
        })
        this.showSpinner = false;
        this.sellOrders = d
      },
      err => {
        console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }
  getSellOrders() {
    if (!this.selectedPlatformToken || !this.tokenService.getToken())
      return;
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'order/sell/getall/' + this.selectedPlatformToken.id, requestOptions).subscribe(
      data => {
        var d = data.json();
        d = d.filter((sellOrders) => {
          return sellOrders.ExpiringBlock > this.currentBlockNumber;
        });
        d.sort((a, b) => {
          // sort buy orders in ascending order
          return a.BuyingVolume - b.BuyingVolume
        })
        this.showSpinner = false;
        this.buyOrders = d
      },
      err => {
        console.log(err);
        // this.notificationService.showNotification(new MessageModel(MessageType.Error, err), MessageContentType.Text);
      }
    );
  }

  showBuyModal(order: SellOrder) {
    if (this.escrowEtherValue < order.SellingVolume * order.TargetVolume) {
      this.buyErrorMessage = 'Insufficient funds in escrow, please deposit ETH';
    }
    this.selectedSellOrder = order;
    this.isBuyModalVisible = true;
  }

  showSellModal(order: BuyOrder) {
    if (this.selectedTokenEscrowValue < order.BuyingVolume) {
      this.sellErrorMessage = 'Insufficient funds in escrow, please deposit ' + order.BuyingToken.symbol;
    }
    this.selectedBuyOrder = order;
    this.isSellModalVisible = true;
  }

  buyOrder() {
    if (this.selectedSellOrder.Id === '')
      return;

    if (this.selectedSellOrder.ExpiringBlock < this.currentBlockNumber + 4) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'This order is about to expire. Sorry for the inconvenience'), MessageContentType.Text);
      return;
    }
    // this.isBuySummaryModalVisible = false;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    var orderID = this.selectedSellOrder.Id;
    let userAccount = this.userService.getCurrentUser().UserAccount;
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var buyFeeToken = Constants.EtherTokenAddress;
    if (this.useWandxForBuyFee)
      buyFeeToken = Constants.WandxTokenAddress;
    var tokensAndAddresses = [
      this.selectedSellOrder.SellingToken.address,
      this.selectedSellOrder.TargetToken.address,
      this.selectedSellOrder.FeeToken.address,
      buyFeeToken,
      this.selectedSellOrder.SellerAccountId,
      userAccount
    ];
    var volumes = [
      web3Functions.toBaseUnitAmount(this.selectedSellOrder.SellingVolume, this.selectedPlatformToken.decimals),
      web3Functions.toBaseUnitAmount(this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume, 18),
      web3Functions.toBaseUnitAmount(this.getSellerFeeValueForBuy(), 18),
      web3Functions.toBaseUnitAmount(this.getBuyerFeeValueForBuy(), 18),
      web3Functions.toBaseUnitAmount(this.selectedSellOrder.SellingVolume, this.selectedPlatformToken.decimals),
      web3Functions.toBaseUnitAmount(this.selectedSellOrder.TargetVolume, 18)
    ];

    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiating transaction, please authorize the transaction'), MessageContentType.Text);
    var ecSignature = web3Functions.extractECSignature(this.selectedSellOrder.SellerSign, this.selectedSellOrder.SellerHash, this.selectedSellOrder.SellerAccountId);
    this.isBuyModalVisible = false;
    instanceOrderTraderContract.fillOrder(
      tokensAndAddresses, volumes, this.selectedSellOrder.ExpiringBlock,
      1, ecSignature.v, ecSignature.r, ecSignature.s, sanitizedOrderId,
      {'from': userAccount},
      (err, data) => {
        if (data) {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted to the blockchain. Please wait for confirmation on the Ethereum blockchain'), MessageContentType.Text);
          let headers = new Headers({
            'content-type': 'application/json',
            'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
            'Token': this.tokenService.getToken().Jwt
          });
          let requestOptions = new RequestOptions({headers: headers});

          let orderTransaction = new OrderTransaction();
          orderTransaction.TransactionId = data;
          orderTransaction.SellOrderId = this.selectedSellOrder.Id;
          orderTransaction.SellerAccountId = this.selectedSellOrder.SellerAccountId;
          orderTransaction.BuyerAccountId = userAccount;
          orderTransaction.Status = 'COMPLETED';
          orderTransaction.TransactionValue = this.selectedSellOrder.SellingVolume * this.selectedSellOrder.TargetVolume;
          this.selectedSellOrder = undefined;
          this.isBuyModalVisible = false;
          this.http.post(Constants.ServiceURL + 'ordertransaction/create', orderTransaction, requestOptions).subscribe(
            data => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isBuyModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction recorded successfully'), MessageContentType.Text);
            },
            err => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isBuyModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
          );
        }
        else {
          this.isBuyModalVisible = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
        }
      }
    );
  }

  sellOrder() {
    if (this.selectedBuyOrder.Id === '')
      return;
    if (this.selectedBuyOrder.ExpiringBlock < this.currentBlockNumber + 4) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'This order is about to expire. Sorry for the inconvenience'), MessageContentType.Text);
      return;
    }

    // this.isSellSummaryModalVisible = false;
    let web3 = this.web3Service.getWeb3();
    var orderTraderContract = web3.eth.contract(Constants.OrderbookContractAbi);
    var instanceOrderTraderContract = orderTraderContract.at(Constants.OrderBookContractAddress);
    var orderID = this.selectedBuyOrder.Id;
    let userAccount = this.userService.getCurrentUser().UserAccount;
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var sellFeeToken = Constants.EtherTokenAddress;
    if (this.useWandxForSellFee)
      sellFeeToken = Constants.WandxTokenAddress;
    var tokensAndAddresses = [
      this.selectedBuyOrder.BuyingToken.address,
      this.selectedBuyOrder.TargetToken.address,
      sellFeeToken,
      this.selectedBuyOrder.FeeToken.address,
      userAccount,
      this.selectedBuyOrder.BuyerAccountId
    ];
    var volumes = [
      web3Functions.toBaseUnitAmount(this.selectedBuyOrder.BuyingVolume, this.selectedPlatformToken.decimals),
      web3Functions.toBaseUnitAmount(this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume, 18),
      web3Functions.toBaseUnitAmount(this.getSellerFeeValueForSell(), 18),
      web3Functions.toBaseUnitAmount(this.getBuyerFeeValueForSell(), 18),
      web3Functions.toBaseUnitAmount(this.selectedBuyOrder.BuyingVolume, this.selectedPlatformToken.decimals),
      web3Functions.toBaseUnitAmount(this.selectedBuyOrder.TargetVolume, 18)
    ];
    var ecSignature = web3Functions.extractECSignature(this.selectedBuyOrder.BuyerSign, this.selectedBuyOrder.BuyerHash, this.selectedBuyOrder.BuyerAccountId);
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiating transaction, please authorize the transaction'), MessageContentType.Text);
    this.isSellModalVisible = false;
    instanceOrderTraderContract.fillOrder(
      tokensAndAddresses, volumes, this.selectedBuyOrder.ExpiringBlock,
      0, ecSignature.v, ecSignature.r, ecSignature.s, sanitizedOrderId,
      {'from': userAccount},
      (err, data) => {
        if (data) {
          this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted to the blockchain. Please wait for confirmation on the Ethereum blockchain'), MessageContentType.Text);
          let headers = new Headers({
            'content-type': 'application/json',
            'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
            'Token': this.tokenService.getToken().Jwt
          });
          let requestOptions = new RequestOptions({headers: headers});

          let orderTransaction = new OrderTransaction();
          orderTransaction.TransactionId = data;
          orderTransaction.BuyOrderId = this.selectedBuyOrder.Id;
          orderTransaction.BuyerAccountId = this.selectedBuyOrder.BuyerAccountId;
          orderTransaction.SellerAccountId = userAccount;
          orderTransaction.Status = 'COMPLETED';
          orderTransaction.TransactionValue = this.selectedBuyOrder.BuyingVolume * this.selectedBuyOrder.TargetVolume;
          this.selectedBuyOrder = undefined;
          this.isSellModalVisible = false;
          this.http.post(Constants.ServiceURL + 'ordertransaction/create', orderTransaction, requestOptions).subscribe(
            data => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isSellModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction has been submitted, once confirmed it will display on the My Orders tab'), MessageContentType.Text);
            },
            err => {
              this.getBuyOrders();
              this.getSellOrders();
              this.isSellModalVisible = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
            }
          );
        }
        else {
          this.isSellModalVisible = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
        }
      }
    );
  }
  getSellerFeeValueForBuy() {
    if (this.selectedSellOrder.FeeToken.address === Constants.WandxTokenAddress) {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume * 3792;
    }
    else {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume;
    }
  }

  getBuyerFeeValueForBuy() {
    if (this.useWandxForBuyFee) {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume * 3792;
    }
    else {
      return this.selectedSellOrder.TargetVolume * this.selectedSellOrder.SellingVolume;
    }
  }

  getSellerFeeValueForSell() {
    if (this.selectedBuyOrder.FeeToken.address === Constants.WandxTokenAddress) {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume * 3792;
    }
    else {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume;
    }
  }

  getBuyerFeeValueForSell() {
    if (this.useWandxForSellFee) {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume * 3792;
    }
    else {
      return this.selectedBuyOrder.TargetVolume * this.selectedBuyOrder.BuyingVolume;
    }
  }
}
