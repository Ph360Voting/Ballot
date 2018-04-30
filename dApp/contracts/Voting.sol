pragma solidity ^0.4.17;
// written for Solidity version 0.4.18 and above that doesnt break functionality

contract Voting {
    // an event that is called whenever a Candidate is added so the frontend could
    // appropriately display the candidate with the right element id (it is used
    // to vote for the candidate, since it is one of arguments for the function "vote")
    event AddedCandidate(uint candidateID);



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


    /* My added functions for uPort integration and accessing a ballot (basicall,
    from the beginning to the point that the person actually gets to vote)  */

    // contract constructor
    constructor() public {
    }

    enum Restriction {None, Country}
    struct Ballot {
        uint length;
        Restriction restriction;  // the restrictions that can be applied to voting
        uint numCandidates;
        bytes32[] candidates;
        uint[] voteCount;
    }
    mapping (bytes32 => Ballot) ballots; // unique ID that will be used to identify the Ballot

    // a function to create a ballot
    function createBallot(bytes32 ballotID, uint len, uint numcands, bytes32[] cands, uint[] votes) public { 
        Restriction rest = Restriction.None;
        ballots[ballotID] = Ballot(len, rest, numcands, cands, votes);
    }

    // a view function to find a ballot
    function getBallotInfo(bytes32 ballotID) public view returns (uint, Restriction, uint ) {
        return( ballots[ballotID].length, ballots[ballotID].restriction, ballots[ballotID].numCandidates);
    }

    // a view function to access a ballots candidates
    function getCandidateInfo(bytes32 ballotID, uint candidateID) public view returns (bytes32) {
        return( ballots[ballotID].candidates[candidateID]);
    }
}
