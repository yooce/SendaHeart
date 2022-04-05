// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Arigatou {
    address private admin;
    address private coin;

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

    /**
     * Join match queue
     */
    function join() public /*timeout notParticipating phaseAdvance*/ {
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
    function getCoinBalance() pure public returns(uint) {
        return 100;
    }
}
