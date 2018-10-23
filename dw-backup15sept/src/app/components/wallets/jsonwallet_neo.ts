
import {Buffer} from 'buffer'
import Neon, {wallet as Wallet} from '@cityofzion/neon-js';

export class JSONNeoWallet {
	private wallet : any;
  private address : string = '';
  private walletName : string = '';
  private isDecrypted : boolean = false
  private key : string = ''
  private account : any;
  public exchange : 'neo';
	constructor(wallet) {
    this.walletName = wallet.walletName
    this.wallet = wallet
    this.address = wallet.address
    this.key = wallet.key
    this.exchange = wallet.exchange
	}
  decrypt(password) {
    let wif;
    try {
      wif = Wallet.decrypt(this.key, password);
      if (Neon.is.wif(wif)) {
        const account = new Wallet.Account(wif);
        this.account = account
      } else {
        return false
      }
    }
    catch (err) {
      console.log('err', err);
      return false
    }
    this.isDecrypted = true;
    return true
  }
  userAddress() {
    return this.address
  }
  getAddress() {
    return this.address
  }
  getAccountAddress() {
    return this.account._scriptHash
  }
  getPrivateKeyHex() {
    if (!this.isDecrypted)
      return ''
    return this.account._privateKey;
  }
  getKey() {
    return this.key
  }
  getWIF() {
    return this.account.WIF
  }
  signEthTx(ethTx, fromAddress) {
  }

  async signTransaction (txParams) {
    if (!this.isDecrypted)
      return false
  }
  async signMessage (msgData) {
    if (!this.isDecrypted)
      return false
  }
  isWalletDecrypted(){
    this.isDecrypted;
  }
}

export class NeoWalletHelper {
  public DEFAULT_WALLET = {
    version: '1.0',
    scrypt: {
      cost: 16384,
      blockSize: 8,
      parallel: 8,
      size: 64
    },
    wallet : null,
    extra: null
  };
  generateWallet(passphrase, name) {
    const account = new Wallet.Account(Wallet.generatePrivateKey());
    // const {WIF, address} = account;
    // const encryptedWIF = Wallet.encrypt(WIF, passphrase);
    // const wallletData = {
    //   walletName: name,
    //   address: address,
    //   key: encryptedWIF
    // };
    // return wallletData
    return account
  }
  createWalletWithJSON(JSONdata, password) {
    let wif;
    let wallet = this.DEFAULT_WALLET;
    let walletObj = JSON.parse(JSONdata)
    try {
      wif = Wallet.decrypt(walletObj.accounts[0].key, password);
      if (Neon.is.wif(wif)) {
        const account = new Wallet.Account(wif);
        // const {WIF, address} = account;
        // const wallletData = {
        //   walletName: walletObj.walletName || walletName,
        //   address: address,
        //   key: walletObj.key
        // };
        // return wallletData
        return {error : null, wallet : account}
      } else {
        return {error : 'Error', wallet : null}
      }
    }
    catch (err) {
      console.log('err', err);
      return {error : err.message, wallet : null}
    }
  }

  createWalletWithPrivate(privateKey) {
    if (!Wallet.isWIF(privateKey) && !Wallet.isPrivateKey(privateKey)) {
      return {error : 'Invalid Private Key', wallet : null}
    }
    const account = new Wallet.Account(privateKey);
    // const encryptedWIF = Wallet.encrypt(account.WIF, password);
    // const wallletData = {
    //   walletName: walletName,
    //   address: account.address,
    //   key: encryptedWIF
    // };
    // return wallletData;
    return {error : null, wallet : account}
  }
  getKeyForAccount(account, password) {
    return Wallet.encrypt(account.WIF, password)
  }
}

