import {Injectable, Inject, OnInit, NgZone} from '@angular/core';
import * as _ from 'underscore';
import {NeoService} from './neo.service';
import {MessageContentType, MessageModel, MessageType} from '../models/message.model';
import {NotificationManagerService} from './notification-manager.service';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class UpdatebasketqueueService {
  private OriginalList: any;
  private newlList: any;
  public queue = [];
  newElememt = [];
  oldElememt = [];
  deletedElememt = [];
  private trackQueueIndex = 0;
  private orderHash: any;
  private trackTransactioTimer: any;
  private liquidate: boolean = false;
  private _removeAssets = new BehaviorSubject<Object>(null);
  RemoveAssets$ = this._removeAssets.asObservable();
  private _transactionComplete = new BehaviorSubject<Object>(null);
  TransactionComplete$ = this._transactionComplete.asObservable();

  constructor(private zone: NgZone, private router: Router, private neoService: NeoService, private notificationManagerService: NotificationManagerService) {

  }

  setorderHash(orderHash: any) {
    this.orderHash = orderHash;
  }

  setOriginalList(list: any) {
    this.OriginalList = list;
  }

  setNewlList(list: any) {
    this.newlList = list;
  }

  addToQueue(address, value, status) {
    if (status === 'Update') {
      let tmp = {};
      tmp['action'] = 'remove', tmp['address'] = address;
      tmp['value'] = null, tmp['status'] = false;
      this.queue.push(tmp);
      let tmp2 = {};
      tmp2['action'] = 'add';
      tmp2['value'] = value;
      tmp2['address'] = address;
      tmp2['status'] = false;
      this.queue.push(tmp2);
    } else if (status === 'add') {
      let tmp2 = {};
      tmp2['action'] = 'add';
      tmp2['value'] = value;
      tmp2['address'] = address;
      tmp2['status'] = false;
      this.queue.push(tmp2);
    } else if (status === 'delete') {
      let tmp = {};
      tmp['action'] = 'remove';
      tmp['value'] = null;
      tmp['address'] = address;
      tmp['status'] = false;
      this.queue.push(tmp);
    } else {
      let tmp = {};
      tmp['action'] = 'placeOrder';
      tmp['value'] = value;
      tmp['address'] = address;
      tmp['status'] = false;
      this.queue.push(tmp);
    }

  }

  findNewandOld() {
    this.newlList.map((key) => {
      var filter = _.filter(this.OriginalList, (k) => k.address == key.address);
      if (filter.length === 0) {
        this.newElememt.push(key);
      } else {
        if (filter[0].value !== key.quantity) {
          this.oldElememt.push(key);
        }

      }
    });
  }

  findDeleted() {
    this.OriginalList.map((key) => {
      var filter = _.filter(this.newlList, (k) => k.address == key.address);
      if (filter.length === 0) {
        this.deletedElememt.push(key);
      }
    });
  }

  finalUpdate(callback) {
    this.findNewandOld();
    this.findDeleted();
    callback(true);
  }

  generateQueue() {
    this.queue = [];
    if (this.oldElememt.length > 0) {
      this.oldElememt.map((key) => {
        this.addToQueue(key.address, key.quantity, 'Update');
      });
    }
    if (this.newElememt.length > 0) {
      this.newElememt.map((key) => {
        this.addToQueue(key.address, key.quantity, 'add');
      });
    }

    if (this.deletedElememt.length > 0) {
      this.deletedElememt.map((key) => {
        this.addToQueue(key.address, key.quantity, 'delete');
      });
    }

    console.log('queue', this.queue);
    setTimeout(() => {
      console.log('processTransaction');
      this.processTransaction();
      this.trackQueueIndex = 0;
    }, 4000);
  }

  addPlaceOrderToqueue(askingToken, askingPrice) {
    this.addToQueue(askingToken, askingPrice, 'placeOrder');
    console.log('queuePlaceorder', this.queue);
    setTimeout(() => {
      console.log('processTransaction');
      this.processTransaction();
      this.trackQueueIndex = 0;
    }, 1000);
  }

  clearQueue() {
    this.queue = [];
    this.oldElememt = [];
    this.newElememt = [];
    this.deletedElememt = [];
  }


  processTransaction() {
    let txdata = this.queue[this.trackQueueIndex];
    if (txdata.action === 'remove') {
      console.log('called remove asset');
      this.neoService.removeAssetFromBasket(this.orderHash, txdata.address).then((res) => {
        if (res['response']['txid']) {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Remove Asset Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        } else {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
        }

      });
    } else if (txdata.action === 'add') {
      console.log('called add asset');
      this.neoService.addAssetsTobasket(this.orderHash, txdata.address, parseFloat(txdata.value) * 100000000).then((res) => {
        if (res['response']['txid']) {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Add Asset Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        } else {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
        }
      });
    } else if (txdata.action === 'placeOrder') {
      console.log('called placeOrder asset');
      this.neoService.placeBasketOrder(this.orderHash, txdata.address, parseFloat(txdata.value) * 100000000).then((res) => {
        if (res['response']['txid']) {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'place order Transaction is submitted to Network please wait for confirmation'), MessageContentType.Text);
          setTimeout(() => {
            this.trackTransaction(res['response']['txid']);
          }, 15000);
        } else {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Error, 'Transaction Failed Try again after some time'), MessageContentType.Text);
        }
      });
    }
  }

  private trackTransaction(txid) {
    console.log('Called timer');
    if (this.trackTransactioTimer)
      clearTimeout(this.trackTransactioTimer);
    this.neoService.trackTransaction(txid).then((res) => {
      if (res['res'].hasOwnProperty('blocktime')) {
        console.log('confirm');
        this.trackQueueIndex = this.trackQueueIndex + 1;
        this.continueTransaction();
        clearTimeout(this.trackTransactioTimer);
      }
    });
    this.trackTransactioTimer = setTimeout(() => {
      this.trackTransaction(txid);
    }, 1000);
  }

  continueTransaction() {
    console.log('index', this.trackQueueIndex);
    if (this.trackQueueIndex <= this.queue.length - 1) {
      setTimeout(() => {
        this.processTransaction();
      }, 20000);
    } else {
      if (this.liquidate === true) {
        this._removeAssets.next(true);
      } else {
        this.zone.run(() => {
          this.notificationManagerService.showNotification(new MessageModel(MessageType.Info, 'Transaction completed successfully'), MessageContentType.Text);
          this._transactionComplete.next('complete');
        });
      }
    }
  }

  clearIndexQueue() {
    this.trackQueueIndex = 0;
  }

  setRemoveAsset(assets) {
    this.liquidate = true;
    this.deletedElememt = assets;
  }

  disableLiquidate() {
    this.liquidate = false;
  }
}
