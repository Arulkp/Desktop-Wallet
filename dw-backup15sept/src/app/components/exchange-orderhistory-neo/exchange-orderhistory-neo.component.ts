import { Component, OnInit, NgZone } from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service'
import {MarketBroadcastService} from '../../services/market-broadcast.service'
import {NeoService} from '../../services/neo.service';
import {Constants} from '../../models/constants';
import {Headers, Http, RequestOptions} from '@angular/http';


@Component({
  selector: 'exchange-orderhistory-neo',
  templateUrl: './exchange-orderhistory-neo.component.html',
  styleUrls: ['./exchange-orderhistory-neo.component.css']
})
export class ExchangeOrderhistoryNeoComponent implements OnInit {

  showSpinner: boolean = true;

  private completedSellOrder : any = new Array<any>();
  private cancelledSellOrder : any = new Array<any>();
  private completedBuyOrder : any = new Array<any>();
  private cancelledBuyOrder : any = new Array<any>();
	public selectedTokenAddress : any;
	public selectedToken : any;
	public selectedExchange : any;
	public selectedOfferTokenAddress : any;
	public selectedOfferToken : any;
	public selectedWallet : any;
  public orders : any;
  public selectedAccount : any;
  public refreshTimer : any;
  private marketBroadcastServiceSub : any;
  private savedWalletsServiceSub : any;

  constructor(
		private savedWalletsService : SavedWalletsService,
		private marketBroadcastService : MarketBroadcastService,
		private neoService: NeoService,
    private http : Http,
    private zone : NgZone

  ) { }

  ngOnInit() {
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
      	var shouldRefresh = this.marketBroadcastService.getSelectedMarket() != this.selectedOfferTokenAddress
      		|| this.marketBroadcastService.getSelectedPlatformToken != this.selectedTokenAddress
      	this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken()
        this.selectedTokenAddress = this.selectedToken ? this.selectedToken.address : null
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange()
        this.selectedOfferToken = this.marketBroadcastService.getSelectedMarket()
        this.selectedOfferTokenAddress = this.selectedOfferToken ? this.selectedOfferToken.address : null
				if (this.selectedAccount && this.selectedAccount.exchange == 'neo') {
          this.cleanRefresh()
        }
      }
    })
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe(status => {
    	if (status == 'currentWalletChanged') {
    		this.selectedAccount = this.savedWalletsService.getCurrentWallet()
        if (this.selectedAccount && this.selectedAccount.exchange == 'neo') {
          this.cleanRefresh()
        }
    	}
    })

  }
  ngOnDestroy() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = 0;
    this.marketBroadcastServiceSub.unsubscribe()
    this.savedWalletsServiceSub.unsubscribe()
  }
  cleanRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refresh()
    this.initiateAutoRefresh()
  }
  private initiateAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      return
    }

    this.refreshTimer = setTimeout(() => {
      this.refresh();
      this.initiateAutoRefresh();
    }, 30000);
  }

  private refresh() {
    if (!this.selectedToken || !this.selectedAccount)
      return
    this.getCompletedSellOrder().then(res => {
      this.completedSellOrder = res['data']
      this.getUserOrders()
    })
    this.getCancelledSellOrder().then(res => {
      this.cancelledSellOrder = res['data']
      this.getUserOrders()
    })
    this.getCompletedBuyOrder().then(res => {
      this.completedBuyOrder = res['data']
      this.getUserOrders()
    })
    this.getCancelledBuyOrder().then(res => {
      this.cancelledBuyOrder = res['data']
      this.getUserOrders()
    })
  }

  getCompletedSellOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress : this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId : this.neoService.reverseHex(this.selectedTokenAddress),
        wantAssetId : this.neoService.reverseHex(this.selectedOfferTokenAddress),
        eventName: "fulfilledSingleOrder",
      }
      this.http.post(Constants.NEO_SERVER_URL,{query} , requestOptions)
      .subscribe(
        res => {
          var d = res.json()
          resolve({data : d.data})
        },
        err => {
          reject(err)
        }
      )
    });
  }
  getCancelledSellOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress : this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId : this.neoService.reverseHex(this.selectedTokenAddress),
        wantAssetId : this.neoService.reverseHex(this.selectedOfferTokenAddress),
        eventName: "singleOrder",
        status : -1
      }
      this.http.post(Constants.NEO_SERVER_URL,{query} , requestOptions)
      .subscribe(
        res => {
          var d = res.json()
          resolve({data : d.data})
        },
        err => {
          reject(err)
        }
      )
    });
  }
  getCompletedBuyOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress : this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId : this.neoService.reverseHex(this.selectedOfferTokenAddress),
        wantAssetId : this.neoService.reverseHex(this.selectedTokenAddress),
        "eventName": "fulfilledSingleOrder",
      }
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json()
          resolve({data : d.data})
        },
        err => {
          reject(err)
        }
      )
    });
  }
  getCancelledBuyOrder() {
    return new Promise((resolve, reject) => {
      if (!this.selectedTokenAddress || !this.selectedOfferTokenAddress || !this.selectedAccount) {
        return resolve({data: []});
      }
      let headers = new Headers({
        'content-type': 'application/json',
      });
      let requestOptions = new RequestOptions({headers: headers});
      var query = {
        sellerAddress : this.neoService.reverseHex(this.selectedAccount.getAccountAddress()),
        offerAssetId : this.neoService.reverseHex(this.selectedOfferTokenAddress),
        wantAssetId : this.neoService.reverseHex(this.selectedTokenAddress),
        "eventName": "singleOrder",
        status : -1
      }
      this.http.post(Constants.NEO_SERVER_URL, {query}, requestOptions)
      .subscribe(
        res => {
          var d = res.json()
          resolve({data : d.data})
        },
        err => {
          reject(err)
        }
      )
    });
  }

  getUserOrders() {
    if (!this.selectedTokenAddress)
      return;

    var completedSellOrder = this.completedSellOrder.map(it => {
      return {
        offerAmount : it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount : it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type : 'Sell',
        status : 'Completed'
      }
    })
    var cancelledSellOrder = this.cancelledSellOrder.map(it => {
      return {
        offerAmount : it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount : it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type : 'Sell',
        status : 'Cancelled'
      }
    })
    var completedBuyOrder = this.completedBuyOrder.map(it => {
      return {
        offerAmount : it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount : it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type : 'Buy',
        status : 'Completed'
      }
    })
    var cancelledBuyOrder = this.cancelledBuyOrder.map(it => {
      return {
        offerAmount : it.payload.offerAmount ? it.payload.offerAmount / 100000000 : it.payload.offeramount / 100000000,
        wantAmount : it.payload.wantAmount ? it.payload.wantAmount / 100000000 : it.payload.wantamount / 100000000,
        type : 'Buy',
        status : 'Cancelled'
      }
    })
    let orders = completedSellOrder
                .concat(cancelledSellOrder)
                .concat(completedBuyOrder)
                .concat(cancelledBuyOrder)

    this.showSpinner=false;
    this.orders = orders

  }

}
