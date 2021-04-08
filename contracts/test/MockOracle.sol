// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

import '../lib/UniswapV2Library.sol';
import '../interfaces/IOracle.sol';
import '../interfaces/ILinkOracle.sol'; // LINK

contract MockOracle is IOracle {
    using SafeMath for uint256;

    uint256 public price = 61400e18;
    bool public error;

    address factory;
    address peg;
    address share;
    address control;
    address hedge;
    address wbtc;
    address hedgefund;
    address ideafund;
    ILinkOracle linkOracle;
    uint256 period;
    uint256 startTime;

    constructor(
        address _factory,
        address _staking, //wbtc
        address _peg, // lfbtc
        address _share, // lift
        address _control, // ctrl
        address _hedge, // haif
        address _hedgefund,
        address _ideafund,
        ILinkOracle _linkOracle,
        uint256 _period,
        uint256 _startTime
    ) {
        factory = _factory;
        peg = _peg;
        share = _share;
        control = _control;
        hedge = _hedge;
        wbtc = _staking;
        hedgefund = _hedgefund;
        ideafund = _ideafund;
        linkOracle = _linkOracle;
        period = _period;
        startTime = _startTime;
    }

    function initialize() external {
    }

    function setPrice(uint256 _price) public {
        price = _price;
    }

    function setRevert(bool _error) public {
        error = _error;
    }

    function update() external override {
        require(!error, 'Oracle: mocked error');
        emit Updated(0, 0);
    }

    function priceOf(address token) external override view returns (uint256 priceOfToken)
    {
        if(token == peg) {
            return price;
        } else if (token == share) {
            return uint256(43e18);
        } else if (token == control) {
            return uint256(113000e18);
        } else if (token == wbtc) {
            return uint256(57400e18);
        } else if (token == hedge) {
            return uint256(500e18);
        } else {
            require(false, 'You have requested something we dont know about: MockOracle');
        }
        
    }

    function wbtcPriceOne() external override pure returns (uint256 priceOfwbtc)
    {
        return uint256(57800e18);
    }

    event Updated(uint256 price0CumulativeLast, uint256 price1CumulativeLast);

    function pairFor(address _factory, address _token1, address _token2) external override view returns (address pairaddy)
    {
        return UniswapV2Library.pairFor(_factory, _token1, _token2);
    }
}