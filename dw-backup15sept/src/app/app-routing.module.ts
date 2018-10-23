import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ExchangeComponent} from './components/exchange/exchange.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {BasketComponent} from './components/basket/basket.component';
import {BasketNeoComponent} from './components/basket-neo/basket-neo.component';
import {DashboardWalletComponent} from './components/dashboard-wallet/dashboard-wallet.component';
import {DashboardDepositewithdrawComponent} from './components/dashboard-depositewithdraw/dashboard-depositewithdraw.component';
import {DashboardQuicktradeComponent} from './components/dashboard-quicktrade/dashboard-quicktrade.component';

import {ExchangeDepositewithdrawComponent} from './components/exchange-depositewithdraw/exchange-depositewithdraw.component';

import {ExchangeOpenordersComponent} from './components/exchange-openorders/exchange-openorders.component';
import {ExchangeOrderhistoryComponent} from './components/exchange-orderhistory/exchange-orderhistory.component';
import { StakeContainerComponent } from './components/stake-container/stake-container.component';
import {WalletsManagerComponent} from './components/wallets-manager/wallets-manager.component';
import {BasketContainerComponent} from './components/basket-container/basket-container.component';
import {AirdropComponent} from './components/airdrop/airdrop.component';
import { ProfileContainerComponent } from './components/profile-container/profile-container.component';
import {NeoStakeComponent} from './components/neo-stake/neo-stake.component';
import {WalletInfoComponent} from './components/wallet-info/wallet-info.component';
import {WalletCreateComponent} from './components/wallet-create/wallet-create.component';
import {WalletDetailComponent} from './components/wallet-detail/wallet-detail.component';
import {WalletTokensComponent} from './components/wallet-tokens/wallet-tokens.component';
import {WalletJsonComponent} from './components/wallet-json/wallet-json.component';
import {WalletPrivatekeyComponent} from './components/wallet-privatekey/wallet-privatekey.component';

const appRoutes: Routes = [
  {
    path: 'exchange',
    component: ExchangeComponent,
    // children : [{
    //   path : 'wallet',
    //   component : ExchangeWalletComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'depositewithdraw',
    //   component : ExchangeDepositewithdrawComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'quicktrade',
    //   component : ExchangeQuicktradeComponent,
    //   outlet : 'wallettabs'
    // }, {
    //   path : 'openorders',
    //   component : ExchangeOpenordersComponent,
    //   outlet : 'ordertabs'
    // }, {
    //   path : 'orderhistory',
    //   component : ExchangeOrderhistoryComponent,
    //   outlet : 'ordertabs'
    // }, {
    //   path: '',
    //   pathMatch: 'full',
    //   redirectTo: '/exchange/(ordertabs:openorders//wallettabs:wallet)'
    // }]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // children : [{
    //   path : 'wallet',
    //   component : DashboardWalletComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path : 'depositewithdraw',
    //   component : DashboardDepositewithdrawComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path : 'quicktrade',
    //   component : DashboardQuicktradeComponent,
    //   outlet : 'dashboarWallettabs'
    // }, {
    //   path: '',
    //   pathMatch: 'full',
    //   redirectTo: '/dashboard/(dashboarWallettabs:wallet)'
    // }]
  },
  {
    path: 'wallets-manager',
    component: WalletsManagerComponent,
    // children : [{
    //   path : 'wallet-eth',
    //   component : WalletInfoComponent,
    //   data : {walletBaseCurrency : 'eth'},
    //   outlet : 'walletactions'
    // }, {
    //   path : 'wallet-neo',
    //   component : WalletInfoComponent,
    //   data : {walletBaseCurrency : 'neo'},
    //   outlet : 'walletactions'
    // }, {
    //   path : 'wallet-create-eth',
    //   component : WalletCreateComponent,
    //   data : {walletBaseCurrency : 'eth'},
    //   outlet : 'walletactions'
    // },{
    //   path : 'wallet-create-neo',
    //   component : WalletCreateComponent,
    //   data : {walletBaseCurrency : 'neo'},
    //   outlet : 'walletactions'
    // },{
    //   path : 'wallet-detail',
    //   component : WalletDetailComponent,
    //   outlet : 'walletdetails'
    // },{
    //   path : 'wallet-tokens',
    //   component : WalletTokensComponent,
    //   outlet : 'walletdetails'
    // },{
    //   path : 'wallet-json',
    //   component : WalletJsonComponent,
    //   data : {walletBaseActivity : 'UploadJson'},
    //   outlet : 'walletcreate'
    // },{
    //   path : 'wallet-privatekey',
    //   component : WalletPrivatekeyComponent,
    //   data : {walletBaseActivity : 'PrivateKey'},
    //   outlet : 'walletcreate'
    // }, {
    //   path: '',
    //   pathMatch: 'full',
    //   redirectTo: '/wallets-manager/(walletactions:wallet-eth//walletdetails:wallet-detail)'
    // }]
  },
  {
    path: 'basket',
    component: BasketComponent
  },
  {
    path: 'neoBasket',
    component: BasketNeoComponent
  },
  {
    path: 'neoBasket/:tab',
    component: BasketNeoComponent
  },
  {
    path: 'baskets',
    component: BasketContainerComponent
  },
  {
    path: 'stake',
    component: StakeContainerComponent
  },
  {
    path: 'airdrop',
    component: AirdropComponent
  },
  {
    path: 'profile',
    component: ProfileContainerComponent
  },
  {path: '', redirectTo: '/wallets-manager', pathMatch: 'full'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
