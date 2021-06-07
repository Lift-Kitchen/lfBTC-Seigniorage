// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract MockLinkETHOracle {
    
  function latestAnswer() public view returns (int256) {
    return int256(2780e8);
  }
}
