// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JunkCoinERC20 is ERC20 {
    uint constant initialSupplies = 100000000;

    constructor() ERC20("JunkCoin", "JKC") {
        _mint(msg.sender, initialSupplies);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}
