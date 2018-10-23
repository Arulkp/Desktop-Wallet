import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';

import {CustomWalletService} from '../services/custom-wallet.service'


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private wallet : CustomWalletService) {}

  canActivate() {
    console.log(tokenNotExpired('id_token', sessionStorage.getItem('id_token')));
    let walletType = sessionStorage.getItem('walletType')
    if (parseInt(walletType) == 1 && !this.wallet.isWalletInitialized()) {
      this.router.navigate(['/']);
      return false;  
    }
    if (tokenNotExpired('id_token', sessionStorage.getItem('id_token'))) {
      console.log("Authguard true");
      return true;
    }
    console.log("Authguard false");
    this.router.navigate(['/']);
    return false;
  }
}
