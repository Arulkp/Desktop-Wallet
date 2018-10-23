import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router, ActivatedRoute} from '@angular/router';
import * as _ from 'underscore';
import {PortfolioService} from '../../services/portfolio.service';
import {Web3Service} from '../../services/web3.service';
import {NavigationService} from '../../services/nav.service';
import {OrdersService} from '../../services/orders.service';
import {PortfolioTransaction} from '../../models/portfolio-transaction.model';
import {TokenService} from '../../services/token.service';
import {SwitchThemeService} from '../../services/switch-theme.service';
import {ChartService} from '../../services/chart.service';
import {Constants} from '../../models/constants';

@Component({
  selector: 'app-basket-order',
  templateUrl: './basket-order.component.html',
  styleUrls: ['./basket-order.component.css']
})
export class BasketOrderComponent implements OnInit, OnDestroy {
  private ordersBoughtSubscription: Subscription;
  private ordersSoldSubscription: Subscription;
  private ordersQuotesSubscription: Subscription;
  private portfolioData: Subscription;
  visibleTab: number = 0;
  title = 'Orders';
  currentBoughtOrders = [];
  currentSoldOrders = [];
  public portfolioDataFilered: Array<Object> = new Array<Object>();
;
  public portfolioDataFileredsellable: Array<Object> = new Array<Object>();
  currentQuotesOrders = [];
  showOrderLoader = true;
  usd: any;

  constructor(private portfolioService: PortfolioService,
              private navService: NavigationService,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
              private web3: Web3Service,
              private router: Router,
              private tokenService: TokenService,
              private chartService: ChartService,
              readonly switchThemeService: SwitchThemeService) {
    this.route.params.subscribe(params => {
      if (params['tab']) {
        if (params['tab'] === 'bought') {
          this.setVisibleTab(0);
        }
        if (params['tab'] === 'sold') {
          this.setVisibleTab(1);
        }
      }
    });
    this.ordersBoughtSubscription = this.ordersService.boughtOrders$.subscribe(data => this.handleBoughtOrderChange(data));
    this.ordersSoldSubscription = this.ordersService.soldOrders$.subscribe(data => this.handleSoldOrderChange(data));
    this.ordersQuotesSubscription = this.ordersService.quotesOrders$.subscribe(data => this.handleQuotesOrderChange(data));
    this.portfolioData = this.portfolioService.orderBookData$.subscribe(data => this.portfoliolistchange(data));
  }

  ngOnInit() {
    if (this.tokenService.getToken() === undefined) {
      this.tokenService.fetchToken();
    }
    else {
      //this.portfolioService.getPorfolioList(3);
      // this.ordersService.fetchAllOrderData({});
    }
    let __this = this;
    this.chartService.setUSD(function (err, result) {
      if (!err) {
        __this.usd = __this.chartService.getUSD();
      }
    });
  }

  ngOnDestroy(): void {
    this.ordersBoughtSubscription.unsubscribe();
    this.ordersSoldSubscription.unsubscribe();
    this.ordersQuotesSubscription.unsubscribe();
  }

  setVisibleTab(tabNumber: number) {
    this.visibleTab = tabNumber;
  }

  isTabVisible(tabNumber: number): boolean {
    return this.visibleTab === tabNumber;
  }

  handleBoughtOrderChange(data: Array<PortfolioTransaction>) {
    // this.showOrderLoader = false;
    if (data === undefined)
      return;
    //this.currentBoughtOrders = data;
  }

  handleSoldOrderChange(data: Array<PortfolioTransaction>) {
    //this.showOrderLoader = false;
    if (data === undefined)
      return;
    //this.currentSoldOrders = data;
  }

  handleQuotesOrderChange(data) {
    console.log('dataa', data);
    this.currentQuotesOrders = [];
    //this.showOrderLoader = false;
    if (data === undefined)
      return;
    data.map((key) => {
      if (key.Quotes[0] !== null) {
        let temp = key.Quotes[0];
        temp.Assets = key.Assets;
        temp.porfolioName = key.PortfolioName;
        temp.CurrentValuationInWand = key.CurrentValuationInWand;
        this.currentQuotesOrders.push(temp);
        console.log('got data', this.currentQuotesOrders);
      }
    });


  }

  getBoughtOrders(): Array<PortfolioTransaction> {
    return this.currentBoughtOrders;
  }

  getSoldOrders(): Array<PortfolioTransaction> {
    return this.currentSoldOrders;
  }

  getQuotesOrders(): Array<PortfolioTransaction> {
    return this.currentQuotesOrders;
  }

  getAddressUrl(): string {
    return Constants.AddressAppnetURL;
  }

  getTransactionUrl(): string {
    return Constants.TxAppnetURL;
  }

  portfoliolistchange(data) {
    if (data) {
      let web3Instance = this.web3.getWeb3();
      this.showOrderLoader = false;
      console.log('data', data);
      this.currentBoughtOrders = _.filter(data, function (key) {
        return key['owner'] !== web3Instance.eth.defaultAccount && key['currentOwnerOrSeller'] === web3Instance.eth.defaultAccount;
      });
      this.currentSoldOrders = _.filter(data, function (key) {
        return key['owner'] === web3Instance.eth.defaultAccount && key['currentOwnerOrSeller'] !== web3Instance.eth.defaultAccount;
      });
    }
  }
}
