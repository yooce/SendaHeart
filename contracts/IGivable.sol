// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGivable {
    function give(address recipient, string memory tokenURI) external returns (uint256);
}
