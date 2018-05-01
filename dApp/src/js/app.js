var uportconnect = window.uportconnect;

const uport = new uportconnect.Connect('Ballot', {
  clientId: '2ohq4TSxrwjCwCov4wJTsBbWWJbPvc2b6BF',
  network: 'rinkeby',
  signer: uportconnect.SimpleSigner('e379f94fcf71ef0dedccfae4f06fdb7a7274c715fa5f72604b235ccff1a2a24f')
})


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
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Voting.json', function(data) {
      //get contact artifact file and instantiate it with truffle
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
    $(document).on('click', '.btn-ballotCheck', App.ballotCheck);
    $(document).on('click', '.btn-numOfVotes', App.findNumOfVotes);

    $(document).on('click', '.btn-vote', App.vote);
    $(document).on('click', '.btn-createBallot', App.createBallot);
    $(document).on('click', '.btn-castVote', App.castVote);
    $(document).on('click', '.btn-addCand', App.addCand);
    $(document).on('click', '.btn-removeCand', App.removeCand);
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
  },

  // checks that the inputted ballot is real and still active, and loads it into window
  ballotCheck: function() {
    var uid = $("#ballot_id").val(); //getting user inputted ballot id
    if (uid == ""){
      $("#msg").html("<p>Please enter id.</p>")
      return
    }

    App.contracts.Voting.deployed().then(function(instance) {
      var votingInstance = instance;

      // use the contract function getBallotInfo, which does not cost gas, and try to get ballot
      window.ballot = votingInstance.getBallotInfo(uid);
      var candidates = [];
      for (let i = 0 ; i < ballot[3] ; ++i) {
        candidates[i] = votingInstance.getCandidateInfo(uid, i)
      }
      window.candidates = candidates;

      var currentTime = Date.now();
      if (currentTime > ballot[0]) // if true then the ballot is no longer active
        return
      else
        return App.LoadQR();

    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // Loads the QR for uPort if the inputted Ballot ID is found and verified
  LoadQR: function() {  
    // Request credentials to login
    uport.requestCredentials({
      requested: ['name', 'country'],
      notifcations: true },
      (uri) => {

        const qr = kjua({
          text: uri,
          fill: '#000000',
          size: 400,
          back: 'rgba(255,255,255,1)'
        })

        // Create wrapping link for mobile touch
        let aTag = document.createElement('a')
        aTag.href = uri

        // Nest QR in <a> and inject
        aTag.appendChild(qr)
        document.querySelector('#kqr').appendChild(aTag)

      }).then((credentials) => {
        if (window.ballot.restriction == "None" || window.ballot.country == credentials.country) {
          let form = document.createElement("form");
          form.setAttributes("class", "w-50 p-10 mx-auto text-center border border-white")

          let ul = document.createElement("ul")
          for (let i = 0 ; i < window.ballot[3] ; ++i) {
            var radio = document.createElement("div");
            radio.setAttribute("class", "custom-control custom-radio");

            var input = document.createElement("input");
            input.setAttribute("type", "radio");
            input.setAttribute("id", "candidate"+i);
            input.setAttribute("name", "radio");
            input.setAttribute("class", "custom-control-input");
            radio.appendChild(input);

            var label = document.createElement("label");
            label.setAttribute("class", "custom-control-label");
            label.setAttribute("for", "candidate"+i);
            label.innerHTML = label.innerHTML + window.candidates[i];
            radio.appendChild(label);            
            form.appendChild(radio);
          }
          var button = document.createElement("button");
          button.setAttribute("type", "submit");
          button.setAttribute("class", "btn btn-primary btn-castVote");
          form.appendChild(button);
          $("#vote_space").appendChild(form);
        }
        else 
          $("#msg").html("<p>You do not have access to this ballot instance.</p>")
      })
  },

  // casting a vote after id and ballot are confirmed
  castVote: function() {

  },

  // creating a new ballot
  createBallot: function() {

    var length = $("#ballot_length").val();  //length of time ballot will be open
    if (length == "Hours...") {
      $("#length_msg").html("<p>Please pick a length of time this ballot will be active.</p>");
      return;
    }
    var candidates = [];                      // participarting candidates in ballot
    var votes = [];
    var candlist = $("input");
    for (let i = 0 ; i <= candlist.length ; i++) {
      let temp = "#Candidate" + (i+1);
      if ($(temp).val() == "") {
        $("#candidate_msg").html("<p>Candidates not entered. Please delete unused candidates. Minimum amount of candidates is 2.</p>");
        return;
      }
      candidates[i] = $(temp).val();
      votes[i] = 0;
    }
    // ballotID creation
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var ballotID = "";
    for (let i = 0 ; i < 8 ; i++)
      ballotID += possible.charAt(Math.floor(Math.random() * possible.length));

    App.contracts.Voting.deployed().then(function(instance) {
      // use the contract function createBallot
      instance.createBallot(ballotID, parseInt(length), candlist.length, candidates, votes).then(function(result){
        // update the user on the ballotID, so that ballot can be accessed
        $("#ballotID_return").html("<p>Ballot ID:<\p>" + ballotID);
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // adding a candidate to form
  addCand: function() {
    if (typeof window.candCount === 'undefined') {
      window.candCount = 2;
    }
    window.candCount += 1;
    var newCand = document.createElement("input");
    newCand.setAttribute("type", "text");
    newCand.setAttribute("class", "form-control");
    newCand.setAttribute("id", "Candidate"+window.candCount);
    newCand.setAttribute("aria-describedby", "CandidateNote");
    newCand.setAttribute("placeholder", "Candidate "+window.candCount);

    document.querySelector("#cands").appendChild(newCand);
  },

  // remove a candidate from form, as long as there are at least two
  removeCand: function() {
    if (typeof window.candCount == 'undefined') {
      return;
    }
    else if (window.candCount < 3) {
      return;
    }
    else {
      let parent = document.getElementById("cands");
      let child = document.getElementById("Candidate"+window.candCount);
      parent.removeChild(child);
      window.candCount -= 1;
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});




