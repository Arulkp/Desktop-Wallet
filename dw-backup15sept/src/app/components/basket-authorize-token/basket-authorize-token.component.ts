import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {Constants} from '../../models/constants';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NavigationService} from '../../services/nav.service';
import {WalletService} from '../../services/wallet.service';
import {Web3Service} from '../../services/web3.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {SwitchThemeService} from '../../services/switch-theme.service';
import {TokenService} from '../../services/token.service';
import {ChartService} from '../../services/chart.service';
import * as _ from 'underscore';
import {PortfolioService} from '../../services/portfolio.service';
import {BigNumber} from 'bignumber.js';
import {validate} from 'codelyzer/walkerFactory/walkerFn';

declare namespace web3Functions {
  export function generateSalt();

  export function prepareCallPayload(data: any);

  export function toBaseUnitAmount(amount: any, decimals: any);

  export function extractECSignature(sign: any, orderHash: any, signer: any);

  export function clientVerifySign(ecSignature: any, orderHash: any, signer: any);
}

@Component({
  selector: 'app-basket-authorize-token',
  templateUrl: './basket-authorize-token.component.html',
  styleUrls: ['./basket-authorize-token.component.css']
})
export class BasketAuthorizeTokenComponent implements OnInit, OnDestroy {
  selectedToken: string = 'WAND';
  allAvailableContracts: Array<any> = [];
  allAvailableTokenContracts: Array<any> = [];
  userAccountSummary: Array<any> = [];
  showWalletLoader = true;
  hasUASummaryUpdateWithTC: boolean = false;
  amount: number = 0.0;
  showContent: boolean = true;
  currentEtherBalance = 0.0;
  wxETHBalance = 0.0;
  usd: any;
  contractAddress: any;
  tokenListAddress: Array<any> = [];
  tokenWithbalance: Array<any> = [];
  vsbContract: any;
  trackDepositeToken = 0;
  private availableTokensType: Array<string> = ['WAND', 'ZRX', 'QTUM', 'VERI', 'GNT', 'DEX'];
  private tokenContracts: any;
  private tokenContractChange: Subscription;
  private userAccountChange: Subscription;
  private transactionInProgress: boolean = false;
  private authorizeTokenList = [];
  private authorizeTransactionTimer: any;
  public showLoader = true;
  public track = 0;
  public platformTokens: any;

  constructor(private navService: NavigationService,
              private http: Http,
              private portfolioService: PortfolioService,
              private zone: NgZone,
              private walletService: WalletService,
              private notificationsService: NotificationManagerService,
              readonly switchThemeService: SwitchThemeService,
              private web3: Web3Service,
              private router: Router,
              private tokenService: TokenService,
              private chartService: ChartService) {
    console.log('cuurent nav', navService.getCurrentActiveTab());
    this.tokenContractChange = this.walletService.tokenContractChange$.subscribe(data => this.handleContractChange(data));
    this.userAccountChange = this.walletService.userAccountSummaryChange$.subscribe(data => this.handleUserAccountSummaryChange(data));
  }

  ngOnInit() {
    this.showWalletLoader = true;
    this.authorizeTokenList = [];
    let web3 = this.web3.getWeb3();
    web3.eth.getBalance(web3.eth.coinbase, (err, data) => {
      this.currentEtherBalance = web3.fromWei(data).toFixed(4);
    });

    if (this.tokenService.getToken() === undefined) {
      this.tokenService.fetchToken();
    }
    else {
      this.loadData();
      this.isWalletActive();
    }
    let __this = this;
    this.chartService.setUSD(function (err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
    this.track = 0;
    this.getPlatformTokens();
  }

  ngOnDestroy(): void {
    this.tokenContractChange.unsubscribe();
    this.userAccountChange.unsubscribe();
    if (this.authorizeTransactionTimer) {
      clearTimeout(this.authorizeTransactionTimer);
    }
  }

  isWalletActive() {
    if (this.navService.getCurrentActiveTab() === 'dashboard') {
      this.showContent = true;
    } else {
      this.showContent = false;
    }
  }

  handleContractChange(data) {
    if (data === undefined)
      return;
    this.allAvailableContracts = data;
    for (var i = 0; i < data.length; i++) {
      if (data[i].isTokenContract) {
        data[i]['AuthorizationAmount'] = 0;
        this.allAvailableTokenContracts.push(data[i]);
      }
    }
    if (!this.hasUASummaryUpdateWithTC)
      this.updateUASummaryWithTokenContract();
  }

  handleUserAccountSummaryChange(data) {
    this.showWalletLoader = false;
    if (data === undefined)
      return;
    this.userAccountSummary = data.Balances;
    this.hasUASummaryUpdateWithTC = false;
    this.updateUASummaryWithTokenContract();
  }

  updateUASummaryWithTokenContract() {
    if (!this.allAvailableTokenContracts || !this.userAccountSummary)
      return;
    var self = this;
    this.hasUASummaryUpdateWithTC = true;
    self.allAvailableTokenContracts.forEach(function (it, i) {
      self.userAccountSummary.forEach(function (jt, j) {
        if (it.symbol && it.symbol == jt.Symbol)
          jt.tokenContract = it;
      });
    });
  }

  refreshAccountSummary() {
    this.showWalletLoader = true;
    this.walletService.fetchAccountSummary();
  }

  deposit() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please check wallet'), MessageContentType.Text);
      return;
    }

    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Depositing ' + this.amount + ' as WXETH to enable trading in ERC20 Token Baskets'), MessageContentType.Text);
    let wxEthData = this.getContract('WXETH');
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get ether token details'), MessageContentType.Text);
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.deposit(userAccount, {from: userAccount, value: convertedAmount}, (err, result) => {
      this.transactionInProgress = false;
      if (!result || result === undefined || result === null) {
        this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction has not been processed'), MessageContentType.Text);
        return;
      }
      this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token deposit successful, please wait for transaction to complete'), MessageContentType.Text);
      return;
    });
  }

  withdraw() {
    if (this.transactionInProgress) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Transaction is in progress'), MessageContentType.Text);
      return;
    }
    let web3Instance = this.web3.getWeb3();
    var userAccount = web3Instance.eth.coinbase;
    if (userAccount === null || userAccount === undefined || userAccount.length === 0) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get user account, please check Wallet'), MessageContentType.Text);
      return;
    }

    this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Withdrawing ' + this.amount + ' from ether token'), MessageContentType.Text);
    let wxEthData = this.getContract('WXETH');
    if (!wxEthData || wxEthData === undefined || wxEthData === null) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Failed to get ether token details'), MessageContentType.Text);
      return;
    }

    let wxEth = web3Instance.eth.contract(JSON.parse(wxEthData.abi));
    let wxEthContract = wxEth.at(wxEthData.address);
    let convertedAmount = web3Functions.toBaseUnitAmount(this.amount, 18);

    wxEthContract.withdraw(convertedAmount, {from: userAccount}, (err, result) => {
      this.transactionInProgress = false;
      if (!result || result === undefined || result === null) {
        this.notificationsService.showNotification(new MessageModel(MessageType.Error, 'Transaction has not been processed'), MessageContentType.Text);
        return;
      }
      this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Token withdrawal successful, please wait for transaction to complete'), MessageContentType.Text);
      return;
    });
  }

  authorize(token: any, value: any) {
    var contract, exchange;
    if (this.allAvailableContracts === null || this.allAvailableContracts === undefined || this.allAvailableContracts.length === 0)
      return;
    var myTokenContract = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
    var instanceMyTokenContract = myTokenContract.at(token.address);
    var userAccount = this.web3.getWeb3().eth.coinbase;
    if (parseFloat(token.AuthorizationAmount) < parseFloat(value)) {
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Please enter allowance greater then the Token balance'), MessageContentType.Text);
    } else {
      this.checkAndAuthorize(instanceMyTokenContract, userAccount, this.contractAddress, web3Functions.toBaseUnitAmount(token.AuthorizationAmount, token.data.decimals));
      this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Initiated authorization'), MessageContentType.Text);
    }
  }

  getWalletInfo(data) {
    let tempArray = data;
    tempArray.map((keys1, value) => {
      this.platformTokens.map((key) => {
        if (key.symbol === keys1.symbol) {
          keys1.data = key;
          if (value === tempArray.length - 1) {
            console.log('getWalletInfo', tempArray);
            if (this.portfolioService.getNewTokenValue()) {
              console.log('token value', this.portfolioService.getNewTokenValue());
              let newAssets = this.portfolioService.getNewTokenValue();
              this.checkWithBalanceOfToken(tempArray, newAssets, (res) => {
                if (res) {
                  this.walletService.setNewPortfolioTokenWithValue(res);
                  this.showLoader = false;
                  this.getAllowance(res);
                  if (res.length === 0) {
                    this.next();
                  }
                  this.tractButton();
                }
              });
            } else {
              this.tokenWithbalance = tempArray;
              console.log('final', this.tokenWithbalance);
              this.showLoader = false;
              this.getAllowance(this.tokenWithbalance);
              this.walletService.setNewPortfolioTokenWithValue(this.tokenWithbalance);
              this.tractButton();
            }
            this.zone.run(() => {
            });
          }
        }
      });
    });
  }

  checkWithBalanceOfToken(data, newAssets, callback) {
    newAssets.map((key, value1) => {
      data.map((key2, value) => {
        if (key2.address === (key.address === undefined ? key.tokenAddress : key.address)) {
          console.log('balance', key.value, key2.balanceOfToken,key2.symbol);
          if (key2.balanceOfToken !== 0) {
            if (key2.balanceOfToken >= key.value) {
              data.splice(value, 1);
              console.log('if', data);
            } else {
              key2.value = key.value - key2.balanceOfToken;
              console.log('else', data);
            }
          }
          if (value1 === newAssets.length - 1) {
            callback(data);
          }
        }
      });
    });
  }

  getTokenAddress(data) {
    let tempArray = data;
    tempArray.map((key2, value) => {
      this.platformTokens.map((key) => {
        if (key.address.toLowerCase() === key2.address.toLowerCase()) {
          key2['symbol'] = key.symbol;
          if (value === data.length - 1) {
            console.log('getTokenAddress', tempArray);
            this.getWalletInfo(tempArray);
          }
        }
      });
    });
  }

  getPortfolioToken() {
    console.log('called getPortfolioToken');
    if (this.walletService.getPortfolioAddress()) {
      this.contractAddress = this.walletService.getPortfolioAddress();
      console.log('address', this.walletService.getPortfolioAddress());
      let web3Instance = this.web3.getWeb3();
      let vsb = web3Instance.eth.contract(Constants.VBPABI);
      let vsbContract = vsb.at(this.contractAddress);
      this.vsbContract = vsbContract;
      for (let i = 0; i < 50; i++) {
        vsbContract.listAssets(JSON.stringify(i), (err, data) => {
          if (data) {
            var temp = {};
            temp['address'] = data;
            this.tokenListAddress.push(temp);
            if (this.tokenListAddress.length === 50) {
              let arr = _.filter(this.tokenListAddress, function (item) {
                return item.address !== '0x';
              });
              this.getAssest(arr, vsbContract);
            }
          }
        });
      }
    }
  }

  getAssest(data, vsbContract) {
    let tempArray = [];
    data.map((key, value) => {
      var temp = {};
      vsbContract.assetStatus(key.address, (err, result) => {
        if (result === true) {
          vsbContract.assets(key.address, (err, res) => {
            temp['address'] = key.address;
            let token = this.platformTokens.filter((token) => token.address.toLowerCase() === key.address.toLowerCase());
            if (token && token.length === 1) {
              let decimals = token[0].decimals;
              temp['value'] = (new BigNumber(res).dividedBy(new BigNumber(10).pow(decimals))).toJSON();
              tempArray.push(temp);
              this.getBalanceOfToken(tempArray, this.vsbContract);
            }
          });
        }
      });
    });
  }

  getBalanceOfToken(data, vsbContract) {
    console.log('getBalanceOfToken', data);
    let tempArray = [];
    data.map((key) => {
      var temp = {};
      vsbContract.balanceOfToken(this.web3.getWeb3().eth.coinbase, key.address, (err, res) => {
        if (!res) {
          return;
        }
        temp['address'] = key.address;
        temp['value'] = key.value;
        let token = this.platformTokens.filter((token) => token.address.toLowerCase() === key.address.toLowerCase());
        if (token && token.length === 1) {
          let decimals = token[0].decimals;
          temp['balanceOfToken'] = (new BigNumber(res).dividedBy(new BigNumber(10).pow(decimals))).toJSON();
          temp['AuthorizationAmount'] = 1000;
          tempArray.push(temp);
          if (tempArray.length === data.length) {
            this.getTokenAddress(tempArray);
          }
        }
      });
    });
  }

  tractButton() {
    this.zone.run(() => {
    });
    if (this.track !== this.authorizeTokenList.length) {
      //console.log("called if")
      return true;
    } else {
      //console.log("called if")
      if (this.authorizeTokenList.length > 0) {
        for (var i = 0; i < this.authorizeTokenList.length; i++) {
          if (this.authorizeTokenList[i].status === false)
            return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  tractButtonTransaction() {
    this.authorizeTokenList.map((key) => {
      this.tractTransaction(key.address).then((res) => {
        console.log('response', res);
        console.log('called getAllowanceAfterTransactionSuccess');
        //this.getAllowanceAfterTransactionSuccess();
      });
    });
  }

  next() {
    console.log('called');
    if (this.authorizeTransactionTimer) {
      clearTimeout(this.authorizeTransactionTimer);
    }
    this.portfolioService.despoiteToken();
  }

  public getAllowance(data) {
    //console.log("data",data)
    data.map((key, value) => {
      var myTokenContract = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
      var instanceMyTokenContract = myTokenContract.at(key.address);
      this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then((res) => {
        this.zone.run(() => {
          key.allowance = res;
          this.validateAllowance(data);
        });
      });
    });
  }

  public getAllowanceAfterTransactionSuccess() {
    this.tokenWithbalance.map((key, value) => {
      var myTokenContract = this.web3.getWeb3().eth.contract(Constants.TokenAbi);
      var instanceMyTokenContract = myTokenContract.at(key.address);
      this.getAllowanceData(instanceMyTokenContract, this.contractAddress).then((res) => {
        this.zone.run(() => {
          key.allowance = res;
        });
      });
    });
  }

  getAllowanceData(instanceMyTokenContract, contractAddress) {
    return new Promise((resolve, reject) => {
      instanceMyTokenContract.allowance(this.web3.getWeb3().eth.coinbase, contractAddress, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(new BigNumber(result).dividedBy(new BigNumber(10).pow(18)).toJSON());
        }
      });
    });
  }

  private tractTransaction(address) {
    return new Promise((resolve, reject) => {
      let web3Instance = this.web3.getWeb3();
      if (this.authorizeTransactionTimer)
        web3Instance.eth.getTransactionReceipt(address, (err, res) => {
          if (res) {
            if (res.status === '0x1') {
              this.getAllowanceAfterTransactionSuccess();
              this.authorizeTokenList.map((key) => {
                if (key.address === address) {
                  key.status = true;
                  this.tractButton();
                }
              });
              resolve(true);
            }
          }
        });
      this.authorizeTransactionTimer = setTimeout(() => {
        this.tractTransaction(address);
      }, 1000);
    });
  }

  private loadData() {
    if (this.walletService.getUserAccountSummary() !== undefined) {
      this.showWalletLoader = false;
      //console.log("userAccountSummary",this.walletService.fetchAccountSummary());
      this.userAccountSummary = this.walletService.getUserAccountSummary().Balances;
      // this.tokenListAddress.map((key)=>{
      //   this.userAccountSummary = this.userAccountSummary.filter((data) => data.address === key.address);
      // })
      this.wxETHBalance = this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].Balance;

      console.log('WXEth Balance: ' + this.userAccountSummary.filter((wxethbalance) => wxethbalance.Symbol === 'WXETH')[0].Balance);
      console.log('userAccountSummary length: ' + this.userAccountSummary.length);

    }
    else {
      this.walletService.fetchAccountSummary();

    }

    if (this.walletService.getContracts() !== undefined) {
      this.allAvailableContracts = this.walletService.getContracts();
    }
    else {
      this.walletService.fetchContracts();
    }
  }

  private checkAndAuthorize(instanceTokenContract, account, authorizedAcc, value) {
    // alert('called checkAndAuthorize')
    instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
      console.log('result', result.lt(value));
      if (result.lt(value)) {
        this.authorizeOne(instanceTokenContract, account, authorizedAcc, value);
      } else {
        this.trackDepositeToken++;
        this.tractButtonTransaction();
        this.notificationsService.showNotification(new MessageModel(MessageType.Info, 'Good, you have sufficient allowance for this token'), MessageContentType.Text);
      }
    });
  }

  private authorizeOne(instanceTokenContract, account, authorizedAcc, value) {
    instanceTokenContract.approve(authorizedAcc, value, {from: account}, (err, result) => {
      instanceTokenContract.allowance(account, authorizedAcc, (err, result) => {
        console.log('allowance', result);
        if (result) {
          this.notificationsService.showNotification(new MessageModel(MessageType.Success, 'Authorization successfully submitted to the Ethereum Blockchain. Please wait till it confirms.'), MessageContentType.Text);
        }
      });
      console.log('allowance', result);
      let temp = {};
      temp['address'] = result;
      temp['status'] = false;
      this.authorizeTokenList.push(temp);
      this.trackDepositeToken++;
      this.tractButtonTransaction();
    });
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

  private validateAllowance(data) {
    console.log('data', data);
    let track = 0;
    data.map((key, value) => {
      if (parseFloat(key.allowance) >= parseFloat(key.value)) {
        track++;
        if (track === data.length) {
          this.showLoader = false;
          this.next();
        }
        ;
      }
      ;
      if (value === data.length - 1) {
        this.track = data.length - track;
        this.tokenWithbalance = data;
      }
    });
  }

  getPlatformTokens() {
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'PlatformToken', requestOptions).subscribe(
      data => {
        var tokens = data.json();
        this.platformTokens = tokens;
        this.getPortfolioToken();
      });
  }
}



