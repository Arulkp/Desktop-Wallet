import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {Http} from '@angular/http';
import {AuthService} from './auth.service';
import 'rxjs/add/operator/map';

@Injectable()
export class PortfolioAssetsService {

  constructor(private http: Http,
              private auth: AuthService) {

  }

  getMultiTwenty4(fsyms) {
    if (!this.auth.isAuthenticated())
      return;
    // this need to be done for each symbol which will make it heavy
    // Work arounds ?
    let observables = fsyms.map((it, i) => {
      return this.http.get('https://min-api.cryptocompare.com/data/histohour?limit=1&aggregate=24&e=CCCAGG&tsym=ETH&fsym=' + it).map(res => res.json());
    });
    let fork = forkJoin(observables)
      .map(results => {
        let valueList = [];
        fsyms.forEach((jt, j) => {
          let latest = results[j]['Data'];
          valueList.push({
            tokenid: jt,
            ohclv: latest[latest.length - 1]
          });
        });
        return valueList;
      });
    return fork;
  }

  getMultiCurrent(tsyms, fsyms) {
    if (!this.auth.isAuthenticated())
      return;
    return this.http.get('https://min-api.cryptocompare.com/data/pricemulti?e=CCCAGG&fsyms=' + fsyms + '&tsyms=' + tsyms).map(res => res.json());
  }

  getHistoMinute(fsyms) {
    if (!this.auth.isAuthenticated())
      return;
    let observables = fsyms.map((it, i) => {
      return this.http.get('https://min-api.cryptocompare.com/data/histominute?limit=120&aggregate=1&e=CCCAGG&tsym=ETH&fsym=' + it).map(res => res.json());
    });
    let fork = forkJoin(observables)
      .map(results => {
        let valueList = [];
        fsyms.forEach((jt, j) => {
          let latest = results[j]['Data'];
          valueList.push({
            tokenid: jt,
            ohclvList: latest
          });
        });
        return valueList;
      });
    return fork;
  }

  getHistoHour(fsyms) {
    if (!this.auth.isAuthenticated())
      return;
    let observables = fsyms.map((it, i) => {
      return this.http.get('https://min-api.cryptocompare.com/data/histohour?limit=120&aggregate=1&e=CCCAGG&tsym=ETH&fsym=' + it).map(res => res.json());
    });
    let fork = forkJoin(observables)
      .map(results => {
        let valueList = [];
        fsyms.forEach((jt, j) => {
          let latest = results[j]['Data'];
          valueList.push({
            tokenid: jt,
            ohclvList: latest
          });
        });
        return valueList;
      });
    return fork;
  }

  getHistoDay(fsyms) {
    if (!this.auth.isAuthenticated())
      return;
    let observables = fsyms.map((it, i) => {
      return this.http.get('https://min-api.cryptocompare.com/data/histoday?limit=120&aggregate=1&e=CCCAGG&tsym=ETH&fsym=' + it).map(res => res.json());
    });
    let fork = forkJoin(observables)
      .map(results => {
        let valueList = [];
        fsyms.forEach((jt, j) => {
          let latest = results[j]['Data'];
          valueList.push({
            tokenid: jt,
            ohclvList: latest
          });
        });
        return valueList;
      });
    return fork;
  }
}
