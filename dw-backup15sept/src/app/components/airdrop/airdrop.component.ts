import {Component, OnInit} from '@angular/core';
import {AwsService} from '../../services/aws.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';
import {SavedWalletsService} from '../../services/saved-wallets.service';

@Component({
  selector: 'app-airdrop',
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.css']
})
export class AirdropComponent implements OnInit {
  public form: FormGroup;
  public selectedWallet = '';
  public wallets = [];
  public alredayExist: boolean = false;
  public airdropSuccess: boolean = false;

  constructor(private savedWalletsService: SavedWalletsService, private awsservice: AwsService, private fb: FormBuilder, private notificationManager: NotificationManagerService) {
  }

  ngOnInit() {
    this.createForm();
    //console.log('neo wallet', this.savedWalletsService.getNeoWallets());
    this.wallets = this.savedWalletsService.getNeoWallets();
  }

  createForm() {
    this.form = this.fb.group({
      NEO: ['', Validators.compose([Validators.required, Validators.minLength(34)])],
      Telegram: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.controls.NEO.value === '') {
      this.form.controls.NEO.setErrors({required: true});
      this.form.controls.NEO.markAsTouched();
    }
    if (this.form.controls.Telegram.value === '') {
      this.form.controls.Telegram.setErrors({required: true});
      this.form.controls.Telegram.markAsTouched();
    }
    if (this.form.controls.Email.value === '') {
      this.form.controls.Email.setErrors({required: true});
      this.form.controls.Email.markAsTouched();
    } else {
      if (this.form.controls.Email.hasError('email')) {
        this.form.controls.Email.setErrors({required: true});
        this.form.controls.Email.markAsTouched();
      }
    }

    if (this.form.controls.NEO.value !== '' && this.form.controls.NEO.value.length < 34) {
      this.form.controls.NEO.setErrors({minLength: true});
      this.form.controls.NEO.markAsTouched();
    }
    if (!this.form.touched || !this.form.valid) {
      this.notificationManager.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in airdrop form'), MessageContentType.Text);
      return;
    }
    const formModel = this.form.value;
    console.log('formModel', formModel);
    this.awsservice.addItemAirDrop(formModel).then((res) => {
      this.createForm();
      this.airdropSuccess = true;
      setTimeout(() => {
        this.airdropSuccess = false;
      }, 2000);
      this.notificationManager.showNotification(new MessageModel(MessageType.Info, 'Airdrop Registration Successfully submitted'), MessageContentType.Text);
    }, (err) => {
      this.notificationManager.showNotification(new MessageModel(MessageType.Error, 'Airdrop registration not submitted'), MessageContentType.Text);
    });
  }

  changeNeoAddress() {
    console.log(this.selectedWallet);
    this.awsservice.checkForAlreadyExit(this.selectedWallet['address']).then((res) => {
      if (res !== 0) {
        this.alredayExist = true;
      } else {
        this.alredayExist = false;
      }
    }, (err) => {

    });
  }
}
