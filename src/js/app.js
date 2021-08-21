App = {
  web3Provider: null,
  account: '0x0',
  instance: {},
  abstratContract: {},

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
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error("User denied account access")
    }
  },

  initContract: async function () {
    $.getJSON("ETHChat.json", function (election) {
      abstratContract = TruffleContract(election);
      abstratContract.setProvider(App.web3Provider);
      abstratContract.deployed().then((i) => instance = i);
      App.listenForEvents();

      return App.render();
    });
  },

  listenForEvents: function () {
    instance.votedEvent({
      fromBlock: 0,
      toBlock: 'latest'
    }, function (error, event) {
      console.log(event); App.render();
    });
    // .on("data", function (event) { App.render() });
  },


};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
