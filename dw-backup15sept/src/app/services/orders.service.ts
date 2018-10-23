import {Injectable, Inject, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Http, RequestOptions, Headers} from '@angular/http';

import {PortfolioTransaction} from '../models/portfolio-transaction.model';
import {Constants} from '../models/constants';
import {MessageModel, MessageType, MessageContentType} from '../models/message.model';

import {NotificationManagerService} from '../services/notification-manager.service';
import {TokenService} from '../services/token.service';
import {Subscription} from 'rxjs';
import {AuthService} from './auth.service';
import {PortfolioService} from '../services/portfolio.service';
@Injectable()
export class OrdersService {
  private _boughtOrders = new BehaviorSubject<Array<PortfolioTransaction>>(undefined);
  public boughtOrders$ = this._boughtOrders.asObservable();
  private _soldOrders = new BehaviorSubject<Array<PortfolioTransaction>>(undefined);
  public soldOrders$ = this._soldOrders.asObservable();
  private _quotesOrders = new BehaviorSubject<Array<Object>>(undefined);
  public quotesOrders$ = this._quotesOrders.asObservable();
  private _currentBoughtOrders: Array<PortfolioTransaction>;
  private _currentSoldOrders: Array<PortfolioTransaction>;
  private _currentQuotesOrders = [];
  private tokenRenewalSubscription: Subscription;
  private fetchTimer;

  constructor(private http: Http, private portfolioService: PortfolioService,
              private notificationService: NotificationManagerService,
              private tokenService: TokenService, private auth: AuthService) {
    this._currentBoughtOrders = new Array<PortfolioTransaction>();
    this._currentSoldOrders = new Array<PortfolioTransaction>();
    this._currentQuotesOrders = [];
    this.tokenRenewalSubscription = this.tokenService.token$.subscribe(data => this.fetchAllOrderData(data));
  }

  getBoughtOrders() {
    if (!this.auth.isAuthenticated() || !this.tokenService.getToken())
      return;
    this._currentBoughtOrders = [];
    let requestBody = {};
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'transaction/bought', requestOptions).subscribe(
      data => {
        this._currentBoughtOrders = data.json();
        this._boughtOrders.next(this._currentBoughtOrders);
      },
      err => {
        console.log(err);
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get bought order data'), MessageContentType.Text);
      }
    );
  }

  getSoldOrders() {
    if (!this.auth.isAuthenticated() || !this.tokenService.getToken())
      return;
    this._currentBoughtOrders = [];
    let requestBody = {};
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + 'transaction/sold', requestOptions).subscribe(
      data => {
        this._currentSoldOrders = data.json();
        this._soldOrders.next(this._currentSoldOrders);
      },
      err => {
        console.log(err);
        this.notificationService.showNotification(new MessageModel(MessageType.Error, 'Failed to get sold order data'), MessageContentType.Text);
      }
    );
  }

  getQuotesOrder() {
    if (!this.auth.isAuthenticated() || !this.tokenService.getToken())
      return;
    this._currentQuotesOrders = [];
    let headers = new Headers({
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
      'Token': this.tokenService.getToken().Jwt
    });
    let requestOptions = new RequestOptions({headers: headers});
    this.http.get(Constants.ServiceURL + '/portfolio/buyable', requestOptions).subscribe(
      data => {
        this._currentQuotesOrders = data.json();
        this._currentQuotesOrders.map((key,value) => {
          let assetAnalysisInput = [];
          for(var i = 0; i < key.Assets.length; i++){
            assetAnalysisInput.push({"Symbol":key.Assets[i].Symbol, "Amount":key.Assets[i].Reqbalance});
          }
          let headers = new Headers({ "content-type": "application/json", "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey, "Token": this.tokenService.getToken().Jwt });
          let requestOptions = new RequestOptions({headers: headers});
          this.http.post(Constants.ServiceURL + "portfolio/analyze", assetAnalysisInput, requestOptions).subscribe(
            data => {
              key.CurrentValuationInWand = data.json().overall.ETH;
              if (value === this._currentQuotesOrders.length-1){
                this._quotesOrders.next(this._currentQuotesOrders);
              }
            },
            err => {
              console.log(err);
              key.CurrentValuationInWand = 0;
            }
          );
        });
      },
      err => {
        console.log(err);
      }
    );
  }

  getCurrentBoughtOrders(): Array<PortfolioTransaction> {
    return this._currentBoughtOrders;
  }
  getCurrentQuotesOrders(): Array<PortfolioTransaction> {
    return this._currentQuotesOrders;
  }

  getCurrentSoldOrders(): Array<PortfolioTransaction> {
    return this._currentSoldOrders;
  }

  fetchAllOrderData(data: any) {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer)
      this.fetchTimer = 0
    }
    if (data === undefined) {
      return;
    }
    this.getBoughtOrders();
    this.getSoldOrders();
    this.getQuotesOrder();
    this.fetchTimer = setTimeout(() => {
      this.fetchAllOrderData({});
    }, 30000);
  }
}
