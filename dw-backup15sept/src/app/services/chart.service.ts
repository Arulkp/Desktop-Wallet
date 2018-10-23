import {Injectable, Inject, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Http, RequestOptions, Headers} from '@angular/http';
import {NavigationService} from '../services/nav.service';
import { AuthService } from './auth.service';
import { SwitchGraphService } from '../services/switch-graph.service';
import { Subscription } from 'rxjs/Subscription';
import {reject} from 'q';
@Injectable()
export class ChartService {
  private temp: any;
  USD:any;
  private lowAndHigh: any;
  private selectedToken: any;
  private _tokenName = new BehaviorSubject<string>(null);
  private _chartData = new BehaviorSubject<Object>(null);
  private _chartDataDetail = new BehaviorSubject<Object>(null);
  private _AdvchartData = new BehaviorSubject<Object>(null);
  private _tokenTodayPrice = new BehaviorSubject<string>(null);
  private _tokenLowAndHighPrice = new BehaviorSubject<Object>(null);
  chartData$ = this._chartData.asObservable();
  advchartData$ = this._AdvchartData.asObservable();
  tokenTodayPrice$ = this._tokenTodayPrice.asObservable();
  tokenLowAndHighPrice$ = this._tokenLowAndHighPrice.asObservable();
  chartDataDetail$ = this._chartDataDetail.asObservable();
  tokenName$ = this._tokenName.asObservable();
  subscription: Subscription;
  private tokenData = [] ;
  private graph: string;
  public changeGraph:any;
  constructor(private http: Http, private navService: NavigationService, private auth: AuthService,
              readonly switchGraph : SwitchGraphService) {
    this.tokenData = [] ;
    this.switchGraph.getGraph().subscribe(message =>{
      this.changeGraph = message.graph;
    });
  }
  getData(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this._tokenName.next(token);
    if(this.changeGraph === undefined || this.changeGraph === true){
      var reqURL = 'https://min-api.cryptocompare.com/data/histohour?aggregate=6&e=CCCAGG&extraParams=CryptoCompare&fsym=' + token + '&limit=120&tryConversion=false&tsym=ETH';
    }else{
      var reqURL = "http://wandx-api.azurewebsites.net/api/trade/history/monthly/"+token;
    }
    return this.http.get(reqURL)
      .subscribe(
        data => {
          console.log("cuurent tab",this.navService.getCurrentActiveTab());
          if (this.navService.getCurrentActiveTab() === "dashboard") {
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            } else {
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }
            }
          }else {
            if(data.json().hasOwnProperty("data")){
              let finalData = data.json();
              let tempArray = finalData.data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray);
            }else{
              let finalData = data.json();
              let tempArray = finalData.Data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray);
            }
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            }else{
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }
            }
          }
        });
  }
  getDetailData(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this._tokenName.next(token);
    if(this.changeGraph === undefined || this.changeGraph === true){
      var reqURL = 'https://min-api.cryptocompare.com/data/histominute?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=' + token + '&limit=120&tryConversion=false&tsym=ETH';
    }else{
      var reqURL = "http://wandx-api.azurewebsites.net/api/trade/history/monthly/"+token;
    }
    return this.http.get(reqURL)
      .subscribe(
        data => {
          if(this.graph === 'candle'){
            if(data.json().hasOwnProperty("data")){
              let finalData = data.json();
              let tempArray = finalData.data;
              this._chartDataDetail.next(tempArray);
            }else{
              let finalData = data.json();
              let tempArray = finalData.Data;
              this._chartDataDetail.next(tempArray);
            }
          }
        });
  }
  getAdvanceData(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this._tokenName.next(token);
    if(this.changeGraph === undefined || this.changeGraph === true){
      var reqURL = 'https://min-api.cryptocompare.com/data/histohour?aggregate=6&e=CCCAGG&extraParams=CryptoCompare&fsym=' + token + '&limit=120&tryConversion=false&tsym=ETH';
    }else{
      var reqURL = "http://wandx-api.azurewebsites.net/api/trade/history/monthly/"+token;
    }
    return this.http.get(reqURL)
      .subscribe(
        data => {
          if(data.json().hasOwnProperty("data")){
            let finalData = data.json();
            let tempArray = finalData.data;
            this._AdvchartData.next(tempArray);
          }else{
            let finalData = data.json();
            let tempArray = finalData.Data;
            this._AdvchartData.next(tempArray);
          }

        });
  }

  getTokenTodayPrice(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this.selectedToken = token;
    this._tokenName.next(token);
    return this.http.get('https://min-api.cryptocompare.com/data/pricehistorical?fsym=' + token + '&tsyms=ETH&ts=' + new Date().getTime() + '&extraParams=WANDX')
      .subscribe(
        data => {
          this.temp = data.json();
          console.log("temp", this.temp[this.selectedToken]);
          if(this.temp[this.selectedToken]){
            this._tokenTodayPrice.next(this.temp[this.selectedToken].ETH.toFixed(4));
          }
          else{
            this._tokenTodayPrice.next((0.0).toFixed(4));
          }
        });
  }

  getTokenLowAndHighPrice(token: any,) {
    if(!this.auth.isAuthenticated())
      return;
    this.selectedToken = token;
    this._tokenName.next(token);
    console.log("called low high", token);
    return this.http.get('https://min-api.cryptocompare.com/data/pricemultifull?tsyms=' + token +'&fsyms=ETH')
      .subscribe(
        data => {
          if(data.json().RAW){
            this._tokenLowAndHighPrice.next(data.json().RAW.ETH[this.selectedToken]);
          }
          else{
            this._tokenLowAndHighPrice.next(0.0);
          }
        });
  }
  getMinData(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this._tokenName.next(token);
    if(this.changeGraph === undefined || this.changeGraph === true){
      var reqURL = 'https://min-api.cryptocompare.com/data/histominute?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=' + token + '&limit=120&tryConversion=false&tsym=ETH';
    }else{
      var reqURL = "http://wandx-api.azurewebsites.net/api/trade/history/monthly/"+token;
    }
    return this.http.get(reqURL)
      .subscribe(
        data => {
          if (this.navService.getCurrentActiveTab() === "dashboard") {
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            } else {
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }
            }
          }else {
            if(data.json().hasOwnProperty("data")){
              let finalData = data.json();
              let tempArray = finalData.data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray);
            }else{
              let finalData = data.json();
              let tempArray = finalData.Data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray);
            }
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            }else{
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }
            }
          }
        });
  }
  getDayData(token: any) {
    if(!this.auth.isAuthenticated())
      return;
    this._tokenName.next(token);
    if(this.changeGraph === undefined || this.changeGraph === true){
      var reqURL = 'https://min-api.cryptocompare.com/data/histominute?aggregate=6&e=CCCAGG&extraParams=CryptoCompare&fsym=' + token + '&limit=120&tryConversion=false&tsym=ETH';
    }else{
      var reqURL = "http://wandx-api.azurewebsites.net/api/trade/history/hourly/"+token;
    }
    return this.http.get(reqURL)
      .subscribe(
        data => {
          if (this.navService.getCurrentActiveTab() === "dashboard") {
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            }else{
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }
            }
          }else {
            if(data.json().hasOwnProperty("data")){
              let finalData = data.json();
              let tempArray = finalData.data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray);
            }else{
              let finalData = data.json();
              let tempArray = finalData.Data;
              this._chartData.next(tempArray);
              this._AdvchartData.next(tempArray)
            }
            if(this.graph === 'candle'){
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartDataDetail.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartDataDetail.next(tempArray);
              }
            }else{
              if(data.json().hasOwnProperty("data")){
                let finalData = data.json();
                let tempArray = finalData.data;
                this._chartData.next(tempArray);
              }else{
                let finalData = data.json();
                let tempArray = finalData.Data;
                this._chartData.next(tempArray);
              }

            }
          }
        });
  }
  getTokenData(token: any, value: any) {
    return this.http.get('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + token + '&tsyms=ETH')
      .subscribe(
        data => {
          if(!data.json().Data) {
            let tokens = data.json().RAW[token.toUpperCase()]['ETH'];
            if (tokens) {
              let temp = {};
              temp['FROMSYMBOL'] = tokens['FROMSYMBOL'];
              temp['PRICE'] = tokens['PRICE'];
              temp['VOLUME24HOUR'] = tokens['VOLUME24HOUR'];
              temp['HIGH24HOUR'] = tokens['HIGH24HOUR'];
              temp['LOW24HOUR'] = tokens['LOW24HOUR'];
              temp['MKTCAP'] = tokens['MKTCAP'];
              temp['CHANGE24HOUR'] = tokens['CHANGE24HOUR'];
              if(value===0){
                this.tokenData=[];
              }else{
                this.tokenData.push(temp);
                console.log("array", this.tokenData);
              }
            };
          } else {
            console.log("calles")
          }
        });
  }
  getAllTokenDetail() {
    return this.tokenData;
  }
  setUSD(callback) {
    if (!this.auth.isAuthenticated())
      return;
    return this.http.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
      .subscribe(
        data => {
          console.log("got USD", data.json().USD);
          this.USD = data.json().USD;
          callback(null,true)
        },err => {
          console.log("errror",err);
          callback(err,null)
        });
  }
  getUSD() {
    return this.USD;
  }
  trackTokenName(token) {
    this._tokenName.next(token);
  }
  trackGraph(type) {
    this.graph = type;
  }
  getUSDETHWAND(token, callback) {
    if (!this.auth.isAuthenticated())
      return;
    return this.http.get('https://min-api.cryptocompare.com/data/price?fsym=' + token + '&tsyms=ETH,USD,WAND')
      .subscribe(
        data => {
          callback(null, data.json())
        },err => {
          console.log("errror",err);
          callback(err,null)
        });
  }
  getTokenLowAndHighPriceOrderbook(token: any) {
    return new Promise((resolve, reject) => {
      if (!this.auth.isAuthenticated())
        return;
      return this.http.get('https://min-api.cryptocompare.com/data/pricemultifull?tsyms=' + token + '&fsyms=ETH')
        .subscribe(
          data => {
            if (data.json().RAW) {
              this._tokenLowAndHighPrice.next(data.json().RAW.ETH[token]);
              resolve(data.json().RAW.ETH[token]);
            }
            else {
              resolve(0.0);
            }
          });
    });
  }
  getTokenTodayPriceOrderBook(token: any) {
    return new Promise((resolve, reject) => {
      if (!this.auth.isAuthenticated())
        return;
      return this.http.get('https://min-api.cryptocompare.com/data/pricehistorical?fsym=' + token + '&tsyms=ETH&ts=' + new Date().getTime() + '&extraParams=WANDX')
        .subscribe(
          data => {
            this.temp = data.json();
            console.log("temp", this.temp[token]);
            if (this.temp[token]) {
              // this._tokenTodayPrice.next(this.temp[this.selectedToken].ETH.toFixed(4));
              resolve(this.temp[token].ETH.toFixed(4))
            }
            else {
              //this._tokenTodayPrice.next((0.0).toFixed(4));
              resolve((0.0).toFixed(4))
            }
          });
    });
  }
}
