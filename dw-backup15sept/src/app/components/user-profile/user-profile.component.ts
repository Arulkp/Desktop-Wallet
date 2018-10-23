import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotificationManagerService} from '../../services/notification-manager.service';
import {AwsService} from '../../services/aws.service';
import {MessageContentType, MessageModel, MessageType} from '../../models/message.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  public form: FormGroup;
  public notMatch:boolean=false
  constructor(private awsservice: AwsService, private fb: FormBuilder, private notificationManager: NotificationManagerService) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      Confirm: ['', Validators.required],
      Password: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.controls.Name.value === '') {
      this.form.controls.Name.setErrors({required: true});
      this.form.controls.Name.markAsTouched();
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
    if (this.form.controls.Password.value === '') {
      this.form.controls.Password.setErrors({required: true});
      this.form.controls.Password.markAsTouched();
    }
    if (this.form.controls.Confirm.value === '') {
      this.form.controls.Confirm.setErrors({required: true});
      this.form.controls.Confirm.markAsTouched();
    }
    if (this.form.controls.Password.value != this.form.controls.Confirm.value) {
      this.notMatch=true
    }
    if (!this.form.touched || !this.form.valid) {
      this.notificationManager.showNotification(new MessageModel(MessageType.Error, 'Please fix the errors in airdrop form'), MessageContentType.Text);
      return;
    }
    const formModel = this.form.value;
    console.log('formModel', formModel);
    // this.awsservice.addItemAirDrop(formModel).then((res) => {
    //   this.createForm();
    //   this.notificationManager.showNotification(new MessageModel(MessageType.Info, 'Airdrop Registration Successfully submitted'), MessageContentType.Text);
    // }, (err) => {
    //   this.notificationManager.showNotification(new MessageModel(MessageType.Error, 'Airdrop registration not submitted'), MessageContentType.Text);
    //
    // });
  }
}
