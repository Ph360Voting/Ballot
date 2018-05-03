var uportconnect = window.uportconnect;

const uport = new uportconnect.Connect('Ballot', {
  clientId: '2ohq4TSxrwjCwCov4wJTsBbWWJbPvc2b6BF',
  network: 'rinkeby',
  signer: uportconnect.SimpleSigner('e379f94fcf71ef0dedccfae4f06fdb7a7274c715fa5f72604b235ccff1a2a24f')
})


App = {
  web3Provider: null,
  contracts: {},

  // beginning of initialization...
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
  // end of initialization...

  bindEvents: function() {
    $(document).on('click', '.btn-addCandidate', App.addCandidate);
    $(document).on('click', '.btn-ballotCheck', App.ballotCheck);
    $(document).on('click', '.btn-numOfVotes', App.findNumOfVotes);
    $(document).on('click', '.btn-vote', App.vote);
    $(document).on('click', '.btn-createBallot', App.createBallot);
    $(document).on('click', '.btn-castVote', App.castVote);
    $(document).on('click', '.btn-addCand', App.addCand);
    $(document).on('click', '.btn-removeCand', App.removeCand);
    $(document).on('click', '.btn-endVote', App.endVote);
  },

  // checks that the inputted ballot is real and still active, and loads it into window
  ballotCheck: function() {
    window.uid = $("#ballot_id").val(); //getting user inputted ballot id
    if (window.uid == ""){
      $("#msg").html("<p>Please enter id.</p>");
      return;
    }

    App.contracts.Voting.deployed().then(function(instance) {
      instance.confirmBallot(window.uid).then(function(result) {
        if (!result) {
          $("#msg").html("<p>No ballot with inputted ID. Either incorrect Ballot ID or nonexistent ballot.</p>");
          exists = false;
          return; 
        }
        else {          
          instance.getCandidateSize(window.uid).then(function(size) {
            window.numOfCands = size;
          })
          instance.getBallotTitle(window.uid).then(function(title) {
            window.ballotTitle = title;
          })

          window.candidates = [];
          instance.getCandidateInfo(window.uid).then(function(cands) {
            for (let i = 0 ; i < window.numOfCands ; ++i)
              window.candidates[i] = web3.toAscii(cands[i]);
          })

          instance.checkActiveBallot(window.uid).then(function(active) {
            if (active)
              return App.LoadQR();
            else
              return App.Results();
          })
        }
      })

    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  // Loads the QR for uPort if the inputted Ballot ID is found and verified
  LoadQR: function() { 
    //$("#msg").html("");
    $("#vote_space").html("");
    window.qr = true; 
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
        $('#kqr').html(aTag)

      }).then((credentials) => {
        var form = document.createElement("form");
        form.setAttribute("class", "container-fliud h-50 p-5 mx-auto text-center d-flex flex-column align-content-between")

        var title = document.createElement("p");
        var head = document.createElement("h2");
        head.innerHTML = window.ballotTitle;
        title.append(head);
        form.append(title);

        for (let i = 0 ; i < window.numOfCands ; ++i) {
          var radio = document.createElement("div");
          radio.setAttribute("class", "custom-control custom-radio voteRadios");

          var input = document.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("id", "candidate"+i);
          input.setAttribute("name", "radio");
          input.setAttribute("value",i)
          input.setAttribute("class", "custom-control-input");
          radio.append(input);

          var label = document.createElement("label");
          label.setAttribute("class", "custom-control-label");
          label.setAttribute("for", "candidate"+i);
          label.innerHTML = window.candidates[i];
          radio.append(label); 

          form.append(radio);
        }
        var breakd = document.createElement("br");
        form.append(breakd);
        form.append(breakd);
        
        var buttons = document.createElement("div");
        var button1 = document.createElement("button");
        button1.setAttribute("class", "btn btn-primary btn-castVote");
        button1.setAttribute("type", "button");
        button1.innerHTML = "Vote!";
        buttons.append(button1);

        var parBreak = document.createElement("p");
        buttons.append(parBreak);

        var button2 = document.createElement("button");
        button2.setAttribute("class", "btn btn-primary btn-endVote");
        button2.setAttribute("type", "button");
        button2.innerHTML = "End Vote";
        buttons.append(button2);
      

        form.append(buttons);
        $("#vote_space").html(form);

        $("#vote_space").append("<div id=\"endVote_msg\"></div>");
         
        $('#kqr').html("");
      })
  },

  // load results of a ballot (will only be done if ballot is over)
  Results: function() {
    window.voteCount = [];
    App.contracts.Voting.deployed().then(function(instance) {
      instance.getVotingInfo(window.uid).then(function(Votes) {
        for (let i = 0 ; i < window.numOfCands ; ++i) {
          window.voteCount.push(web3.toDecimal(Votes[i]));
        }
        var header = document.createElement("p");
        var title = document.createElement("h2");
        title.innerHTML = "RESULTS";
        header.append(title);
        $("#vote_space").html(header);
    
        var table = document.createElement("table");
        table.setAttribute("class","table");

        var thead = document.createElement("thead");
        thead.setAttribute("class", "thead-dark");

        var row = document.createElement("tr");

        var data1 = document.createElement("th");
        data1.setAttribute("scope","col");
        data1.innerHTML = "Candidates";
        var data2 = document.createElement("th");
        data2.setAttribute("scope","col");
        data2.innerHTML = "Vote Count";
        row.append(data1);
        row.append(data2);

        thead.append(row);

        table.append(thead);

        var body = document.createElement("tbody");
        for (let i = 0 ; i < window.numOfCands ; ++i) {
          var row = document.createElement("tr");
          
          var data1 = document.createElement("td");
          data1.innerHTML = window.candidates[i];
    
          var data2 = document.createElement("td");
          data2.innerHTML = window.voteCount[i];
    
          row.append(data1);
          row.append(data2);
          body.append(row);  
        }
        table.append(body);
        $("#vote_space").append(table);
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
      return;
    })
  },
  
  // end the specified ballot
  endVote: function () {
    App.contracts.Voting.deployed().then(function(instance) {
      instance.setEndedBallot(window.uid).then(function(status) {
        if (status)
          return App.Results();
        else {
          $("#endVote_msg").html("You do not have premission to end this ballot!");
          return;
        }
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
      return;
    })

  },

  // casting a vote after id and ballot are confirmed
  castVote: function() {
    var voteCase = $("form input[type='radio']:checked").val();
    
    App.contracts.Voting.deployed().then(function(instance) {
      instance.addVote(window.uid, voteCase).then(function(status) {
        $("#vote_space").html("<p>Thank you, your vote has been counted.</p>");
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
      return;
    })
  },

  // creating a new ballot
  createBallot: function() {

    var title = $("#ballot_title").val()

    var length = $("#ballot_length").val();  //length of time ballot will be open
    if (length == "Hours...") {
      $("#length_msg").html("<p>Please pick a length of time this ballot will be active.</p>");
      return;
    }
    var candidates = [];  // participarting candidates in ballot
    var votes = [];
    var candlist = $("input");

    for (let i = 0 ; i < candlist.length - 1  ; ++i) {
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
      instance.createBallot(title, ballotID, parseInt(length), (candlist.length - 2), candidates, votes).then(function(result){
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




