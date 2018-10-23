import {Component, OnInit, Input, NgZone} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
// import * as Wallet from 'ethereumjs-wallet-browser';

import {SavedWalletsService} from '../../services/saved-wallets.service';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';

@Component({
  selector: 'wallet-create',
  templateUrl: './wallet-create.component.html',
  styleUrls: ['./wallet-create.component.css']
})
export class WalletCreateComponent implements OnInit {

  public showSpinner: boolean = false;

  @Input() walletBaseCurrency: string = '';
  @Input() handleWalletDetail: any;
  @Input() redirectToInfo: any;
  private activeRouteSub: any;
  private paramsMapSub: any;
  private keyStorePath = '/Library/Ethereum/keystore/';
  private newWalletInfo: any;

  public activeTab: any;
  // private previousActiveTab : any;
  public walletCreateForm: FormGroup;

  constructor(private fb: FormBuilder,
              private notificationManagerService: NotificationManagerService,
              private savedWalletsService: SavedWalletsService,
              private zone: NgZone) {
    this.getExchangeName = this.getExchangeName.bind(this);
    this.getExchangeImage = this.getExchangeImage.bind(this);
    this.createWalletCreateForm = this.createWalletCreateForm.bind(this);
    this.onSubmitCreateWallet = this.onSubmitCreateWallet.bind(this);
  }

  createWalletCreateForm() {
    this.walletCreateForm = this.fb.group({
      walletName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  onSubmitCreateWallet() {
    this.zone.run(() => {
      this.showSpinner = true;
    });
    if (this.walletCreateForm.status == 'INVALID') {
      this.walletCreateForm.get('password').markAsDirty();
      this.walletCreateForm.get('walletName').markAsDirty();
      this.walletCreateForm.get('confirmPassword').markAsDirty();
      return;
    }
    let walletName = this.walletCreateForm.get('walletName').value;
    let password = this.walletCreateForm.get('password').value;
    let confirmPassword = this.walletCreateForm.get('confirmPassword').value;
    if (password !== confirmPassword) {
      this.showSpinner = false;
      this.walletCreateForm.get('confirmPassword').setErrors({
        'notmatch': true
      });
      return;
    }
    if (this.savedWalletsService.hasWalletWithName(walletName, this.walletBaseCurrency)) {
      this.showSpinner = false;
      this.walletCreateForm.get('walletName').setErrors({
        'duplicate': true
      });
      return;
    }

    setTimeout(() => {
      var newWallet = this.savedWalletsService.generateWallet(this.walletBaseCurrency);
      console.log(newWallet);
      var data = {
        walletName,
        password,
        wallet: newWallet,
        type: 'json'
      };
      var obj;
      if (this.walletBaseCurrency == 'eth') {
        obj = this.savedWalletsService.addNewEthWallet(data, newWallet);
      } else if (this.walletBaseCurrency == 'neo') {
        obj = this.savedWalletsService.addNewNeoWallet(data, newWallet);
      } else if(this.walletBaseCurrency == 'wan'){
        obj = this.savedWalletsService.addNewWanWallet(data, newWallet);
      } else if(this.walletBaseCurrency == 'aion'){
        obj = this.savedWalletsService.addNewAionWallet(data, newWallet);
      }

      this.handleWalletDetail(obj.wallet);
      this.walletCreateForm.reset();
      this.showSpinner = false;
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Wallet Created successfully'), MessageContentType.Text);
    });
  }

  ngOnInit() {
    this.createWalletCreateForm();
  }

  ngOnDestroy() {
  }

  setVisiable(tab) {
    this.activeTab = tab;
    this.newWalletInfo = null;
    this.handleWalletDetail(null);
  }

  setBaseCurrency(walletBaseCurrency) {
    this.walletBaseCurrency = walletBaseCurrency;
  }

  generateWallet() {
    // should generate and save the wallet to wallets
    // also

    // savedWalletsService.addWallet()
  }

  addWalletPrivateKey() {
    // savedWalletsService.addWallet()
  }

  addWalletJson() {
    // savedWalletsService.addWallet()
  }

  addWalletLedger() {
    // savedWalletsService.addWallet()
  }

  showWalletInfo() {
  }

  getExchangeName() {
    if (this.walletBaseCurrency == 'eth') {
      return 'Ethereum';
    }
    else if (this.walletBaseCurrency == 'neo') {
      return 'NEO';
    }else if (this.walletBaseCurrency == 'wan') {
      return 'Wanchain';
    }
  }

  getExchangeImage() {
    if (this.walletBaseCurrency == 'eth') {
      return '../../assets/images/eth.png';
    }
    else if (this.walletBaseCurrency == 'neo') {
      return '../../assets/images/neo.png';
    }
  }

}
