// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../lib/UniswapV2Library.sol";
import "../interfaces/IOracle.sol";
import "../interfaces/ILinkOracle.sol"; // LINK
import '../interfaces/IIdeaFund.sol'; // source of pricing for CTRL

contract MockOracle is IOracle {
    using SafeMath for uint256;

    uint256 public price = 0;
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

    IUniswapV2Pair public pairStakingtoPeg;
    IUniswapV2Pair public pairPegtoShare;

    constructor(
        address _factory,
        address _staking, //wbtc
        address _peg, // lfbtc
        address _share, // lift
        address _control, // ctrl
        address _hedge, // haif
        address _hedgefund,
        address _ideafund,
        ILinkOracle _linkOracle
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

        pairStakingtoPeg = IUniswapV2Pair(
            UniswapV2Library.pairFor(factory, wbtc, peg)
        );

        pairPegtoShare = IUniswapV2Pair(
            UniswapV2Library.pairFor(factory, peg, share)
        );
    }

    function setPrice(uint256 _price) public {
        price = _price;
    }

    function setRevert(bool _error) public {
        error = _error;
    }

    function priceOf(address token)
        public
        view
        override
        returns (uint256 priceOfToken)
    {
        if (token == peg) {
            if(price > 0) {
                return price;
            }
            else { // @audit-changes
               return priceFromPair(pairStakingtoPeg);
            }
        } else if (token == share) {
            return uint256(43e18);
        } else if (token == control) {
            // @audit-changes
            return IIdeaFund(ideafund).getControlPrice();
        } else if (token == wbtc) {
            return uint256(57400e18);
        } else if (token == hedge) {
            return uint256(500e18);
        } else {
            require(
                false,
                "You have requested something we dont know about: MockOracle"
            );
        }
    }

    // always returns the price for token1
    function priceFromPair(IUniswapV2Pair pair)
        public
        view
        returns (uint256 price)
    {
        uint256 token0Supply = 0;
        uint256 token1Supply = 0;

        // @audit-issue uses reserves here, can be gamed
        (token0Supply, token1Supply, ) = pair.getReserves();

        if (pair.token0() == wbtc) {
            token0Supply = token0Supply.mul(1e18);

            return
                token0Supply.div(token1Supply).mul(priceOf(pair.token0())).div(
                    1e8
                );
        } else if (pair.token1() == wbtc) {
            token1Supply = token1Supply.mul(1e18);

            return
                token1Supply.div(token0Supply).mul(priceOf(pair.token1())).div(
                    1e8
                );
        } else if (pair.token0() == peg) {
            token0Supply = token0Supply.mul(1e8);

            return
                token0Supply.div(token1Supply).mul(priceOf(pair.token0())).div(
                    1e8
                );
        } else if (pair.token1() == peg) {
            token1Supply = token1Supply.mul(1e8);

            return
                token1Supply.div(token0Supply).mul(priceOf(pair.token1())).div(
                    1e8
                );
        }
    }

<<<<<<< HEAD
    function wethPriceOne() external override pure returns (uint256 priceOfweth)
    {
        return uint256(2755e18);
    }

    function pairFor(address _factory, address _token1, address _token2) external override view returns (address pairaddy)
=======
    function wbtcPriceOne()
        external
        pure
        override
        returns (uint256 priceOfwbtc)
>>>>>>> 7b76deb823a624dd640665d69f1024de11c5b5cc
    {
        return uint256(57400e18);
    }

    function pairFor(
        address _factory,
        address _token1,
        address _token2
    ) external view override returns (address pairaddy) {
        return UniswapV2Library.pairFor(_factory, _token1, _token2);
    }
}