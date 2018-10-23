

import * as Wallet from 'ethereumjs-wallet-browser'
import * as Transaction from 'ethereumjs-tx'
import * as ethSigUtil from 'eth-sig-util'
import {Buffer} from 'buffer'
import * as ethUtil from 'ethereumjs-util'

export class PrivateKeyWallet {
	wallet : any
	constructor(privateKey) {
    this.authAccountFromPrivateKey(privateKey)
	}
  getAccounts() {
    return new Promise((resolve, reject) => {
      var address = this.userAddress()
      return resolve([address])
    })
  }
	_formatAddress() {
    if (!this.wallet || !this.wallet.getAddress())
      return ''
 		const addressKeyBuffer = this.wallet.getAddress()
		return ethUtil.bufferToHex(addressKeyBuffer)
 	}
  getPrivateKeyHex() {
    let pk = this.wallet.getPrivateKey()
    return ethUtil.bufferToHex(pk)
  }
 	getPrivateKey() {
 		return this.wallet.getPrivateKey()
 	}
  authAccountFromPrivateKey(privateKey) {
    let w
    if (!privateKey)
      return {status : 0}
    privateKey = ethUtil.stripHexPrefix(privateKey)
    let pk = new Buffer(privateKey, 'hex')
    w  = Wallet.fromPrivateKey(pk)

    this.wallet = w;
  }
  userAddress() {
  	return this._formatAddress()
  }
  signEthTx(ethTx, fromAddress) {
    var _fromAddress = ethSigUtil.normalize(fromAddress)
    var privKey = this.wallet.getPrivateKey()
    ethTx.sign(privKey)
  }

  async signTransaction (txParams) {
    const fromAddress = txParams.from
    // add network/chain id
    const ethTx = new Transaction(txParams)
    this.signEthTx(ethTx, fromAddress)
    const rawTx = ethUtil.bufferToHex(ethTx.serialize())
    let t = ''
    return rawTx
  }
  signMessage (msgData) {
    const message = ethUtil.stripHexPrefix(msgData.data)
    var privKey = this.wallet.getPrivateKey()
    let x = new Buffer(message, 'hex');
    var msgSig = ethUtil.ecsign(new Buffer(message, 'hex'), privKey)
    var rawMsgSig = ethUtil.bufferToHex(ethSigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    return rawMsgSig
  }
  getHashForMessage(hash) {
    return hash;
  }
}