import { Injectable } from '@angular/core';
import {promisify} from 'es6-promisify'

import {EventProxy} from '../common/events-proxy';
import {ReplaySubject} from 'rxjs/ReplaySubject';

import * as  SubproviderFromProvider from 'web3-provider-engine/subproviders/provider.js'
import * as createInfuraProvider from 'eth-json-rpc-infura/src/createProvider'
import * as EthQuery from 'eth-query'
import * as ethUtil from 'ethereumjs-util'
import * as createProvider from 'web3-provider-engine/zero.js'
import {CustomWalletService} from './custom-wallet.service'
import {TransactionService} from './transaction.service'

import { Constants } from '../models/constants';



const MAINET_RPC_URL = 'https://mainnet.infura.io/metamask'
const ROPSTEN_RPC_URL = 'https://ropsten.infura.io/metamask'
const KOVAN_RPC_URL = 'https://kovan.infura.io/metamask'
const RINKEBY_RPC_URL = 'https://rinkeby.infura.io/metamask'
const LOCALHOST_RPC_URL = 'http://localhost:8545'

const MAINET_RPC_URL_BETA = 'https://mainnet.infura.io/metamask2'
const ROPSTEN_RPC_URL_BETA = 'https://ropsten.infura.io/metamask2'
const KOVAN_RPC_URL_BETA = 'https://kovan.infura.io/metamask2'
const RINKEBY_RPC_URL_BETA = 'https://rinkeby.infura.io/metamask2'

const DEFAULT_RPC = 'ropsten'
const OLD_UI_NETWORK_TYPE = 'network'
const BETA_UI_NETWORK_TYPE = 'networkBeta'
const INFURA_PROVIDER_TYPES = ['ropsten', 'rinkeby', 'kovan', 'mainnet']

var networkConfig = {
  network: {
    42: KOVAN_RPC_URL_BETA,
    1: MAINET_RPC_URL,
    3: ROPSTEN_RPC_URL,
  },
  // Used for beta UI
  networkBeta: {
    localhost: LOCALHOST_RPC_URL,
    mainnet: MAINET_RPC_URL_BETA,
    ropsten: ROPSTEN_RPC_URL_BETA,
    kovan: KOVAN_RPC_URL_BETA,
    rinkeby: RINKEBY_RPC_URL_BETA,
  },
  networkNames: {
    1 : 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    42: 'kovan',
  },
  enums: {
    DEFAULT_RPC,
    OLD_UI_NETWORK_TYPE,
    BETA_UI_NETWORK_TYPE,
  },
}

@Injectable()
export class InfuraNetworkService {

	selectedNetwork : string;
  networkState : string;
	_proxy : any;
	ethQuery : any;
	_provider : any;
	networkStatus : ReplaySubject<number> = new ReplaySubject(0); /* -1 error, 0 - not connected, 1 - connected */
  // blockTracker$ : ReplaySubject<any> = new ReplaySubject(1);
  // blockTracker : any;
  constructor(private wallet : CustomWalletService, private transactionService : TransactionService) {
  	this.selectedNetwork = networkConfig.network[Constants.AllowedNetwork]
  	this._proxy = (new EventProxy(null, null)).getProxy()
  	this.initialize = this.initialize.bind(this)
  	this.setNetworkStatus = this.setNetworkStatus.bind(this)
  	this.isNetworkLoading = this.isNetworkLoading.bind(this)
    this.getNetworkStatus$ = this.getNetworkStatus$.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.getEthQuery = this.getEthQuery.bind(this)
    this.getChainId = this.getChainId.bind(this)
  }
  getEthQuery() {
    return this.ethQuery
  }
  getChainId() {
    return ethUtil.addHexPrefix(Number(this.networkState).toString(16))
  }
  getRpcAddressForType (type, provider) {
    return this.selectedNetwork
  }
  setNetworkStatus(networkStatus) {
     setTimeout(() => {
      this.networkStatus.next(networkStatus)  
    }, 100)
  }
  updateStatus(networkStatus) {
    setTimeout(() => {
      this.setNetworkStatus(networkStatus)  
    }, 100)
  }
  getNetworkStatus$() {
    return this.networkStatus.asObservable()
  }
  lookupNetwork () {
    // Prevent firing when provider is not defined.
    if (!this.ethQuery || !this.ethQuery.sendAsync) {
      this.setNetworkStatus(-1)
      return false;
    }
    this.ethQuery.sendAsync({ method: 'net_version' }, (err, network) => {
      if (err) {
        this.setNetworkStatus(-1)
      }
      // log.info('web3.getNetwork returned ' + network)
      this.networkState = network
      this.setNetworkStatus(1)
    })
  }
  initialize () {
    const opts = {
      type : networkConfig.networkNames[Constants.AllowedNetwork],
      rpcUrl: this.selectedNetwork,
      getAccounts : this.wallet.getAccounts,
      processTransaction : this.transactionService.processTransaction,
      processMessage : this.transactionService.processMessage,
      processPersonalMessage : ()=>{},
      processTypedMessage : ()=>{}
    }
    this._configureProvider(opts)
    this._proxy.on('error', this.verifyNetwork.bind(this))
    this.ethQuery = new EthQuery(this._proxy)
    // this.blockTracker = this._proxy._blockTracker
    // this.blockTracker$.next(this._proxy._blockTracker)
    this.lookupNetwork()
    
    // this.blockTracker.on('block', (block) => {
    //    const signedTxList = this.getPendingTransactions()
    //    var pending = signedTxList.filter(a => {
    //       return a.status == 'pending'
    //    })
    //   pending.forEach((txMeta) => {
    //     block.transactions.forEach((tx) => {
    //       if (tx.hash === txMeta.hash) {
    //         txMeta.status = 'confirmed'
    //       }
    //     })
    //   })
    // })
    this.transactionService.initialize(this)
  }
  
  verifyNetwork () {
    // Check network when restoring connectivity:
    if (!this.isNetworkLoading()) this.lookupNetwork()
  }
	isNetworkLoading() {
		return true
	}
  _configureProvider (opts) {
    // type-based rpc endpoints
    const { type } = opts
    if (type) {
      // type-based infura rpc endpoints
      const isInfura = INFURA_PROVIDER_TYPES.includes(type)
      opts.rpcUrl = this.getRpcAddressForType(type, null)
      if (isInfura) {
        this._configureInfuraProvider(opts)
      // other type-based rpc endpoints
      } else {
        this._configureStandardProvider(opts)
      }
    // url-based rpc endpoints
    } else {
      this._configureStandardProvider(opts)
    }
  }

  _configureInfuraProvider (opts) {
    // log.info('_configureInfuraProvider', opts)
    const infuraProvider = createInfuraProvider({
      network: opts.type,
    })
    const infuraSubprovider = new SubproviderFromProvider(infuraProvider)
    const providerParams = {
    	...opts,
      rpcUrl: opts.rpcUrl,
      engineParams: {
        pollingInterval: 8000,
        blockTrackerProvider: infuraProvider,
      },
      dataSubprovider: infuraSubprovider,
    }
    const provider = createProvider(providerParams)
    this._setProvider(provider)
  }

  _configureStandardProvider ({ rpcUrl }) {
    const providerParams = {
      rpcUrl,
      engineParams: {
        pollingInterval: 8000,
      },
    }
    const provider = createProvider(providerParams)
    this._setProvider(provider)
  }

  _setProvider (provider) {
    // collect old block tracker events
    const oldProvider = this._provider
    let blockTrackerHandlers
    if (oldProvider) {
      // capture old block handlers
      blockTrackerHandlers = oldProvider._blockTracker.proxyEventHandlers
      // tear down
      oldProvider.removeAllListeners()
      oldProvider.stop()
    }
    // override block tracler
    var eventProxy = new EventProxy(provider._blockTracker, blockTrackerHandlers)
    provider._blockTracker = eventProxy.getProxy()
    // set as new provider
    this._provider = provider
    this._proxy.setTarget(provider)
  }

  _logBlock (block) {
    // log.info(`BLOCK CHANGED: #${block.number.toString('hex')} 0x${block.hash.toString('hex')}`)
    this.verifyNetwork()
  }



}
