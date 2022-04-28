// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IMintable.sol";
import "hardhat/console.sol";

pragma experimental ABIEncoderV2;

contract Arigatou {
    enum UserStatus {
        NoParticipating,
        Participated
    }

    struct UserContext {
        string name;
        UserStatus status;
        uint points;
        uint receipts;
        uint dits;
    }

    uint constant private initialAmount = 500;

    address private admin;
    address private point;
    address private dit;

    address[] private addresses;
    mapping (address => UserContext) private users;

    // 参加イベント
    event Joined(address addr, uint index);

    // コンストラクタ
    constructor(address _point, address _dit) {
        point = _point;
        dit = _dit;
        admin = msg.sender;

        // デモ用セットアップ
        setupDemo();
    }

    // デモ用セットアップ
    function setupDemo() private {
        // デモ用ユーザー名
        string[20] memory demoNames = [
            "bottn",
            "Mameta",
            "User3",
            "User4",
            "User5",
            "User6",
            "User7",
            "User8",
            "User9",
            "User10",
            "User11",
            "User12",
            "User13",
            "User14",
            "User15",
            "User16",
            "User17",
            "User18",
            "User19",
            "User20"
        ];

        // デモ用アドレス
        address payable[20] memory demoAddresses = [
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720,
            0xBcd4042DE499D14e55001CcbB24a551F3b954096,
            0x71bE63f3384f5fb98995898A86B02Fb2426c5788,
            0xFABB0ac9d68B0B445fB7357272Ff202C5651694a,
            0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec,
            0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097,
            0xcd3B766CCDd6AE721141F452C550Ca635964ce71,
            0x2546BcD3c84621e976D8185a91A922aE77ECEc30,
            0xbDA5747bFD65F08deb54cb465eB87D40e51B197E,
            0xdD2FD4581271e230360230F9337D5c0430Bf44C0,
            0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
        ];

        // デモ用受領量
        uint16[20] memory demoReceipts = [
            0,
            450,
            300,
            300,
            150,
            150,
            150,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];

        // ユーザー追加
        for (uint256 i = 0; i < demoNames.length - 1; i++) {
            addUser(demoNames[i], demoAddresses[i], demoReceipts[i]);
        }
    }

    // ユーザー追加
    function addUser(string memory name, address addr, uint receipt) private {
        // MINT
        IMintable(point).mint(initialAmount);

        // 登録
        addresses.push(addr);
        users[addr] = UserContext({
            name: name,
            status: UserStatus.Participated,
            points: initialAmount,
            dits: 0,
            receipts: receipt
        });

        // イベント
        emit Joined(addr, 0);
    }

    function isParticipated() view public returns(bool) {
        return users[msg.sender].status == UserStatus.Participated;
    }

    function getParticipantNum() view public returns(uint256) {
        return addresses.length;
    }

    function getUsers() view public returns (string[] memory, address[] memory, uint[] memory) {
        uint length = addresses.length;
        string[] memory names = new string[](length);
        address[] memory addrs = new address[](length);
        uint[] memory receipts = new uint[](length);

        for (uint i = 0; i < length; i++) {
            UserContext memory user = users[addresses[i]];
            names[i] = user.name;
            addrs[i] = addresses[i];
            receipts[i] = user.receipts;
        }

        return (names, addrs, receipts);
    }

    function transfer(address opponent, uint amount) public {
        users[msg.sender].points -= amount;
        users[opponent].points += amount;
    }

    /**
     * Join match queue
     */
    function join(string memory name) public /*timeout notParticipating phaseAdvance*/ {
        if (users[msg.sender].status == UserStatus.NoParticipating) {
            addUser(name, msg.sender, 0);
        }
    }

    /**
     * Withdraw JunkCoin
     */
    function withdraw() public /*timeout haveCoins phaseAdvance*/ {
        uint amount = users[msg.sender].points;
        users[msg.sender].points = 0;
        IERC20(point).transferFrom(admin, msg.sender, amount);

        // emit Withdrew(msg.sender, amount);
    }
    
    /**
     * Get own coin balance
     * This is view function so `block.timestamp` isn't update. Obtain actual timestamp from args.
     */
    function getPointBalance() view public returns (uint coins) {
        coins = users[msg.sender].points;
    }

    function getDitBalance() view public returns (uint) {
        return users[msg.sender].dits;
    }

    function getTotalReceipts() view public returns (uint) {
        uint sum = 0;
        for (uint i = 0; i < addresses.length; i++) {
            sum += users[addresses[i]].receipts;
        }
        return sum;
    }
}
