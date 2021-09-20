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
  /*
  //发送消息事件
  messageSentEvent: function () {
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
  */

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
      // 把自己发送的消息显示在对话框里
        $('.box-bd').append(`
        <div class="message-box">
           <div class="my message">
            <img class="avatar" src="${avatar}" alt="" />
              <div class="content">
               <div class="bubble">
                  <div class="bubble_cont">${message}</div>
               </div>
              </div>
            </div>
        </div>
    `)
      }).catch((err) => {
        App.error('Error sending message: ' + err.message);
      });
  },

  decryptMessage: async (message) => {
    let encryptedMessage = new Buffer(message, 'base64');
    // Decrypt message with account private key.
    return ecies.decrypt(new Buffer(sessionStorage.getItem(KEY_PK), 'hex'), encryptedMessage).toString();
  },

  receiveMessage: async (err, result) => {
    if (!err) {
      //if (result.to === web3.eth.accounts[0]&&$('#receiver').val()==result.msg.sender)
      /*?这里不太懂怎么提取消息
      if (result.args.receiver === web3.eth.accounts[0] && !App.messages[result.args.hash]) {
                        App.loadMessage(result.args.sender, result.args.hash, result.args.time,
       */
      if (result.to === web3.eth.accounts[0]) {
        let decryptedMessage = await App.decryptMessage(result.message);
        let sender = result.msg.sender;
        $('.box-bd').append(`
        <div class="message-box">
         <div class="other message">
          <img class="avatar" src="${sender.avatar}" alt="" />
           <div class="content">
             <div class="nickname">${sender.username}</div>
              <div class="bubble">
               <div class="bubble_cont">${decryptedMessage}</div>
              </div>
             </div>
           </div>
         </div>
    `)
      }
    } else {
      App.error('Error getting message: ' + err.message);
    }
  },

  //这个函数负责监听所有事件，包括发送，接收消息，导入私钥
  bindEvents: () => {
    $('#sendMessageButton').click(App.sendMessage);
    $('#importPrivateKey').click(() => {
      $('#pk').val('');
      $('#pkModal').modal('show');
    });
    $('#confirmPk').click(App.setPrivateKey);
    let messageSentEvent = App.contracts.ETHChatInstance._messageSent();
    messageSentEvent.watch(App.receiveMessage);
  }
};


$(function () {
  $(window).load(function () {
    App.init();
  });
});



