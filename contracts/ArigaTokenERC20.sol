// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IMintable.sol";

contract ArigaTokenERC20 is ERC20, IMintable {
    address admin;

    constructor() ERC20("ArigaToken", "ARGT") {
        admin = msg.sender;
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(uint256 amount) public override {
        _mint(admin, amount);
    }
}
