import { Injectable, Inject, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Http, Headers, RequestOptions } from "@angular/http";

import { Web3Service } from "../services/web3.service";
import { Constants } from "../models/constants";
import { UserRegistration, UserRegistrationResponse } from "../models/user-registration.model";
import { User } from "../models/user.model";
import { JwtToken } from "../models/token.model";
import { AuthService } from "./auth.service";

@Injectable()
export class TokenService{
    private currentToken: JwtToken;
    private _token = new BehaviorSubject<JwtToken>(undefined);
    token$ = this._token.asObservable();
    private tokenTimer : any;
    constructor(private http: Http, private web3: Web3Service, private auth: AuthService){}

    fetchToken(){
        if(!this.auth.isAuthenticated())
            return;
        if(this.tokenTimer)
            clearTimeout(this.tokenTimer)
        let userRegistration = new UserRegistration();
        userRegistration.UserAccount = this.web3.getWeb3().eth.coinbase;
        userRegistration.UserEmail = sessionStorage.getItem("email");
        userRegistration.Name = sessionStorage.getItem("name");
        let headers = new Headers({ "content-type": "application/json", "Ocp-Apim-Subscription-Key": Constants.ApiManagementSubscriptionKey });
        let requestOptions = new RequestOptions({headers: headers});
        this.http.post(Constants.ServiceURL + "Token", userRegistration, requestOptions).subscribe(
            data => {
              console.log("tokens", data.json())
                this.currentToken = new JwtToken();
                this.currentToken.Jwt = data.json().Jwt;
                this.currentToken.JwtExpiryDateTime = data.json().JwtExpiryDateTime;
                sessionStorage.setItem('id_token', this.currentToken.Jwt);
                this._token.next(this.currentToken);
            },
            err => {
                console.log(err);
                this._token.next(undefined);
            }
        );
        this.tokenTimer = setTimeout(() => {
            this.fetchToken();
        }, 3600000);
    }

    getToken(){
        return this.currentToken;
    }
    stopTokenService() {
        if(this.tokenTimer)
            clearTimeout(this.tokenTimer)
        this.tokenTimer = 0
        this.currentToken = null
        this._token.next(undefined)
    }
}
