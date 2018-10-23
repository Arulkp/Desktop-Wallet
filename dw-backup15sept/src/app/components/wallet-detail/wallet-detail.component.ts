import { Component, OnInit, Input } from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service'

@Component({
  selector: 'wallet-detail',
  templateUrl: './wallet-detail.component.html',
  styleUrls: ['./wallet-detail.component.css']
})
export class WalletDetailComponent implements OnInit {

	@Input() wallet: any;
  _show = false;
  _pwdType = 'password';
  constructor(
    private savedWalletsService : SavedWalletsService,
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes) {
    var oldWallet = changes.wallet.previousValue
    var newWallet = changes.wallet.currentValue
    if (!oldWallet || oldWallet != newWallet) {
      this._show = false
       this._pwdType = 'password';
    }
  }
  downloadFile() {
    this.savedWalletsService.downloadFile()
  }
  toggleShow() {
    this._show = !this._show;
    this._pwdType = this._show ? 'text' : 'password';

  }
}
