// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IMintable.sol";
import "./IGivable.sol";

contract Arigatou {
    enum UserStatus {
        NoParticipating,
        Participated
    }

    struct UserContext {
        string name;
        UserStatus status;
        uint pts;
        uint receivedPts;
        uint dits;
    }

    uint constant private initialAmount = 500;

    // アドレス
    address private admin;
    address private ptAddress;
    address private ditAddress;
    address private nftAddress;

    // ユーザー
    address[] private userAddresses;
    mapping (address => UserContext) private userContexts;

    constructor(address _pt, address _dit, address _nft) {
        admin = msg.sender;
        ptAddress = _pt;
        ditAddress = _dit;
        nftAddress = _nft;

        // デモ用セットアップ
        setupDemo();
    }

    function resetDemo() public {
        for (uint i = 0; i < userAddresses.length; i++) {
            userContexts[userAddresses[i]].pts = initialAmount;
        }
    }

    // デモ用セットアップ
    function setupDemo() private {
        // デモ用ユーザー名
        string[20] memory demoNames = [
            "User1",
            "User2",
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
        address[20] memory demoAddresses = [
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
            720,
            800,
            640,
            600,
            560,
            550,
            490,
            350,
            300,
            290,
            200,
            180,
            180,
            150,
            150,
            90,
            90,
            90,
            90,
            0
        ];

        // ユーザー追加
        for (uint256 i = 0; i < demoNames.length - 1; i++) {
            addUser(demoNames[i], demoAddresses[i], demoReceipts[i]);
        }
    }

    // ユーザー追加
    function addUser(string memory name, address addr, uint received) private {
        // MINT
        IMintable(ptAddress).mint(initialAmount);

        // 登録
        userAddresses.push(addr);
        userContexts[addr] = UserContext({
            name: name,
            status: UserStatus.Participated,
            pts: initialAmount,
            receivedPts: received,
            dits: 0
        });
    }

    function isParticipated() view public returns(bool) {
        return userContexts[msg.sender].status == UserStatus.Participated;
    }

    function getUsers() view public returns (string[] memory, address[] memory, uint[] memory) {
        uint length = userAddresses.length;
        string[] memory names = new string[](length);
        address[] memory addrs = new address[](length);
        uint[] memory receipts = new uint[](length);

        for (uint i = 0; i < length; i++) {
            UserContext memory user = userContexts[userAddresses[i]];
            names[i] = user.name;
            addrs[i] = userAddresses[i];
            receipts[i] = user.receivedPts;
        }

        return (names, addrs, receipts);
    }

    function withdrawDit() public {
        uint amount = userContexts[msg.sender].dits;
        userContexts[msg.sender].dits = 0;
        IERC20(ditAddress).transferFrom(admin, msg.sender, amount);
    }
    
    function getPtBalance() view public returns (uint) {
        return userContexts[msg.sender].pts;
    }

    function getDitBalance() view public returns (uint) {
        return userContexts[msg.sender].dits;
    }

    function getTotalReceivedPts() view public returns (uint) {
        uint sum = 0;
        for (uint i = 0; i < userAddresses.length; i++) {
            sum += userContexts[userAddresses[i]].receivedPts;
        }
        return sum;
    }

    function giveNft(address recipient, string memory tokenURI, uint cost) public {
        // NFTをmint
        IGivable(nftAddress).give(recipient, tokenURI);

        // Point消費
        userContexts[msg.sender].pts -= cost;

        // 受領量追加
        userContexts[recipient].receivedPts += cost;

        // DIT付与
        userContexts[msg.sender].dits += 15;
    }
}
