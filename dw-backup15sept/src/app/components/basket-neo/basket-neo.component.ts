import {Component, OnInit, OnDestroy} from '@angular/core';
import {BigNumber} from 'bignumber.js';
import {NeoService} from '../../services/neo.service';
import {Constants} from '../../models/constants';
import {ActivatedRoute, Router} from '@angular/router';
import {SwitchThemeService} from '../../services/switch-theme.service';
import {NavigationService} from '../../services/nav.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NeotokenService} from '../../services/neotoken.service';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'underscore';
import {UpdatebasketqueueService} from '../../services/updatebasketqueue.service';
import {AmChart, AmChartsService} from '@amcharts/amcharts3-angular';
import {PortfolioAssetsService} from '../../services/portfolio-assets.service';

@Component({
  selector: 'app-basket-neo',
  templateUrl: './basket-neo.component.html',
  styleUrls: ['./basket-neo.component.css']
})
export class BasketNeoComponent implements OnInit, OnDestroy {
  public tokenList = [];
  public dropdownSettings = {};
  private savedWalletsServiceSub: Subscription;
  public selectedItems = [];
  public askingPrice: any;
  public askingToken: any;
  public accountAddress: any;
  public GAS: any;
  public NEO: any;
  public activeTab: any;
  public basketOrders = [];
  public canceledBasketOrders = [];
  public sellBasketOrders = [];
  public loginModal: boolean = false;
  public bashketDetailModal: boolean = false;
  public bashketDetailModalliquidate: boolean = false;
  public WIF: any;
  public searchText: any;
  public selectedPortfolioToken: any;
  public visibleTab: string = 'buy';
  public activeTabs: string = 'Active';
  private trackTransactioTimer: any;
  private refreshTimer: any;
  public sellBasketOrdersFilered = [];
  public trackCancel: boolean = false;
  public removeAssetList: any;
  private removeAsset: Subscription;
  myBasketModal: boolean = false;
  shouldShowBuyPortfolioModal: boolean = false;
  selectedBuyPorfolioIndex: number;
  public trackBuyButton = false;
  selectedBuyAblePorfolio: any;
  amChartPie: AmChart;
  amChartPieOptions: Object = {};
  amChartPieData: Array<Object> = [];
  public totalTokens: any;
  themeColor = '#672482';
  darkTheme = 'dark';
  color = 'black';
  amChartPieLegendMap = {};
  stockTF: string = 'DD';
  toSymbols: Array<string> = ['NEO', 'USD'];
  amChartStockOptions: Object = {};
  backgroundColor = '#672482';
  amChartStock: AmChart;
  private trackTransactionComplete: Subscription;
  constructor(private portfolioAssetsService: PortfolioAssetsService, private AmCharts: AmChartsService, private updatebasketqueueService: UpdatebasketqueueService, private http: Http, private savedWalletsService: SavedWalletsService, private neotokenService: NeotokenService, private route: ActivatedRoute, private notificationManagerService: NotificationManagerService, private navService: NavigationService, public neoService: NeoService, private router: Router, readonly switchThemeService: SwitchThemeService) {
    this.tokenList = this.neotokenService.getNeonTokenList();
    this.trackTransactionComplete = this.updatebasketqueueService.TransactionComplete$.subscribe((data) => this.transactionComplete(data));
    this.navService.setCurrentActiveTab('neoBasket');
    this.removeAsset = this.updatebasketqueueService.RemoveAssets$.subscribe((data) => this.assetComplete(data));
    this.route.params.subscribe(params => {
      if (params['tab']) {
        // changing to specific string for visibletab as this won't
        // affect any change in order in which tabs are listed
        if (params['tab'] === 'buy') {
          this.setVisibleTabs('buy');
        }
        if (params['tab'] === 'sell') {
          this.setVisibleTabs('sell');
        }
        if (params['tab'] === 'order-history') {
          this.setVisibleTabs('order-history');
        }
        if (params['tab'] === 'wallet') {
          this.setVisibleTabs('wallet');
        }
      }
    });
  }
  transactionComplete(data) {
    console.log('data', data);
    if (data && data === 'complete') {
      this.setVisibleTabs('sell');
      this.init();
    }
  }

  ngOnInit() {
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
      if (status == 'currentWalletChanged') {
        var wallet = this.savedWalletsService.getCurrentWallet();
        if (wallet && wallet.isDecrypted && wallet.exchange == 'neo') {
          this.neoService.setAccoutWithWIF(wallet.getWIF());
          this.init();
        }
      }
    });
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      text: 'Select Token',
      enableSearchFilter: false,
      enableCheckAll: false
    };
  }

  assetComplete(data) {
    if (data === true) {
      setTimeout(() => {
        this.neoService.liquidateBasket(this.selectedPortfolioToken.orderHash).then((res) => {
          if (res['response']['txid']) {
            this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'liquidate Basket is submitted to Network please wait for confirmation'), MessageContentType.Text);
            setTimeout(() => {
              this.trackTransaction(res['response']['txid']);
            }, 15000);
          } else {
            this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
          }
        });
      }, 20000);
    }
  }

  ngOnDestroy() {
    if (this.trackTransactioTimer) {
      clearTimeout(this.trackTransactioTimer);
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.savedWalletsServiceSub.unsubscribe();
    this.removeAsset.unsubscribe();
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }

  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }


  onSelect(address) {
    this.askingToken = address;
    console.log(address);
  }

  search(data) {
    console.log('data', data);
    this.searchText = data;
    if (this.searchText.length === 0) {
      this.sellBasketOrdersFilered = this.sellBasketOrders;
    } else {
      this.sellBasketOrdersFilered = _.filter(this.sellBasketOrders, (buyAblePortfolio) => {
        /*if (buyAblePortfolio['name'].toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0) {
          return true;
        }*/
        if (_.any(buyAblePortfolio['tokens'], (asset) => {
            return asset['name'].toUpperCase().indexOf(this.searchText.toUpperCase()) >= 0;
          })) {
          return true;
        }
        return false;
      });
    }
  }

  closeModal() {
    this.loginModal = false;
  }

  init() {
    console.log('Calles');
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
    this.getBasketOrder(1);
    this.getBasketOrder(2);
    this.getAllBasketOrder();
    setTimeout(() => {
      this.refresh();
    }, 3000);
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

  /*  getBaksetOrder(flag) {
      this.neoService.getBasketOrders(flag).then((res) => {
        console.log('orders', res);
        if (res[0].value) {
          let baskets = res[0].value;
          this.basketOrders = [];
          let finalArray = [];
          baskets.map((key, value) => {
            let tmp = {};
            let count;
            let tokenAsset;
            let token;
            let str = '';
            if (key.type !== 'Boolean') {
              key.value.map((key2, value2) => {
                if (value2 === 0) {
                  str += key2.value;
                } else if (value2 === 1) {
                  str += key2.value;
                  tmp['owner'] = this.neoService.getNeon().u.reverseHex(key2.value);
                } else if (value2 === 2) {
                  token = key2.value;
                  str += key2.value;
                } else if (value2 === 4) {
                  str += key2.value;
                  if (key2.value.length > 40) {
                    if (this.neoService.getNeon().u.reverseHex(key2.value) === Constants.NEO_GAS_ASSET_ID) {
                      tmp['askingToken'] = 'GAS';
                    }
                    if (this.neoService.getNeon().u.reverseHex(key2.value) === Constants.NEO_ASSET_ID) {
                      tmp['askingToken'] = 'NEO';
                    }
                  } else {
                    let tkn = this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(key2.value));
                    tmp['askingToken'] = tkn[0].name;
                  }
                } else if (value2 === 3) {
                  count = key2.value.length;
                  tokenAsset = key2.value;
                  tokenAsset.map((k) => {
                    if (k.type === 'Integer') {
                      str += this.neoService.getNeon().u.int2hex(parseFloat(k.value));
                    } else {
                      str += k.value;
                    }

                  });
                  this.getToken(token, count).then((res) => {
                    res['token'].map((key4, v) => {
                      tokenAsset.map((key3, v2) => {
                        if (v === v2) {
                          if (key3.type === 'ByteArray') {
                            key4['asset'] = new BigNumber(this.neoService.getNeon().u.Fixed8.fromReverseHex(key3.value)).toNumber();
                          } else {
                            key4['asset'] = key3.value;
                          }
                        }
                        if (v === res['token'].length - 1) {
                          tmp['tokens'] = res;
                          //console.log('tmp', tmp);
                        }
                      });
                    });
                  });
                } else if (value2 === 5) {
                  tmp['askingPrice'] = key2.value;
                  if (key2.type === 'ByteArray') {
                    tmp['askingPrice'] = new BigNumber(this.neoService.getNeon().u.Fixed8.fromReverseHex(key2.value)).toNumber();
                  } else {
                    tmp['askingPrice'] = key2.value;
                  }
                  if (key2.type === 'Integer') {
                    str += this.neoService.getNeon().u.int2hex(parseFloat(key2.value));
                  } else {
                    str += key2.value;
                  }
                } else if (value2 === 6) {
                  if (key2.type === 'Integer') {
                    str += this.neoService.getNeon().u.int2hex(parseFloat(key2.value));
                  } else {
                    str += key2.value;
                  }
                  tmp['hash'] = str;
                  // tmp['askingPrice'] = key2.value;
                }
              });
              finalArray.push(tmp);
              if (finalArray.length === 0) {
                this.basketOrders = [];
              } else {
                this.basketOrders = finalArray;
              }

              console.log('final', finalArray);
            }
          });
        }
      });
    }*/

  calculateFee(total) {
    console.log('total', total + (total * 2) / 100);
    return total + (total * 2) / 100;
  }

  buy(basket) {
    this.closeDetailModal();
    let errMesg: string = '';
    let askToken;
    if (basket.askingToken === 'GAS') {
      askToken = Constants.NEO_GAS_ASSET_ID;
    } else {
      askToken = Constants.NEO_ASSET_ID;
    }
    this.neoService.getBalance(askToken).then((res) => {
      if (res) {
        if (res >= parseFloat(this.calculateFee(basket.askingPrice))) {
          this.neoService.fulfillBasketOrder(basket.orderHash).then((ress) => {
            console.log('ress[\'response\'][\'txid\']', ress['response']['txid']);
            if (ress['response']['txid']) {
              setTimeout(() => {
                this.trackTransaction(ress['response']['txid']);
              }, 15000);
              this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
            }
          });
        } else {
          this.closeDetailModal();
          errMesg = 'Insufficient balance ' + basket.askingToken;
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, errMesg), MessageContentType.Text);
        }
      } else {
        this.closeDetailModal();
        errMesg = 'Insufficient balance' + basket.askingToken;
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, errMesg), MessageContentType.Text);
      }
    });
  };

  liquidate() {
    if (this.selectedPortfolioToken.tokens.length > 3) {
      this.closeDetailModalLiquidate();
      this.updatebasketqueueService.clearIndexQueue();
      this.updatebasketqueueService.clearQueue();
      this.updatebasketqueueService.setorderHash(this.selectedPortfolioToken.orderHash);
      this.updatebasketqueueService.setRemoveAsset(this.removeAssetList);
      this.updatebasketqueueService.generateQueue();
    } else {
      this.closeDetailModalLiquidate();
      this.neoService.liquidateBasket(this.selectedPortfolioToken.orderHash).then((res) => {
        if (res['response']['txid']) {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'liquidate Basket is submitted to Network please wait for confirmation'), MessageContentType.Text);
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        } else {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
        }
      });
    }

  };

  cancel(basket) {
    if (this.trackCancel === false) {
      this.neoService.cancelBasketOrder(basket.orderHash).then((res) => {
        if (res['response']['txid']) {
          this.trackCancel = true;
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        } else {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
        }
      });
    }
  };

  rebublish(basket, status) {
    if (status === 'publish') {
      this.neoService.setBasketUpdateStatus('publish');
    } else {
      this.neoService.setBasketUpdateStatus('edit');
    }
    console.log('reblush', basket);
    this.neoService.setBasket(basket);
    this.setVisibleTabs('create-portfolio');
  }

  setVisibleTabs(tabName: string) {
    this.visibleTab = tabName;
  }

  isTabVisible(tabName: string): boolean {
    return this.visibleTab === tabName;
  }

  activeTabBtn(tab) {
    this.activeTabs = tab;
  }

  cleardata() {
    this.neoService.setBasket(undefined);
  }

  bashketDetail(basket) {
    this.selectedPortfolioToken = basket;
    this.bashketDetailModal = true;
  }

  bashketDetailLiquidate(basket) {
    this.selectedPortfolioToken = basket;
    this.bashketDetailModalliquidate = true;
  }

  liquidateBashketDetail(basket) {
    console.log('basket', basket);
    this.selectedPortfolioToken = basket;
    if (this.selectedPortfolioToken.tokens.length > 3) {
      // console.log(_.rest(this.selectedPortfolioToken.tokens, [3]));
      this.removeAssetList = _.rest(this.selectedPortfolioToken.tokens, [3]);
    }
    this.bashketDetailModal = true;
  }

  closeDetailModal() {
    this.bashketDetailModal = false;
  }

  closeDetailModalLiquidate() {
    this.bashketDetailModalliquidate = false;
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        this.getBasketOrder(1);
        this.getAllBasketOrder();
        if (this.trackCancel === true) {
          this.trackCancel = false;
        }
        this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 5000);
  }

  getBasketOrder(orderStatus) {
    let basketOrders = [];
    let canceledBasketOrders = [];
    let headers = new Headers({
      'content-type': 'application/json',
    });
    let requestOptions = new RequestOptions({headers: headers});
    var query = {
      ownerAddress: this.neoService.reverseHex(this.neoService.getCurrentUserScripthash()),
      'eventName': 'basketOrder',
      orderStatus: orderStatus
    };
    this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json();
          if (d.data.length > 0) {
            d.data.map((key, value) => {
              let tmp = {};
              let tokens = [];
              tmp['basketName'] = this.neoService.getNeon().u.hexstring2str(key.payload.basketName);
              tmp['askingPrice'] = key.payload.wantAmount / 100000000;
              tmp['orderHash'] = key.payload.orderHash;
              tmp['orderStatus'] = key.payload.orderStatus;
              tmp['ownerAddress'] = this.neoService.getNeon().u.reverseHex(key.payload.ownerAddress);
              if (this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId) === Constants.NEO_GAS_ASSET_ID) {
                tmp['askingToken'] = 'GAS';
              } else if (this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId) === Constants.NEO_ASSET_ID) {
                tmp['askingToken'] = 'NEO';
              } else {
                tmp['askingToken'] = this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId))[0].symbol;
              }
              key.payload.offerAssetIds.map((k, v) => {
                key.payload.offerAmounts.map((k2, v2) => {
                  let amt;
                  if (v === v2) {
                    if (parseInt(k2) < 100) {
                      amt = k2;
                    } else {
                      amt = k2 / 100000000;
                    }
                    tokens.push({
                      'address': this.neoService.getNeon().u.reverseHex(k),
                      'value': amt,
                      'name': this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(k))[0].symbol
                    });
                  }
                });
              });
              tmp['tokens'] = tokens;
              basketOrders.push(tmp);
              if (orderStatus === 1) {
                this.basketOrders = basketOrders;
              } else {
                this.canceledBasketOrders = basketOrders;
              }
              //console.log('this.basketOrders', this.basketOrders, this.accountAddress);
            });
          }
        },
      );
  }

  getAllBasketOrder() {
    this.sellBasketOrders = [];
    let headers = new Headers({
      'content-type': 'application/json',
    });
    let requestOptions = new RequestOptions({headers: headers});
    var query = {
      'eventName': 'basketOrder',
      orderStatus: 1
    };
    this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json();
          let orders = d.data.filter((key) => key.payload.ownerAddress !== this.neoService.reverseHex(this.neoService.getCurrentUserScripthash()));
          setTimeout(() => {
            if (orders.length > 0) {
              orders.map((key, value) => {
                let tmp = {};
                let tokens = [];
                tmp['basketName'] = this.neoService.getNeon().u.hexstring2str(key.payload.basketName);
                tmp['askingPrice'] = key.payload.wantAmount / 100000000;
                tmp['orderHash'] = key.payload.orderHash;
                tmp['orderStatus'] = key.payload.orderStatus;
                tmp['ownerAddress'] = this.neoService.getNeon().u.reverseHex(key.payload.ownerAddress);
                if (this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId) === Constants.NEO_GAS_ASSET_ID) {
                  tmp['askingToken'] = 'GAS';
                } else if (this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId) === Constants.NEO_ASSET_ID) {
                  tmp['askingToken'] = 'NEO';
                } else {
                  tmp['askingToken'] = this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(key.payload.wantAssetId))[0].symbol;
                }
                key.payload.offerAssetIds.map((k, v) => {
                  key.payload.offerAmounts.map((k2, v2) => {
                    let amt;
                    if (v === v2) {
                      if (parseInt(k2) < 100) {
                        amt = k2;
                      } else {
                        amt = k2 / 100000000;
                      }
                      tokens.push({
                        'address': this.neoService.getNeon().u.reverseHex(k),
                        'value': amt,
                        'name': this.tokenList.filter((token) => token.address === this.neoService.getNeon().u.reverseHex(k))[0].symbol
                      });
                    }
                  });
                });
                tmp['tokens'] = tokens;
                this.sellBasketOrders.push(tmp);
                this.sellBasketOrdersFilered = _.uniq(this.sellBasketOrders, 'orderHash');
                // console.log('this.sellBasketOrders', this.sellBasketOrders, this.accountAddress);
              });
            } else {
              this.sellBasketOrdersFilered = [];
            }
          }, 1500);

        },
      );
  }

  private refresh() {
    if (this.refreshTimer)
      clearTimeout(this.refreshTimer);
    this.getBasketOrder(1);
    this.getBasketOrder(2);
    this.getAllBasketOrder();
    this.refreshTimer = setTimeout(() => {
      this.refresh();
    }, 10000);
  }



  // Changes for 12th Feb Impl
  showBuyPortfolioModal(index: number, selectedBuyPorfolio, flag) {
    alert('called');
    if (flag === 'myBasket') {
      this.myBasketModal = true;
    } else {
      this.myBasketModal = false;
    }
    console.log('got data', selectedBuyPorfolio);
    this.shouldShowBuyPortfolioModal = true;
    this.selectedBuyPorfolioIndex = index;
    /* for quote verification */
    if (selectedBuyPorfolio.owner === this.neoService.getAccountAddress()) {
      this.trackBuyButton = false;
    } else {
      this.trackBuyButton = true;
    }
    this.selectedBuyAblePorfolio = {
      portfolio: selectedBuyPorfolio,
      filteredAssets: [],
      totalVolume: 0,
      twenty4Volume: 0,
      twenty4High: 0,
      twenty4Low: 0,
      totalTokens: 0,
      symbolsMap: {},
      currentTokenPrices: {}
    };
    this.amChartPieData = [];
    this.totalTokens = 0;
    let filteredAssets = selectedBuyPorfolio['tokens'].filter(function (it, i) {
      return parseFloat(it.value) != 0;
    });
    selectedBuyPorfolio['tokens'].map((key) => {
      this.totalTokens += parseInt(key.value);
      console.log('token', this.totalTokens);
    });
    this.selectedBuyAblePorfolio.totalTokens = this.totalTokens;
    this.selectedBuyAblePorfolio.filteredAssets = filteredAssets;
    this.formatAssetInformation();
    this.updatePieChart();
    this.updateAssetPrices();
  }

  formatAssetInformation() {
    // we create totals and asset map and format data for pie chart
    let totalTokens = 0;
    let useThemeColor = false;
    if (this.selectedBuyAblePorfolio.filteredAssets.length == 1)
      useThemeColor = true;
    this.selectedBuyAblePorfolio.filteredAssets.forEach((it, i) => {
      this.selectedBuyAblePorfolio.symbolsMap[it.name] = it;
      this.selectedBuyAblePorfolio.totalTokens += it.value;
      let data = {
        symbol: it.name,
        tokenName: it.name,
        tokenQty: it.value
      };
      if (useThemeColor)
        data['color'] = this.themeColor;
      this.amChartPieData.push(data);
    });
  }

  updatePieChart() {
    this.amChartPieOptions = {
      'type': 'pie',
      'theme': this.darkTheme,
      'dataProvider': [],
      'titleField': 'tokenName',
      'valueField': 'tokenQty',
      'colorField': this.color,
      'labelRadius': 0,
      'balloon': {
        'fixedPosition': true
      },
      'innerRadius': '60%',
      'export': {
        'enabled': true
      },
      autoMargins: false,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      pullOutRadius: 0,
    };

    setTimeout(() => {
      this.amChartPie = this.AmCharts.makeChart('piechartdiv', this.amChartPieOptions);
      this.AmCharts.updateChart(this.amChartPie, () => {
        // Change whatever properties you want
        this.amChartPie.dataProvider = this.amChartPieData;
        // get the colors for legend
        if (this.amChartPieData.length == 1) {
          let symbol = this.amChartPieData[0]['symbol'];
          this.amChartPieLegendMap[symbol] = this.themeColor;
          if (this.switchThemeService.getCuurentTheme) {
          } else {
            this.amChartPieLegendMap[symbol] = this.themeColor;
          }
        } else {
          this.amChartPieData.forEach((it, i) => {
            let symbol = it['symbol'];
            this.amChartPieLegendMap[symbol] = this.amChartPie.colors[i];
          });
        }
      });
    }, 100);

  }

  updateAssetPrices() {
    if (!Object.keys(this.selectedBuyAblePorfolio.symbolsMap).length)
      return;
    let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
    this.portfolioAssetsService.getMultiCurrent(this.toSymbols.join(','), symbolList.join(',')).subscribe((res) => this.updateMultiCurrent(res));
    this.portfolioAssetsService.getMultiTwenty4(symbolList).subscribe((res) => this.updateTwenty4Assets(res));
    this.setStockTF(this.stockTF);
  }

  updateMultiCurrent(data) {
    this.selectedBuyAblePorfolio.currentTokenPrices = data;
  }

  updateTwenty4Assets(data) {
    if (data.length) {
      let totalVolume = 0;
      let totalHigh = 0;
      let totalLow = 0;
      let totalTokens = 0;
      let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
      data.forEach((it, i) => {
        if (this.selectedBuyAblePorfolio.symbolsMap[it.tokenid]) {
          let asset = this.selectedBuyAblePorfolio.symbolsMap[it.tokenid];
          let ohclv = it.ohclv;
          if(ohclv){
            totalVolume += asset.Reqbalance * ohclv.volumeto;
            totalHigh += asset.Reqbalance * ohclv.high;
            totalLow += asset.Reqbalance * ohclv.low;
          }
        }
      });
      if (this.selectedBuyAblePorfolio.totalTokens)
        this.selectedBuyAblePorfolio.totalVolume = totalVolume / this.selectedBuyAblePorfolio.totalTokens;
      this.selectedBuyAblePorfolio.twenty4Volume = totalVolume;
      this.selectedBuyAblePorfolio.twenty4High = totalHigh / this.selectedBuyAblePorfolio.totalTokens;
      this.selectedBuyAblePorfolio.twenty4Low = totalLow / this.selectedBuyAblePorfolio.totalTokens;
    }
  }

  updateStockChart(dataList) {
    this.amChartStockOptions = {
      'type': 'stock',
      'theme': this.darkTheme,
      'dataSets': [],
      autoMargins: false,
      'panels': [{
        'showCategoryAxis': false,
        'title': 'Value',
        recalculateToPercents: false,
        'percentHeight': 50,
        'stockGraphs': [{
          'id': 'g1',
          'valueField': 'value',
          'comparable': true,
          'fillColors': 'red',
          'compareField': 'value',
          'balloonText': '[[title]]:<b>[[value]]</b>',
          'compareGraphBalloonText': '[[title]]:<b>[[value]]</b>',
          type: 'line'
        }],
        'stockLegend': {
          'periodValueTextComparing': '[[percents.value.close]]%',
          'periodValueTextRegular': '[[value.close]]'
        }
      }],
      'chartScrollbarSettings': {
        'enabled': true,
        'backgroundColor': this.backgroundColor,
        'backgroundAlpha': 1,
        'fontSize': 15,
        'color': this.color,
        'graph': 'g1'
      },
      'chartCursorSettings': {
        'valueBalloonsEnabled': false,
        'fullWidth': true,
        'cursorAlpha': 0.1,
        'valueLineBalloonEnabled': true,
        'valueLineEnabled': true,
        'valueLineAlpha': 0.5
      },
    };
    this.amChartStock = this.AmCharts.makeChart('stockchartdiv', this.amChartStockOptions);
    let dataSets = [];
    let portfolioProvider = new Array(dataList[0].ohclvList.length);
    dataList.forEach((it, i) => {
      let dataProvider = [];
      var symbolsMap = this.selectedBuyAblePorfolio.symbolsMap;
      it.ohclvList.forEach((jt, j) => {
        dataProvider.push({
          'date': new Date(jt.time * 1000),
          'value': jt.close,
        });
        if (!portfolioProvider[j]) {
          portfolioProvider[j] = {
            'date': new Date(jt.time * 1000),
            'value': 0,
          };
        }
        // taking percent value of the coin
        portfolioProvider[j]['value'] += (jt.close * symbolsMap[it['tokenid']].Reqbalance) / this.selectedBuyAblePorfolio.totalTokens;
      });
      dataSets.push({
        'title': it.tokenid,
        'fieldMappings': [{
          'fromField': 'value',
          'toField': 'value'
        }],
        'categoryField': 'date',
        'dataProvider': dataProvider,
        compared: true
      });
    });
    // make precision
    portfolioProvider.forEach((it, i) => {
      it.value = parseFloat(it.value.toFixed(6));
    });
    dataSets.push({
      'title': this.selectedBuyAblePorfolio.portfolio.PortfolioName,
      'fieldMappings': [{
        'fromField': 'value',
        'toField': 'value'
      }],
      'categoryField': 'date',
      'dataProvider': portfolioProvider,
      'color': '#672482',
      compared: true

    });
    this.AmCharts.updateChart(this.amChartStock, () => {
      this.amChartStock.dataSets = dataSets;
      this.amChartStock.categoryAxesSettings.minPeriod = this.stockTF;
    });
  }

  setStockTF(stockTF: string) {
    this.stockTF = stockTF;
    let symbolList = Object.keys(this.selectedBuyAblePorfolio.symbolsMap);
    if (this.stockTF == 'mm') {
      this.portfolioAssetsService.getHistoMinute(symbolList)
        .subscribe((res) => this.updateStockChart(res));
    } else if (this.stockTF == 'hh') {
      this.portfolioAssetsService.getHistoHour(symbolList)
        .subscribe((res) => this.updateStockChart(res));
    }
    if (this.stockTF == 'DD') {
      this.portfolioAssetsService.getHistoDay(symbolList)
        .subscribe((res) => this.updateStockChart(res));
    }
  }

  isStockTF(stockTF: string) {
    return this.stockTF === stockTF;
  }

  getAssetValue(asset, type) {
    if (!Object.keys(this.selectedBuyAblePorfolio.currentTokenPrices).length)
      return 0;
    let fromPrice = this.selectedBuyAblePorfolio.currentTokenPrices[asset.symbol];
    if (!fromPrice)
      return 0;
    return parseFloat(asset.value) * fromPrice[type];
  }

  getTotalPorfolioValue(type) {
    let total = 0;
    if (!Object.keys(this.selectedBuyAblePorfolio.currentTokenPrices).length)
      return 0;
    this.selectedBuyAblePorfolio.filteredAssets.forEach((it, i) => {
      let fromPrice = this.selectedBuyAblePorfolio.currentTokenPrices[it.symbol];
      if (fromPrice)
        total += parseFloat(it.value) * fromPrice[type];
    });
    return total;

  }

  getTotalAssetBalance() {
    if (!this.selectedBuyAblePorfolio.totalTokens)
      return 0;
    if (this.selectedBuyAblePorfolio.totalTokens == 1)
      return '1 Token';
    return this.selectedBuyAblePorfolio.totalTokens + ' Tokens';
  }

  getPieLegendColor(symbol) {
    if (this.amChartPieLegendMap && this.amChartPieLegendMap[symbol])
      return this.amChartPieLegendMap[symbol];
    return 'white';
  }

  hideBuyPorfolioModal() {
    this.shouldShowBuyPortfolioModal = false;
    this.amChartPieLegendMap = {};
    if (this.amChartPie) {
      this.AmCharts.destroyChart(this.amChartPie);
      this.amChartPie = null;
    }
    // need to unsubscribe from observables
  }

  getAddressUrl() {
    return Constants.AddressAppnetURL;
  }

}
