pragma solidity ^0.4.17;
// written for Solidity version 0.4.18 and above that doesnt break functionality

contract Voting {
     /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  These functions perform transactions, editing the mappings *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /*
    function addCandidate(bytes32 name, bytes32 party) public {
        candidateID is the return variable
        uint candidateID = numCandidates++;
        // Create new Candidate Struct with name and saves it to storage.
        candidates[candidateID] = Candidate(name,party,true);
        emit AddedCandidate(candidateID);
    }

    function vote(bytes32 uid, uint candidateID) public {
        // checks if the struct exists for that candidate
        if (candidates[candidateID].doesExist == true) {
            uint voterID = numVoters++; //voterID is the return variable
            voters[voterID] = Voter(uid,candidateID);
        }
    }
    */
    /* * * * * * * * * * * * * * * * * * * * * * * * * * 
     *  Getter Functions, marked by the key word "view" *
     * * * * * * * * * * * * * * * * * * * * * * * * * */
    

    // finds the total amount of votes for a specific candidate by looping
    // through voters 
    /*function totalVotes(uint candidateID) view public returns (uint) {
        uint numOfVotes = 0; // we will return this
        for (uint i = 0; i < numVoters; i++) {
            // if the voter votes for this specific candidate, we increment the number
            if (voters[i].candidateIDVote == candidateID) {
                numOfVotes++;
            }
        }
        return numOfVotes; 
    }
    */


    // contract constructor
    constructor() public {
    }

    enum Restriction {None, Country}
    struct Ballot {
        string title;
        address creator;
        bool exists;
        bool active;
        uint length;
        uint numOfCands;
        Restriction restriction;  // the restrictions that can be applied to voting
        bytes32[] candidates;
        uint[] voteCount;
    }
    mapping (bytes32 => Ballot) ballots; // unique ID that will be used to identify the Ballot

    // a function to create a ballot
    function createBallot(string title, bytes32 ballotID, uint len, uint numOfCands, bytes32[] cands, uint[] votes) public { 
        Restriction rest = Restriction.None;
        ballots[ballotID] = Ballot(title, msg.sender, true, true, len, numOfCands, rest, cands, votes);
    }


    /* SETTER FUNCTIONS */

    // set ballot to be over
    function setEndedBallot(bytes32 ballotID) public returns (bool) {
        if (msg.sender == ballots[ballotID].creator) {
            ballots[ballotID].active = false;
            return true;
        }
        else
            return false;
    }

    // add vote
    function addVote(bytes32 ballotID, uint index) public returns (bool) {
        ballots[ballotID].voteCount[index]++;
    }
    
    /* CHECKING FUNCTIONS */

    // a view function to see if a ballot exists
    function confirmBallot(bytes32 ballotID) public view returns (bool) {
        if (ballots[ballotID].exists == true)
            return true;
        else
            return false;
    }

    // a vew function to see if a ballot is still active
    function checkActiveBallot(bytes32 ballotID) public view returns (bool) {
        if (ballots[ballotID].active)
            return true;
        else
            return false;
    }


    /* GETTER FUNCTIONS */

    // a view function of the length of candidate list
    function getCandidateSize(bytes32 ballotID) public view returns (uint) {
        return( ballots[ballotID].numOfCands);
    }

    // a view function to access a ballots candidates
    function getCandidateInfo(bytes32 ballotID) public view returns (bytes32[]) {
        return( ballots[ballotID].candidates);
    }

    // a view function to access a ballots candidates
    function getVotingInfo(bytes32 ballotID) public view returns (uint[]) {
        return( ballots[ballotID].voteCount);
    }

    // a view function to get a title of the ballot
    function getBallotTitle(bytes32 ballotID) public view returns (string) {
        return(ballots[ballotID].title);
    }
}
