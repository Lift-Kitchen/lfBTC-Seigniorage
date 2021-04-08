// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../interfaces/IDistributor.sol';
import '../interfaces/IRewardDistributionRecipient.sol';

contract InitialShareDistributor is IDistributor {
    using SafeMath for uint256;
    
    event Distributed(address pool, uint256 Amount);

    bool public once = true;

    IERC20 public share;
    IRewardDistributionRecipient public wBTClfBTCLPPool;
    uint256 public wBTClfBTCInitialBalance;

    IRewardDistributionRecipient public lfBTCLIFTLPPool;
    uint256 public lfBTCLIFTInitialBalance;

    // 1,040,000 = 20k/week for 52 weeks (52 * 7 is only 364) so not a full year... -1 day
    // 75% to the lfbtc / lift pool
    // 25% to the wbtc / lfbtc pool
    // Tokens for emissions out to the LP pools weekly
    constructor(
        IERC20 _share,
        IRewardDistributionRecipient _wBTClfBTCLPPool,
        uint256 _wBTClfBTCInitialBalance,
        IRewardDistributionRecipient _lfBTCLIFTLPPool,
        uint256 _lfBTCLIFTInitialBalance
    ) {
        share = _share;
        wBTClfBTCLPPool = _wBTClfBTCLPPool;
        wBTClfBTCInitialBalance = _wBTClfBTCInitialBalance;

        lfBTCLIFTLPPool = _lfBTCLIFTLPPool;
        lfBTCLIFTInitialBalance = _lfBTCLIFTInitialBalance;
    }

    function distribute() public override {
        require(
            once,
            'InitialShareDistributor: you cannot run this function twice'
        );

        share.transfer(address(wBTClfBTCLPPool), wBTClfBTCInitialBalance);
        wBTClfBTCLPPool.notifyRewardAmount(wBTClfBTCInitialBalance);
        emit Distributed(address(wBTClfBTCLPPool), wBTClfBTCInitialBalance);

        share.transfer(address(lfBTCLIFTLPPool), lfBTCLIFTInitialBalance);
        lfBTCLIFTLPPool.notifyRewardAmount(lfBTCLIFTInitialBalance);
        emit Distributed(address(lfBTCLIFTLPPool), lfBTCLIFTInitialBalance);

        once = false;
    }
}
