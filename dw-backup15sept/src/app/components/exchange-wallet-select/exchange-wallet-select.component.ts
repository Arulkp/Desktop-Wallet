import { Component, OnInit, Input,SimpleChanges, NgZone } from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service'
import {MarketBroadcastService} from '../../services/market-broadcast.service'
@Component({
  selector: 'exchange-wallet-select',
  templateUrl: './exchange-wallet-select.component.html',
  styleUrls: ['./exchange-wallet-select.component.css']
})
export class ExchangeWalletSelectComponent implements OnInit {

  public displayRequest = 'none';
  public displayWrongPassword = 'none';
	private ethWallets : Array<any> = []
	private neoWallets : Array<any> = []
  public wallets : Array<any> = []
	public selectedWallet : any = "";
  public password : any;
  public pSelectedWallet : any = "";
  private previousExchange : any;
  public selectedExchange : any;
  private savedWalletsServiceSub : any;
  private marketBroadcastServiceSub : any;
  public showFullScreen : boolean = true
  public passwordError : any = {}
  public showSpinner = false;
  @Input() exchangeName : any;
  @Input() walletAddress : any;
  @Input() successCallback : any;
  @Input()  cancel : any;
  @Input() showCancel : any;
  public exchanges = [{
    name : 'ETH',
    _name : 'eth'
  }, {
    name : 'NEO',
    _name : 'neo'
  }];
  constructor(
  	private savedWalletsService : SavedWalletsService,
    private marketBroadcastService : MarketBroadcastService,
    private zone : NgZone,
  ) {
    this.useWalletFullscreen = this.useWalletFullscreen.bind(this)
    this.getWalletsForExchange = this.getWalletsForExchange.bind(this)
    this.success = this.success.bind(this)
  }
  ngOnDestroy() {
    if (this.savedWalletsServiceSub)
      this.savedWalletsServiceSub.unsubscribe()
    if (this.marketBroadcastServiceSub)
      this.marketBroadcastServiceSub.unsubscribe()
  }
  setSelectedExchange(e) {
    this.selectedExchange = e
    if (this.selectedExchange && this.selectedExchange == this.previousExchange)
      return;
    if (this.previousExchange)
      this.previousExchange.isSelected = false
    this.previousExchange = this.selectedExchange
    this.selectedExchange.isSelected = true
    // this.marketBroadcastService.resetAll()
    // this.marketBroadcastService.setSelectedExchange(this.selectedExchange._name)
    this.selectedWallet = ''
    //this.savedWalletsService.setCurrentWallet("")
    this.updateWalletData()
    this.getWalletsForExchange()
    sessionStorage.setItem('exchange', e._name)
  }
  getWalletsForExchange() {
    if (this.selectedExchange._name == 'eth') {
      this.wallets = this.savedWalletsService.getEthWallets()
    }
    else if (this.selectedExchange._name == 'neo') {
      this.wallets = this.savedWalletsService.getNeoWallets()
    }
  }
  updateWalletData() {
  	this.ethWallets = this.savedWalletsService.getEthWallets()
  	this.neoWallets = this.savedWalletsService.getNeoWallets()

  }
  updateCurrentWalletChanged() {
  	var currentWallet = this.savedWalletsService.getCurrentWallet()
  	this.selectedWallet = currentWallet
    if (!currentWallet)
      this.pSelectedWallet = ""
  }
  shouldDisableBtnFS() {
    return !this.selectedWallet || !this.selectedWallet.isDecrypted && !this.password
  }
  success() {
    var prevSelectedExchange = this.marketBroadcastService.getSelectedExchange()
    sessionStorage.setItem('walletAddress', this.selectedWallet.address)
    sessionStorage.setItem('exchange', this.selectedExchange._name)
    if (!prevSelectedExchange || prevSelectedExchange != this.selectedExchange._name) {
      this.marketBroadcastService.resetForExchangeChange()
      this.marketBroadcastService.setSelectedExchange(this.selectedExchange._name)
    }
    this.savedWalletsService.setCurrentWallet('')
    setTimeout(() => {
      this.savedWalletsService.setCurrentWallet(this.selectedWallet)
    },0)
    this.successCallback()
  }
  useWalletFullscreen() {
    this.passwordError = {}
    if (this.selectedWallet && this.selectedWallet.isDecrypted) {
      this.success()
      return
    }
    if (!this.password) {
      this.passwordError.required = true
      return;
    }
    this.zone.run(() => {
      this.showSpinner = true
    })
    setTimeout(() => {
      if (this.selectedWallet.decrypt(this.password) === false) {
        this.zone.run(() => {
          this.showSpinner = false
        })
        this.passwordError.invalid = true
        return;
      }
      this.password = ''
      this.zone.run(() => {
        this.showSpinner = false
      })
      this.success()
    }, 10)
    // do other things
  }
  ngOnInit() {
  }
  ngOnChanges(changes) {
    var walletAddress = changes.walletAddress.currentValue
    var exchangeName = changes.exchangeName.currentValue
    if (exchangeName) {
      var selectedExchange = this.exchanges.filter(a => {
        return exchangeName == a._name
      })[0]
      if (this.selectedExchange && this.selectedExchange._name !== selectedExchange._name) {
        this.selectedWallet = ""
      }
      this.selectedExchange = selectedExchange
      this.selectedExchange.isSelected = true;
      this.previousExchange = this.selectedExchange
      this.getWalletsForExchange()
    }

    if (walletAddress) {
      var selectedWallet = this.wallets.filter(a => {
        return a.address == walletAddress
      })[0]
      this.selectedWallet = selectedWallet
    } else {
      this.selectedWallet = ""
    }

  }
  onSelectChange() {
    if (this.pSelectedWallet && this.pSelectedWallet == this.selectedWallet) {
      return;
    }
      this.pSelectedWallet = this.selectedWallet
  	// if (!this.selectedWallet.isDecrypted) {
   //    this.requestForTheme()
   //    return;
   //  }
  	// this.savedWalletsService.setCurrentWallet(this.selectedWallet)
  }

  requestForTheme(w) {
    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
      this.selectedWallet = w;
    } else {
      if (!w) {
        this.savedWalletsService.setCurrentWallet("");
      }
      this.displayRequest = 'none';
      this.selectedWallet = "";
    }
  }

  handleWalletPassword() {
    this.password;
    if (this.selectedWallet.decrypt(this.password) === false) {
      this.displayWrongPassword = 'block';
    }
    else {
      // this.savedWalletsService.setCurrentWallet("");
      this.savedWalletsService.setCurrentWallet(this.selectedWallet)
      this.password = '';
      this.displayRequest = 'none';
    }
  }

  getButtonClass(isSelected,index){
    if (isSelected){
      return `selected button${index + 1}`
    }
    else {
      return `button${index + 1}`
    }
  }
}
