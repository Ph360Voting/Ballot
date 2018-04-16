App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {

    // checking if there is a web3 instance alreadly active (Mist / Metmask have their own web3 instances).
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    }
    else {
      // if no injected web3 instance is detected, use Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Voting.json', function(data) {
      //get contact artifact fil and instantiate it with truffle
      // Artifacts are information about our contract such as its deployed address and Application Binary Interface (ABI). 
      // The ABI is a JavaScript object defining how to interact with the contract including its variables, functions and their parameters.
      var VotingArtifact = data;
      // putting the articats into truffle contract lets us create an instance of the contract to interact with.
      App.contracts.Voting = TruffleContract(VotingArtifact);

      // set provider for our contract, now that it is instansiated.
      App.contracts.Voting.setProvider(App.web3Provider);
    })
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-addCandidate', App.addCandidate);
    $(document).on('click', '.btn-vote', App.vote);
    $(document).on('click', '.btn-numOfVotes', App.findNumOfVotes);
  },

  // function called when user adds a candidate
  addCandidate: function() {
    // deploy the voting contract
    App.contracts.Voting.deployed().then(function(instance) {
      var votingInstance = instance

      // will add a candidate and increment the candidate count
      votingInstance.addCandidate( $("#candidate_id").val() , $("#candidate_party").val() ).then(function(result){ 
        $("#candidate_box").append(`<div class='form-check'><input class='form-check-input' type='checkbox' value='' id=${result.logs[0].args.candidateID}><label class='form-check-label' for=0>${$("#candidate_id").val()}</label></div>`)
      })

      // calls getNumOfCandidates() function in Smart Contract, 
      // this is not a transaction though, since the function is marked with "view" and
      // truffle contract automatically knows this
      votingInstance.getNumOfCandidates().then(function(numOfCandidates){
        // sets global variable for number of Candidates
        // displaying and counting the number of Votes depends on this
        window.numOfCandidates = numOfCandidates
      })

    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // Function that is called when user clicks the "vote" button
  vote: function() {
    var uid = $("#voter_id").val() //getting user inputted id

    // Application Logic 
    if (uid == ""){
      $("#msg").html("<p>Please enter id.</p>")
      return
    }
    // Checks whether a candidate is chosen or not.
    // if it is, we get the Candidate's ID, which we will use
    // when we call the vote function in Smart Contracts
    if ($("#candidate_box :checkbox:checked").length > 0){ 
      // just takes the first checked box and gets its id
      var candidateID = $("#candidate_box :checkbox:checked")[0].id
    } 
    else {
      // print message if user didn't vote for candidate
      $("#msg").html("<p>Please vote for a candidate.</p>")
      return
    }
    // Actually voting for the Candidate and displaying "Voted"
    App.contracts.Voting.deployed().then(function(instance){
      instance.vote( uid , parseInt(candidateID) ).then(function(result){
        $("#msg").html("<p>Voted</p>")
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // function called when the "Count Votes" button is clicked
  findNumOfVotes: function() {
    App.contracts.Voting.deployed().then(function(instance) {
      var votingInstance = instance;
      // this is where we will add the candidate vote Info before replacing whatever is in #vote_box
      var box = $("<section></section>")

      // loop through the number of candidates and display their votes
      for (var i = 0; i < window.numOfCandidates; i++) {
        // calls two smart contract functions
        var candidatePromise = votingInstance.getCandidate(i)
        var votesPromise = votingInstance.totalVotes(i)

        // resolves Promises by adding them to the variable box
        Promise.all( [ candidatePromise , votesPromise ] ).then( function(data){
          box.append(`<p>${window.web3.toAscii(data[0][1])}: ${data[1]}</p>`)
        }).catch(function(err){ 
          console.error("ERROR! " + err.message)
        })
      }
      $("#vote_box").html(box) // displays the "box" and replaces everything that was in it before
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
