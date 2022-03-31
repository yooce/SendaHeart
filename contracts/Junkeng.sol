// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Junkeng {
    enum ParticipantStatus {
        NoRegistration,
        NoParticipating,
        Participated
    }

    enum MatchStatus {
        NoParticipating,
        Participated,
        Disclosed,
        Settled
    }

    enum HandShape {
        Undefined,
        Guu,
        Choki,
        Paa
    }

    struct ParticipantContext {
        uint current;  // Current index of queue
        ParticipantStatus status;
        uint streak;  // Win streak
        uint phase;  // Increment every transaction. This helps frontend status transition
    }

    struct Queue {
        address addr;
        HandShape handShape;
        uint timestamp;  // block.timestamp
        MatchStatus status;
    }

    address private admin;
    address private coin;

    // Match context
    Queue[] private queue;
    mapping (address => ParticipantContext) private participants;

    // User's asset
    mapping (address => uint) private coinStock;

    /**
     * Emit when participant joined.
     */
    event Joined(address addr, uint index);

    /**
     * Emit when the match has been established.
     */
    event Established(address a, uint a_index, address b, uint b_index, uint timestamp);

    /**
     * Emit when hand shape has been disclosed. (It cannot obtain hand shape value!)
     */
    event Disclosed(address addr, uint index);

    /**
     * Emit when each participants disclosed their hand shape.
     */
    event Settled(address a, uint a_index, uint8 a_handShape, address b, uint b_index, uint8 b_handShape);

    /**
     * Emit when awarded JunkCoin to winner
     */
    event Earned(address addr, uint index, uint amount);

    /**
     * Emit when withdrew JunkCoin
     */
    event Withdrew(address addr, uint amount);

    /**
     * Sender is registered
     */
    modifier registered() {
        require(participants[msg.sender].status > ParticipantStatus.NoRegistration, "No registration");
        _;
    }

    /**
     * Sender is participant
     */
    modifier participating() {
        require(participants[msg.sender].status > ParticipantStatus.NoParticipating, "Not participants");
        _;
    }

    /**
     * Sender is non participant
     */
    modifier notParticipating() {
        require(participants[msg.sender].status <= ParticipantStatus.NoParticipating, "Already participated");
        _;
    }

    /**
     * Calc opponent index
     */
    function calcOpponentIndex(uint _index) pure private returns(uint) {
        return (_index & ~uint(1)) + ((_index + 1) & uint(1));
    }

    /**
     * Get opponent index
     * Require exists
     */
    function getOpponent(uint _index) view private returns(uint) {
        // Even vs Odd
        uint opponent = calcOpponentIndex(_index);

        require(opponent < queue.length, "Opponent not ready");

        return opponent;
    }

    /**
     * Get maximum of a and b
     */
    function bigger(uint _a, uint _b) pure private returns(uint) {
        return (_a > _b) ? _a : _b;
    }

    /**
     * Calculate duration from latest timestamp
     */
    function calcDuration(uint _a, uint _b) view private returns(uint) {
        return block.timestamp - bigger(_a, _b);
    }

    /**
     * Expire at 5 minutes after the match was established.
     */
    modifier timeout() {
        if (participants[msg.sender].status == ParticipantStatus.Participated) {
            uint index = participants[msg.sender].current;
            uint opponent = calcOpponentIndex(index);

            if (opponent < queue.length) {
                // Keep deadline
                uint duration = calcDuration(queue[index].timestamp, queue[opponent].timestamp);

                if (duration > 5 minutes) {
                    // Timeout -> Reset
                    participants[msg.sender].status = ParticipantStatus.NoParticipating;

                    if (queue[index].handShape != HandShape.Undefined && queue[opponent].handShape == HandShape.Undefined) {
                        // Opponent timeout -> DEFWIN
                        // Get coin
                        coinStock[msg.sender] += ++participants[msg.sender].streak;

                        emit Earned(msg.sender, index, participants[msg.sender].streak);
                    } else {
                        // Self timeout or both timeout -> DEFLOSS
                        participants[msg.sender].streak = 0;
                    }

                    queue[index].status = MatchStatus.Settled;
                }
            }
        }
        _;
    }

    /**
     * Some coins have been stocked
     */
    modifier haveCoins() {
        require(coinStock[msg.sender] > 0, "No coins");
        _;
    }

    /**
     * Advance phase value after the transaction process
     */
    modifier phaseAdvance() {
        _;
        participants[msg.sender].phase++;
    }

    /**
     * Settle match result
     * result: 0 draw, 1 win, -1 lose
     */
    function settle(uint _index, uint _opponent) view private returns(int8) {
        // FIXME: Constants of non-value type not yet implemented on solidity 0.7.x
        int8[4][4] memory lookupTable = [
            [int8(0), int8(-1), int8(-1), int8(-1)],
            [int8(1), int8( 0), int8( 1), int8(-1)],
            [int8(1), int8(-1), int8( 0), int8( 1)],
            [int8(1), int8( 1), int8(-1), int8( 0)]
        ];
        return lookupTable[uint8(queue[_index].handShape)][uint8(queue[_opponent].handShape)];
    }

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
    function join() public timeout notParticipating phaseAdvance {
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
    }

    /**
     * Disclose hand shape each other.
     * _handShape: 1 Guu, 2 Choki, 3 Paa
     */
    function disclose(uint8 _handShape) public participating phaseAdvance {
        uint index = participants[msg.sender].current;
        uint opponent = getOpponent(index);
        address opponentAddr = queue[opponent].addr;

        require(queue[index].status == MatchStatus.Participated, "Already disclosed" );
        require(_handShape >= 1 && _handShape <= 3, "Invalid hand shape");

        // Keep deadline
        uint duration = calcDuration(queue[index].timestamp, queue[opponent].timestamp);

        if (duration > 5 minutes) {
            // Timeout -> Lost or Draw(if opponent timeout too)
            queue[index].handShape = HandShape.Undefined;
        } else {
            queue[index].handShape = HandShape(_handShape);
        }

        queue[index].status = MatchStatus.Disclosed;
        emit Disclosed(msg.sender, index);

        if (queue[opponent].status == MatchStatus.Disclosed) {
            emit Settled(
                msg.sender,
                index,
                uint8(queue[index].handShape),
                opponentAddr,
                opponent,
                uint8(queue[opponent].handShape)
            );

            // Settlement
            int8 result = settle(index, opponent);

            if (result == 1) {
                // Won -> Get coin
                coinStock[msg.sender] += ++participants[msg.sender].streak;
                participants[msg.sender].status = ParticipantStatus.NoParticipating;
                // Reset opponent status for next join
                participants[opponentAddr].status = ParticipantStatus.NoParticipating;
                participants[opponentAddr].streak = 0;

                emit Earned(msg.sender, index, participants[msg.sender].streak);

            } else if (result == -1) {
                // Lost -> The coin is taken by opponent
                coinStock[opponentAddr] += ++participants[opponentAddr].streak;
                participants[opponentAddr].status = ParticipantStatus.NoParticipating;
                // Reset own status for next join
                participants[msg.sender].status = ParticipantStatus.NoParticipating;
                participants[msg.sender].streak = 0;

                emit Earned(opponentAddr, opponent, participants[opponentAddr].streak);

            } else {
                // Draw -> No one get coin
                // Reset both status for next join
                participants[msg.sender].status = ParticipantStatus.NoParticipating;
                participants[msg.sender].streak = 0;
                participants[opponentAddr].status = ParticipantStatus.NoParticipating;
                participants[opponentAddr].streak = 0;
            }

            queue[index].status = MatchStatus.Settled;
            queue[opponent].status = MatchStatus.Settled;
            participants[opponentAddr].phase++;
        }
    }

    /**
     * Withdraw JunkCoin
     */
    function withdraw() public timeout haveCoins phaseAdvance {
        uint amount = coinStock[msg.sender];
        coinStock[msg.sender] = 0;
        IERC20(coin).transferFrom(admin, msg.sender, amount);

        emit Withdrew(msg.sender, amount);
    }

    /**
     * Get own status
     */
    function getStatus() view public registered
        returns(address addr, uint index, uint8 status, uint timestamp, uint8 handShape, uint streak, uint phase)
    {
        addr = msg.sender;
        index = participants[msg.sender].current;
        status = uint8(queue[index].status);
        timestamp = queue[index].timestamp;
        handShape = uint8(queue[index].handShape);
        streak = participants[msg.sender].streak;
        phase = participants[msg.sender].phase;
    }

    /**
     * Get own coin balance
     * This is view function so `block.timestamp` isn't update. Obtain actual timestamp from args.
     */
    function getCoinBalance(uint timestamp) view public returns(uint coins) {
        if (participants[msg.sender].status == ParticipantStatus.Participated) {
            // Keep deadline
            uint index = participants[msg.sender].current;

            if (queue[index].status == MatchStatus.Disclosed) {
                // No settled yet
                uint opponent = getOpponent(index);
                uint duration = timestamp - bigger(queue[index].timestamp, queue[opponent].timestamp);

                if (duration > 5 minutes &&
                    queue[index].handShape != HandShape.Undefined &&
                    queue[opponent].handShape == HandShape.Undefined)
                {
                    // DEFWIN previous match, add (streak + 1) coins to balance
                    coins += participants[msg.sender].streak + 1;
                }
            }
        }

        coins += coinStock[msg.sender];
    }

    /**
     * Get opponent status
     */
    function getOpponentStatus() view public registered
        returns(address addr, uint index, uint8 status, uint timestamp, uint8 handShape, uint streak, uint phase)
    {
        uint  self = participants[msg.sender].current;

        index = getOpponent(self);
        addr = queue[index].addr;
        status = uint8(queue[index].status);
        timestamp = queue[index].timestamp;
        streak = participants[queue[index].addr].streak;
        phase = participants[queue[index].addr].phase;

        // You can obtain opponent hand shape when disclosed own hand shape
        handShape = uint8((queue[self].status >= MatchStatus.Disclosed) ? queue[index].handShape : HandShape.Undefined);
    }
}
