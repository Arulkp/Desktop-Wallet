import {Injectable} from '@angular/core';
import {Constants} from '../models/constants';
import {BigNumber} from 'bignumber.js';
import {type} from 'os';
import {MessageContentType, MessageModel, MessageType} from '../models/message.model';
import {Http, RequestOptions, Headers} from '@angular/http';

@Injectable()
export class NeoService {
  private _Neon: any;
  private Neon: any;
  private account: any;
  private scriptHash: string;
  private address: string;
  private withDrawHash: any;
  private trackTransactioTimer: any;
  private status: any;
  private updateBasket: any;
  private config = {
    name: 'PrivateNet',
    extra: {
      neoscan: Constants.NEOSCAN_URL
    }
  };
  private client: any;
  private privateNet: any;

  constructor(private http: Http,) {
    this.Neon = window['Neon'];
    this._Neon = this.Neon.default;
    this.client = this._Neon.create.rpcClient(Constants.RPC_URL, '2.3.2');
    this.privateNet = new this.Neon.rpc.Network(this.config);
    this._Neon.add.network(this.privateNet);

  }

  getWallet(WIF) {
    return new Promise((resolve, reject) => {
      let account = new this.Neon.wallet.Account(WIF);
      resolve(account);
    });
  }

  getConfigCreator(operation, args) {
    return {
      scriptHash: Constants.contractScriptHash,
      operation: operation,
      args: args
    };
  }

  getState() {
    return new Promise((resolve, reject) => {
      console.log(this.getConfigCreator('getState', ''));
      const script = this._Neon.create.script(this.getConfigCreator('getState', ''));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          resolve(res.result.stack[0]);
        }, error => {
          console.log('error', error);
          reject(error);
        });
    });
  }

  signTx(tx, publicKey) {
    console.log(this.account.privateKey);
    return Promise.resolve(tx.sign(this.account.privateKey));
  }

  reverseHex(value) {
    return this.Neon.u.reverseHex(value);
  }

  getTokenBalance(tokenSH, address) {
    return new Promise((resolve, reject) => {
      const tokenBalConfig = {
        scriptHash: tokenSH,
        operation: 'balanceOf',
        args: [this.Neon.u.reverseHex(address)]
      };

      const script = this._Neon.create.script(tokenBalConfig);

      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          if (res.result.stack[0].value !== '') {
            resolve({balance: new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON()});
          } else {
            resolve({balance: 0});
          }
        });
    });
  }

  // tokenTransfer(tokenSH, amount) {
  //   return new Promise((resolve, reject) => {
  //     const from = this.Neon.u.reverseHex(Constants.deafult_scriptHash);
  //     const to = this.Neon.u.reverseHex(this.account._scriptHash);
  //
  //     const transferConfig = {
  //       net: Constants.NEOSCAN_URL,
  //       script: this._Neon.create.script({
  //         scriptHash: tokenSH,
  //         operation: 'transfer',
  //         args: [from, to, amount]
  //       }),
  //       address: this.getContractOwnerDetails().address,
  //       privateKey: this.getContractOwnerDetails().privateKey,
  //       gas: 0,
  //       fees: 0
  //     };
  //     this._Neon.doInvoke(transferConfig)
  //       .then(res => {
  //         console.log('doInvoke', res);
  //         resolve(res);
  //       })
  //       .catch(function (err) {
  //         console.log('doInvoke Error', err);
  //         reject(err);
  //       });
  //   });
  // }

  initialize() {
    return new Promise((resolve, reject) => {
      const initConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'initialize',
          args: [100, 100, this.Neon.u.reverseHex('46f0755e44a99fd589b6cb0b88e39c4515684990'), 400]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        // signingFunction: signTx,
        gas: 1,
        fees: 0
      };

      this._Neon.doInvoke(initConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  getSellerFee() {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script(this.getConfigCreator('getSellerFee', ''));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          //console.log('getSellerFee', new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON());
          // console.log('getSellerFee', this.Neon.u.hexstring2ab(res.result.stack[0].value)[0]);
          resolve(new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON());
        });
    });
  }

  getBuyerFee() {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script(this.getConfigCreator('getBuyerFee', ''));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          //console.log(this.Neon.u.hexstring2ab(res.result.stack[0].value)[0]);
          resolve(new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON());
        });
    });
  }

  getBalance(assetid) {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script(this.getConfigCreator('getBalance', [this.Neon.u.reverseHex(this.getCurrentUserScripthash()), this.Neon.u.reverseHex(assetid)]));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log('res', assetid, res.result.stack[0], assetid);
          if (res.result.stack[0].value !== '') {
            if (assetid === Constants.NEO_ASSET_ID || assetid === Constants.NEO_GAS_ASSET_ID) {
              resolve(new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON());
            } else {
              resolve(new BigNumber(this.Neon.u.Fixed8.fromReverseHex(res.result.stack[0].value)).toJSON());
            }
          } else {
            resolve(0);
          }
        });
    });
  }

  setFeeAddress() {
    return new Promise((resolve, reject) => {
      const feeAddressConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'setFeeAddress',
          args: [this.Neon.u.reverseHex('46f0755e44a99fd589b6cb0b88e39c4515684990')]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        // signingFunction: signTx,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(feeAddressConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  setSellerFee() {
    return new Promise((resolve, reject) => {
      const feeAddressConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'setSellerFee',
          args: [100]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        // signingFunction: signTx,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(feeAddressConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  setBuyerFee() {
    return new Promise((resolve, reject) => {
      const feeAddressConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'setBuyerFee',
          args: [100, 100]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        // signingFunction: signTx,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(feeAddressConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          resolve(err);
        });
    });
  }

  deposit(value, assetid) {
    console.log('deposit', value, assetid);
    return new Promise((resolve, reject) => {
      let originator = this.Neon.u.reverseHex(this.account._scriptHash);
      let intents;
      if (assetid === Constants.NEO_GAS_ASSET_ID) {
        intents = this.Neon.api.makeIntent({GAS: value}, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
        value = value * 100000000;
      } else if (assetid === Constants.NEO_ASSET_ID) {
        intents = this.Neon.api.makeIntent({NEO: value}, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
        value = value * 100000000;
      } else {
        value = value * 100000000;
      }
      assetid = this.Neon.u.reverseHex(assetid);
      debugger;
      const depositConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'deposit',
          args: [originator, assetid, value]
        }),
        intents: intents,
        address: this.account.address,
        privateKey: this.account.privateKey,
        // signingFunction: signTx,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(depositConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  isFloat(x) {
    return !!(x % 1);
  }

  singleSellOrder(offerAssetId, offerAmount, wantAssetId, wantAmount) {
    debugger;
    return new Promise((resolve, reject) => {
      if (this.isFloat(wantAmount)) {
        wantAmount.toFixed(4);
      }
      let sellerAddress = this.Neon.u.reverseHex(this.account._scriptHash);
      offerAssetId = this.Neon.u.reverseHex(offerAssetId);
      wantAssetId = this.Neon.u.reverseHex(wantAssetId);
      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'singleSellOrder',
          args: [sellerAddress, offerAssetId, offerAmount, wantAssetId, wantAmount]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(sellConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  calculateHash(hash) {
    return new Promise((resolve, reject) => {
      let HASH256 = hash;
      console.log(this.Neon.u.hash256(HASH256));
      resolve(this.Neon.u.hash256(HASH256));
    });
  }

  getSingleOrders(offer, wants) {
    return new Promise((resolve, reject) => {
      // var headers = new Headers({
      //   'content-type': 'application/json',
      // });
      // var requestOptions = new RequestOptions({headers: headers});
      // var reqData = {
      //   OfferAssetID : offer,
      //   WantAssetID : wants
      // }
      // this.http.post(Constants.NEO_SERVER_URL, requestOptions, reqData).subscribe(
      //   data => {
      //     resolve({orders : data})
      //   },
      //   err => {
      //     reject(err)
      // })
      let tradingPair = this.Neon.u.reverseHex(offer) + this.Neon.u.reverseHex(wants);
      var script = this._Neon.create.script(this.getConfigCreator('getSingleOrders', [tradingPair, '']));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          resolve({orders: res.result.stack[0].value});
        });
    });
  }

  fulfillSingleOffer(orderHash, buyForAmount) {
    return new Promise((resolve, reject) => {
      let fillerAddress = this.Neon.u.reverseHex(this.account._scriptHash);

      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'fulfillSingleOrder',
          args: ['', fillerAddress, orderHash, buyForAmount]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(sellConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  cancelSingleOrder(hash) {
    console.log('hash', hash);
    return new Promise((resolve, reject) => {
      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'cancelSingleOrder',
          args: [hash]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(sellConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  basketSellOrder(basketname, activeOrder, assetsCount, sellingAssets, assetsAmounts, wantAssetId, wantAmount) {
    return new Promise((resolve, reject) => {
      const sellerAddress = this.Neon.u.reverseHex(this.account._scriptHash);
      basketname = this.Neon.u.str2hexstring(basketname);
      // sellingAsset1 = this.Neon.u.reverseHex(sellingAsset1);
      // sellingAsset2 = this.Neon.u.reverseHex(sellingAsset2);
      wantAssetId = this.Neon.u.reverseHex(wantAssetId);
      activeOrder = this.Neon.u.int2hex(parseInt(activeOrder));

      // const sellingAssets = sellingAsset1 + sellingAsset2;
      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'createNewBasket',
          args: [basketname, sellerAddress, activeOrder, sellingAssets, assetsAmounts, wantAssetId, wantAmount]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0.1
      };
      // var script = this._Neon.create.script([this.getConfigCreator('fulfillBasketOrder', [fillerAddress, orderHash])]);
      // this.Neon.rpc.Query.invokeScript(script)
      //   .execute(Constants.RPC_URL)
      //   .then(res => {
      //     console.log("invokeScript",res.result);
      //     //resolve(res.result.stack);
      //   });
      this._Neon.doInvoke(sellConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  getBasketOrders(orderStatus) {
    orderStatus = this.Neon.u.str2hexstring(orderStatus);
    return new Promise((resolve, reject) => {
      var script = this._Neon.create.script([this.getConfigCreator('getBasketOrders', [orderStatus, ''])]);
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log(res.result.stack);
          resolve(res.result.stack);
        });
    });
  }

  fulfillBasketOrder(orderHash) {
    const thirdparty = '2f11bb4a5f43be0d0259cddd107d42774ab61cc6';
    return new Promise((resolve, reject) => {
      const fillerAddress = this.Neon.u.reverseHex(this.account._scriptHash);
      const fulfillConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'fulfillBasketOrder',
          args: ['', fillerAddress, orderHash]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };
      this._Neon.doInvoke(fulfillConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  placeBasketOrder(orderHash, wantAssetId, wantAmount) {
    return new Promise((resolve, reject) => {
      debugger;
      wantAssetId = this.Neon.u.reverseHex(wantAssetId);
      const config = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'placeBasketOrder',
          args: [orderHash, wantAssetId, wantAmount]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(config)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  cancelBasketOrder(orderHash) {
    return new Promise((resolve, reject) => {
      const config = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'cancelBasketOrder',
          args: [orderHash]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(config)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  liquidateBasket(orderHash) {
    return new Promise((resolve, reject) => {
      const config = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'liquidateBasket',
          args: [orderHash]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };
      // var script = this._Neon.create.script([this.getConfigCreator('liquidateBasket', [orderHash])]);
      // this.Neon.rpc.Query.invokeScript(script)
      //   .execute(Constants.RPC_URL)
      //   .then(res => {
      //     console.log("invokeScript",res.result);
      //     //resolve(res.result.stack);
      //   });

      this._Neon.doInvoke(config)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  getNeondGas() {
    console.log('scriptHash', this.scriptHash);
    return new Promise((resolve, reject) => {
      this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(this.getCurrentUserScripthash())).then((res) => {
        console.log('res', res);
        resolve(res);
      });
    });
  }

  getAccountAddress() {
    if (this.account) {
      return this.account._scriptHash;
    } else {
      return false;
    }

  }

  setAccoutWithWIF(WIF) {
    return new Promise((resolve, reject) => {
      this.account = new this.Neon.wallet.Account(WIF);
      //console.log(this.account);
      this.scriptHash = this.account._scriptHash;
      resolve(this.account);
    });
  }

  getCurrentUserScripthash() {
    return this.scriptHash;
  }

  getCurrentUserAdd() {
    if (this.account) {
      return this.account.address;
    } else {
      return false;
    }

  }

  getNeon() {
    return this.Neon;
  }

  // assetTransfer(neo, gas, address) {
  //   return new Promise((resolve, reject) => {
  //     const intent = this.getNeon().api.makeIntent({GAS: gas, NEO: neo}, address);
  //
  //     const assetConfig = {
  //       net: Constants.NEOSCAN_URL, // The network to perform the action, MainNet or TestNet.
  //       address: this.getContractOwnerDetails().address,  // This is the address which the assets come from.
  //       privateKey: this.getContractOwnerDetails().privateKey,
  //       intents: intent
  //     };
  //     this.Neon.api.sendAsset(assetConfig)
  //       .then(config => {
  //         console.log(config.response);
  //         resolve(config.response);
  //       })
  //       .catch(config => {
  //         console.log(config);
  //       });
  //   });
  // }

  trackTransaction(txid) {
    return new Promise((resolve, reject) => {
      const client = this._Neon.create.rpcClient(Constants.RPC_URL, '2.3.2');
      client.getRawTransaction(txid, 1).then((res) => {
        console.log('res', res);
        let data = {
          txid: txid,
          res: res
        };
        resolve(data);
      });
    });
  }

  public trackTransactionWithDraw(txid) {
    console.log('Called timer', txid);
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.trackTransaction(txid).then((res) => {
      console.log(res);
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        this.getNeondGas().then((res) => {
          console.log('res', res);
          const unspent = res['assets']['NEO']['unspent'];
          unspent.map((key) => {
            if (key.txid === txid) {
              // this.withdrawSyatemAssetWithdraw(this.currentNeoWithdrawAmt, key).then((res) => {
              //   console.log(res);
              // });
            }
          });
        });
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 1000);
  }

  getTokensBalance(rpxScriptHash, adress) {
    return new Promise((resolve, reject) => {
      this.Neon.api.nep5.getToken(Constants.RPC_URL, rpxScriptHash, adress).then((res) => {
        resolve(res);
      });
    });
  }

  // withdraw

  async awithdrawStageMark(assetID, amount) {
    const isNEP5 = assetID.length === 40;
    const originator = this.account._scriptHash;
    const contractBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
    const originatorBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(originator));
    console.log('contractBalance', contractBalance);
    console.log('originatorBalance', originatorBalance);
    const sb = new this.Neon.sc.ScriptBuilder();
    sb.emitAppCall(Constants.contractScriptHash, 'withdraw', [], true);

    const intents = [{
      assetId: isNEP5 ? Constants.NEO_GAS_ASSET_ID : assetID,
      value: isNEP5 ? '0.00000001' : amount.toString(),
      scriptHash: isNEP5 ? this.account._scriptHash : Constants.contractScriptHash
    }];
    let withdrawMark;
    let withdrawFrom;
    withdrawMark = '50';
    withdrawFrom = '53';
    const overrides = {
      attributes: [
        {usage: 0x20, data: this.Neon.u.reverseHex(originator)}, // user is the additional witness
        {usage: 0x20, data: this.Neon.u.reverseHex(Constants.contractScriptHash)}, // contract is the additional witness
        {usage: 0xa1, data: withdrawMark.padEnd(64, '0')}, // withdraw flag
        {usage: isNEP5 ? 0xa2 : 0xa3, data: this.Neon.u.reverseHex(assetID).padEnd(64, '0')}, // asset ID
        {usage: 0xa4, data: this.Neon.u.reverseHex(originator).padEnd(64, '0')},
        {usage: 0xa5, data: withdrawFrom.padEnd(64, '0')},
      ],
    };
    if (isNEP5) {
      overrides.attributes.push({
        usage: 0xa6,
        // data: Neon.u.num2hexstring(amount, 32, true),
        data: this.Neon.u.num2hexstring(amount * (10 ** 8), 32, true),
      }); // withdraw amount
    }

    var balance = isNEP5 ? new this.Neon.wallet.Balance(originatorBalance) : new this.Neon.wallet.Balance(contractBalance);
    let txn = this.Neon.tx.Transaction.createInvocationTx(balance, intents, sb.str, 0, overrides);

    if (!txn) {
      console.log('fail tx');
      return;
    }

    txn.sign(this.account.privateKey);

    //  Attach contract signature
    const contractSignature = {
      invocationScript: '0000',
      verificationScript: '',
    };

    if (parseInt(Constants.contractScriptHash, 16) > parseInt(originator, 16)) {
      txn.scripts.push(contractSignature);
    } else {
      txn.scripts.unshift(contractSignature);
    }

    console.log(txn);
    //localStorage.setItem('txn', JSON.stringify(txn));

    const client = new this.Neon.rpc.RPCClient(Constants.RPC_URL);
    return client.sendRawTransaction(txn).then(result => {
      console.log('result', result);
      if (!result) {
        console.log('failed to use utxo, moving to next..'); // eslint-disable-line no-console
      } else {
        return result;
      }
      //console.log('step 1 success'); // eslint-disable-line no-console
    }).catch(err => {
      console.error(err); // eslint-disable-line no-console
      const error = new Error('Cannot withdraw now, please try again in a while.');
      error['err'] = err;
      throw error;
    });
  }

  async withdrawStageWithdraw(assetID, amount) {
    const isNEP5 = assetID.length === 40;
    const originator = this.account._scriptHash;
    const contractBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
    const originatorBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(originator));

    const sb = new this.Neon.sc.ScriptBuilder();
    sb.emitAppCall(Constants.contractScriptHash, 'withdraw', [], true);

    const intents = [{
      assetId: isNEP5 ? Constants.NEO_GAS_ASSET_ID : assetID,
      value: isNEP5 ? '0.00000001' : amount.toString(),
      scriptHash: originator
    }];
    let withdrawFrom;
    let withdraw;
    withdraw = '51';
    withdrawFrom = '53';
    const overrides = {
      attributes: [
        {usage: 0x20, data: this.Neon.u.reverseHex(originator)}, // user is the additional witness
        {usage: 0x20, data: this.Neon.u.reverseHex(Constants.contractScriptHash)}, // contract is the additional witness
        {usage: 0xa1, data: withdraw.padEnd(64, '0')}, // withdraw flag
        {usage: isNEP5 ? 0xa2 : 0xa3, data: this.Neon.u.reverseHex(assetID).padEnd(64, '0')}, // asset ID
        {usage: 0xa4, data: this.Neon.u.reverseHex(originator).padEnd(64, '0')},
        {usage: 0xa5, data: withdrawFrom.padEnd(64, '0')}
      ],
    };

    var balance = isNEP5 ? new this.Neon.wallet.Balance(originatorBalance) : new this.Neon.wallet.Balance(contractBalance);
    let txn = this.Neon.tx.Transaction.createInvocationTx(balance, intents, sb.str, 0, overrides);

    if (!txn) {
      console.log('fail tx');
      return;
    }

    txn.sign(this.account.privateKey);

    const contractSignature = {
      invocationScript: '0000',
      verificationScript: '',
    };

    if (parseInt(Constants.contractScriptHash, 16) > parseInt(originator, 16)) {
      txn.scripts.push(contractSignature);
    } else {
      txn.scripts.unshift(contractSignature);
    }

    console.log(txn);

    const client = new this.Neon.rpc.RPCClient(Constants.RPC_URL);
    return client.sendRawTransaction(txn).then(result => {
      console.log('result', result);
      if (!result) {
        console.log('failed to use utxo, moving to next..'); // eslint-disable-line no-console
      } else {
        return result;
      }
      console.log('step 1 success'); // eslint-disable-line no-console
    }).catch(err => {
      console.error(err); // eslint-disable-line no-console
      const error = new Error('Cannot withdraw now, please try again in a while.');
      error['err'] = err;
      throw error;
    });
  }


  //stake withdraw
  async withdrawStakeStageMark(assetID, amount) {
    const isNEP5 = assetID.length === 40;
    const originator = this.account._scriptHash;
    const contractBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
    const originatorBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(originator));
    console.log('contractBalance', contractBalance);
    console.log('originatorBalance', originatorBalance);
    const sb = new this.Neon.sc.ScriptBuilder();
    sb.emitAppCall(Constants.contractScriptHash, 'withdraw', [], true);

    const intents = [{
      assetId: isNEP5 ? Constants.NEO_GAS_ASSET_ID : assetID,
      value: isNEP5 ? '0.00000001' : amount.toString(),
      scriptHash: isNEP5 ? this.account._scriptHash : Constants.contractScriptHash
    }];
    let withdrawMark;
    let withdrawFrom;
    withdrawMark = '50';
    withdrawFrom = '54';
    const overrides = {
      attributes: [
        {usage: 0x20, data: this.Neon.u.reverseHex(originator)}, // user is the additional witness
        {usage: 0x20, data: this.Neon.u.reverseHex(Constants.contractScriptHash)}, // contract is the additional witness
        {usage: 0xa1, data: withdrawMark.padEnd(64, '0')}, // withdraw flag
        {usage: isNEP5 ? 0xa2 : 0xa3, data: this.Neon.u.reverseHex(assetID).padEnd(64, '0')}, // asset ID
        {usage: 0xa4, data: this.Neon.u.reverseHex(originator).padEnd(64, '0')},
        {usage: 0xa5, data: withdrawFrom.padEnd(64, '0')},
      ],
    };
    if (isNEP5) {
      overrides.attributes.push({
        usage: 0xa6,
        // data: Neon.u.num2hexstring(amount, 32, true),
        data: this.Neon.u.num2hexstring(amount * (10 ** 8), 32, true),
      }); // withdraw amount
    }

    var balance = isNEP5 ? new this.Neon.wallet.Balance(originatorBalance) : new this.Neon.wallet.Balance(contractBalance);
    let txn = this.Neon.tx.Transaction.createInvocationTx(balance, intents, sb.str, 0, overrides);

    if (!txn) {
      console.log('fail tx');
      return;
    }

    txn.sign(this.account.privateKey);

    //  Attach contract signature
    const contractSignature = {
      invocationScript: '0000',
      verificationScript: '',
    };

    if (parseInt(Constants.contractScriptHash, 16) > parseInt(originator, 16)) {
      txn.scripts.push(contractSignature);
    } else {
      txn.scripts.unshift(contractSignature);
    }

    console.log(txn);

    const client = new this.Neon.rpc.RPCClient(Constants.RPC_URL);
    return client.sendRawTransaction(txn).then(result => {
      console.log('result', result);
      if (!result) {
        console.log('failed to use utxo, moving to next..'); // eslint-disable-line no-console
        // const {unspent} =originatorBalance.assets[isNEP5 ? 'GAS' : 'NEO'];
        // const {unspent} = isNEP5 ? originatorBalance.assets['GAS'] : contractBalance.assets['NEO'];
        // const index = unspent.findIndex(utxo => utxo.txid === txn.inputs[0].prevHash && utxo.index === txn.inputs[0].prevIndex);
        // if (isNEP5) {
        //   originatorBalance.assets['GAS'].unspent.splice(index, 1);
        //   return this.awithdrawStageMark(assetID, amount, originatorBalance, withdrawFrom);
        // } else {
        //   contractBalance.assets['NEO'].unspent.splice(index, 1);
        //   return this.awithdrawStageMark(assetID, amount, contractBalance, withdrawFrom);
        // }
        // originatorBalance.assets[isNEP5 ? 'GAS' : 'NEO'].unspent.splice(index, 1);
      } else {
        return result;
      }
      //console.log('step 1 success'); // eslint-disable-line no-console
    }).catch(err => {
      console.error(err); // eslint-disable-line no-console
      const error = new Error('Cannot withdraw now, please try again in a while.');
      error['err'] = err;
      throw error;
    });
  }

  async withdrawStakeStageWithdraw(assetID, amount) {
    const isNEP5 = assetID.length === 40;
    const originator = this.account._scriptHash;
    const contractBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(Constants.contractScriptHash));
    const originatorBalance = await this.Neon.api.neoscan.getBalance(Constants.NEOSCAN_URL, this.Neon.wallet.getAddressFromScriptHash(originator));

    const sb = new this.Neon.sc.ScriptBuilder();
    sb.emitAppCall(Constants.contractScriptHash, 'withdraw', [], true);

    const intents = [{
      assetId: isNEP5 ? Constants.NEO_GAS_ASSET_ID : assetID,
      value: isNEP5 ? '0.00000001' : amount.toString(),
      scriptHash: originator
    }];
    let withdrawFrom;
    let withdraw;
    withdraw = '51';
    withdrawFrom = '54';
    const overrides = {
      attributes: [
        {usage: 0x20, data: this.Neon.u.reverseHex(originator)}, // user is the additional witness
        {usage: 0x20, data: this.Neon.u.reverseHex(Constants.contractScriptHash)}, // contract is the additional witness
        {usage: 0xa1, data: withdraw.padEnd(64, '0')}, // withdraw flag
        {usage: isNEP5 ? 0xa2 : 0xa3, data: this.Neon.u.reverseHex(assetID).padEnd(64, '0')}, // asset ID
        {usage: 0xa4, data: this.Neon.u.reverseHex(originator).padEnd(64, '0')},
        {usage: 0xa5, data: withdrawFrom.padEnd(64, '0')}
      ],
    };

    var balance = isNEP5 ? new this.Neon.wallet.Balance(originatorBalance) : new this.Neon.wallet.Balance(contractBalance);
    let txn = this.Neon.tx.Transaction.createInvocationTx(balance, intents, sb.str, 0, overrides);

    if (!txn) {
      console.log('fail tx');
      return;
    }

    txn.sign(this.account.privateKey);

    const contractSignature = {
      invocationScript: '0000',
      verificationScript: '',
    };

    if (parseInt(Constants.contractScriptHash, 16) > parseInt(originator, 16)) {
      txn.scripts.push(contractSignature);
    } else {
      txn.scripts.unshift(contractSignature);
    }

    console.log(txn);

    const client = new this.Neon.rpc.RPCClient(Constants.RPC_URL);
    return client.sendRawTransaction(txn).then(result => {
      console.log('result', result);
      if (!result) {
        console.log('failed to use utxo, moving to next..'); // eslint-disable-line no-console
        // const {unspent} =originatorBalance.assets[isNEP5 ? 'GAS' : 'NEO'];
        // const {unspent} = isNEP5 ? originatorBalance.assets['GAS'] : contractBalance.assets['NEO'];
        // const index = unspent.findIndex(utxo => utxo.txid === txn.inputs[0].prevHash && utxo.index === txn.inputs[0].prevIndex);
        // if (isNEP5) {
        //   originatorBalance.assets['GAS'].unspent.splice(index, 1);
        //   return this.withdrawStageWithdraw(assetID, amount, originatorBalance, withdrawFrom);
        // } else {
        //   contractBalance.assets['NEO'].unspent.splice(index, 1);
        //   return this.withdrawStageWithdraw(assetID, amount, contractBalance, withdrawFrom);
        // }
        // originatorBalance.assets[isNEP5 ? 'GAS' : 'NEO'].unspent.splice(index, 1);
      } else {
        return result;
      }
      console.log('step 1 success'); // eslint-disable-line no-console
    }).catch(err => {
      console.error(err); // eslint-disable-line no-console
      const error = new Error('Cannot withdraw now, please try again in a while.');
      error['err'] = err;
      throw error;
    });
  }

  // getContractOwnerDetails() {
  //   return new this.Neon.wallet.Account(Constants.WIF_KEY_2);
  // }

  // getContractOwnerDetails() {
  //   return new this.Neon.wallet.Account(Constants.WIF_KEY_4);
  // }

  getBasket() {
    return this.updateBasket;
  }

  setBasket(basket) {
    this.updateBasket = basket;
  }

  setBasketUpdateStatus(status) {
    this.status = status;
  }

  getBasketUpdateStatus() {
    return this.status;
  }

  //stake
  stakeWandx(amount) {
    return new Promise((resolve, reject) => {
      const originator = this.Neon.u.reverseHex(this.account._scriptHash);
      const script = this._Neon.create.script({
        scriptHash: Constants.contractScriptHash,
        operation: 'stakeWandx',
        args: [originator, amount]
      });

      const config = {
        net: Constants.NEOSCAN_URL,
        script: script,
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0
      };

      this._Neon.doInvoke(config)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  getUserStakeData() {
    return new Promise((resolve, reject) => {
      const depositor = this.Neon.u.reverseHex(this.account._scriptHash);
      const script = this._Neon.create.script([this.getConfigCreator('getUserStakeData', [depositor])]);
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log(res.result.stack);
          resolve({stake: res.result.stack});
        });
    });
  }

  getTotalStakeData() {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script([this.getConfigCreator('getTotalStakeData', [])]);
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          //  console.log('getTotalStakeData',res);
          resolve(res.result.stack);
        });
    });
  }

  getCurrentBucket() {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script([this.getConfigCreator('getCurrentBucket', [])]);
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log(res.result);
          resolve(res.result.stack);
        });
    });
  }

  getFeeCollection(assetId) {
    return new Promise((resolve, reject) => {
      const script = this._Neon.create.script(this.getConfigCreator('getFeeCollection', [this.Neon.u.reverseHex(assetId)]));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log(res.result.stack);
          resolve(res.result.stack);
        });
    });
  }

  claimProfits(assetId) {
    return new Promise((resolve, reject) => {
      const originator = this.Neon.u.reverseHex(this.account._scriptHash);
      assetId = this.Neon.u.reverseHex(assetId);

      const cp_claimConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'claimProfits',
          args: [originator, assetId]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };
      // this.Neon.rpc.Query.invokeScript(cp_claimConfig)
      //   .execute(Constants.RPC_URL)
      //   .then(res => {
      //     console.log(res.result);
      //   });

      this._Neon.doInvoke(cp_claimConfig)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  getProfitBalance(assetId) {
    return new Promise((resolve, reject) => {
      const originator = this.Neon.u.reverseHex(this.account._scriptHash);
      assetId = this.Neon.u.reverseHex(assetId);
      const script = this._Neon.create.script(this.getConfigCreator('getProfitBalance', [originator, assetId]));
      this.Neon.rpc.Query.invokeScript(script)
        .execute(Constants.RPC_URL)
        .then(res => {
          console.log(res.result.stack);
          resolve(res.result.stack);
        });
    });
  }

  syncUpFeeCollection(assetId) {
    return new Promise((resolve, reject) => {
      assetId = this.Neon.u.reverseHex(assetId);
      const script = this._Neon.create.script({
        scriptHash: Constants.contractScriptHash,
        operation: 'syncUpFeeCollection',
        args: [assetId]
      });

      const config = {
        net: Constants.NEOSCAN_URL,
        script: script,
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0
      };

      this._Neon.doInvoke(config)
        .then(res => {
          console.log('doInvoke', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('doInvoke Error', err);
          reject(err);
        });
    });
  }

  syncUpTotalStake() {
    return new Promise((resolve, reject) => {
      const syncConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'syncUpTotalStake',
          args: []
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
// signingFunction: signTx,
        gas: 0,
        fees: 0
      };
      this._Neon.doInvoke(syncConfig)
        .then(res => {
          console.log('syncTS', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('syncTS Error', err);
          reject(err);
        });
    });
  }

  syncUpUserStake() {
    return new Promise((resolve, reject) => {
      const originator = this.Neon.u.reverseHex(this.account._scriptHash);
      const syncConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'syncUpUserStake',
          args: [originator]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
// signingFunction: signTx,
        gas: 0,
        fees: 0
      };
      this._Neon.doInvoke(syncConfig)
        .then(res => {
          console.log('syncUS', res);
          resolve(res);
        })
        .catch(function (err) {
          console.log('syncUS Error', err);
          reject(err);
        });
    });
  }

  addAssetsTobasket(baskethash, newasset, assetsAmount2) {
    return new Promise((resolve, reject) => {
      newasset = this.Neon.u.reverseHex(newasset);
      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'addAssetsToBasket',
          args: [baskethash, newasset, [assetsAmount2]]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(sellConfig)
        .then(res => {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  removeAssetFromBasket(baskethash, removeasset) {
    return new Promise((resolve, reject) => {
      const sellConfig = {
        net: Constants.NEOSCAN_URL,
        script: this._Neon.create.script({
          scriptHash: Constants.contractScriptHash,
          operation: 'removeAssetFromBasket',
          args: [baskethash, this.Neon.u.reverseHex(removeasset)]
        }),
        address: this.account.address,
        privateKey: this.account.privateKey,
        gas: 0,
        fees: 0
      };

      this._Neon.doInvoke(sellConfig)
        .then(res => {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  setAddressForTokenDetail(account) {
    this.address = account;
  }

  getTokenDetail() {
    return new Promise((resolve, reject) => {
      this.http.get(Constants.NEO_TESTNET_TOKENDETAIL + this.address).subscribe(
        data => {
          resolve(data.json());
        },
        err => {
          reject(err);
        });
    });
  }
}
