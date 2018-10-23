const fetch = require('node-fetch');
(function () {
  var utils = {};
  var data;
  utils.setData = function () {
    fetch('https://neoscan-testnet.io/api/test_net/v1/get_balance/AVgAf6PJZHLL8F9Quqhzq8smdUuxxJFw45')
      .then(res => res.json())
  .then(json => console.log(json));
  };
  utils.getData = function () {
    return data
  };
  module.exports = utils;
}());
