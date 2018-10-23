import { Injectable } from '@angular/core';
import * as ethUtil from 'ethereumjs-util'
import {promisify} from 'es6-promisify'
import {BigNumber} from 'bignumber.js'
import {BN} from 'bn.js'

const SIMPLE_GAS_COST = '0x5208'


export class GasUtils {
	query : any;
	constructor(query) {
		this.query = query
	}
  // helper functions
  BnMultiplyByFraction (targetBN, numerator, denominator) {
    const numBN = new BN(numerator)
    const denomBN = new BN(denominator)
    let ret = targetBN.mul(numBN).div(denomBN)
    return ret 
  }
  bnToHex (inputBn) {
    return ethUtil.addHexPrefix(inputBn.toString(16))
  }

  hexToBn (inputHex) {
    return new BN(ethUtil.stripHexPrefix(inputHex), 16)
  }
	async analyzeGasUsage (txMeta) {
    const block = await promisify(this.query.getBlockByNumber.bind(this.query))('latest', true)
    let estimatedGasHex
    try {
      estimatedGasHex = await this.estimateTxGas(txMeta, block.gasLimit)
    } catch (err) {
      const simulationFailed = (
        err.message.includes('Transaction execution error.') ||
        err.message.includes('gas required exceeds allowance or always failing transaction')
      )
      if (simulationFailed) {
        txMeta.simulationFails = true
        return txMeta
      }
    }
    this.setTxGas(txMeta, block.gasLimit, estimatedGasHex)
    return txMeta
  }

  async estimateTxGas (txMeta, blockGasLimitHex) {
    const txParams = txMeta.txParams

    // check if gasLimit is already specified
    txMeta.gasLimitSpecified = Boolean(txParams.gas)

    // if it is, use that value
    if (txMeta.gasLimitSpecified) {
      return txParams.gas
    }

    // if recipient has no code, gas is 21k max:
    const recipient = txParams.to
    const hasRecipient = Boolean(recipient)
    const code = await promisify(this.query.getCode.bind(this.query))(recipient)
    if (hasRecipient && (!code || code === '0x')) {
      txParams.gas = SIMPLE_GAS_COST
      txMeta.simpleSend = true // Prevents buffer addition
      return SIMPLE_GAS_COST
    }

    // if not, fall back to block gasLimit
    const blockGasLimitBN = this.hexToBn(blockGasLimitHex)
    const saferGasLimitBN = this.BnMultiplyByFraction(blockGasLimitBN, 19, 20)
    txParams.gas = this.bnToHex(saferGasLimitBN)

    // run tx
    return await promisify(this.query.estimateGas.bind(this.query))(txParams)
  }

  setTxGas (txMeta, blockGasLimitHex, estimatedGasHex) {
    txMeta.estimatedGas = ethUtil.addHexPrefix(estimatedGasHex)
    const txParams = txMeta.txParams

    // if gasLimit was specified and doesnt OOG,
    // use original specified amount
    if (txMeta.gasLimitSpecified || txMeta.simpleSend) {
      txMeta.estimatedGas = txParams.gas
      return
    }
    // if gasLimit not originally specified,
    // try adding an additional gas buffer to our estimation for safety
    const recommendedGasHex = this.addGasBuffer(txMeta.estimatedGas, blockGasLimitHex)
    txParams.gas = recommendedGasHex
    return
  }

  addGasBuffer (initialGasLimitHex, blockGasLimitHex) {
    const initialGasLimitBn = this.hexToBn(initialGasLimitHex)
    const blockGasLimitBn = this.hexToBn(blockGasLimitHex)
    const upperGasLimitBn = blockGasLimitBn.muln(0.9)
    const bufferedGasLimitBn = initialGasLimitBn.muln(1.5)

    // if initialGasLimit is above blockGasLimit, dont modify it
    if (initialGasLimitBn.gt(upperGasLimitBn)) 
      return this.bnToHex(initialGasLimitBn)
    // if bufferedGasLimit is below blockGasLimit, use bufferedGasLimit
    if (bufferedGasLimitBn.lt(upperGasLimitBn)) 
      return this.bnToHex(bufferedGasLimitBn)
    // otherwise use blockGasLimit
    return this.bnToHex(upperGasLimitBn)
  }
  
  validateTxParams (txParams) {
    this.validateRecipient(txParams)
    if ('value' in txParams) {
      const value = txParams.value.toString()
      if (value.includes('-')) {
        throw new Error(`Invalid transaction value of ${txParams.value} not a positive number.`)
      }

      if (value.includes('.')) {
        throw new Error(`Invalid transaction value of ${txParams.value} number must be in wei`)
      }
    }
    return true
  }
  validateRecipient (txParams) {
    if (txParams.to === '0x') {
      if (txParams.data) {
        delete txParams.to
      } else {
        throw new Error('Invalid recipient address')
      }
    }
    return txParams
  }
  async addTxDefaults (txMeta) {
    const txParams = txMeta.txParams
    // ensure value
    txMeta.gasPriceSpecified = Boolean(txParams.gasPrice)
    txMeta.nonceSpecified = Boolean(txParams.nonce)
    let gasPrice = txParams.gasPrice
    if (!gasPrice) {
      gasPrice = await promisify(this.query.gasPrice.bind(this.query))()
    }
    txParams.gasPrice = ethUtil.addHexPrefix(gasPrice.toString(16))
    txParams.value = txParams.value || '0x0'
    // set gasLimit
    return await this.analyzeGasUsage(txMeta)
  }
  
}