App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  accessToAccounts: function () {
    try {
      ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error("User denied account access")
    }
  },

  initContract: async function () {
    $.getJSON("ETHChat.json", function (res) {
      App.contracts.ETHChat = TruffleContract(res);
      App.contracts.ETHChat.setProvider(App.web3Provider);
      App.contracts.ETHChat.deployed().then((i) => App.contracts.ETHChatInstance = i);
      App.sendMessageEvents();
      // App.listenForEvents();

    });
  },

  sendMessageEvents: function () {
    App.contracts.ETHChatInstance._messageSent({
      fromBlock: 0,
      toBlock: 'latest'
    }, function (error, event) {
      console.log(event);
    })
      // .on("data", function (event) { console.log(event); });
  },

  listenForEvents: function () {
    App.contracts.ETHChat.deployed().then(function (instance) {
      instance._messageSent({
        fromBlock: 0,
        toBlock: 'latest'
      }, function (error, event) {
        console.log(event);
      })
        // .on("data", function (event) {  console.log(event); });
    });
  },

  PastEvent: function () {
    App.contracts.ETHChatInstance.getPastEvents('_messageSent', function (error, events) { console.log(events); })
      .then(function (events) {
        console.log(events) // 与上述可选回调结果相同
      });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
