// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

import '../utils/Operator.sol';
import '../utils/Epoch.sol';
import '../utils/ContractGuard.sol';

contract MockIdeaFund is Operator, ContractGuard {
}