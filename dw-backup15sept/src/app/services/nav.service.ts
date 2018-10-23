import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class NavigationService{
    currentActiveTab: string = "portfolios";
    private _activeTab = new BehaviorSubject<string>("portfolios");
    
    public active$ = this._activeTab.asObservable();

    setCurrentActiveTab(tabName: string){
        this.currentActiveTab = tabName;
        this._activeTab.next(this.currentActiveTab);
    }

    getCurrentActiveTab(){
        return this.currentActiveTab;
    }
}