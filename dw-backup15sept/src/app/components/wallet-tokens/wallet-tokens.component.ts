import {Component, OnInit, Input} from '@angular/core';
import {NeoService} from '../../services/neo.service';

@Component({
  selector: 'wallet-tokens',
  templateUrl: './wallet-tokens.component.html',
  styleUrls: ['./wallet-tokens.component.css']
})
export class WalletTokensComponent implements OnInit {

  @Input() wallet: any;
  public walletToken: any;

  constructor(private neoService: NeoService) {

  }

  ngOnInit() {
    this.neoService.getTokenDetail().then((res) => {
      console.log('token', res);
      this.walletToken = res['balance'];
    });
  }

}
