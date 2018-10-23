import {Injectable, Inject, OnInit} from '@angular/core';

declare const window: any;
declare const ipcRenderer: any;
const getmac = window.require('getmac');

@Injectable()
export class AwsService {
  private dynamodb: any;
  private docClient: any;
  public macAddress: any = 'dummy';
  public count = 0;
  public airDropItemdata: any;

  constructor() {
    window['AWS'].config.update({
      accessKeyId: 'AKIAI54GMQ6SFKTC65NA',
      secretAccessKey: 'vGqcf/Bb/WoEYry7GmpCj/rHwTEqMenuS91hfO9+',
      region: 'us-east-2'
    });
    this.dynamodb = new window['AWS'].DynamoDB({apiVersion: '2012-10-08'});
    this.docClient = new window['AWS'].DynamoDB.DocumentClient();

    console.log(this.dynamodb);
    getmac.getMac((err, macAddress) => {
      if (err) throw err;
      console.log(macAddress);
      this.macAddress = macAddress;
    });

  }

  addItemAirDrop(data) {
    return new Promise((resolve, reject) => {
      console.log(data);
      if (!data.Ethereum) {
        data.Ethereum = 'not_provided';
      }
      var params = {
        TableName: 'AirDrop',
        Item: {
          'neo_address': {S: data.NEO.address.toString()},
          'device_id': {S: this.macAddress.toString()},
          'telegram_id': {S: data.Telegram.toString()},
          'email_id': {S: data.Email.toString()},
          'ethereum_address': {S: data.Ethereum.toString()},
          'timestamp': {N: new Date().getTime().toString()},
        }
      };
      // Call DynamoDB to add the item  to the table
      this.dynamodb.putItem(params, function (err, data) {
        if (err) {
          reject(err);
          console.log('Error', err);
        } else {
          console.log('Success', data);
          resolve(data);
        }
      });
    });

  }

  addItemNewWallet(data) {
    var params = {
      TableName: 'DesktopWallets',
      Item: {
        'address': {S: data.address},
        'deviceID': {S: this.macAddress.toString()},
        'platform': {S: data.type},
        'timestamp': {N: new Date().getTime().toString()},
      }
    };

    // Call DynamoDB to add the item to the table
    this.dynamodb.putItem(params, function (err, data) {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data);
      }
    });
  }

  checkForAlreadyExit(address) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: 'AirDrop',
        KeyConditionExpression: '#neo_address = :neo_address',
        ExpressionAttributeNames: {
          '#neo_address': 'neo_address'
        },
        ExpressionAttributeValues: {
          ':neo_address': address
        }
      };
      this.docClient.query(params, (err, data) => {
        if (err) {
          reject(err);
          console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
        } else {
          resolve(data.Count);
          //console.log('Query succeeded.', data.Count);
        }
      });
    });
  }


}
