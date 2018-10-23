import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {SavedWalletsService} from '../../services/saved-wallets.service'
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';

@Component({
  selector: 'wallet-json',
  templateUrl: './wallet-json.component.html',
  styleUrls: ['./wallet-json.component.css']
})
export class WalletJsonComponent implements OnInit {

	jsonForm: FormGroup;
  filename: string = '';
  public newWalletInfo : any;
  public showSpinner = false;
  public walletError : any;
	@Input() walletBaseCurrency : string = ''
  @Input() redirectToInfo;
  // files: UploadFile[] = [];

  constructor(
    private notificationManagerService: NotificationManagerService,
  	private savedWalletsService : SavedWalletsService,
  	private fb: FormBuilder,
    private zone : NgZone
  ) {
  	this.createForm = this.createForm.bind(this);
    this.onSubmitAddFromJSON = this.onSubmitAddFromJSON.bind(this);
    this.onJSONFileChanged = this.onJSONFileChanged.bind(this);
  }

  ngOnInit() {
    this.createForm();
  }
  onJSONFileChanged(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsText(file);
      reader.onload = () => {
        this.filename = file.name;
        this.jsonForm.patchValue({
          jsonfile: reader.result
        });
        try {
          JSON.parse(reader.result);
        } catch (e) {
          this.jsonForm.get('jsonfile').markAsDirty();
          this.jsonForm.get('jsonfile').setErrors({
            'invalidJson': true
          });
        }
      };
    }
  }
  createForm() {
    this.jsonForm = this.fb.group({
      password: ['', Validators.required],
      jsonfile: ['', Validators.required],
      walletName: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  onSubmitAddFromJSON() {
    const formStatus = this.jsonForm.status;
    this.walletError = ''
    if (formStatus == 'INVALID') {
      this.jsonForm.get('jsonfile').markAsDirty();
      this.jsonForm.get('password').markAsDirty();
      this.jsonForm.get('walletName').markAsDirty();
      this.jsonForm.get('confirmPassword').markAsDirty();
      return;
    }
    let walletName = this.jsonForm.get('walletName').value
    let jsonfile = this.jsonForm.get('jsonfile').value
    let password = this.jsonForm.get('password').value
    let confirmPassword = this.jsonForm.get('confirmPassword').value;
    if (password !== confirmPassword) {
      this.jsonForm.get('confirmPassword').setErrors({
        'notmatch': true
      });
      return;
    }
    if (this.savedWalletsService.hasWalletWithName(walletName, this.walletBaseCurrency)) {
      this.jsonForm.get('walletName').setErrors({
        'duplicate': true
      });
      return;
    }
    this.zone.run(()=>{
      this.showSpinner = true;
    })
    setTimeout(() => {
      var {error , wallet} = this.savedWalletsService.createWalletWithJSON(jsonfile, password, this.walletBaseCurrency);
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
        type : 'json'
      }
      var obj;
      if (this.walletBaseCurrency == 'eth') {
        obj = this.savedWalletsService.addNewEthWallet(data, wallet)
      } else if (this.walletBaseCurrency == 'neo') {
        obj = this.savedWalletsService.addNewNeoWallet(data, wallet)
      }else if (this.walletBaseCurrency == 'wan') {
        obj = this.savedWalletsService.addNewWanWallet(data, wallet)
      }else if (this.walletBaseCurrency == 'aion') {
        obj = this.savedWalletsService.addNewAionWallet(data, wallet)
      }
      this.zone.run(()=>{
        this.showSpinner = false;
      })
      if (obj.error) {
        this.walletError = obj.error
        return;
      }
      this.jsonForm.reset()
      this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Wallet Created successfully'), MessageContentType.Text);
      this.redirectToInfo()
    }, 10)
  }
}
