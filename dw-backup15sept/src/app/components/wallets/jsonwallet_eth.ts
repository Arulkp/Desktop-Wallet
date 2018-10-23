
import * as Wallet from 'ethereumjs-wallet-browser'
import * as importers from 'ethereumjs-wallet-browser/thirdparty'
import * as Transaction from 'ethereumjs-tx'
import * as ethSigUtil from 'eth-sig-util'
import * as ethUtil from 'ethereumjs-util'
import {Buffer} from 'buffer'

export class JSONEthWallet {
	private wallet : any;
  private address : string = '';
  private walletName : string = '';
  private isDecrypted : boolean = false
  private walletV3 : any;
  public exchange : 'eth';
	constructor(walletV3) {
    this.walletName = walletV3.walletName
    this.walletV3 = walletV3
    this.address = ethUtil.addHexPrefix(walletV3.address)
    this.exchange = walletV3.exchange
	}
	getAccounts() {
    return new Promise((resolve, reject) => {
    	var address = this.getAddress()
    	return resolve([address])
    })
  }
	_formatAddress() {
    if (!this.address)
      return ''
		return ethUtil.bufferToHex(this.address)
 	}
  getPrivateKeyHex() {
    if (!this.isDecrypted)
      return ''
    let pk = this.wallet.getPrivateKey()
    return ethUtil.bufferToHex(pk)

  }
 	getPrivateKey() {
    if (!this.isDecrypted)
      return ''
 		return this.wallet.getPrivateKey()
 	}
  decrypt(password) {
    if (!this.walletV3)
      return false;
  	let w
    try {
      w = importers.fromEtherWallet(JSON.stringify(this.walletV3), password)
    } catch (e) {
      console.log('Attempt to import as EtherWallet format failed, trying V3...')
    }

    if (!w) {
      try {
        w = Wallet.fromV3(JSON.stringify(this.walletV3), password, true)  
      } catch(e) {
        console.log(e)
        return false
      }
      
    }
    this.wallet = w;
    this.isDecrypted = true;
    return true
  }
  userAddress() {
    return this.address
  }
  getAddress() {
    return this.address
  }
  signEthTx(ethTx, fromAddress) {
    var _fromAddress = ethSigUtil.normalize(fromAddress)
    var privKey = this.wallet.getPrivateKey()
    ethTx.sign(privKey)
  }

  async signTransaction (txParams) {
    if (!this.isDecrypted)
      return false
    const fromAddress = txParams.from
    // add network/chain id
    const ethTx = new Transaction(txParams)
    this.signEthTx(ethTx, fromAddress)
    const rawTx = ethUtil.bufferToHex(ethTx.serialize())
    let t = ''
    return rawTx
  }
  async signMessage (msgData) {
    if (!this.isDecrypted)
      return false
    const message = ethUtil.stripHexPrefix(msgData.data)
    var privKey = this.wallet.getPrivateKey()
    var msgSig = ethUtil.ecsign(new Buffer(message, 'hex'), privKey)
    var rawMsgSig = ethUtil.bufferToHex(ethSigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    return rawMsgSig
  }
  getHashForMessage(hash) {
    return hash;
  }
  isWalletDecrypted(){
    this.isDecrypted;
  }
}

export class EthWalletHelper {
  createWalletWithJSON(JSONdata, password) {
    let w
    try {
      w = importers.fromEtherWallet(JSONdata, password)
    } catch (e) {
      console.log('Attempt to import as EtherWallet format failed, trying V3...')
    }

    if (!w) {
      try {
        w = Wallet.fromV3(JSONdata, password, true)
      } catch(e) {
        return {error : 'Wrong Password', wallet : null}
      }

    }
    return {wallet : w, error : null};
    // this.nt.setWallet(wallet)
  }
}