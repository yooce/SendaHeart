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
     * Constructor
     * Obtain JunkCoin address from args
     * Obtain admin address from msg.sender
     */
    constructor(address _coin) {
        coin = _coin;
        admin = msg.sender;
    }

    function isParticipated() view public returns(bool) {
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

        /*
        uint index = queue.length;

        queue.push(Queue({
            addr: msg.sender,
            handShape: HandShape.Undefined,
            timestamp: block.timestamp,
            status: MatchStatus.Participated
        }));

        if (participants[msg.sender].status == ParticipantStatus.NoRegistration) {
            // New registration
            participants[msg.sender] = ParticipantContext({
                current: index,
                status: ParticipantStatus.Participated,
                streak: 0,
                phase: 0
            });
        } else {
            // Continuous
            participants[msg.sender].current = index;
            participants[msg.sender].status = ParticipantStatus.Participated;
        }

        emit Joined(msg.sender, index);

        if (index % 2 == 1) {
            // Establish match when index is odd.
            uint timestamp = bigger(queue[index - 1].timestamp, queue[index].timestamp);
            emit Established(queue[index - 1].addr, index - 1, queue[index].addr, index, timestamp);
        }
        //*/
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
