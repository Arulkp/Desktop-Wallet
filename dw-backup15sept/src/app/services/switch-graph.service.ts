import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


@Injectable()
export class SwitchGraphService {

  public subject = new Subject<any>();
  public wandGraph : boolean;
  constructor() {  }

  switchGraph = (graph) => {;
    this.wandGraph = graph;
    this.subject.next({graph});
  }
  getGraph() : Observable<any>{
    return this.subject.asObservable();
  }
}
