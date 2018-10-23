import { Injectable } from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import * as Wallet from 'ethereumjs-wallet-browser'
import * as importers from 'ethereumjs-wallet-browser/thirdparty'
import * as ethUtil from 'ethereumjs-util'
import * as Transaction from 'ethereumjs-tx'
// import * as EthQuery from 'eth-query'
import * as ethSigUtil from 'eth-sig-util'
import {Buffer} from 'buffer'


@Injectable()
export class CustomWalletService {

	userAddress$ : ReplaySubject<string> = new ReplaySubject(1);
	wallet : any;
  isInitialized : boolean = false
  // query : EthQuery;
  constructor() {
  	this.authAccountFromJSON = this.authAccountFromJSON.bind(this)
    this.authAccountFromPrivateKey = this.authAccountFromPrivateKey.bind(this)
		// this.getAddress = this.getAddress.bind(this)
		this.getPrivateKey = this.getPrivateKey.bind(this)
    this.getPrivateKeyHex = this.getPrivateKeyHex.bind(this)
    this.userAddress = this.userAddress.bind(this)
    this.getAccounts = this.getAccounts.bind(this)
    this.isWalletInitialized = this.isWalletInitialized.bind(this)
    this.setWallet = this.setWallet.bind(this)
    this.getHashForMessage = this.getHashForMessage.bind(this)
  }
  setWallet(wallet) {
    this.wallet = wallet
    this.isInitialized = true
  }
  getHashForMessage(hash) {
    return this.wallet.getHashForMessage(hash)
  }
  isWalletInitialized() {
    return this.isInitialized
  }  
  getPrivateKeyHex() {
    let pk = this.wallet.getPrivateKey()
    return ethUtil.bufferToHex(pk)
  }
 	getPrivateKey() {
 		return this.wallet.getPrivateKey()
 	}
  authAccountFromJSON(input, password) {
  	let w
    try {
      w = importers.fromEtherWallet(input, password)
    } catch (e) {
      console.log('Attempt to import as EtherWallet format failed, trying V3...')
    }

    if (!w) {
      try {
        w = Wallet.fromV3(input, password, true)  
      } catch(e) {
        return {status : -1, error : e}
      }
      
    }
    this.wallet = w;
    this.isInitialized = true
    return {status : 1}
    // this.nt.setWallet(wallet)
  }
  authAccountFromPrivateKey(privateKey) {
    let w
    if (!privateKey)
      return {status : 0}
    privateKey = ethUtil.stripHexPrefix(privateKey)
    let pk = new Buffer(privateKey, 'hex')
    w  = Wallet.fromPrivateKey(pk)

    this.wallet = w;
    this.isInitialized = true
    return {status : 1}
  }
  userAddress() {
    if (!this.wallet)
      return []
  	return this.wallet.userAddress()
  }
  getAccounts(cb) {
    setTimeout(async () => {
      if (!this.wallet)
        cb({message : 'Error'})
      let addresses = await this.wallet.getAccounts()
      cb(null, addresses)
    })
  }

  signTransaction (txParams) {
    return this.wallet.signTransaction(txParams)
  }
  signMessage (msgData) {
    return this.wallet.signMessage(msgData)
  }
  
}
