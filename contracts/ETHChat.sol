// SPDX-License-Identifier: MIT
import "./funcDef.sol";

pragma solidity 0.8.6;

contract ETHChat is funcDef {

    /**
    @notice the relation of two members
     */
    mapping(address => mapping(address => RelationshipType)) relationships;

    /**
    @notice the profile the member including name, the blocknumber when sending first message, 
     */
    mapping(address => Member) public members;

    modifier onlyMember() {
        require(members[msg.sender].isMember == true);
        _;
    }

    function register(string memory _name, uint _Avater) public {
        require(members[msg.sender].isMember == false);

        Member memory newMember = Member(_name, 0, true, _Avater);
        members[msg.sender] = newMember;
    }

    function addContact(address addr) public onlyMember {
        require(relationships[msg.sender][addr] == RelationshipType.NoRelation);
        require(relationships[addr][msg.sender] == RelationshipType.NoRelation);

        relationships[msg.sender][addr] = RelationshipType.Requested;
        emit _addContact(msg.sender, addr);
    }

    function acceptContactRequest(address addr) public onlyMember {
        require(relationships[addr][msg.sender] == RelationshipType.Requested);

        relationships[msg.sender][addr] = RelationshipType.Connected;
        relationships[addr][msg.sender] = RelationshipType.Connected;

        emit _contactaddApproved(msg.sender, addr);
    }

    function blockMessagesFrom(address from) public onlyMember {
        require(relationships[msg.sender][from] == RelationshipType.Connected);

        relationships[msg.sender][from] = RelationshipType.Blocked;
        emit _blockContact(msg.sender, from);
    }

    function unblockMessagesFrom(address from) public onlyMember {
        require(relationships[msg.sender][from] == RelationshipType.Blocked);

        relationships[msg.sender][from] = RelationshipType.Connected;
        emit _unblockContact(msg.sender, from);
    }

    function updateProfile(string memory _name, uint _Avater) public onlyMember {
        members[msg.sender].name = _name;
        emit _profileUpdate(msg.sender, _name, _Avater);
    }

    function sendMessage(
        address to,
        string memory message
    ) public onlyMember {
        require(relationships[to][msg.sender] == RelationshipType.Connected);

        if (members[to].messageStartBlock == 0) {
            members[to].messageStartBlock = block.number;
        }

        emit _messageSent(msg.sender, to, message);
    }

    function getRelationWith(address a)
        public
        view
        onlyMember
        returns (RelationshipType)
    {
        return relationships[msg.sender][a];
    }
}
