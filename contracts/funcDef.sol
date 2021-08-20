// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

interface funcDef {
    event _messageSent(address indexed from, address indexed to, string hash);
    event _addContact(address indexed from, address indexed to);
    event _contactaddApproved(address indexed from, address indexed to);
    event _profileUpdate(address indexed from, string name);
    event _blockContact(address indexed from, address indexed to);
    event _unblockContact(address indexed from, address indexed to);

    /**
    @notice you have to register and became a member before sending messages
    @param name: your name
    @param messageStartBlock: the blocknumber when sending the first message, default is 0 indicating never sent messages
    @param isMember: check if you have registered
     */
    struct Member {
        string name;
        uint256 messageStartBlock;
        bool isMember;
    }

    /**
    @notice the relationship between two members
    @param NoRelation: never contacted
    @param requested: for contact
    @param contacted: having contacted
    @param blocked: do not receive his messages
    */
    enum RelationshipType {
        NoRelation,
        Requested,
        Connected,
        Blocked
    }


}
