import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {AmChartsService, AmChart} from '@amcharts/amcharts3-angular';
import {ChartService} from '../../services/chart.service';
import {Subscription} from 'rxjs/Subscription';
import { SwitchThemeService } from '../../services/switch-theme.service';
import { SwitchGraphService } from '../../services/switch-graph.service';

@Component({
  selector: 'detail-chart',
  templateUrl: './detail-chart.component.html',
  styleUrls: ['./detail-chart.component.css']
})
export class DetailChartComponent implements OnInit {
	public chart: AmChart;
  chartData1 = [];
  subscription: Subscription;
  public tokenName: any;
  data: any;
  theme:any;
  chartSubscription:Subscription;
  graphSubscription:Subscription;
  dataAvailable: boolean = false;
  changeGraph:any;

  constructor(private AmCharts: AmChartsService, private chartservice: ChartService,
  private switchThemeService:SwitchThemeService, readonly switchGraph:SwitchGraphService) {
    this.graphSubscription = this.switchGraph.getGraph().subscribe(message=>{
      this.changeGraph = message.graph;
      if(this.changeGraph === false){
        this.ngAfterViewInit();
      }else{
        this.ngAfterViewInit();
      }
    })
  }

  ngOnInit() {
    console.log("Detail component initialized");
  }

  ngAfterViewInit(){
    console.log("Detail component view initialized");
    this.chartSubscription = this.switchThemeService.getTheme().subscribe(message => {
      this.theme = message;
      if(this.theme.theme === true){
        this.generateDarkChart();
      }else{
        this.generateChart();
      }
    });
    this.getDetailChartData();
    this.chartservice.getMinData(this.tokenName);
  }

  getDetailChartData() {
    this.subscription = this.chartservice.chartDataDetail$.subscribe(
      item => {
        this.data = item;
        this.generateAdvanceChartData();
      });
    this.subscription = this.chartservice.tokenName$.subscribe(
      item => {
        this.tokenName = item;
      }
    );
  }

  generateChart() {
    if(!this.dataAvailable)
      return;
    this.chart = this.AmCharts.makeChart('detailDiv', {
      "type": "stock",
      "theme": "dark",
      'categoryAxesSettings': {
        'minPeriod': 'ss'
      },
      "balloon": {
        "fixedPosition": true
      },
      "dataSets": [{
        'title': this.tokenName,
        "fieldMappings": [{
          "fromField": "open",
          "toField": "open"
        }, {
          "fromField": "close",
          "toField": "close"
        }, {
          "fromField": "high",
          "toField": "high"
        }, {
          "fromField": "low",
          "toField": "low"
        }, {
          "fromField": "volume",
          "toField": "volume"
        }],
        "dataProvider": this.chartData1,
        "categoryField": "date"
      }],
      "panels": [{
        "title": "Value",
        "showCategoryAxis": false,
        'categoryAxis': {
          'gridThickness': 0
        },
        "percentHeight": 70,
        "stockGraphs": [{
          "type": "candlestick",
          "id": "g1",
          "openField": "open",
          "closeField": "low",
          "highField": "high",
          "lowField": "close",
          "valueField": "high",
          "lineColor": "white",
          "fillColors": "white",
          "negativeLineColor": "white",
          "negativeFillColors": "white",
          "fillAlphas": 1,
          "useDataSetColors": false,
          "comparable": true,
          "compareField": "high",
          "showBalloon": true,
          "proCandlesticks": true,
          "balloonText": "open:<b>[[open]]</b> close:<b>[[close]]</b><br>low:<b>[[low]]</b> high:<b>[[high]]</b>",
        }],

        "stockLegend": {
          "valueTextRegular": undefined,
          "periodValueTextComparing": "[[percents.value.close]]%"
        },
        'categoryAxesSettings': {
          'minPeriod': 'MM'
        },
      },

        {
          "title": "Volume",
          'percentHeight': 45,
          'marginLeft': 10,
          'columnWidth': 0.4,
          'categoryAxis': {
            'gridThickness': 0
          },
          "stockGraphs": [{
            "valueField": "volume",
            "type": "column",
            "showBalloon": true,
            "fillAlphas": 1,
            'lineColor': 'white',
            'fillColors': 'white',
            'negativeLineColor': 'white',
            'negativeFillColors': 'white',
            'useDataSetColors': false,
          }],

          "stockLegend": {
            "markerType": "none",
            "markerSize": 0,
            "labelText": "",
            "periodValueTextRegular": "[[value.close]]"
          }
        }
      ],
      "chartScrollbarSettings": {
        "graph": "g1",
      },
      "chartCursorSettings": {
        "valueLineBalloonEnabled": true,
        "valueLineEnabled": true
      },
      'valueAxesSettings':{
        "inside":false,
      },
    "panelsSettings": {
    "marginLeft":60,
    "marginTop": 5,
    "marginBottom": 5,
    "marginRight" : 60
      },
    })
  };
  generateDarkChart() {
    if(!this.dataAvailable)
      return;
    this.chart = this.AmCharts.makeChart('detailDiv', {
      "type": "stock",
      "theme": "dark",
      'categoryAxesSettings': {
        'minPeriod': 'ss'
      },
      "dataSets": [{
        'title': this.tokenName,
        "fieldMappings": [{
          "fromField": "open",
          "toField": "open"
        }, {
          "fromField": "close",
          "toField": "close"
        }, {
          "fromField": "high",
          "toField": "high"
        }, {
          "fromField": "low",
          "toField": "low"
        }, {
          "fromField": "volume",
          "toField": "volume"
        }],
        "dataProvider": this.chartData1,
        "categoryField": "date"
      }],
      "panels": [{
        "title": "Value",
        "showCategoryAxis": false,
        'categoryAxis': {
          'gridThickness': 0
        },
        "percentHeight": 70,
        "stockGraphs": [{
          "type": "candlestick",
          "id": "g1",
          "openField": "open",
          "closeField": "low",
          "highField": "high",
          "lowField": "close",
          "valueField": "high",
          "lineColor": "white",
          "fillColors": "white",
          "negativeLineColor": "white",
          "negativeFillColors": "white",
          "fillAlphas": 1,
          "useDataSetColors": false,
          "comparable": true,
          "compareField": "high",
          "showBalloon": true,
          "proCandlesticks": true,
          "balloonText": "open:<b>[[open]]</b><br>close:<b>[[close]]</b><br>low:<b>[[low]]</b><br>high:<b>[[high]]</b>",
        }],

        "stockLegend": {
          "valueTextRegular": undefined,
          "periodValueTextComparing": "[[percents.value.close]]%"
        },
        'categoryAxesSettings': {
          'minPeriod': 'MM'
        },
      },

        {
          "title": "Volume",
          'percentHeight': 35,
          'marginLeft': 10,
          'columnWidth': 0.4,
          'categoryAxis': {
            'gridThickness': 0
          },
          "stockGraphs": [{
            "valueField": "volume",
            "type": "column",
            "showBalloon": true,
            "fillAlphas": 1,
            'lineColor': 'white',
            'fillColors': 'white',
            'negativeLineColor': 'white',
            'negativeFillColors': 'white',
            'useDataSetColors': false,
          }],

          "stockLegend": {
            "markerType": "none",
            "markerSize": 0,
            "labelText": "",
            "periodValueTextRegular": "[[value.close]]"
          }
        }
      ],
      "chartScrollbarSettings": {
        "graph": "g1",
      },
      "chartCursorSettings": {
        "valueLineBalloonEnabled": true,
        "valueLineEnabled": true
      },
      'valueAxesSettings':{
        "inside":false,
      },
    "panelsSettings": {
    "marginLeft":60,
    "marginTop": 5,
    "marginBottom": 5
      },
    })
  };

  generateAdvanceChartData() {
    if (this.data && this.data.length > 0) {
      this.dataAvailable = true;
      this.chartData1 = [];
      let temp = this.data;
      let finalLength = this.data.length;
      
      for (let i = 0; i < temp.length; i++) {
        if(temp[i].hasOwnProperty("volumefrom")){
          this.chartData1.push({
            'date': new Date(temp[i].time * 1000),
            'open': temp[i].open,
            'close': temp[i].close,
            'high': temp[i].high,
            'low': temp[i].low,
            "value": temp[i].close,
            "volume": temp[i].volumefrom,
          });
        }else{
          this.chartData1.push({
            'date': new Date(temp[i].time * 1000),
            'open': temp[i].open,
            'close': temp[i].close,
            'high': temp[i].high,
            'low': temp[i].low,
            'value': temp[i].close,
            'volume': temp[i].open
          });
          console.log(this.chartData1);
        }
        if (finalLength === this.chartData1.length) {
          console.log("finla array",this.chartData1)
          if(this.switchThemeService.getCuurentTheme() === true){
            this.generateDarkChart();
          }else{
          this.generateChart();            
          }
        }
      }
    }
    else{
      console.log("No chart data available");
      this.dataAvailable = false;
    }
  }

  ngOnDestroy() {

  }
}
