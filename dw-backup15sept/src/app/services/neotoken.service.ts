import {Injectable} from '@angular/core';
import {Constants} from '../models/constants';
import {NeoService} from './neo.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class NeotokenService {

  private _neoTokenList = new BehaviorSubject<Object>(null);
  NeoTokenList$ = this._neoTokenList.asObservable();

  private tokens = [];

  private privatenet_tokens = [{
    'name': 'Aphelion',
    'fullName': 'Aphelion',
    'address': '69814b077395ced2c4141279dc6680a9359bf993',
    'id': 1,
    'symbol': 'APH',
    'decimals': 8
  }, {
    'name': 'Travala',
    'fullName': 'Travala',
    'address': '90987085d099fda8da0cc5655d75dfb76b76e369',
    'id': 2,
    'symbol': 'AVA',
    'decimals': 8
  }, {
    'name': 'Red Pulse Token',
    'fullName': 'Red Pulse Token',
    'address': 'cf631b17062fe1b2275c2d13859d10e485dd3107',
    'id': 3,
    'symbol': 'RPX',
    'decimals': 8
  }, {
    'name': 'Qlink Token',
    'fullName': 'Qlink Token',
    'address': 'a8fd3721fab2161ba046d131c0431612de8e5376',
    'id': 4,
    'symbol': 'QLC',
    'decimals': 8
  }, {
    'name': 'Loopring Neo Token',
    'fullName': 'Loopring Neo Token',
    'address': 'e46d6d3ede87bb7f93ad7ce5f0d4a578f6119edc',
    'id': 5,
    'symbol': 'LRN',
    'decimals': 8
  }, {
    'name': 'Phantasma',
    'fullName': 'Phantasma',
    'address': 'a15008c3c21c9c1e905acdef2fe7e56af534b42b',
    'id': 6,
    'symbol': 'SOUL',
    'decimals': 8
  }, {
    'name': 'GagaPay network token',
    'fullName': 'GagaPay network token',
    'address': '97dd8b15afad6df4dec30b88460ebb22d9428564',
    'id': 7,
    'symbol': 'GTA',
    'decimals': 8
  }, {
    'name': 'TreatailToken',
    'fullName': 'TreeTailToken',
    'address': '17dc5e9ac0965b39626b7b820e6a96ecff0cfd68',
    'id': 8,
    'symbol': 'TTL',
    'decimals': 8
  }, {
    'name': 'Special Drawing Token',
    'fullName': 'Special Drawing Token',
    'address': '37b5011de8671fb7c03fdcea340dbfe72bd6ad13',
    'id': 9,
    'symbol': 'SDT',
    'decimals': 8
  }];

  private testnet_tokens = [{
    'name': 'Travala',
    'fullName': 'Travala',
    'address': 'c84ec4db4edb87e0421862fe934eceea2b4d56a6',
    'id': 1,
    'symbol': 'AVA',
    'decimals': 8
  }, {
    'name': 'Loopring Neo Token',
    'fullName': 'Loopring Neo Token',
    'address': '617428b12734d0635d5b942d0fcf708762db3297',
    'id': 2,
    'symbol': 'LRN',
    'decimals': 8
  }, {
    'name': 'For The Win',
    'fullName': 'For The Win',
    'address': 'c168cad4a48ef8d95b38f0b6dc792b37d99a7973',
    'id': 3,
    'symbol': 'FTW',
    'decimals': 8
  }, {
    'name': 'Contract Token X',
    'fullName': 'Contract Token X',
    'address': '9aff1e08aea2048a26a3d2ddbb3df495b932b1e7',
    'id': 4,
    'symbol': 'CTX',
    'decimals': 8
  }, {
    'name': 'WandX Neo Token',
    'fullName': 'WandX Neo Token',
    'address': '4c87396582bdc9daf8df0470f175c79021190b49',
    'id': 5,
    'symbol': 'WANDNEO',
    'decimals': 8
  }];

  constructor(private neoService: NeoService) {
    console.log('noe token initiated');
    this.tokens = this.testnet_tokens;
  }

  getNeonTokenList() {
    return this.tokens;
  }

  getTokenDetail() {
    const temp = [];
    this.tokens.map((key, value) => {
      this.neoService.getTokensBalance(key.address, this.neoService.getCurrentUserAdd()).then((res) => {
        if (res) {
          key.name = res['name'];
          key.itemName = res['name'];
          key.symbol = res['symbol'];
          key.balance = res['balance'];
          key.decimals = res['decimals'];
          temp.push(key);
          this._neoTokenList.next(temp);
        }
      });
    });
  }

}
