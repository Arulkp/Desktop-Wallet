import * as importers from 'ethereumjs-wallet-browser/thirdparty'
import * as Wallet from 'ethereumjs-wallet-browser'

//import * as randomBytes from'random-bytes';
//var randomBytes = require('random-bytes');
 //var crytt = require('browserify-aes');
 var cryptobrowserify = require('crypto-browserify');
var nacl=require('tweetnacl');
var Web3 = require('aion-web3-v1.0')
// import { AionWeb3Service } from '../aion-web3.service';
var blake2b = require('blakejs');
var blake2bHex = blake2b.blake2bHex;
var blake2B = blake2b.blake2b;
//const RLP = require('../../RLP.js');
var RLP=require('./RLP.js');
//var globalFuncs = require('../../globalFuncs.js');
var ethUtil = require('ethereumjs-util');
//ethUtil.crypto= require('crypto');
var cryt=require('crypto');

ethUtil.scrypt=require('scryptsy');;
declare var Buffer: any;
export class JSONAionWallet {
  private isDecrypted : boolean = false
  private wallet : any;
  public privatekey;
  public aion_web3;
  private address : any;
  private walletName : string = '';
  private walletV3 : any;
  public exchange : 'aion';
    constructor(walletV3) {
    this.aion_web3 = new Web3(new Web3.providers.HttpProvider("http://18.191.165.67:8545"));
    console.log(walletV3);
    this.walletName = walletV3.walletName
    this.wallet = walletV3
    this.address = walletV3.address
    this.privatekey = walletV3.key
    this.exchange = walletV3.exchange
  }
  getPrivateKey() {
    // if (!this.isDecrypted)
    //   return ''
     return this.privatekey;
  }
  
  generateKey()
  {
    var web3Instance=this.aion_web3.getWeb3();
    var keys = nacl.sign.keyPair();
    this.privatekey='0x' + new Buffer(keys.secretKey, 'hex').toString('hex');
    console.log(this.privatekey);
    console.log(this.aion_web3);
    this.address= web3Instance.eth.accounts.privateKeyToAccount(this.privatekey);
    console.log(this.privatekey,this.address);
  }
  userAddress() {
    return this.address
  }
  getAddress() {
    return this.address
  }
  getKey() {
    return this.privatekey
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
}
export class AionWalletHelper{
 

  public publicbufferkey:any;
  public privatebufferkey:any;
  public encfile:any;
  public key:any;
  
   encode1(password){
     console.log("aion",ethUtil);
 console.log(ethUtil.scrypt);
 var salt=cryptobrowserify.randomBytes(32);
    console.log(salt);
    console.log(cryptobrowserify)
     //var n = 262144;
     var n = 8192;
     var p = 1;
     var r = 8;
     var dklen = 32;
    console.log(r+" "+p);
 
     var kdfparams=[];
     kdfparams[0] = "";
     kdfparams[1] = dklen;
     kdfparams[2] = n;
     kdfparams[3] = p;
     kdfparams[4] = r;
     kdfparams[5] = salt.toString('hex');
     var Kdfparams = RLP.encode(kdfparams);
 
     var tempParams = cryptobrowserify.randomBytes(16);
     var cipherparams=[];
     cipherparams[0] = tempParams.toString('hex');
     var Cipherparams = RLP.encode(cipherparams);
     var derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer (salt,'hex'), n, r, p, dklen);
     console.log(derivedKey);
     var cipher = cryptobrowserify.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), tempParams);
     console.log(cipher);
     var ciphertext = Buffer.concat([cipher.update(this.privatebufferkey), cipher.final()]);
     var mac = blake2bHex(Buffer.concat([new Buffer(derivedKey.slice(16,32)),ciphertext]),'',32);
     var crypto=[];
     crypto[0] = 'aes-128-ctr'; // cypher
     crypto[1] = ciphertext.toString('hex');
     crypto[2] = "scrypt"; 
     crypto[3] = mac;
     crypto[4] = Cipherparams;
     crypto[5] = Kdfparams;
     var Crypto = RLP.encode(crypto);
     var keystore = [];
     keystore[0] = cryptobrowserify.randomBytes(16).toString('hex');
     keystore[1] = 3;
     keystore[2] = Buffer(this.publicbufferkey, 'hex').toString('hex');
     keystore[3] = Crypto;
     console.log(keystore);
     var Keystore = RLP.encode(keystore);
     console.log("keystore[2]",keystore[2]);
     console.log( Keystore);
     return Keystore;
   }
  
   password(password,publickey,privatekey){
     
     this.privatebufferkey=privatekey;
     this.publicbufferkey=publickey;
    var encoded= this.encode1(password);

    return {};
  }
}