import {Component, OnInit, Input, SimpleChanges, SimpleChange, NgZone} from '@angular/core';
import * as ethUtil from 'ethereumjs-util';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {Constants} from '../../models/constants';

const electron = window.require('electron');
var shell = window.require('electron').shell;
declare var window: any;

@Component({
  selector: 'wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.css']
})
export class WalletInfoComponent implements OnInit {

  public displayRequest = 'none';
  public displayWrongPassword = 'none';
  private activeRouteSub: any;
  public exchangeImg = '../../assets/images/eth.png';
  public wallets: Array<any> = [];
  @Input() walletBaseCurrency: string;
  @Input() handleWalletDetail: any;
  @Input() handleWalletTokens: any;
  private selectedWallet;
  public password: any;
  public shell = shell;

  constructor(private savedWalletsService: SavedWalletsService,
              private ngZone: NgZone) {
    this.handleExchangeChange = this.handleExchangeChange.bind(this);
    this.getExchangeName = this.getExchangeName.bind(this);
    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'ready') {
        this.handleExchangeChange();
      }
    });
  }

  handleWalletPassword() {
    this.password;
    if (this.selectedWallet.decrypt(this.password) === false) {
      this.displayWrongPassword = 'block';
    }
    else {
      this.handleWalletDetail(this.selectedWallet);
      this.password = '';
      this.displayRequest = 'none';
    }
  }

  handleExchangeChange() {
    var wallets = [];
    if (this.walletBaseCurrency == 'eth') {
      this.exchangeImg = '../../assets/images/eth.png';
      wallets = this.savedWalletsService.getEthWallets();
    } else if (this.walletBaseCurrency == 'neo') {
      this.exchangeImg = '../../assets/images/neo.png';
      wallets = this.savedWalletsService.getNeoWallets();
    }else if (this.walletBaseCurrency == 'wan') {
      this.exchangeImg = '../../assets/images/wanchain.svg';
      wallets = this.savedWalletsService.getWanWallets();
    }
    this.ngZone.run(() => {
      this.wallets = wallets.reverse();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.handleExchangeChange();
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  getExchangeName() {
    if (this.walletBaseCurrency == 'eth') {
      return 'Ethereum';
    }
    else if (this.walletBaseCurrency == 'neo') {
      return 'NEO';
    } else if (this.walletBaseCurrency == 'wan') {
      return 'Wanchain';
    }else if (this.walletBaseCurrency == 'aion') {
      return 'Aion';
    }
  }

  requestForTheme(w) {

    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
      this.selectedWallet = w;
    } else {
      this.displayRequest = 'none';
      this.selectedWallet = null;
    }
  }

  getTokenDetailUrl(): string {
    return Constants.AddressAppnetURL;
  }
}
