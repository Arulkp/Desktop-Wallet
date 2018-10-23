import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { Http, RequestOptions, Headers } from "@angular/http";
import { Subscription } from "rxjs";

import { Constants } from "../models/constants";
import { MessageModel, MessageType, MessageContentType } from "../models/message.model";
import { PlatformToken } from "../models/platform-tokens";

import { NotificationManagerService } from "../services/notification-manager.service";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";

@Injectable()
export class PlatformTokenService{

    private platformTokens: Array<PlatformToken> = new Array<PlatformToken>();
    private _platformTokens : BehaviorSubject<Array<PlatformToken>> = new BehaviorSubject<Array<PlatformToken>>(undefined);
    public platformTokens$ : Observable<Array<PlatformToken>> = this._platformTokens.asObservable()
    private _selectedPlatformToken : BehaviorSubject<PlatformToken> = new BehaviorSubject<PlatformToken>(undefined);
    public selectedPlatformToken$ : Observable<PlatformToken> = this._selectedPlatformToken.asObservable()

    constructor(
        private notificationManagerService: NotificationManagerService,
        private http: Http,
        private tokenService: TokenService, private auth: AuthService
    ){
    }

    public getPlatformTokens() : Observable<Array<PlatformToken>> {
        let headers = new Headers({
          'content-type': 'application/json',
          'Ocp-Apim-Subscription-Key': Constants.ApiManagementSubscriptionKey,
          'Token': this.tokenService.getToken().Jwt
        });
        let requestOptions = new RequestOptions({headers: headers});
        this.http.get(Constants.ServiceURL + 'PlatformToken', requestOptions).subscribe(
          data => {
            var tokens = data.json();
            this.platformTokens = tokens;
            this._platformTokens.next(this.platformTokens)
          },
          err => {
            console.log(err)
            this._platformTokens.next(undefined)
          }
        );
        return this._platformTokens.asObservable()
    }
    public GetAllPlatformTokens() : Array<PlatformToken>{
        return this.platformTokens;
    }

    public FindPlatformToken(id: number): PlatformToken{
        for(var i = 0; i < this.platformTokens.length; i++){
            if(this.platformTokens[i].id == id)
                return this.platformTokens[i];
        }
        return undefined;
    }

    public getCurrentTokenPrice(token: any) {
        let reqURL = `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=ETH`
        return this.http.get(reqURL)
            .map(res => res.json())
    }
    public setSelectedPlatformToken(token) {
        this._selectedPlatformToken.next(token)
    }
}