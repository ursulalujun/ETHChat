let encryptionPublicKey
const KEY_PK = 'pk';
let encryptedMessage

App = {
  web3Provider: null,
  contracts: {},
  messages: {},

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
      // App.sendMessageEvents();
      App.listenForEvents();

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
  },

  setPublicKey: async () => {
    //getPublicKey获取当前账户的公钥，可能已经存过一遍了
    let contractPublicKey = await App.contracts.ETHChatInstance.getPublicKey.call(web3.eth.accounts[0]);
    if (!contractPublicKey) {
      // Set public key if it is not already set in order to be able to receive messages.
      contractPublicKey = util.privateToPublic(new Buffer(sessionStorage.getItem(KEY_PK), 'hex')).toString('hex');
      App.contracts.ETHChatInstance.setPublicKey(contractPublicKey).catch((err) => {
        App.error('Error setting public key: ' + err.message);
      });
    }
  },

  setPrivateKey: () => {
    sessionStorage.removeItem(KEY_PK);
    let address = null;
    try {
      address = '0x' + util.privateToAddress(new Buffer($('#pk').val(), 'hex')).toString('hex');
    } catch (e) {
      console.log(e);
    }
    if (address !== web3.eth.accounts[0]) {
      $('#pkModal').modal('hide');
      App.error('Private key does not match not current account.');
    } else {
      sessionStorage.setItem(KEY_PK, $('#pk').val());
      $('#pkModal').modal('hide');
      App.setPublicKey();
    }
  },

  sendMessage: async () => {
    //先检查双方是否都设置了公钥
    let senderPublicKey = await App.contracts.ETHChatInstance.getPublicKey.call(web3.eth.accounts[0]);
    if (!sessionStorage.getItem(KEY_PK) || !senderPublicKey) {
      App.error('You need to import your private key in order to send/receive messages.');
      return;
    }
    if (!$('#message').val()) {
      App.error('Empty message.');
      return;
    }
    let receiverPublicKey = await App.contracts.ETHChatInstance.getPublicKey.call($('#receiver').val());
    if (!receiverPublicKey) {
      App.error('Cannot send message because receiver has not set its private key.');
      return;
    }
    let message = new Buffer($('#message').val());
    let encryptedMessage = ecies.encrypt(new Buffer(receiverPublicKey, 'hex'), message).toString('base64');
    App.contracts.ETHChatInstance.sendMessage(message, $('#receiver').val()).then(() => {
        $('#message').val('');
        App.success('Message sent successfully.')
      }).catch((err) => {
        App.error('Error sending message: ' + err.message);
      });
  },

    decryptMessage: function (){
    try {
      //将content从str转化为buffer
      const plainText = new Buffer(content);
      //对明文进行加密
      const cipherText = ecies.encrypt(publicKey, plainText);
      console.info(cipherText)

    } catch(e){}
  }



};

$(function () {
  $(window).load(function () {
    App.init();
  });
});



