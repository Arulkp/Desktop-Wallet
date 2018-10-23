import {Injectable} from '@angular/core';
import {Constants} from '../models/constants';
import {BigNumber} from 'bignumber.js';
import {type} from 'os';
import {MessageContentType, MessageModel, MessageType} from '../models/message.model';
import {Http, RequestOptions, Headers} from '@angular/http';
import * as Aion_web3 from 'aion-web3-v1.0'

@Injectable()
export class AionService {
  public aion_web3:any;

  constructor() {
    this.aion_web3 = new Aion_web3(new Aion_web3.providers.HttpProvider("http://18.191.165.67:8545"))
  }

  getWeb3() {
      return this.aion_web3;
  }
}