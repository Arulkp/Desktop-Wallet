import {Component, ViewEncapsulation, Inject, NgZone} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as web3Utils from 'web3/lib/utils/utils';
import {BigNumber} from 'bignumber.js';

@Component({
  selector: 'transaction-confirm-dialog',
  templateUrl: './transaction-confirm-dialog.component.html',
  styleUrls: ['./transaction-confirm-dialog.component.css'],
  encapsulation: ViewEncapsulation.None

})

export class TransactionConfirmDialogComponent {
  web3: any;
  from: string;
  to: string;
  txdata: string;
  valueBN: BigNumber = new BigNumber('0');
  value: string;
  gasTotalBN: BigNumber = new BigNumber('0');
  gasTotal: string = '';
  gas: BigNumber = new BigNumber('0');
  gasPrice: BigNumber = new BigNumber('0');
  totalValueBN: BigNumber = new BigNumber('0');
  totalValue: string = '';
  txMeta: any;
  symbol: string;
  conversionRate: number;
  decimals: number = 0;
  gasDecimals: number = 10;
  public newGasPrice : string;
  showGasEdit : boolean = false
  isLoading: boolean = true;

  constructor(private matdialogRef: MatDialogRef<TransactionConfirmDialogComponent>,
              private zone: NgZone,
              @Inject(MAT_DIALOG_DATA)
              public data: any) {
    this.formatData = this.formatData.bind(this);
    this.isLoading = true;
    this.data.txMeta.subscribe((txMeta) => {
      if (!txMeta)
        return;
      this.txMeta = txMeta;
      this.conversionRate = this.txMeta.conversionRate ? this.txMeta.conversionRate : 0;
      this.decimals = this.txMeta.decimals ? this.txMeta.decimals : 6;
      this.symbol = this.txMeta.symbol ? this.txMeta.symbol : 'ETH';
      this.from = this.txMeta.txParams.from;
      this.to = this.txMeta.txParams.to;
      this.txdata = this.txMeta.txParams.data;
      this.valueBN = new BigNumber(this.txMeta.value ? this.txMeta.value : this.txMeta.txParams.value);
      this.gasPrice = new BigNumber(this.txMeta.txParams.gasPrice);
      this.gas = new BigNumber(this.txMeta.txParams.gas);

      this.formatData();
      this.isLoading = false;
    });

  }

  editGas() {
    this.showGasEdit = true
  }
  formatData() {
    // gas total
    this.gasTotalBN = new BigNumber(this.gas).times(this.gasPrice);

    if (!this.txMeta.symbol || this.txMeta.symbol == 'ETH') {
      // gas total
      let gasTotal = web3Utils.fromWei(this.gasTotalBN.toString());
      this.gasTotal = (new BigNumber(gasTotal)).decimalPlaces(this.gasDecimals).toString();
      // this.newGasPrice = this.gasTotal

      let value = web3Utils.fromWei(this.valueBN.toString());
      this.value = (new BigNumber(value)).decimalPlaces(this.decimals).toString();
      // total
      this.totalValueBN = new BigNumber(this.valueBN).plus(this.gasTotalBN);
      let totalValue = web3Utils.fromWei(this.totalValueBN.toString());
      this.totalValue = (new BigNumber(totalValue)).decimalPlaces(this.decimals).toString();

    } else {
      let gasTotalConverted = (new BigNumber(this.gasTotalBN)).div(this.conversionRate);
      let gasTotalConvertedEther = web3Utils.fromWei(gasTotalConverted.toString());
      this.gasTotal = (new BigNumber(gasTotalConvertedEther)).decimalPlaces(this.decimals).toString();

      // this.newGasPrice = this.gasTotal;

      let value = web3Utils.fromWei(this.valueBN.toString());
      this.value = (new BigNumber(value)).decimalPlaces(this.decimals).toString();

      this.totalValueBN = new BigNumber(this.valueBN).plus(gasTotalConverted);
      let totalValue = web3Utils.fromWei(this.totalValueBN.toString());
      this.totalValue = (new BigNumber(totalValue)).decimalPlaces(this.decimals).toString();
    }
  }

  ngOnInit() {
    BigNumber.config({
      ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN,
    });
  }

  confirm() {
    var newGasPrice
    if (this.newGasPrice)
      newGasPrice = '0x' + (new BigNumber(web3Utils.toWei(this.newGasPrice, 'gwei'))).toString(16)
    else {
      newGasPrice = 0
    }
    var data = {
      status : 'confirm',
      newGasPrice : newGasPrice
    }
    this.matdialogRef.close(JSON.stringify(data));

  }

  cancel() {
    var data = {
      status : '',
    }
    this.matdialogRef.close(JSON.stringify(data));
  }
}
