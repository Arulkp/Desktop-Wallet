import { Component, ViewEncapsulation, Inject, NgZone } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'signature-confirm-dialog',
  templateUrl: './signature-confirm-dialog.component.html',
  styleUrls: ['./signature-confirm-dialog.component.css'],
  encapsulation: ViewEncapsulation.None

})

export class SignatureConfirmDialogComponent{
  web3 : any;
  from : string;
  to : string;
  txdata : string;
  constructor(private matdialogRef: MatDialogRef<SignatureConfirmDialogComponent>,
              private zone:NgZone,
              @Inject(MAT_DIALOG_DATA)
              public data:any) {
    let txMeta = this.data.txMeta
    this.from = txMeta.msgParams.from
    this.txdata = txMeta.msgParams.data
  }
  confirm() {
    this.matdialogRef.close('confirm')
    
  }
  cancel() {
    this.matdialogRef.close()
  }
}