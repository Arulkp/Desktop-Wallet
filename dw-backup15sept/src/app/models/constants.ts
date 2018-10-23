export class Constants {
  public static TokenVault: string = '0xbaab5cac3c8ada9f04d987aaeb4267a4d3f692f1';
  public static TokenHistoryUrl: string = 'https://wandxrgdiag.blob.core.windows.net/tokentradedatat1/testtoken7daystrade.json';
  public static ServiceURL: string = 'https://wandx.azure-api.net/web/api/';
  public static CryptoCompareUrl: string = 'https://min-api.cryptocompare.com/data/histoday';
  public static WandxCompareUrl: string = 'http://wandx-api.azurewebsites.net/api/trade/history/hourly/';
  public static ThemedBasketRequest: string = 'https://wandx-api.azurewebsites.net/';
  //public static BashketURL: string = 'https://18.217.72.249:3443/api/portfolio/findPortfolio';
  public static BashketURL: string = 'https://erpt.privatenet.xyz:8443/api/portfolio/findPortfolio';
  public static TxAppnetURL: string = 'https://ropsten.etherscan.io/tx/';
  public static AddressAppnetURL: string = 'https://ropsten.etherscan.io/address/';
  public static EthTokenDetailURL: string = 'https://ropsten.etherscan.io/tokenholdings?a=';
  public static ApiManagementSubscriptionKey: string = 'c807bf6f64494923862a780a305397a2';
  public static AllowedNetwork: any = '3';
  public static WandxExchangeFeeRate: number = 0.00025;
  public static EthExchangeFeeRate: number = 0.001;
  public static OtherExchageFeeRate: number = 0.0015;
  public static EtherTokenId: number = 7;
  public static EtherTokenAddress: string = '0xc377e1b1916ba8825e14ed38cefdff47ec70ee07';
  public static WandxTokenId: number = 2;
  public static WandxTokenAddress: string = '0xeae069eac7c768fd16f677d2e17e150567f512da';
  public static WandxTokenDecimals =  18;
  public static OrderBookContractAddress: string = '0x97f09ec8540f4433f736851d712a55b72c5f8c0f';
  public static CretaeContractAddress: string = '0xd98fd92d7a47ede09e41944f2035bf009c72beb1';
  public static protoStorageAddress: string = '0xCF7a14B50d7fcf6A28EaB42daa2020e4826bB268';
  public static TrasfersProxyAddress: string = '0x59970f5b98edb807d37fbb709f034a4912125f6f';
  public static BlockExpirationWindow = 52000;

  // Neo Start
  public static contractScriptHash: string = '4b6dc098507569b853267a881faaefe15e84c852';
  public static PRIVATENET_RPC_URL: string = 'http://139.59.67.102:30333';
  public static PRIVATENET_URL: string = 'http://139.59.67.102:4000/api/main_net';
  public static NEO_TESTNET_RPC_URL: string = 'https://neotnrpc.wandx.co:8443';
  public static TESTNET_URL: string = 'TestNet';
  //public static NEOSCAN_URL_ASS: string = 'https://neoscan-testnet.io/address/';
  public static Script: number = 32;

  //TODO change to 0xa1... and update in neo.service.ts
  public static TAUsage_WithdrawalAddress: number = 164;
  public static TAUsage_NEP5AssetID: number = 162;
  public static TAUsage_SystemAssetID: number = 163;
  public static TAUsage_WithdrawalStage: number = 161;
  public static TAUsage_WithdrawalAmount: number = 241;
  public static Mark: string = '5000000000000000000000000000000000000000000000000000000000000000';
  public static Withdraw: string = '5100000000000000000000000000000000000000000000000000000000000000';

  public static NEO_ASSET_ID: string = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';
  public static NEO_GAS_ASSET_ID: string = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7';
  public static WAND_NEO_ASSET_ID: string = '4c87396582bdc9daf8df0470f175c79021190b49';

  public static NEO_SERVER_URL_PRIVETNET: string = 'http://139.59.94.223:3000/api/bc/getOrderDetails';
  public static NEO_SERVER_URL_STAKE_PRIVETNET: string = 'http://139.59.94.223:3000/api/bc/getOrderDetails';
  public static NEO_SERVER_URL_TESTNET: string = 'http://neotnapi.wandx.co/api/bc/getOrderDetails';
  public static NEO_SERVER_URL_STAKE_TESTNET: string = 'http://neotnapi.wandx.co/api/bc/getOrderDetails';

  public static NEO_SERVER_URL: string = Constants.NEO_SERVER_URL_TESTNET;
  public static NEO_SERVER_URL_STAKE: string = Constants.NEO_SERVER_URL_STAKE_TESTNET;

  public static RPC_URL = Constants.NEO_TESTNET_RPC_URL;
  public static NEOSCAN_URL = Constants.TESTNET_URL;
  public static NEO_TESTNET_TOKENDETAIL = 'https://neoscan-testnet.io/api/test_net/v1/get_balance/';
  // Neo End


  public static TokenAbi: any = [{
    'constant': false,
    'inputs': [{'name': '_spender', 'type': 'address'}, {'name': '_value', 'type': 'uint256'}],
    'name': 'approve',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'totalSupply',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_from', 'type': 'address'}, {'name': '_to', 'type': 'address'}, {'name': '_value', 'type': 'uint256'}],
    'name': 'transferFrom',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_spender', 'type': 'address'}, {'name': '_subtractedValue', 'type': 'uint256'}],
    'name': 'decreaseApproval',
    'outputs': [{'name': 'success', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_owner', 'type': 'address'}],
    'name': 'balanceOf',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_to', 'type': 'address'}, {'name': '_value', 'type': 'uint256'}],
    'name': 'transfer',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_spender', 'type': 'address'}, {'name': '_addedValue', 'type': 'uint256'}],
    'name': 'increaseApproval',
    'outputs': [{'name': 'success', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_owner', 'type': 'address'}, {'name': '_spender', 'type': 'address'}],
    'name': 'allowance',
    'outputs': [{'name': 'remaining', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': true, 'name': 'owner', 'type': 'address'}, {
      'indexed': true,
      'name': 'spender',
      'type': 'address'
    }, {'indexed': false, 'name': 'value', 'type': 'uint256'}],
    'name': 'Approval',
    'type': 'event'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': true, 'name': 'from', 'type': 'address'}, {'indexed': true, 'name': 'to', 'type': 'address'}, {
      'indexed': false,
      'name': 'value',
      'type': 'uint256'
    }],
    'name': 'Transfer',
    'type': 'event'
  }];
  public static OrderbookContractAbi: any = [{
    'constant': true,
    'inputs': [],
    'name': 'dataStore',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_tokensAndAddresses', 'type': 'address[6]'}, {'name': '_volumes', 'type': 'uint256[5]'}, {
      'name': '_orderMatchID',
      'type': 'bytes32'
    }, {'name': '_expiryBlockNumber', 'type': 'uint256'}],
    'name': 'orderMatchHash',
    'outputs': [{'name': '', 'type': 'bytes32'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_sellToken', 'type': 'address'}, {'name': '_buyToken', 'type': 'address'}, {
      'name': '_totalOrderVolume',
      'type': 'uint256'
    }, {'name': '_priceRate', 'type': 'uint256'}, {'name': '_numBlocksExpires', 'type': 'uint256'}, {
      'name': '_orderCreator',
      'type': 'address'
    }, {'name': '_orderType', 'type': 'uint256'}, {'name': '_orderID', 'type': 'bytes32'}, {'name': '_feeToken', 'type': 'address'}],
    'name': 'orderHash',
    'outputs': [{'name': '', 'type': 'bytes32'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_orderHash', 'type': 'bytes32'}, {'name': '_orderCreator', 'type': 'address'}, {
      'name': '_totalOrderVolume',
      'type': 'uint256'
    }],
    'name': 'orderAvailability',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_depositor', 'type': 'address'}],
    'name': 'balanceOf',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_orderHash', 'type': 'bytes32'}, {'name': '_orderCreator', 'type': 'address'}],
    'name': 'oredrAlreadyExists',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'isTradingActive',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_orderHash', 'type': 'bytes32'}, {'name': '_orderCreator', 'type': 'address'}, {
      'name': '_totalOrderVolume',
      'type': 'uint256'
    }],
    'name': 'isOrderClosedOrFulfilled',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'isLocked',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'address'}, {'name': '', 'type': 'address'}],
    'name': 'fundDeposits',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_depositor', 'type': 'address'}, {'name': '_token', 'type': 'address'}],
    'name': 'balanceOfToken',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'owner',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'baseTokenAddress',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'address'}],
    'name': 'authorized',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'uint256'}],
    'name': 'exFees',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'safetyWallet',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'etherRefAddress',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'approver',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_msgHash', 'type': 'bytes32'}, {'name': 'v', 'type': 'uint8'}, {'name': 'r', 'type': 'bytes32'}, {
      'name': 's',
      'type': 'bytes32'
    }],
    'name': 'ecrecovery',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'pure',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_signer', 'type': 'address'}, {'name': '_orderHash', 'type': 'bytes32'}, {
      'name': 'v',
      'type': 'uint8'
    }, {'name': 'r', 'type': 'bytes32'}, {'name': 's', 'type': 'bytes32'}],
    'name': 'verifySignature',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'pure',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_value', 'type': 'uint256'}, {'name': '_feeToken', 'type': 'address'}],
    'name': 'calcTradeFee',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'uint256'}],
    'name': 'listTokens',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {'payable': true, 'stateMutability': 'payable', 'type': 'fallback'}, {
    'constant': false,
    'inputs': [{'name': '_newAddress', 'type': 'address'}],
    'name': 'addAuthorizedAddress',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_to', 'type': 'address'}, {'name': '_token', 'type': 'address'}, {'name': '_amount', 'type': 'uint256'}],
    'name': 'withdrawTokenTo',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'origin', 'type': 'address'}, {
      'indexed': false,
      'name': 'activityCode',
      'type': 'bytes32'
    }, {'indexed': false, 'name': 'customMsg', 'type': 'bytes32'}],
    'name': 'TradeActivity',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_depositor', 'type': 'address'}],
    'name': 'deposit',
    'outputs': [],
    'payable': true,
    'stateMutability': 'payable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'signer', 'type': 'address'}, {
      'indexed': false,
      'name': 'isValidSignature',
      'type': 'bool'
    }, {'indexed': false, 'name': 'activityCode', 'type': 'bytes32'}],
    'name': 'SingatureValidated',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_sellToken', 'type': 'address'}, {'name': '_buyToken', 'type': 'address'}, {
      'name': '_totalOrderVolume',
      'type': 'uint256'
    }, {'name': '_priceRate', 'type': 'uint256'}, {'name': '_numBlocksExpires', 'type': 'uint256'}, {
      'name': '_orderCreator',
      'type': 'address'
    }, {'name': '_orderType', 'type': 'uint256'}, {'name': '_orderID', 'type': 'bytes32'}, {'name': '_feeToken', 'type': 'address'}],
    'name': 'createOrder',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'oldApprover', 'type': 'address'}, {'indexed': false, 'name': 'newApprover', 'type': 'address'}],
    'name': 'OwnerChanged',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_newOwner', 'type': 'address'}],
    'name': 'changeOwner',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'creator', 'type': 'address'}, {
      'indexed': false,
      'name': 'orderHash',
      'type': 'bytes32'
    }, {'indexed': false, 'name': 'activityCode', 'type': 'bytes32'}],
    'name': 'OrderOps',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_orderHash', 'type': 'bytes32'}, {'name': '_orderCreator', 'type': 'address'}, {
      'name': '_totalOrderVolume',
      'type': 'uint256'
    }, {'name': '_feeToken', 'type': 'address'}, {'name': '_orderValue', 'type': 'uint256'}],
    'name': 'cancelOrder',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'inputs': [{'name': '_newApprover', 'type': 'address'}, {'name': '_newWallet', 'type': 'address'}, {
      'name': '_dataStore',
      'type': 'address'
    }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'
  }, {
    'constant': false,
    'inputs': [{'name': '_tokensAndAddresses', 'type': 'address[6]'}, {
      'name': '_volumes',
      'type': 'uint256[6]'
    }, {'name': '_numBlocksExpires', 'type': 'uint256'}, {'name': '_orderType', 'type': 'uint256'}, {
      'name': 'v',
      'type': 'uint8'
    }, {'name': 'r', 'type': 'bytes32'}, {'name': 's', 'type': 'bytes32'}, {'name': '_orderID', 'type': 'bytes32'}],
    'name': 'fillOrder',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'origin', 'type': 'address'}, {
      'indexed': false,
      'name': 'seller',
      'type': 'address'
    }, {'indexed': false, 'name': 'buyer', 'type': 'address'}, {
      'indexed': false,
      'name': 'orderHash',
      'type': 'bytes32'
    }, {'indexed': false, 'name': 'activityCode', 'type': 'bytes32'}, {'indexed': false, 'name': 'customMsg', 'type': 'bytes32'}],
    'name': 'OrderFills',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [],
    'name': 'moveToSafetyWallet',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'orderHash', 'type': 'bytes32'}, {
      'indexed': false,
      'name': 'expiryBlockNumber',
      'type': 'uint256'
    }, {'indexed': false, 'name': 'activityCode', 'type': 'bytes32'}],
    'name': 'OrderExpired',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_baseToken', 'type': 'address'}, {'name': '_ether', 'type': 'address'}, {
      'name': '_baseTokenFee',
      'type': 'uint256'
    }, {'name': '_etherFee', 'type': 'uint256'}, {'name': '_normalTokenFee', 'type': 'uint256'}],
    'name': 'updateFeeCalcConfig',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_tradeActive', 'type': 'bool'}, {'name': '_dataStore', 'type': 'address'}, {'name': '_isLocked', 'type': 'bool'}],
    'name': 'changeTraderConfig',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'oldApprover', 'type': 'address'}, {'indexed': false, 'name': 'newApprover', 'type': 'address'}],
    'name': 'ApproverChanged',
    'type': 'event'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'target', 'type': 'address'}, {'indexed': false, 'name': 'caller', 'type': 'address'}],
    'name': 'AuthorizationAdded',
    'type': 'event'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'target', 'type': 'address'}, {'indexed': false, 'name': 'caller', 'type': 'address'}],
    'name': 'AuthorizationRemoved',
    'type': 'event'
  }, {
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': 'origin', 'type': 'address'}, {
      'indexed': false,
      'name': '_accHolder',
      'type': 'address'
    }, {'indexed': false, 'name': 'token', 'type': 'address'}, {'indexed': false, 'name': 'amount', 'type': 'uint256'}, {
      'indexed': false,
      'name': 'activityCode',
      'type': 'bytes32'
    }, {'indexed': false, 'name': 'customMsg', 'type': 'bytes32'}],
    'name': 'LockerActivity',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [{'name': '_newApprover', 'type': 'address'}],
    'name': 'changeApprover',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_to', 'type': 'address'}, {'name': '_amount', 'type': 'uint256'}],
    'name': 'withdrawTo',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_newAddress', 'type': 'address'}],
    'name': 'removeAuthorizedAddress',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_tokensAndAddresses', 'type': 'address[6]'}, {
      'name': '_volumes',
      'type': 'uint256[5]'
    }, {'name': '_expiryBlockNumber', 'type': 'uint256'}, {'name': '_orderMatchID', 'type': 'bytes32'}, {
      'name': 'v',
      'type': 'uint8'
    }, {'name': 'r', 'type': 'bytes32'}, {'name': 's', 'type': 'bytes32'}],
    'name': 'fillOrderMatch',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_depositor', 'type': 'address'}, {'name': '_token', 'type': 'address'}, {'name': '_amount', 'type': 'uint256'}],
    'name': 'depositTokens',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }];
  public static createPortfolio: any = [{
    'anonymous': false,
    'inputs': [{'indexed': false, 'name': '_maker', 'type': 'address'}, {
      'indexed': false,
      'name': '_portfolio',
      'type': 'address'
    }, {'indexed': false, 'name': '_fee', 'type': 'uint256'}, {'indexed': false, 'name': '_hash', 'type': 'bytes32'}, {
      'indexed': false,
      'name': '_message',
      'type': 'bytes32'
    }],
    'name': 'Exchange',
    'type': 'event'
  }, {
    'constant': false,
    'inputs': [
      {'name': '_maker', 'type': 'address'},
      {'name': '_assets', 'type': 'address[]'},
      {'name': '_volumes', 'type': 'uint256[]'},
      {'name': '_askValue', 'type': 'uint256'},
      {'name': '_expiryBlock', 'type': 'uint256'},
      {'name': '_name', 'type': 'bytes32'}],
    'name': 'createPortfolio',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_storage', 'type': 'address'}, {'name': '_calc', 'type': 'address'}, {
      'name': '_proxy',
      'type': 'address'
    }, {'name': '_token', 'type': 'address'}],
    'name': 'updateExchange',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'inputs': [{'name': '_storage', 'type': 'address'}, {'name': '_calc', 'type': 'address'}, {
      'name': '_proxy',
      'type': 'address'
    }, {'name': '_token', 'type': 'address'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'ethertoken',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'feeCalculator',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_askValue', 'type': 'uint256'}, {'name': '_feeIndex', 'type': 'uint256'}],
    'name': 'getFee',
    'outputs': [{'name': '', 'type': 'uint256'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_maker', 'type': 'address'}, {'name': '_assets', 'type': 'address[]'}, {
      'name': '_volumes',
      'type': 'uint256[]'
    }, {'name': '_askValue', 'type': 'uint256'}, {'name': '_expiryBlock', 'type': 'uint256'}, {'name': '_name', 'type': 'bytes32'}],
    'name': 'getPortfolioHash',
    'outputs': [{'name': '', 'type': 'bytes32'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'owner',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'protostage',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'transferProxy',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'version',
    'outputs': [{'name': '', 'type': 'bytes32'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }];
  public static VBPABI: any = [
    {
      'constant': false,
      'inputs': [],
      'name': 'publish',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [],
      'name': 'liquidate',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [{'name': '_token', 'type': 'address'}, {'name': '_amount', 'type': 'uint256'}],
      'name': 'depositTokens',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [{'name': '', 'type': 'address'}],
      'name': 'assetStatus',
      'outputs': [{'name': '', 'type': 'bool'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [{'name': '_token', 'type': 'address'}, {'name': '_amount', 'type': 'uint256'}],
      'name': 'withdrawToken',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [{'name': '', 'type': 'address'}, {'name': '', 'type': 'address'}],
      'name': 'fundDeposits',
      'outputs': [{'name': '', 'type': 'uint256'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [],
      'name': 'buy',
      'outputs': [],
      'payable': true,
      'stateMutability': 'payable',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [{'name': '', 'type': 'uint256'}],
      'name': 'listAssets',
      'outputs': [{'name': '', 'type': 'address'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [],
      'name': 'cancelPortfolio',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': false,
      'inputs': [{'name': '_askValue', 'type': 'uint256'}, {'name': '_expiresAfter', 'type': 'uint256'}, {
        'name': '_assets',
        'type': 'address[]'
      }, {'name': '_volumes', 'type': 'uint256[]'}, {'name': '_portfolioName', 'type': 'bytes32'}],
      'name': 'updatePortfolio',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [],
      'name': 'currentPortfolio',
      'outputs': [{'name': 'maker', 'type': 'address'}, {'name': 'currentOwnerOrSeller', 'type': 'address'}, {
        'name': 'valueInEther',
        'type': 'uint256'
      }, {'name': 'expiresAt', 'type': 'uint256'}, {'name': 'name', 'type': 'bytes32'}, {'name': 'status', 'type': 'uint8'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [{'name': '', 'type': 'address'}],
      'name': 'assets',
      'outputs': [{'name': '', 'type': 'uint256'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'constant': true,
      'inputs': [{'name': '_depositor', 'type': 'address'}, {'name': '_token', 'type': 'address'}],
      'name': 'balanceOfToken',
      'outputs': [{'name': '', 'type': 'uint256'}],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function'
    }, {
      'inputs': [{'name': '_owner', 'type': 'address'}, {'name': '_assets', 'type': 'address[]'}, {
        'name': '_volumes',
        'type': 'uint256[]'
      }, {'name': '_askValue', 'type': 'uint256'}, {'name': '_expiryBlock', 'type': 'uint256'}, {
        'name': '_portfolioName',
        'type': 'bytes32'
      }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'
    }, {'payable': true, 'stateMutability': 'payable', 'type': 'fallback'}, {
      'anonymous': false,
      'inputs': [{'indexed': false, 'name': '_ownerOrSeller', 'type': 'address'}, {
        'indexed': false,
        'name': '_amount',
        'type': 'uint256'
      }, {'indexed': false, 'name': '_message', 'type': 'bytes32'}],
      'name': 'PortfolioPublsihed',
      'type': 'event'
    }, {
      'anonymous': false,
      'inputs': [{'indexed': false, 'name': '_ownerOrSeller', 'type': 'address'}, {
        'indexed': false,
        'name': '_message',
        'type': 'bytes32'
      }],
      'name': 'PortfolioEvents',
      'type': 'event'
    }, {
      'anonymous': false,
      'inputs': [{'indexed': false, 'name': '_ownerOrSeller', 'type': 'address'}, {
        'indexed': false,
        'name': '_buyer',
        'type': 'address'
      }, {'indexed': false, 'name': '_amount', 'type': 'uint256'}, {'indexed': false, 'name': '_message', 'type': 'bytes32'}],
      'name': 'PortfolioBought',
      'type': 'event'
    }, {
      'anonymous': false,
      'inputs': [{'indexed': false, 'name': '_depositor', 'type': 'address'}, {
        'indexed': false,
        'name': '_token',
        'type': 'address'
      }, {'indexed': false, 'name': '_amount', 'type': 'uint256'}, {'indexed': false, 'name': '_message', 'type': 'bytes32'}],
      'name': 'Deposited',
      'type': 'event'
    }, {
      'anonymous': false,
      'inputs': [{'indexed': false, 'name': '_depositor', 'type': 'address'}, {
        'indexed': false,
        'name': '_token',
        'type': 'address'
      }, {'indexed': false, 'name': '_amount', 'type': 'uint256'}, {'indexed': false, 'name': '_message', 'type': 'bytes32'}],
      'name': 'withdrawn',
      'type': 'event'
    }];
  public static ProtoStorage: any = [{
    'constant': false,
    'inputs': [{'name': '_newPortfolio', 'type': 'address'}, {'name': '_maker', 'type': 'address'}],
    'name': 'addPortfolio',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_publisher', 'type': 'address'}],
    'name': 'registerPublisher',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {
    'constant': false,
    'inputs': [{'name': '_publisher', 'type': 'address'}],
    'name': 'removePublisher',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }, {'inputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'}, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'address'}],
    'name': 'exchanges',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '_publisher', 'type': 'address'}],
    'name': 'IsExchangeAllowed',
    'outputs': [{'name': '', 'type': 'bool'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'uint256'}],
    'name': 'listExchange',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'uint256'}],
    'name': 'listPortfolios',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [],
    'name': 'owner',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }, {
    'constant': true,
    'inputs': [{'name': '', 'type': 'address'}],
    'name': 'portfolios',
    'outputs': [{'name': '', 'type': 'address'}],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }];

  // themed basket for app(QA)
  public static Decentralised_exhchange_tokensApp: any = ['0x7354b4cea1cb8188a290b857132cd1214bd1cbbc', '0x2c94bba009e0133f5944fa25944edc44427db790'];
  public static Decentralised_insurance_tokensApp: any = ['0x2c94bba009e0133f5944fa25944edc44427db790', '0xc8f0c992660666b64596c452fc0e7e6b07a448c2'];
  public static Decentralised_identity_tokensApp: any = ['0x7354b4cea1cb8188a290b857132cd1214bd1cbbc', '0x2c94bba009e0133f5944fa25944edc44427db790', '0xc8f0c992660666b64596c452fc0e7e6b07a448c2'];


  //themed basket for exchange(PROD)
  public static Decentralised_exhchange_tokens: any = ['0xdd974d5c2e2928dea5f71b9825b8b646686bd200', '0x27f610bf36eca0939093343ac28b1534a721dbb4'];

  public static Decentralised_insurance_tokens: any = ['0x52a7cb918c11a16958be40cba7e31e32a499a465', '0x1063ce524265d5a3a624f4914acd573dd89ce988'];

  public static Decentralised_identity_tokens: any = ['0xB236E2477B8ed34B203B60e2b88884ee5b31a3c3'];

  public static Low_market_cap_ERC20_tokens: any = ['0x52a7cb918c11a16958be40cba7e31e32a499a465', '0x27f610bf36eca0939093343ac28b1534a721dbb4', '0x2fa32a39fc1c399e0cc7b2935868f5165de7ce97'];
}
