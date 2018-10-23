import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Constants } from "../models/constants";
import { TokenHistoryData, DayData } from "../models/token-history.model";
import { retry } from "rxjs/operators/retry";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AuthService } from "./auth.service";

@Injectable()
export class TokenHistoryService{

    private tokenHistoryData: Array<TokenHistoryData> = new Array<TokenHistoryData>();
    private _tokenHistoryDataAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _isTokenHistoryDataAvailable: boolean = false;
    private fetchingData: boolean = false;

    public tokenHistoryDataAvailable$ = this._tokenHistoryDataAvailable.asObservable();

    constructor(private http: Http, private auth: AuthService){
        console.log("Token history service constructed");
        this.fetchingData = false;
        this.loadTokenHistoryData();
    }

    loadTokenHistoryData(){
        let lastUpdateDate = localStorage.getItem("lastUpdateDay");
        if(lastUpdateDate === undefined || lastUpdateDate === ""){
            this.fetchTokenHistoryData();
            return;
        }
        let todayDate = new Date();
        let today = todayDate.getDate();
        if(today !== Number(lastUpdateDate)){
            this.fetchTokenHistoryData();
            return;
        }
        let tokenHistoryData = localStorage.getItem("tokenHistoryData");
        if(tokenHistoryData === undefined || tokenHistoryData === ""){
            this.fetchTokenHistoryData();
            return;
        }
        this.tokenHistoryData = JSON.parse(tokenHistoryData);
        this._isTokenHistoryDataAvailable = true;
        this._tokenHistoryDataAvailable.next(true);
    }

    private fetchTokenHistoryData(){
        if(!this.auth.isAuthenticated())
            return;
        if(this.fetchingData){
            return;
        }
        this.fetchingData = true;
        console.log("Fetching token history data from server");
        this.http.get(Constants.TokenHistoryUrl).subscribe(
            data => {
                this.fetchingData = false;
                this.tokenHistoryData = data.json();
                let todayDate = new Date();
                let today = todayDate.getDate();
                localStorage.setItem("lastUpdateDay", today.toString());
                localStorage.setItem("tokenHistoryData", JSON.stringify(this.tokenHistoryData));
                this._isTokenHistoryDataAvailable = true;
                this._tokenHistoryDataAvailable.next(true);
            },
            err => {
                console.log(err);
                this.fetchingData = false;
                this._isTokenHistoryDataAvailable = false;
                this._tokenHistoryDataAvailable.next(false);
            }
        );
    }

    getTokenHistoryData(): Array<TokenHistoryData>{
        return this.tokenHistoryData;
    }

    isTokenHistoryDataAvailable(): boolean{
        return this._isTokenHistoryDataAvailable;
    }
}