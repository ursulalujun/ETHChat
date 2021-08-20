App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
    init: async function () {
      return await App.initWeb3();
    },
    
    /**
     * @notice 
     * @param 
     * @returns 
     */

    initWeb3: async function () {
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          await   ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error("User denied account access")
        }
      } else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
  
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    },
  
    initContract: function () {
      $.getJSON("Election.json", function (election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);
  
        App.listenForEvents();
  
        return App.render();
      });
    },
  
    listenForEvents: function () {
      App.contracts.Election.deployed().then(function (instance) {
        instance.votedEvent({
          fromBlock: 0,
          toBlock: 'latest'
        }, function (error, event) {
          console.log(event); App.render();
        })
          // .on("data", function (event) { App.render() });
      });
    },
  
    render: function () {
      var electionInstance;
      var loader = $("#loader");
      var content = $("#content");
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });
  
      // Load contract data
      App.contracts.Election.deployed().then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      }).then(function (candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();
  
        var candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();
  
        for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function (candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
  
            // Render candidate Result
            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);
  
            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });
        }
        return electionInstance.voters(App.account);
      }).then(function (hasVoted) {
        // Do not allow a user to vote
        if (hasVoted) {
          $('form').hide();
        }
        loader.hide();
        content.show();
      }).catch(function (error) {
        console.warn(error);
      });
    },
  
    castVote: function () {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      }).then(function (result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      }).catch(function (err) {
        console.error(err);
      });
    }
  };
  
  $(function () {
    $(window).load(function () {
      App.init();
    });
  });
  