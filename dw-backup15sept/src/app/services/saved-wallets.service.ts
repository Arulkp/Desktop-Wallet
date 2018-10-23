import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as EthWallet from 'ethereumjs-wallet-browser';
import {JSONEthWallet, EthWalletHelper} from '../components/wallets/jsonwallet_eth';
import {JSONNeoWallet, NeoWalletHelper} from '../components/wallets/jsonwallet_neo';
import {JSONWanWallet, WanWalletHelper} from '../components/wallets/jsonwallet_wan';
import {JSONAionWallet, AionWalletHelper} from '../components/wallets/jsonwallet_aion';
import * as ethUtil from 'ethereumjs-util';
import {AwsService} from './aws.service';
import {AionService} from './aion.service';

var nacl=require('tweetnacl');
var Web3 = require('aion-web3-v1.0')

// if (window['require']) {
//   const fs = window.require('fs');
//   const electron = window.require('electron');
//   var remote = window.require('electron').remote;
//   const app = remote.app;
// } else {
//   const fs = {}
//   const electron = {}
//   var remote = {}
//   const app = {}
// }
const {electron, shell} = window.require('electron');
var remote = window.require('electron').remote;
const app = remote.app;
const fs = window.require('fs-extra');
const path = window.require('path');
declare var window: any;

@Injectable()
export class SavedWalletsService {
  public aion:any;
  public privatekey:any;
  private ethWallets: Array<any> = [];
  private neoWallets: Array<any> = [];
  private wanWallets: Array<any> = [];
  private aionWallets: Array<any> = [];
  private baseCurrency: string = 'eth';
  private currentWallet: any;
  private _serviceStatus = new BehaviorSubject<any>('initializing');
  public serviceStatus$ = this._serviceStatus.asObservable();
  private neoWalletHelper: any;
  private ethWalletHelper: any;
  private wanWalletHelper: any;
  private aionWalletHelper: any;
  private keyStorePath: string = path.join('library', 'wallet', 'keystore');

  constructor(private awsservice: AwsService, private aionservice: AionService) {
    this.aion = new Web3(new Web3.providers.HttpProvider("http://18.191.165.67:8545"));
    this.saveEthToJson = this.saveEthToJson.bind(this);
    this.saveNeoToJson = this.saveNeoToJson.bind(this);
    this.getEthWallets = this.getEthWallets.bind(this);
    this.getNeoWallets = this.getNeoWallets.bind(this);
    this.addNewEthWallet = this.addNewEthWallet.bind(this);
    this.addNewNeoWallet = this.addNewNeoWallet.bind(this);
    this.setCurrentWallet = this.setCurrentWallet.bind(this);
    this.hasWalletWithName = this.hasWalletWithName.bind(this);
    this.hasWallets = this.hasWallets.bind(this);

    this.neoWalletHelper = new NeoWalletHelper();
    this.ethWalletHelper = new EthWalletHelper();
    this.wanWalletHelper = new WanWalletHelper();
    this.aionWalletHelper = new AionWalletHelper();

    this.getWallet();
  }
  
  generateKey()
  {
   
    var keys = nacl.sign.keyPair();
   this.privatekey='0x' + new Buffer(keys.secretKey, 'hex').toString('hex');
    var address= this.aion.eth.accounts.privateKeyToAccount(this.privatekey);
    return address;
  }
  getWallet() {
    this.ethWallets = [];
    this.neoWallets = [];
    this.wanWallets = [];
    this.aionWallets = [];
    var homePath = app.getPath('home');
    var folderPath = path.join(homePath, this.keyStorePath);
    fs.readdir(folderPath, (err, files) => {
      if (err)
        return;
      let length = files.length;
      files.forEach(file => {
        console.log(file.indexOf('utc'));
        if (file.toLowerCase().indexOf('utc') !== -1)
          try {
            var filePath = path.join(folderPath, file);
            var data = fs.readFileSync(filePath, 'utf-8');
            var a = JSON.parse(data);
            var j = null;
            if (a.exchange == 'neo')
              j = new JSONNeoWallet(a);
            else if (a.exchange == 'eth')
              j = new JSONEthWallet(a);
            else if (a.exchange == 'wan')
              j = new JSONWanWallet(a);
            else if (a.exchange == 'aion')
              j = new JSONAionWallet(a);
            // j.decrypt('password')
            if (a.exchange == 'eth')
              this.ethWallets.push(j);
            else if (a.exchange == 'neo')
              this.neoWallets.push(j);
            else if (a.exchange == 'wan')
              this.wanWallets.push(j);
            else if (a.exchange == 'aion')
              this.aionWallets.push(j);
          } catch (err) {
            console.log(err.message);
          }

      });
      this._serviceStatus.next('ready');
      // if (!this.currentWallet) {
      //   var currentWallet = this.getEthWallets() && this.getEthWallets().length ? this.getEthWallets()[0] : null;
      //   setTimeout(() => {
      //     this.setCurrentWallet(currentWallet)
      //   })

      // }
    });
  }

  saveEthToJson(walletName, password, wallet) {
    let a = wallet.toV3(password, {
      kdf: 'scrypt',
      n: 8192
    });
    a['walletName'] = walletName;
    a['exchange'] = 'eth';
    // console.log('app', app.getPath('home'));
    var homePath = app.getPath('home');
    var filePath = path.join(homePath, this.keyStorePath, `utc-${(new Date()).getTime()}_eth_${a.address}.json`);
    fs.ensureFileSync(filePath);
    try {
      let data = {
        type: 'ETH',
        address: a.address
      };
      this.awsservice.addItemNewWallet(data);
      console.log('eth', a);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return {error: err};
    }
    return a;
  }
  saveWanToJson(walletName, password, wallet) {
    let a = wallet.toV3(password, {
      kdf: 'scrypt',
      n: 8192
    });
    a['walletName'] = walletName;
    a['exchange'] = 'wan';
    // console.log('app', app.getPath('home'));
    var homePath = app.getPath('home');
    var filePath = path.join(homePath, this.keyStorePath, `utc-${(new Date()).getTime()}_wan_${a.address}.json`);
    fs.ensureFileSync(filePath);
    try {
      let data = {
        type: 'WAN',
        address: a.address
      };
      //this.awsservice.addItemNewWallet(data);
      console.log('eth', a);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return {error: err};
    }
    return a;
  }

  saveAionToJson(walletName, password, wallet) {
    console.log("saveAionToJson");
    
    console.log(walletName, password, wallet);
    
    let a =this.aionWalletHelper.password(password,wallet.publickey,wallet._privkey)
    a['walletName'] = walletName;
    a['exchange'] = 'aion';
    // console.log('app', app.getPath('home'));
    var homePath = app.getPath('home');
    var filePath = path.join(homePath, this.keyStorePath, `utc-${(new Date()).getTime()}_aion_${wallet.address}.json`);
    fs.ensureFileSync(filePath);
    try {
      let data = {
        type: 'AION',
        address: a.address
      };
      this.awsservice.addItemNewWallet(data);
      console.log('aion', a);
      fs.writeFileSync(filePath,a);
    } catch (err) {
      return {error: err};
    }
    return a;
  }

  saveNeoToJson(walletName, password, wallet) {
    let a = {
      walletName,
      exchange: 'neo',
      address: wallet._address,
      key: this.neoWalletHelper.getKeyForAccount(wallet, password)
    };
    var homePath = app.getPath('home');
    var filePath = path.join(homePath, this.keyStorePath, `utc-${(new Date()).getTime()}_neo_${a.address}.json`);
    fs.ensureFileSync(filePath);
    try {
      console.log('eth', a);
      let data = {
        type: 'NEO',
        address: a.address
      };
      this.awsservice.addItemNewWallet(data);
      fs.writeFileSync(filePath, JSON.stringify(a));
    } catch (err) {
      return {error: err};
    }
    return a;
  }

  getEthWallets() {
    return this.ethWallets.slice();
  }

  getNeoWallets() {
    return this.neoWallets.slice();
  }
  getWanWallets() {
    return this.wanWallets.slice();
  }
  getAionWallets() {
    return this.aionWallets.slice();
  }

  newNeoWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == 'private' || data.type == 'json') {
      var a = this.saveNeoToJson(data.walletName, data.password, wallet);
      walletData = new JSONNeoWallet(a);
      deCryptedNewWallet = new JSONNeoWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return {walletData, deCryptedNewWallet};
  }

  newEthWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == 'private' || data.type == 'json') {
      var a = this.saveEthToJson(data.walletName, data.password, wallet);
      walletData = new JSONEthWallet(a);
      deCryptedNewWallet = new JSONEthWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return {walletData, deCryptedNewWallet};
  }

  newWanWalletSetUp(data, wallet) {
    var walletData, deCryptedNewWallet;
    if (data.type == 'private' || data.type == 'json') {
      var a = this.saveWanToJson(data.walletName, data.password, wallet);
      walletData = new JSONWanWallet(a);
      deCryptedNewWallet = new JSONWanWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return {walletData, deCryptedNewWallet};
  }

  newAionWalletSetUp(data, wallet) {
    console.log(data);
    console.log(wallet);
        
    var walletData, deCryptedNewWallet;
    if (data.type == 'private' || data.type == 'json') {
      var a = this.saveAionToJson(data.walletName, data.password, wallet);
      walletData = new JSONAionWallet(a);
      deCryptedNewWallet = new JSONAionWallet(a);
      deCryptedNewWallet.decrypt(data.password);
    }

    return {walletData, deCryptedNewWallet};
  }

  addNewEthWallet(data, wallet) {
    data['exchange'] = 'eth';
    var address = wallet._address;
    var ethWallets = this.getEthWallets();
    for (let w of ethWallets) {
      if (w.address == wallet.getAddressString()) {
        return {error: 'Duplicate!! Wallet already added', wallet: null};
      }
    }
    var {walletData, deCryptedNewWallet} = this.newEthWalletSetUp(data, wallet);
    this.ethWallets.push(walletData);
    this._serviceStatus.next('newWalletAdded');
    return {error: '', wallet: deCryptedNewWallet};

  }

  addNewWanWallet(data, wallet) {
    console.log("addNewWanWallet");
    
    console.log(data);
    console.log(wallet);

    data['exchange'] = 'wan';
    var address = wallet._address;
    var ethWallets = this.getWanWallets();
    for (let w of ethWallets) {
      if (w.address == wallet.getAddressString()) {
        return {error: 'Duplicate!! Wallet already added', wallet: null};
      }
    }
    var {walletData, deCryptedNewWallet} = this.newWanWalletSetUp(data, wallet);
    this.wanWallets.push(walletData);
    this._serviceStatus.next('newWalletAdded');
    return {error: '', wallet: deCryptedNewWallet};

  }

  addNewAionWallet(data, wallet) {
    console.log("addNewAionWallet");
    
    console.log(data);
    console.log(wallet);
    
    
    data['exchange'] = 'aion';
    var address = wallet._address;
    var ethWallets = this.getAionWallets();
    //debugger;
    for (let w of ethWallets) {
      if (w.address == wallet.getAddressString()) {
        return {error: 'Duplicate!! Wallet already added', wallet: null};
      }
    }
    var {walletData, deCryptedNewWallet} = this.newAionWalletSetUp(data, wallet);
    this.aionWallets.push(walletData);
    this._serviceStatus.next('newWalletAdded');
    return {error: '', wallet: deCryptedNewWallet};

  }

  addNewNeoWallet(data, wallet) {
    data['exchange'] = 'neo';
    // check for duplicates
    var address = wallet._address;
    var neoWallets = this.getNeoWallets();
    for (let w of neoWallets) {
      if (w.address == wallet._address) {
        return {error: 'Duplicate!! Wallet already added', wallet: null};
      }
    }
    var {walletData, deCryptedNewWallet} = this.newNeoWalletSetUp(data, wallet);
    this.neoWallets.push(walletData);
    this._serviceStatus.next('newWalletAdded');
    return {error: '', wallet: deCryptedNewWallet};
  }

  setCurrentWallet(wallet) {
    if (!wallet) {
      this.currentWallet = wallet;
      this._serviceStatus.next('ready');
      // this._serviceStatus.next('currentWalletChanged');
      return;
    }
    var oldWallet = this.currentWallet;
    this.currentWallet = wallet;

    if (wallet) {
      this._serviceStatus.next('currentWalletChanged');
    }
  }

  getCurrentWallet() {
    return this.currentWallet;
  }

  generateWallet(exchange) {
    if (exchange == 'eth') {
      return EthWallet.generate();
    } else if (exchange == 'neo') {
      return this.neoWalletHelper.generateWallet();
    } else if (exchange == 'wan') {
      return EthWallet.generate();
    } else if (exchange == 'aion') {
      return this.generateKey();
    }

  }

  createWalletWithPrivate(privateKey, exchange) {
    let w = {
      error: '',
      wallet: ''
    };
    if (exchange == 'eth') {
      privateKey = ethUtil.stripHexPrefix(privateKey);
      let pk = new Buffer(Buffer.from(privateKey, 'hex'));
      w.wallet = EthWallet.fromPrivateKey(pk);

    } else if (exchange == 'neo') {
      w = this.neoWalletHelper.createWalletWithPrivate(privateKey);
    } else if (exchange == 'wan') {
      privateKey = ethUtil.stripHexPrefix(privateKey);
      let pk = new Buffer(Buffer.from(privateKey, 'hex'));
      w.wallet = EthWallet.fromPrivateKey(pk);
    } else if (exchange == 'aion') {
      privateKey = ethUtil.stripHexPrefix(privateKey);
      let pk = new Buffer(Buffer.from(privateKey, 'hex'));
      w.wallet = EthWallet.fromPrivateKey(pk);
    }
    return w;
  }

  createWalletWithJSON(jsonData, password, exchange) {
    if (exchange == 'eth') {
      var {error, wallet} = this.ethWalletHelper.createWalletWithJSON(jsonData, password);
    } else if (exchange == 'neo') {
      var {error, wallet} = this.neoWalletHelper.createWalletWithJSON(jsonData, password);
    } else if (exchange == 'wan') {
      var {error, wallet} = this.wanWalletHelper.createWalletWithJSON(jsonData, password);
    } else if (exchange == 'aion') {
      var {error, wallet} = this.aionWalletHelper.createWalletWithJSON(jsonData, password);
    }
    return {error, wallet};
  }

  downloadFile() {
    var path = app.getPath('home');
    path += '/Library/wallet/keystore/';
    shell.showItemInFolder(path);
  }

  hasWalletWithName(name, exchange) {
    var walletList = exchange == 'eth' ? this.ethWallets : (exchange == 'neo' ? this.neoWallets : []);
    var found = false;
    if (!name)
      return false;
    for (let w of walletList) {
      if (w.name === name) {
        found = true;
        break;
      }
    }
    return found;
  }

  hasWallets() {
    return this.ethWallets.length || this.neoWallets.length;
  }

}

//JSONAionWallet
//AionWalletHelper

