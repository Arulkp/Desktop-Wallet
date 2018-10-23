import {Injectable, Inject, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {UUID} from 'angular2-uuid';
import {Http, RequestOptions, Headers} from '@angular/http';
import * as _ from 'underscore';

import {PortfolioBuyModel} from '../models/portfolio-buy.model';
import {BuyablePortfolio, SellablePortfolio, Portfolio} from '../models/portfolio.model';
import {PortfolioTokenContribution} from '../models/portfolio-token-contribution';
import {Constants} from '../models/constants';
import {MessageModel, MessageType, MessageContentType} from '../models/message.model';
import {Quote} from '../models/quote.model';

import {UserService} from '../services/user.service';
import {Web3Service} from '../services/web3.service';
import {WalletService} from '../services/wallet.service';
import {NotificationManagerService} from '../services/notification-manager.service';
import {TokenService} from '../services/token.service';
import {JwtToken} from '../models/token.model';
import {Asset, AssetAnalysis} from '../models/asset.model';
import {forEach} from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import {AuthService} from './auth.service';
import {BigNumber} from 'bignumber.js';

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Injectable()
export class PortfolioService {
  private _buyAblePortfolios = new BehaviorSubject<Array<BuyablePortfolio>>(undefined);
  private _sellAblePortfolios = new BehaviorSubject<Array<SellablePortfolio>>(undefined);
  private _currentBuyablePortfolios: Array<BuyablePortfolio>;
  private _currentSellablePortfolios: Array<SellablePortfolio>;
  private transactionInProgress: boolean;
  private tokenRenewalSubscription: Subscription;
  private _portfolioData = new BehaviorSubject<Object>(null);
  private _portfolioPendingData = new BehaviorSubject<Object>(null);
  private _orderBookData = new BehaviorSubject<Object>(null);
  private _updateportfolioData = new BehaviorSubject<Object>(null);
  private _closeModal = new BehaviorSubject<boolean>(null);
  private _depositToken = new BehaviorSubject<boolean>(null);
  private _publishComplete = new BehaviorSubject<boolean>(null);
  private _buyComplete = new BehaviorSubject<boolean>(null);
  private _portfolioActiveData = new BehaviorSubject<Object>(null);
  private _closebuypopup = new BehaviorSubject<Object>(null);
  public portfolioData$ = this._portfolioData.asObservable();
  public orderBookData$ = this._orderBookData.asObservable();
  public portfolioActiveData$ = this._portfolioActiveData.asObservable();
  public updatePortfolioData$ = this._updateportfolioData.asObservable();
  public buyComplete$ = this._buyComplete.asObservable();
  public closeModal$ = this._closeModal.asObservable();
  public depositToken$ = this._depositToken.asObservable();
  public PublishComplete$ = this._publishComplete.asObservable();
  public PortfolioPendingData$ = this._portfolioPendingData.asObservable();
  public Closebuypopup$ = this._closebuypopup.asObservable();
  private portfolioList = [];
  private portfolioDetails = [];
  public buyAblePortfolios: any;
  public sellAblePortfolios: any;
  public assets: any;
  public allPortfolio = [];
  public pendingPortfolio: any;
  public orderBookPortfolio: any;
  public buyTimer: any;
  private platformTokens: any;

  constructor(private userService: UserService,
              private http: Http,
              private web3: Web3Service,
              private walletService: WalletService,
              private notificationService: NotificationManagerService,
              private tokenService: TokenService,
              private auth: AuthService) {
    this._currentBuyablePortfolios = new Array<BuyablePortfolio>();
    this._currentSellablePortfolios = new Array<SellablePortfolio>();
  }

  getCurrentSellAblePortfolios(): void {
    if (!this.auth.isAuthenticated())
      return;
    this._currentBuyablePortfolios = [];
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + '/portfolio/sellable', requestOptions).subscribe(
      data => {
        this._currentSellablePortfolios = data.json();
        this._sellAblePortfolios.next(this._currentSellablePortfolios);
      },
      err => {
        console.log(err);
      }
    );
  }

  currentSellablePortfolios(): Array<SellablePortfolio> {
    return this._currentSellablePortfolios;
  }

  buyPortfolio(portfolio) {
    if (!this.auth.isAuthenticated())
      return;
    if (this.transactionInProgress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Alert, 'Transactions is in progress, please wait.'), MessageContentType.Text);
      return;
    }
    //this.transactionInProgress = true;
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Buying  ' + portfolio.name + ' has been initiated on the Blockchain. Please accept the Wallet transaction to buy the bashket'), MessageContentType.Text);
    this.validateAssetsForSeller(portfolio);
  }

  sellPortfolio(portfolio: SellablePortfolio, quote: Quote) {
    if (!this.auth.isAuthenticated())
      return;
    if (this.transactionInProgress) {
      this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction in progress'), MessageContentType.Text);
      return;
    }
    var contracts = this.walletService.getContracts();
    if (contracts === null || contracts === undefined || contracts.length === 0) {
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get token contracts'), MessageContentType.Text);
      return;
    }
    this.validateAssetsForBuyer(portfolio, quote);
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Initiated sale, Verifying assets of both seller and buyer'), MessageContentType.Text);
  }

  publishPortfolio(portfolioName: string, askingPriceInWand: number, creationPriceInWand: number, portfolio: Array<any>) {
    if (!this.auth.isAuthenticated())
      return;
    var publishRequestObject = {};
    publishRequestObject['PortfolioName'] = portfolioName;
    publishRequestObject['UserAccount'] = this.web3.getWeb3().eth.coinbase;
    publishRequestObject['Assets'] = portfolio;
    publishRequestObject['AskPriceInWand'] = askingPriceInWand;
    publishRequestObject['CreationPriceInWand'] = creationPriceInWand;
    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Submitted portfolio creation request.'), MessageContentType.Text);
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});

    this.http.post(Constants.ServiceURL + '/portfolio/create', publishRequestObject, requestOptions).subscribe(
      data => {
        this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Successfully published ' + portfolioName), MessageContentType.Text);
        this.getCurrentSellAblePortfolios();
      },
      err => {
        console.log(err);
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to publish ' + portfolioName), MessageContentType.Text);
        this.getCurrentSellAblePortfolios();
      }
    );
  }

  signAndPublishPortfolio(portfolioName: string, askingPriceInWand: number, creationPriceInWand: number,
                          portfolio: Array<any>, assetAnalysis: any) {
    if (!this.auth.isAuthenticated())
      return;
    var publishRequestObject = {};
    var maker = this.web3.getWeb3().eth.coinbase;
    var orderID = UUID.UUID();
    var web3Instance = this.web3.getWeb3();
    let dexContractValue = this.getContract('DEX');
    let wxEthContractValue = this.getContract('WXETH');
    if (dexContractValue === undefined) {
      console.log('Unknown DEX contract');
      return;
    }
    var dexContract = web3Instance.eth.contract(JSON.parse(dexContractValue.abi));
    var instanceDexContract = dexContract.at(dexContractValue.address);
    let _sellerTokens = [];
    let _sellerValues = []; // Wand equivalent of token values
    let _orderValues = new Array<any>(5);
    let _orderAddresses = new Array<any>(5);
    for (var i = 0; i < assetAnalysis.assets.length; i++) {
      let contract = this.getContract(assetAnalysis.assets[i].coin);
      if (contract === undefined) {
        continue;
      }
      _sellerTokens.push(contract.address);
      _sellerValues.push(web3Functions.toBaseUnitAmount(assetAnalysis.assets[i].reqbalance, 18));
    }
    _orderValues[0] = web3Functions.toBaseUnitAmount(askingPriceInWand.toFixed(6), 18);//fee Value (in fee token.. )
    _orderValues[3] = web3Functions.toBaseUnitAmount(askingPriceInWand.toFixed(6), 18);
    _orderAddresses[0] = maker;
    _orderAddresses[1] = maker;
    _orderAddresses[3] = wxEthContractValue.address;
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = orderID.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    instanceDexContract.getOrderHash(_sellerTokens, _sellerValues, _orderValues[3], _orderValues[0], _orderAddresses[3], _orderAddresses[0], _orderAddresses[1], sanitizedOrderId, (err, result) => {
      var sellOrderHash = result;
      var payload = {
        jsonrpc: '2.0',
        method: 'eth_sign',
        params: [maker, sellOrderHash]
      };
      web3Instance.currentProvider.sendAsync(payload, (err, result) => {
        var signature = result.result;
        var ecSignature = web3Functions.extractECSignature(signature, sellOrderHash, maker);
        if (web3Functions.clientVerifySign(ecSignature, sellOrderHash, maker)) {
          instanceDexContract.isOrderSigned(sellOrderHash, ecSignature.v, ecSignature.r, ecSignature.s, maker, (err, result) => {
            if (result && result !== undefined && result !== null) {
              publishRequestObject['PortfolioName'] = portfolioName;
              publishRequestObject['PortfolioId'] = orderID;
              publishRequestObject['UserAccount'] = maker;
              publishRequestObject['Assets'] = portfolio;
              publishRequestObject['AskPriceInWand'] = askingPriceInWand;
              publishRequestObject['CreationPriceInWand'] = creationPriceInWand;
              publishRequestObject['SellerSignature'] = signature;
              publishRequestObject['SellerHash'] = sellOrderHash;
              let headers = new Headers({
                'content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                'Token': this.tokenService.getToken().Jwt
              });
              let requestOptions = new RequestOptions({headers: headers});

              this.http.post(Constants.ServiceURL + '/portfolio/create', publishRequestObject, requestOptions).subscribe(
                data => {
                  this.getCurrentSellAblePortfolios();
                  this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Successfully published ' + portfolioName), MessageContentType.Text);
                },
                err => {
                  console.log(err);
                  this.getCurrentSellAblePortfolios();
                  this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to publish ' + portfolioName), MessageContentType.Text);
                }
              );
            }
            else {
              this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
            }
          });
        }
        else {
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Signature check verification failed'), MessageContentType.Text);
        }
      });
    });
  }

  private validateAssetsForBuyer(portfolio: SellablePortfolio, quote: Quote) {
    let loggedInUserWalletStatus = this.walletService.getUserAccountSummary();
    if (!loggedInUserWalletStatus || loggedInUserWalletStatus === undefined || loggedInUserWalletStatus === null) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Logged in user wallet status not available'), MessageContentType.Text);
      return;
    }
    for (let i: number = 0; i < portfolio.Assets.length; i++) {
      let asset = portfolio.Assets[i];
      let assetsStatus = _.where(loggedInUserWalletStatus.Balances, {Symbol: asset.Symbol});
      if (!assetsStatus || assetsStatus === undefined || assetsStatus === null || assetsStatus.length <= 0) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to validate assets'), MessageContentType.Text);
        return;
      }
      let assetStatus = assetsStatus[0];
      if (Number(asset.Reqbalance) > Number(assetStatus['Balance']) || Number(asset.Reqbalance) > Number(assetStatus['Allowance']['Allowance'])) {
        this.transactionInProgress = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient ' + assetStatus['Symbol'] + ' tokens/allowance'), MessageContentType.Text);
        return;
      }
    }
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    let data = ['WXETH'];
    this.http.post(Constants.ServiceURL + 'manage/token/summary/' + portfolio.PortfolioId + '/' + quote.UserAccount, data, requestOptions).subscribe(
      data => {
        let summaryData = data.json();
        let wandBalance = summaryData.Balances[0].Balance;
        if (Number(quote.Value) > Number(wandBalance) || Number(quote.Value) > Number(summaryData.Balances[0].Allowance.Allowance)) {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Buyer/Bidder does not have sufficient Ether tokens/allowance'), MessageContentType.Text);
          return;
        }
        else {
          this.processSell(portfolio, quote);
        }
      },
      err => {
        this.transactionInProgress = false;
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get buyer/bidder\'s Ether balance'), MessageContentType.Text);
        return;
      }
    );
  }

  private validateAssetsForSeller(portfolio) {
    this.processBuy(portfolio);
    /* let web3Instance = this.web3.getWeb3();
     let vsb = web3Instance.eth.contract(Constants.VBPABI);
     let vsbContract = vsb.at(portfolio.contractAddress);
     let assets = 0;
     let owner = portfolio.owner;
     this.validateAssets(portfolio.tokens, vsbContract, owner).then((res) => {
       console.log('rs', res);
       if (res === true) {
         console.log('buy');
         this.processBuy(portfolio);
       } else {
         console.log('not buy');
         this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Seller does not have sufficient tokens/allowance'), MessageContentType.Text);
       }
     });*/
  }

  validateAssets(tokens, vsbContract, owner) {
    return new Promise((resolve, reject) => {
      let assets = 0;
      tokens.map((key, value) => {
        vsbContract.balanceOfToken(owner, key.tokenAddress, (err, response) => {
          if (response) {
            if ((new BigNumber(response).dividedBy(new BigNumber(10).pow(18))).toJSON() === key.value) {
              assets++;
              //resolve(true);
            } else {
              // resolve(false);
            }
            if (value === tokens.length - 1) {
              if (assets === tokens.length) {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          }
        });
      });
    });
  }

  private processBuy(portfolio) {
    let web3Instance = this.web3.getWeb3();
    if (web3Instance === null || web3Instance === undefined || web3Instance.eth.coinbase === null || web3Instance.eth.coinbase === undefined || web3Instance.eth.coinbase.length === 0) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get Wallet Instance'), MessageContentType.Text);
      return;
    }
    let vsb = web3Instance.eth.contract(Constants.VBPABI);
    let vsbContract = vsb.at(portfolio.contractAddress);
    vsbContract.buy({
      from: web3Instance.eth.accounts[0],
      value: web3Functions.toBaseUnitAmount(portfolio.valueInEther, 18)
    }, (err, response) => {
      console.log('response', response);
      if (response) {
        this._closebuypopup.next(true);
        this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
        this.trackBuyTransaction(response, web3Instance);
      } else {
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction not Submitted'), MessageContentType.Text);
      }

    });
  }

  private trackBuyTransaction(address, web3Instance) {
    if (this.buyTimer)
      clearTimeout(this.buyTimer);
    web3Instance.eth.getTransactionReceipt(address, (err, res) => {
      if (res) {
        if (res.status === '0x1') {
          this.buyComplete();
          clearTimeout(this.buyTimer);
        } else if (res.status === '0x0') {
          clearTimeout(this.buyTimer);
          this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Transaction failed'), MessageContentType.Text);
        }
      }
    });
    this.buyTimer = setTimeout(() => {
      this.trackBuyTransaction(address, web3Instance);
    }, 1000);
  }

  private processSell(portfolio: SellablePortfolio, quote: Quote) {
    let web3Instance = this.web3.getWeb3();
    if (web3Instance === null || web3Instance === undefined || web3Instance.eth.coinbase === null || web3Instance.eth.coinbase === undefined || web3Instance.eth.coinbase.length === 0) {
      this.transactionInProgress = false;
      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get Web3 Instance. Please reload'), MessageContentType.Text);
      return;
    }
    var seller = this.web3.getWeb3().eth.coinbase;
    let dexContractValue = this.getContract('DEX');
    let wxEthContractValue = this.getContract('WXETH');
    if (dexContractValue === undefined) {
      this.transactionInProgress = false;
      console.log('Unknown DEX contract');
      return;
    }
    var find = '-';
    var re = new RegExp(find, 'g');
    var sanitizedOrderId = portfolio.PortfolioId.replace(re, '');
    sanitizedOrderId = '0x' + sanitizedOrderId;
    var dexContract = web3Instance.eth.contract(JSON.parse(dexContractValue.abi));
    var instanceDexContract = dexContract.at(dexContractValue.address);

    var _buyerTokens = [wxEthContractValue.address];
    var _buyerValues = [web3Functions.toBaseUnitAmount(quote.Value, 18)];
    let _orderValues = new Array<any>(5);
    let _orderAddresses = new Array<any>(5);

    let _sellerTokens = [];
    let _sellerValues = []; // Wand equivalent of token values

    for (var i = 0; i < portfolio.Assets.length; i++) {
      let contract = this.getContract(portfolio.Assets[i].Symbol);
      if (contract === undefined) {
        continue;
      }
      _sellerTokens.push(contract.address);
      _sellerValues.push(web3Functions.toBaseUnitAmount(portfolio.Assets[i].Reqbalance, 18));
    }

    _orderValues[0] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[1] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[2] = portfolio.CreationTimestamp + 15780000;
    _orderValues[3] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderValues[4] = web3Functions.toBaseUnitAmount(quote.Value.toFixed(6), 18);
    _orderAddresses[0] = portfolio.UserAccount;
    _orderAddresses[1] = portfolio.UserAccount;
    _orderAddresses[2] = quote.UserAccount;
    _orderAddresses[3] = wxEthContractValue.address;
    _orderAddresses[4] = wxEthContractValue.address;
    instanceDexContract.getOrderHash(_sellerTokens, _sellerValues, _orderValues[3], _orderValues[0], _orderAddresses[3], _orderAddresses[0], _orderAddresses[1], sanitizedOrderId, (err, result) => {
      var sellOrderHash = result;
      var payload = {
        jsonrpc: '2.0',
        method: 'eth_sign',
        params: [seller, sellOrderHash]
      };
      web3Instance.currentProvider.sendAsync(payload, (err, result) => {
        var signature = result.result;
        var ecBuyerSignature = web3Functions.extractECSignature(quote.BuyerSignature, quote.BuyerHash, quote.UserAccount);
        var ecSellerSignature = web3Functions.extractECSignature(signature, sellOrderHash, portfolio.UserAccount);
        if (web3Functions.clientVerifySign(ecSellerSignature, sellOrderHash, seller)) {
          instanceDexContract.isOrderSigned(sellOrderHash, ecSellerSignature.v, ecSellerSignature.r, ecSellerSignature.s, seller, (err, result) => {
            if (result) {
              //instanceDexContract.oneWayFulfillPO.estimateGas(_sellerTokens, _buyerTokens, _sellerValues, _buyerValues, _orderAddresses, _orderValues,
              //[ecSellerSignature.v, ecBuyerSignature.v], ecBuyerSignature.r, ecBuyerSignature.s, ecSellerSignature.r, ecSellerSignature.s, sanitizedOrderId,
              //(err, result) => {
              //    var estimatedGas = result;
              instanceDexContract.oneWayFulfillPO(_sellerTokens, _buyerTokens, _sellerValues, _buyerValues, _orderAddresses, _orderValues,
                [ecSellerSignature.v, ecBuyerSignature.v], ecBuyerSignature.r, ecBuyerSignature.s, ecSellerSignature.r, ecSellerSignature.s, sanitizedOrderId,
                {
                  from: seller
                  //    , gas: estimatedGas
                }, (err, result) => {
                  if (!result || result === undefined || result === null) {
                    this.transactionInProgress = false;
                    this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
                    return;
                  }
                  let headers = new Headers({
                    'content-type': 'application/json',
                    'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
                    'Token': this.tokenService.getToken().Jwt
                  });
                  let requestOptions = new RequestOptions({headers: headers});
                  let transactionId = result;
                  let body = {};
                  body['TransactionId'] = transactionId;
                  body['BuyerUserAccountId'] = quote.UserAccount;
                  body['SellerUserAccountId'] = portfolio.UserAccount;
                  body['PortfolioId'] = portfolio.PortfolioId;
                  this.http.post(Constants.ServiceURL + 'transaction/create', body, requestOptions).subscribe(
                    data => {
                      var html = '<div class=\'standard-text\'>' +
                        '<p>Sell Initiated</p>' +
                        '<p><a href=';
                      ' + Constants.TxAppnetURL + ';
                      ' + result + ';
                      ' target=\'_blank\'>Click here to check status</a></p>' +
                      '</div>';
                      this.notificationService.showNotification(new MessageModel(MessageType.Success, html), MessageContentType.Html);
                      this.getCurrentSellAblePortfolios();
                    },
                    err => {
                      console.log(err);
                      this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to log sale'), MessageContentType.Text);
                      this.getCurrentSellAblePortfolios();
                    }
                  );
                  this.transactionInProgress = false;
                });
              //});
            }
            else {
              this.transactionInProgress = false;
              this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
            }
          });
        }
        else {
          this.transactionInProgress = false;
          this.notificationService.showNotification(new MessageModel(MessageType.Info, 'Transaction not finished'), MessageContentType.Text);
        }
      });
    });
  }

  private extractMetadata(array: any, symbol: string) {
    for (var i = 0; i < array.length; i++) {
      if (symbol === array[i]['symbol'])
        return array[i];
    }
    return undefined;
  }


  private getContract(symbol: string) {
    let availableContracts = this.walletService.getContracts();
    for (var i = 0; i < availableContracts.length; i++) {
      if (availableContracts[i].symbol === symbol) {
        return availableContracts[i];
      }
    }
    return undefined;
  }

  //new Portfolio date :- 25/04/2018
  getList() {
    if (!this.tokenService.getToken()) {
      return;
    }
    let web3Instance = this.web3.getWeb3();
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    let body = new URLSearchParams();
    let query = {currentOwnerOrSeller: web3Instance.eth.accounts[0]};
    body.set('query', JSON.stringify(query));
    //console.log('form data', body.toString());
    let requestOptions = new RequestOptions({headers: headers});
    this.http.post(Constants.BashketURL, body.toString(), requestOptions).subscribe(data => {
      //console.log('basketlist', data.json());
      let baskets = data.json();
      if (baskets.length !== 0) {
        this.getPlatformTokens().then((res) => {
          let tokenList;
          tokenList = res;
          baskets.map((k, v) => {
            k['tokens'].map((k2, v2) => {
              tokenList.map((k1, v1) => {
                if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
                  k2['symbol'] = k1.symbol;
                }
              });
            });
          });
          let pending = [];
          let active = [];
          let buy = [];
          baskets.map((key, value) => {
            key['tokens'].map((k2, v2) => {
              if (key['status'] === '0' && k2.symbol !== undefined) {
                pending.push(key);
              } else if (key['status'] === '1' && k2.symbol !== undefined) {
                active.push(key);
              } else if (key['status'] === '3' && k2.symbol !== undefined) {
                buy.push(key);
              }
              if (value === baskets.length - 1) {
                this.setSellAblePortfolios(_.uniq(active));
                this.setOrderbookPortfolio(_.uniq(buy));
                this.setPendingPortfolio(_.uniq(pending));
                this._portfolioActiveData.next(_.uniq(active));
                this._portfolioPendingData.next(_.uniq(pending));
                this._orderBookData.next(_.uniq(buy));
              }
            });
          });
        }, (err) => {
          this.setSellAblePortfolios([]);
          this.setOrderbookPortfolio([]);
          this.setPendingPortfolio([]);
          this._portfolioActiveData.next([]);
          this._portfolioPendingData.next([]);
          this._orderBookData.next([]);
        });
      } else {
        this.setSellAblePortfolios([]);
        this.setOrderbookPortfolio([]);
        this.setPendingPortfolio([]);
        this._portfolioActiveData.next([]);
        this._portfolioPendingData.next([]);
        this._orderBookData.next([]);
      }

    });
  }

  getBasketList() {
    if (!this.tokenService.getToken()) {
      return;
    }
    let web3Instance = this.web3.getWeb3();
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    let body = new URLSearchParams();
    let query = {currentOwnerOrSeller: ''};
    body.set('query', JSON.stringify(query));
    let requestOptions = new RequestOptions({headers: headers});
    this.http.post(Constants.BashketURL, {}, requestOptions).subscribe(data => {
      let temp = data.json();
      let baskets = _.filter(temp, function (key) {
        return key['currentOwnerOrSeller'] !== web3Instance.eth.accounts[0];
      });
      if (baskets.length !== 0) {
        this.getPlatformTokens().then((res) => {
          let tokenList;
          tokenList = res;
          baskets.map((k, v) => {
            k['tokens'].map((k2, v2) => {
              tokenList.map((k1, v1) => {
                if (k2.tokenAddress.toLowerCase() === k1.address.toLowerCase()) {
                  k2['symbol'] = k1.symbol;
                }
              });
            });
          });
          let buy = [];
          baskets.map((key, value) => {
            key['tokens'].map((k2, v2) => {
              if (key['status'] === '1' && k2.symbol !== undefined) {
                buy.push(key);
              }
            });
            if (value === baskets.length - 1) {
              this.setBuyAblePortfolios(_.uniq(buy));
              this._portfolioData.next(_.uniq(buy));
            }
          });
        }, (err) => {
          this.setBuyAblePortfolios([]);
          this._portfolioData.next([]);
        });
      } else {
        this.setBuyAblePortfolios([]);
        this._portfolioData.next([]);
      }
    });
  }

  getBuyAblePortfolios() {
    return this.buyAblePortfolios;
  }

  setBuyAblePortfolios(data) {
    this.buyAblePortfolios = data;
  }

  getSellAblePortfolios() {
    return this.sellAblePortfolios;
  }

  setSellAblePortfolios(data) {
    this.sellAblePortfolios = data;
  }

  updatePorfolio(portfolio) {
    this._updateportfolioData.next(portfolio);
  }

  setNewTokenValue(assest) {
    console.log('new assest set', assest);
    this.assets = assest;
  }

  getNewTokenValue() {
    return this.assets;
  }

  closeEditModal() {
    this._closeModal.next(true);
  }

  despoiteToken() {
    this._depositToken.next(true);
  }

  publishComplete() {
    this._publishComplete.next(true);
  }

  buyComplete() {
    console.log('called buyComplete');
    this.notificationService.showNotification(new MessageModel(MessageType.Success, 'Transaction completed Successfully'), MessageContentType.Text);
    clearTimeout(this.buyTimer);
    this._buyComplete.next(true);
  }

  closeButPopup() {
    this._buyComplete.next(true);
  }

  getPendingPortfolio() {
    return this.pendingPortfolio;
  }

  setPendingPortfolio(data) {
    this.pendingPortfolio = data;
  }

  getOrderbookPortfolio() {
    return this.orderBookPortfolio;
  }

  setOrderbookPortfolio(data) {
    this.orderBookPortfolio = data;
  }

  getPlatformTokens() {
    return new Promise((resolve, reject) => {
      if (!this.tokenService.getToken()) {
        reject(false);
      }
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({headers: headers});
      this.http.get(Constants.ServiceURL + 'PlatformToken', requestOptions).subscribe(
        data => {
          // console.log('tokes', data.json());
          resolve(data.json());
        });
    });
  }

  requestPortfolio(theme) {
    return new Promise((resolve, reject) => {
      if (!this.auth.isAuthenticated())
        return;
      const publishRequestObject = {};
      publishRequestObject['PortfolioId'] = UUID.UUID();
      publishRequestObject['PortfolioTheme'] = theme.name;
      publishRequestObject['PortfolioPriceInEth'] = theme.PortfolioPriceInEth;
      publishRequestObject['PortfolioMaxPriceInEth'] = theme.PortfolioMaxPriceInEth;
      publishRequestObject['UserAccount'] = this.web3.getWeb3().eth.coinbase;
      publishRequestObject['ExpiryDate'] = moment().add(7, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      publishRequestObject['Created'] = moment().format('yyyy-MM-dd\'T\'HH:mm:ss.SSSZ');
      publishRequestObject['UserId'] = sessionStorage.getItem('user_id');
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({headers: headers});
      this.http.post(Constants.ThemedBasketRequest + 'api/portfoliorequests/create', publishRequestObject, requestOptions).subscribe(
        data => {
          resolve(data.json());
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  getrequestPortfolio() {
    return new Promise((resolve, reject) => {
      let headers = new Headers({
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
        'Token': this.tokenService.getToken().Jwt
      });
      let requestOptions = new RequestOptions({headers: headers});
      this.http.get(Constants.ThemedBasketRequest + 'api/portfoliorequests/getuserrequests', requestOptions).subscribe(
        data => {
          resolve({data: data.json()});
        }, err => {
          console.log(err);
          reject(err);
        });
    });
  }
}
