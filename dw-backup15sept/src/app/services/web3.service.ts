import { Injectable, Inject, OnInit } from "@angular/core";
import * as EthQuery from 'eth-query'
import * as web3local from 'web3'

import {CustomWalletService} from './custom-wallet.service'
import {InfuraNetworkService} from './infura-network.service'

declare global {
  interface Window { web3: any; }
}
window.web3 = window.web3 || undefined;
declare namespace web3Functions{
  export function initializeWeb3(useJsonWallet : boolean, data : any);
  export function setDefaultAccount();
}

@Injectable()
export class Web3Service {
  web3: any;
  query : EthQuery
  constructor(private wallet : CustomWalletService, private network : InfuraNetworkService) {
    this.sendAsync = this.sendAsync.bind(this)
    this.send = this.send.bind(this)
    this.initialize = this.initialize.bind(this)

    // by default we load metamask web3
    // this.initialize()
  }
  initialize(useJsonWallet = false) {
    // we need to manually initialize web3 after the wallet is chosen
    web3Functions.initializeWeb3(useJsonWallet, {web3 : web3local, provider : this});

    this.web3 = window.web3;
    this.network.initialize()
    this.query = this.network.getEthQuery()
    if (this.wallet.isWalletInitialized())
      this.web3.eth.defaultAccount = this.wallet.userAddress()
  }
  setDefaultAccount() {
    web3Functions.setDefaultAccount()
  }
  sendAsync(payload, callback) {
    if (!this.query)
      return callback(new Error('Not connected to rpc network'))
    this.query.sendAsync(payload, (err, result) => {
      var data = null;
      if (!err) {
        data =  {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: result,
        }
      }
      callback(err, data)
    })
  }
  send(payload) {
    const self = this

    let selectedAddress
    let result = null
    switch (payload.method) {

      case 'eth_accounts':
        // read from localStorage
        selectedAddress = this.wallet.userAddress()
        result = selectedAddress ? [selectedAddress] : []
        break

      case 'eth_coinbase':
        // read from localStorage
        selectedAddress = this.wallet.userAddress()
        result = selectedAddress || null
        break

      case 'eth_uninstallFilter':
        self.sendAsync(payload, function(){})
        result = true
        break

      case 'net_version':
        const networkVersion = this.network.networkState
        result = networkVersion || null
        break

      // throw not-supported Error
      default:
        var link = 'https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#dizzy-all-async---think-of-metamask-as-a-light-client'
        var message = `The Web3 object does not support synchronous methods like ${payload.method} without a callback parameter. See ${link} for details.`
        throw new Error(message)
    }

    // return the result
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result: result,
    }
  }
  getWeb3() {
    return this.web3;
  }

  checkWeb3(): boolean{
    if(this.getWeb3() === null || this.getWeb3() === undefined)
      return false;
    var userAccount = this.getWeb3().eth.coinbase;
    if(userAccount === null || userAccount === undefined || userAccount.length === 0)
      return false;
    return true;
  }
}
