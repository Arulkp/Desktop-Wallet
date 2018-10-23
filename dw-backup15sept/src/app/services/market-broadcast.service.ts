import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';

@Injectable()
export class MarketBroadcastService {
  private _selectedPlatformToken = new ReplaySubject<any>();
  private _selectedExchange = new ReplaySubject<any>();
  private _selectedMarket = new ReplaySubject<any>();
  private _marketStatus = new ReplaySubject<any>();
  private selectedPlatformToken: any;
  private selectedExchange: any;
  private selectedMarket: any;
  private marketStatus: any;
  private shouldRefresh:boolean=false;
  // private _selectedWallet ?

  public selectedPlatformToken$ = this._selectedPlatformToken.asObservable();
  public selectedExchange$ = this._selectedExchange.asObservable();
  public selectedMarket$ = this._selectedMarket.asObservable();
  public marketStatus$ = this._marketStatus.asObservable();

  constructor() {
  }

  resetAll() {
    this.selectedPlatformToken = '';
    this.selectedExchange = '';
    this.selectedMarket = '';
    this._selectedPlatformToken.next('');
    this._selectedExchange.next('');
    this._selectedMarket.next('');
    this._marketStatus.next('changed');
  }

  resetForExchangeChange() {
    this.selectedPlatformToken = '';
    this.selectedMarket = '';
    this._selectedPlatformToken.next('');
    this._selectedMarket.next('');
    this._marketStatus.next('changed');
    this.shouldRefresh=true
  }

  setSelectedPlatformToken(selectedPlatformToken) {
    this.selectedPlatformToken = selectedPlatformToken;
    this._selectedPlatformToken.next(selectedPlatformToken);
    this._marketStatus.next('changed');
  }

  setSelectedExchange(selectedExchange) {
    this.selectedExchange = selectedExchange;
    this._selectedExchange.next(selectedExchange);
    this._marketStatus.next('exchangeWillChange');
    this._marketStatus.next('changed');
  }

  setSelectedMarket(selectedMarket) {
    this.selectedMarket = selectedMarket;
    this._selectedMarket.next(selectedMarket);
    this._marketStatus.next('changed');
  }

  getSelectedPlatformToken() {
    return this.selectedPlatformToken;
  }

  getSelectedExchange() {
    return this.selectedExchange;
  }

  getSelectedMarket() {
    return this.selectedMarket;
  }
  getRefresh() {
    return this.shouldRefresh;
  }
}
