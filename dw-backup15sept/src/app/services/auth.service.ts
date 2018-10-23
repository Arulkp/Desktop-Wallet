import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from '../models/auth0-variables';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import {CustomWalletService} from './custom-wallet.service'

@Injectable()
export class AuthService {
  userProfile: any;
  auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.clientID,
    domain: AUTH_CONFIG.domain,
    responseType: 'token id_token',
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    redirectUri: AUTH_CONFIG.callbackURL,
    scope: 'openid email profile'
  });

  constructor(public router: Router, private wallet : CustomWalletService) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        this.router.navigate(['/']);
      } else if (err) {
        this.router.navigate(['/']);
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    sessionStorage.setItem('access_token', authResult.accessToken);
    sessionStorage.setItem('id_token', authResult.idToken);
    sessionStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('expires_at');
    // Go back to the home route
    this.router.navigateByUrl('/');
  }

  public isAuthenticated(): boolean {
    return true;
  }

  public getProfile(cb): void {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
        console.log(profile);
      }
      cb(err, profile);
    });
  }
}
