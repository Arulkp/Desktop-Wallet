import { Component, OnInit, Input } from '@angular/core';
import {ChartService} from '../../services/chart.service';
import {Subscription} from 'rxjs/Subscription';
import {PlatformTokenService} from '../../services/platform-token.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service'

@Component({
  selector: 'exchange-graph',
  templateUrl: './exchange-graph.component.html',
  styleUrls: ['./exchange-graph.component.css']
})
export class ExchangeGraphComponent implements OnInit {

  @Input() exchange : any;
  public selectedMarket : any;
	private selectedPlatformToken : any;
	public currentPrice: any;
	public lowPrice: any;
	public highPrice: any;
	public activeBtn: string;
	public tokenSelected : string;
  public subscription : Subscription;
  public selectedToken : any;
	public usd: number = 0.0;
	public tracKGraph: string = 'line';
  private savedWalletsServiceSub : any;
  private marketBroadcastServiceSub : any;
  private subscription1 : any;
  private subscription2 : any;
  constructor(
  	private chartService : ChartService,
    private platformTokenService: PlatformTokenService,
    private marketBroadcastService : MarketBroadcastService,
  ) {
  	this.changeChart = this.changeChart.bind(this)
		this.getMinData = this.getMinData.bind(this)
		this.getHoursData = this.getHoursData.bind(this)
		this.getDayData = this.getDayData.bind(this)
  }

  ngOnInit() {
    // this.platformTokenService.selectedPlatformToken$.subscribe(selectedToken => {
    //   this.tokenSelected = selectedToken ? selectedToken.symbol : ''
    // })

    this.marketBroadcastServiceSub =  this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'changed') {
        this.selectedToken = this.marketBroadcastService.getSelectedPlatformToken()
        if (this.selectedToken) {
          this.tokenSelected = this.selectedToken ? this.selectedToken .symbol : ''
          this.changeChart('line')
        }
        this.selectedMarket = this.marketBroadcastService.getSelectedMarket()
        // this.refresh()
        // this.initiateAutoRefresh()
      }
    })
    this.chartService.setUSD((err, result) => {
      if (!err) {
        this.usd = this.chartService.getUSD();
      }
    });
    // this.refresh()
  }
  changeChart(type) {
    this.tracKGraph = type;
    this.getMinData();
    this.chartService.trackGraph(type);

  }
  getMinData() {
    this.subscription1 = this.chartService.tokenTodayPrice$.subscribe(
      item => {
        this.currentPrice = item;
      });
    this.subscription2 = this.chartService.tokenLowAndHighPrice$.subscribe(
      item => {
        if (item) {
          if (item['LOW24HOUR'] !== 0) {
            this.lowPrice = (1 / item['LOW24HOUR']).toFixed(4);
          }
          else {
            this.lowPrice = 0.0;
          }
          if (item['HIGH24HOUR'] !== 0) {
            this.highPrice = (1 / item['HIGH24HOUR']).toFixed(4);
          }
          else {
            this.highPrice = 0.0;
          }
        }
        else {
          this.lowPrice = 0.0;
          this.highPrice = 0.0;
        }
      });
    this.activeBtn = 'M';
    this.chartService.getMinData(this.tokenSelected);
    this.chartService.getTokenTodayPrice(this.tokenSelected);
    this.chartService.getTokenLowAndHighPrice(this.tokenSelected);
  }

  getHoursData() {
    this.activeBtn = 'D';
    this.chartService.getData(this.tokenSelected);
    this.chartService.getAdvanceData(this.tokenSelected);
    this.chartService.getTokenTodayPrice(this.tokenSelected);
    this.chartService.getTokenLowAndHighPrice(this.tokenSelected);
  }

  getDayData() {
    this.activeBtn = 'H';
    this.chartService.getDayData(this.tokenSelected);
    this.chartService.getTokenTodayPrice(this.tokenSelected);
    this.chartService.getTokenLowAndHighPrice(this.tokenSelected);
  }

  ngOnDestroy() {
    this.subscription1 ? this.subscription1.unsubscribe() : null
    this.subscription2 ? this.subscription2.unsubscribe() : null
    this.marketBroadcastServiceSub.unsubscribe()
  }

}
