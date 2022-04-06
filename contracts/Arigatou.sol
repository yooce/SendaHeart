// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Arigatou {
    enum ParticipantStatus {
        NoRegistration,
        NoParticipating,
        Participated
    }

    struct ParticipantContext {
        uint current;  // Current index of queue
        ParticipantStatus status;
        uint streak;  // Win streak
        uint phase;  // Increment every transaction. This helps frontend status transition
    }

    address private admin;
    address private coin;

    // Match context
    // Queue[] private queue;
    mapping (address => ParticipantContext) private participants;

    // User's asset
    mapping (address => uint) private coinStock;

    /**
     * Emit when participant joined.
     */
    event Joined(address addr, uint index);

    /**
     * Constructor
     * Obtain JunkCoin address from args
     * Obtain admin address from msg.sender
     */
    constructor(address _coin) {
        coin = _coin;
        admin = msg.sender;
    }

    function isParticipated() view public returns(bool) {
        console.logAddress(coin);
        return participants[msg.sender].status == ParticipantStatus.Participated;
    }

    /**
     * Join match queue
     */
    function join() public /*timeout notParticipating phaseAdvance*/ {
        console.log('aaa');
        console.logInt(int8(participants[msg.sender].status));
        console.logAddress(msg.sender);

        //*
        if (participants[msg.sender].status == ParticipantStatus.NoRegistration) {
            coinStock[msg.sender] += 400;
            participants[msg.sender].status = ParticipantStatus.Participated;
        }
        //*/
        
        console.logInt(int8(participants[msg.sender].status));
        console.logUint(coinStock[msg.sender]);

        emit Joined(msg.sender, 0);
    }

    /**
     * Withdraw JunkCoin
     */
    function withdraw() public /*timeout haveCoins phaseAdvance*/ {
        uint amount = coinStock[msg.sender];
        coinStock[msg.sender] = 0;
        IERC20(coin).transferFrom(admin, msg.sender, amount);

        // emit Withdrew(msg.sender, amount);
    }
    
    /**
     * Get own coin balance
     * This is view function so `block.timestamp` isn't update. Obtain actual timestamp from args.
     */
    function getCoinBalance() view public returns(uint coins) {
        coins = coinStock[msg.sender];
    }
}
