import {BrowserModule, Title} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {NgModule} from '@angular/core';

import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {MainContentComponent} from './components/main-content/main-content.component';
import {HeaderComponent} from './components/header/header.component';
import {ExchangeComponent} from './components/exchange/exchange.component';
import {WalletInfoComponent} from './components/wallet-info/wallet-info.component';
import {ExchangeOrderbookSidepaneComponent} from './components/exchange-orderbook-sidepane/exchange-orderbook-sidepane.component';
import {ExchangeGraphComponent} from './components/exchange-graph/exchange-graph.component';
import {ExchangeTradehistorySidepaneComponent} from './components/exchange-tradehistory-sidepane/exchange-tradehistory-sidepane.component';
import {TabsComponent} from './components/tabs/tabs.component';
import {ExchangeDepositewithdrawComponent} from './components/exchange-depositewithdraw/exchange-depositewithdraw.component';
import {ExchangeOrderhistoryComponent} from './components/exchange-orderhistory/exchange-orderhistory.component';
import {ExchangeOpenordersComponent} from './components/exchange-openorders/exchange-openorders.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';

import {AmChartsModule} from '@amcharts/amcharts3-angular';
import {ScrollToModule} from 'ng2-scroll-to-el';
import {ClipboardModule} from 'ngx-clipboard';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';

import {AppRoutingModule} from './app-routing.module';
import {PortfolioGraphComponent} from './components/portfolio-graph/portfolio-graph.component';
import {PortfolioBreakdownComponent} from './components/portfolio-breakdown/portfolio-breakdown.component';
import {DashboardWalletComponent} from './components/dashboard-wallet/dashboard-wallet.component';
import {DashboardDepositewithdrawComponent} from './components/dashboard-depositewithdraw/dashboard-depositewithdraw.component';
import {DashboardQuicktradeComponent} from './components/dashboard-quicktrade/dashboard-quicktrade.component';
import {DashboardRecentactivityComponent} from './components/dashboard-recentactivity/dashboard-recentactivity.component';

// import {SlimScroll} from 'angular4-slimscroll';
import {MatButtonModule, MatIconModule, MatToolbarModule, MatInputModule, MatDialogModule} from '@angular/material';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AuthService} from './services/auth.service';
import {Web3Service} from './services/web3.service';
import {NavigationService} from './services/nav.service';
import {PortfolioService} from './services/portfolio.service';
import {UserService} from './services/user.service';
import {WalletService} from './services/wallet.service';
import {NotificationManagerService} from './services/notification-manager.service';
import {OrdersService} from './services/orders.service';
import {PlatformTokenService} from './services/platform-token.service';
import {ChartService} from './services/chart.service';
import {TokenHistoryService} from './services/token-history.service';
import {PortfolioAssetsService} from './services/portfolio-assets.service';
import {SwitchThemeService} from './services/switch-theme.service';
import {SwitchGraphService} from './services/switch-graph.service';
import {TokenService} from './services/token.service';
import {CustomWalletService} from './services/custom-wallet.service';
import {TransactionService} from './services/transaction.service';
import {InfuraNetworkService} from './services/infura-network.service';
import {NgxChartsModule, AreaChartModule} from '@swimlane/ngx-charts/release/index.js';
import {QRCodeModule} from 'angular2-qrcode';
import {SavedWalletsService} from './services/saved-wallets.service';
import {EthExchangeService} from './services/eth-exchange.service';
import {NeotokenService} from './services/neotoken.service';
import {NeoService} from './services/neo.service';
import {AionService} from './services/aion.service';
import {AwsService} from './services/aws.service';
import {UpdatebasketqueueService} from './services/updatebasketqueue.service';

import {AuthGuard} from './common/auth-guard';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {WalletsManagerComponent} from './components/wallets-manager/wallets-manager.component';
import {WalletCreateComponent} from './components/wallet-create/wallet-create.component';
import {WalletDetailComponent} from './components/wallet-detail/wallet-detail.component';
import {WalletTokensComponent} from './components/wallet-tokens/wallet-tokens.component';
import {WalletJsonComponent} from './components/wallet-json/wallet-json.component';
import {WalletPrivatekeyComponent} from './components/wallet-privatekey/wallet-privatekey.component';
import {ExchangeWalletSelectComponent} from './components/exchange-wallet-select/exchange-wallet-select.component';
import {ExchangeWalletBuyComponent} from './components/exchange-wallet-buy/exchange-wallet-buy.component';
import {ExchangeWalletSellComponent} from './components/exchange-wallet-sell/exchange-wallet-sell.component';
import {ExchangePlatformTokenSelectComponent} from './components/exchange-platform-token-select/exchange-platform-token-select.component';
import {DetailChartComponent} from './components/detail-chart/detail-chart.component';
import {AdvancedChartComponent} from './components/advanced-chart/advanced-chart.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import {TransactionConfirmDialogComponent} from './components/transaction-confirm-dialog/transaction-confirm-dialog.component';
import {SignatureConfirmDialogComponent} from './components/signature-confirm-dialog/signature-confirm-dialog.component';
import {BasketComponent} from './components/basket/basket.component';
import {BasketNewComponent} from './components/basket-new/basket-new.component';
import {BasketWalletComponent} from './components/basket-wallet/basket-wallet.component';
import {BasketOrderComponent} from './components/basket-order/basket-order.component';
import {BasketAuthorizeTokenComponent} from './components/basket-authorize-token/basket-authorize-token.component';
import { ExchangeOpenordersNeoComponent } from './components/exchange-openorders-neo/exchange-openorders-neo.component';
import { ExchangeOrderbookSidepaneNeoComponent } from './components/exchange-orderbook-sidepane-neo/exchange-orderbook-sidepane-neo.component';
import { ExchangeDepositewithdrawNeoComponent } from './components/exchange-depositewithdraw-neo/exchange-depositewithdraw-neo.component';
import { ExchangeOrderhistoryNeoComponent } from './components/exchange-orderhistory-neo/exchange-orderhistory-neo.component';
import { ExchangeTradehistorySidepaneNeoComponent } from './components/exchange-tradehistory-sidepane-neo/exchange-tradehistory-sidepane-neo.component';
import { ExchangeWalletBuyNeoComponent } from './components/exchange-wallet-buy-neo/exchange-wallet-buy-neo.component';
import { ExchangeWalletSellNeoComponent } from './components/exchange-wallet-sell-neo/exchange-wallet-sell-neo.component';
import { ExchangePlatformTokenSelectNeoComponent } from './components/exchange-platform-token-select-neo/exchange-platform-token-select-neo.component';
import { ExchangeEthComponent } from './components/exchange-eth/exchange-eth.component';
import { ExchangeNeoComponent } from './components/exchange-neo/exchange-neo.component';
import { MarketBroadcastService } from './services/market-broadcast.service';
import { BasketNeoComponent } from './components/basket-neo/basket-neo.component';
import { NeoBasketNewComponent } from './components/neo-basket-new/neo-basket-new.component';
import { BasketContainerComponent } from './components/basket-container/basket-container.component';
import { FirsttimeComponent } from './components/firsttime/firsttime.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

import { ExchangeWalletSelectInlineComponent } from './components/exchange-wallet-select-inline/exchange-wallet-select-inline.component';
import { NeoStakeComponent } from './components/neo-stake/neo-stake.component';
import { StakeContainerComponent } from './components/stake-container/stake-container.component';
import { AirdropComponent } from './components/airdrop/airdrop.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ProfileContainerComponent } from './components/profile-container/profile-container.component';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    MainContentComponent,
    HeaderComponent,
    ExchangeComponent,
    WalletInfoComponent,
    ExchangeOrderbookSidepaneComponent,
    ExchangeGraphComponent,
    ExchangeTradehistorySidepaneComponent,
    TabsComponent,
    ExchangeDepositewithdrawComponent,
    ExchangeOrderhistoryComponent,
    ExchangeOpenordersComponent,
    DashboardComponent,
    PortfolioGraphComponent,
    PortfolioBreakdownComponent,
    DashboardWalletComponent,
    DashboardDepositewithdrawComponent,
    DashboardQuicktradeComponent,
    DashboardRecentactivityComponent,
    // SlimScroll,
    WalletsManagerComponent,
    WalletCreateComponent,
    WalletDetailComponent,
    WalletTokensComponent,
    WalletJsonComponent,
    WalletPrivatekeyComponent,
    ExchangeWalletSelectComponent,
    ExchangeWalletBuyComponent,
    ExchangeWalletSellComponent,
    ExchangePlatformTokenSelectComponent,
    DetailChartComponent,
    AdvancedChartComponent,
    TransactionConfirmDialogComponent,
    SignatureConfirmDialogComponent,
    BasketComponent,
    BasketNewComponent,
    BasketWalletComponent,
    BasketOrderComponent,
    BasketAuthorizeTokenComponent,
    ExchangeDepositewithdrawNeoComponent,
    ExchangeOrderhistoryNeoComponent,
    ExchangeTradehistorySidepaneNeoComponent,
    ExchangeWalletBuyNeoComponent,
    ExchangeWalletSellNeoComponent,
    ExchangePlatformTokenSelectNeoComponent,
    ExchangeEthComponent,
    ExchangeNeoComponent,
    ExchangeOpenordersNeoComponent,
    ExchangeOrderbookSidepaneNeoComponent,
    BasketNeoComponent,
    NeoBasketNewComponent,
    BasketContainerComponent,
    FirsttimeComponent,
    LoadingSpinnerComponent,
    ExchangeWalletSelectInlineComponent,
    NeoStakeComponent,
    StakeContainerComponent,
    AirdropComponent,
    UserProfileComponent,
    ProfileContainerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    MatDialogModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    QRCodeModule,
    UiSwitchModule.forRoot({
      size: 'small',
      color: 'rgb(0, 189, 99)',
      switchColor: '#80FFA2',
      defaultBgColor: '#00ACFF',
      defaultBoColor : '#476EFF',
    }),
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    NgxChartsModule,
    AreaChartModule,
    MatDialogModule,
    MatTooltipModule,
    AmChartsModule,
    SimpleNotificationsModule.forRoot(),
    ScrollToModule.forRoot(),
    ClipboardModule,
    AngularMultiSelectModule,
  ],
  providers: [
    Web3Service,
    NotificationManagerService,
    NavigationService,
    PortfolioService,
    UserService,
    WalletService,
    OrdersService,
    TokenService,
    PlatformTokenService,
    Title,
    ChartService,
    TokenHistoryService,
    PortfolioAssetsService,
    AuthService,
    AuthGuard,
    SwitchThemeService,
    SwitchGraphService,
    CustomWalletService,
    TransactionService,
    InfuraNetworkService,
    SavedWalletsService,
    EthExchangeService,
    MarketBroadcastService,
    NeotokenService,
    NeoService,
    AionService,
    AwsService,
    UpdatebasketqueueService
  ],
  entryComponents: [
    TransactionConfirmDialogComponent,
    SignatureConfirmDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
