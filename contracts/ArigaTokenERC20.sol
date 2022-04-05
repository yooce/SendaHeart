// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArigaTokenERC20 is ERC20 {
    constructor() ERC20("ArigaToken", "ARGT") {
        _mint(msg.sender, 0);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}
