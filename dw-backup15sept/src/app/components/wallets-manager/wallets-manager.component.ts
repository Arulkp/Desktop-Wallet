import {Component, OnInit, NgZone} from '@angular/core';
import {NeoService} from '../../services/neo.service';

@Component({
  selector: 'wallets-manager',
  templateUrl: './wallets-manager.component.html',
  styleUrls: ['./wallets-manager.component.css']
})
export class WalletsManagerComponent implements OnInit {

  public privateKey;
  // sub : any;
  public walletDetail: any;
  public selectedTab: string = 'wallets-eth';
  public tokenOrDetail = 'nodetails';

  constructor(private ngZone: NgZone,
              private neoService: NeoService) {
    this.handleWalletDetail = this.handleWalletDetail.bind(this);
    this.setCurrentTab = this.setCurrentTab.bind(this);
    this.handleWalletTokens = this.handleWalletTokens.bind(this);
    this.redirectToInfoEth = this.redirectToInfoEth.bind(this);
    this.redirectToInfoNeo = this.redirectToInfoNeo.bind(this);
    this.redirectToInfoWan = this.redirectToInfoWan.bind(this);
    this.redirectToInfoAion = this.redirectToInfoAion.bind(this);
    
  }

  ngOnInit() {
    // this.sub = this.route
    //   .data
    //   .subscribe(v => console.log(v));
  }

  setCurrentTab(tab) {
    if (tab != this.selectedTab) {
      this.tokenOrDetail = 'nodetails';
    }
    this.selectedTab = tab;
  }

  redirectToInfoEth() {
    this.setCurrentTab('wallets-eth');
  }

  redirectToInfoNeo() {
    this.setCurrentTab('wallets-neo');
  }

  redirectToInfoAion() {
    this.setCurrentTab('wallets-aion');
  }

  redirectToInfoWan() {
    console.log('redirectToInfoWan', this);
    this.setCurrentTab('wallets-wan');
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }

  handleWalletDetail(w) {
    this.walletDetail = null;
    this.ngZone.run(() => {
      this.walletDetail = w;
      this.tokenOrDetail = 'detail';
    });

  }

  handleWalletTokens(w) {
    this.tokenOrDetail = 'tokens';
    this.walletDetail = w;
    this.neoService.setAddressForTokenDetail(w.address);
  }

  handleAddWalletPrivateKey() {

  }


}
