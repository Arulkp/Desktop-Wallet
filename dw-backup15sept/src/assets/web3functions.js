
var web3Functions = new function(){
  var TokenVault = "0xbaab5cac3c8ada9f04d987aaeb4267a4d3f692f1"; //web3.eth.coinbase;
  function getCurrentUnixTimestamp() {
    return new BigNumber(Date.now() / 1000);
  }
  function generateSalt() {
    const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
    const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT - 10);
    const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
    var salt = randomNumber.times(factor).round();
    return salt;
  }
  this.checkWeb3 = function(){
    if(typeof web3 === 'undefined'){
      return false;
    }
    else{
      return true;
    }
  };
  this.initializeDefaultAccount=function(){

  }
  this.initializeWeb3 = function(useJsonWallet, data){
    if (!data)
      return;
    web3 = new data.web3(data.provider);
    web3.eth.defaultAccount=web3.eth.accounts[0];
    console.log("useJsonWallet", web3.eth.defaultAccount)
  };
  this.setDefaultAccount = function(){
    web3.eth.defaultAccount=web3.eth.accounts[0];
    console.log("useJsonWallet", web3.eth.defaultAccount)
  };
  this.generateSalt = function(){
    const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
    const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT - 10);
    const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
    var salt = randomNumber.times(factor).round();
    return salt;
  };
  this.prepareCallPayload = function (portfolioJson) {
    var sellerTokens = [], sellervalues = [], buyerTokens = [], buyerValues = [];
    creationFee = new BigNumber(Math.floor(portfolioJson['creationfee']));
    buyerFee = new BigNumber(Math.floor(portfolioJson['sellingFee']));
    expirationTimeStamp = getCurrentUnixTimestamp();
    ordersalt = generateSalt();
    sellerTokens = portfolioJson['sellerTokens'];
    buyerTokens = portfolioJson['buyerTokens'];
    orderaddresses = [portfolioJson['creator'], portfolioJson['buyer'], TokenVault];
    orderValues = [creationFee, buyerFee, expirationTimeStamp, ordersalt];
    for (var i = 0, len = portfolioJson['sellervalues'].length; i < len; i++) {
      sellervalues.push(new BigNumber(Math.floor(portfolioJson['sellervalues'][i])));
    }
    for (var i = 0, len = portfolioJson['buyervalues'].length; i < len; i++) {
      buyerValues.push(new BigNumber(Math.floor(portfolioJson['buyervalues'][i])));
    }
    return [sellerTokens, sellervalues, buyerTokens, buyerValues, orderaddresses, orderValues];
  };
  this.toBaseUnitAmount = function(amount, decimals) {
    var value = new BigNumber(parseFloat(amount).toFixed(15));
    var unit = new BigNumber(10).pow(decimals);
    var baseUnitAmount = value.times(unit);
    return baseUnitAmount;
  };
  this.convertToBigNumber = function(amount){
    return new BigNumber(amount);
  }
  function parseSignatureAsVRS(signature) {
    var _a = ehUtil.Util.toBuffer(signature);
    var v = _a[0];
    if (v < 27) {
      v += 27;
    }
    var r = _a.slice(1, 33);
    var s = _a.slice(33, 65);
    var ecSignature = {
      v: v,
      r: ehUtil.Util.bufferToHex(r),
      s: ehUtil.Util.bufferToHex(s),
    };
    return ecSignature;
  }

  function parseSignatureAsRSV(signature) {
    var _a = ehUtil.Util.fromRpcSig(signature), v = _a.v, r = _a.r, s = _a.s;
    var ecSignature = {
      v: v,
      r: ehUtil.Util.bufferToHex(r),
      s: ehUtil.Util.bufferToHex(s),
    };
    return ecSignature;
  }

  this.extractECSignature = function(sign, orderHash, signer) {
    // Parse the signature in RSV way
    var ecSignature = parseSignatureAsRSV(sign);
    if (!isValidSignature(ecSignature, orderHash, signer)) {
      // Parse the signature in VRS way
      ecSignature = parseSignatureAsVRS(sign);
      if (!isValidSignature(ecSignature, orderHash, signer)) {
        return null;
      }
    }
    return ecSignature;
  }

  function isValidSignature(ecSignature, orderHash, signer) {
    var msgBuf = ehUtil.Util.toBuffer(orderHash);
    var v = ecSignature.v;
    var rBuf = ehUtil.Util.toBuffer(ecSignature.r);
    var sBuf = ehUtil.Util.toBuffer(ecSignature.s);
    var pubKeyBuff = ehUtil.Util.ecrecover(msgBuf, v, rBuf, sBuf);
    var pubAddBuf = ehUtil.Util.pubToAddress(pubKeyBuff);

    var addrRetrieved = ehUtil.Util.bufferToHex(pubAddBuf);
    return signer === addrRetrieved;
  }

  this.clientVerifySign = function(ecSignature, orderHash, signer) {
    if (ecSignature == null)
      return false;

    if (!isValidSignature(ecSignature, orderHash, signer)) {
      return false;
    }
    return true;
  }
}
