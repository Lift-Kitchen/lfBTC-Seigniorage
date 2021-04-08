// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract MockLinkOracle {
    
  function latestAnswer() public view returns (int256) {
    return int256(57800e8);
  }
}
