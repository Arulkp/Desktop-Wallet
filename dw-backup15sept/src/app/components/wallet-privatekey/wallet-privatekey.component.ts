import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {SavedWalletsService} from '../../services/saved-wallets.service'
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {NotificationManagerService} from '../../services/notification-manager.service';


@Component({
  selector: 'wallet-privatekey',
  templateUrl: './wallet-privatekey.component.html',
  styleUrls: ['./wallet-privatekey.component.css']
})
export class WalletPrivatekeyComponent {

	public privateKeyForm : FormGroup;
	public newWalletInfo : any;
  public showSpinner = false;
  public walletError : any;
  @Input() redirectToInfo;
	@Input('walletBaseCurrency') walletBaseCurrency : string = ''
  constructor(
    private notificationManagerService: NotificationManagerService,
    private fb: FormBuilder,
    private savedWalletsService : SavedWalletsService,
    private zone : NgZone
  ) {
    this.createPrivateKeyForm = this.createPrivateKeyForm.bind(this)
  }
  ngOnInit() {
  	this.createPrivateKeyForm()
  }
  createPrivateKeyForm() {
    this.privateKeyForm = this.fb.group({
    	walletName : ['', Validators.required],
      privateKey: ['', Validators.required],
      password : ['', Validators. required],
      confirmPassword: ['', Validators.required],
    })
  }
  // accountFromPrivateKey(privateKey) {
  // 	let w;
  //   if (!privateKey)
  //     return {status: 0};
  //   privateKey = ethUtil.stripHexPrefix(privateKey);
  //   let pk = new Buffer(Buffer.from(privateKey, 'hex'));
  //   w = wallet.fromPrivateKey(pk);
  //   return w;
  // }
  onSubmitAddFromPrivateKey() {
    if (this.privateKeyForm.status == 'INVALID') {
    	this.privateKeyForm.get('walletName').markAsDirty();
      this.privateKeyForm.get('password').markAsDirty();
      this.privateKeyForm.get('privateKey').markAsDirty();
      this.privateKeyForm.get('confirmPassword').markAsDirty();
      return;
    }
    let walletName = this.privateKeyForm.get('walletName').value
    let privateKey = this.privateKeyForm.get('privateKey').value
    let password = this.privateKeyForm.get('password').value
    let confirmPassword = this.privateKeyForm.get('confirmPassword').value;
    if (password !== confirmPassword) {
      this.privateKeyForm.get('confirmPassword').setErrors({
        'notmatch': true
      });
      return;
    }
    if (this.savedWalletsService.hasWalletWithName(walletName, this.walletBaseCurrency)) {
      this.privateKeyForm.get('walletName').setErrors({
        'duplicate': true
      });
      return;
    }
    this.zone.run(()=>{
      this.showSpinner = true;
    })
    setTimeout(() => {
      var {error , wallet} = this.savedWalletsService.createWalletWithPrivate(privateKey, this.walletBaseCurrency);
      if (error) {
        this.zone.run(()=>{
          this.showSpinner = false;
        })
        this.walletError = error
        return;
      }
      var data = {
        walletName,
        password,
        type : 'private'
      }
      var obj;
      if (this.walletBaseCurrency == 'eth') {
        obj = this.savedWalletsService.addNewEthWallet(data, wallet)
      } else if (this.walletBaseCurrency == 'neo') {
        obj = this.savedWalletsService.addNewNeoWallet(data, wallet)
      }else if (this.walletBaseCurrency == 'wan') {
        obj = this.savedWalletsService.addNewWanWallet(data, wallet)
      }
      this.zone.run(()=>{
        this.showSpinner = false;
      })
      if (obj.error) {
        this.walletError = obj.error
        return;
      }
      this.privateKeyForm.reset();
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Wallet Created successfully'), MessageContentType.Text);
      this.redirectToInfo()
    })
  }
}
