import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs';


@Injectable()
export class SwitchThemeService {
  private subject = new Subject<any>();
  private replaySubject = new ReplaySubject<any>();

  constructor() {
  }

  public switchTheme: boolean;
  public switchGraphColor: boolean;

  changeClass = (theme) => {
    this.switchTheme = theme;
      this.subject.next({ theme });
      this.replaySubject.next({theme});
  };
  getTheme(): Observable<any> {
    return this.subject.asObservable();
  }
  getThemePortfolio():Observable<any>{
    return this.replaySubject.asObservable();
  }
  getCuurentTheme(){
    return this.switchTheme;
  }
}
