const contract = require('@truffle/contract');

const POOL_START_DATE     = 1618018953; //1619888400; // 05/01/2021 @ 1:00pm (EST)
const TREASURY_START_DATE = 1618018953; //1619888400; // 05/01/2021 @ 1:00pm (EST)
const GENESIS_START_DATE = 1618018953;  //1619283600; // 04/24/2021 @ 1pm EST
const HEDGEFUND_START_DATE = 1618018953; //1619888400; // 05/01/2021 @ 1:00pm (EST)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const knownContracts = require('./known-contracts');

const MockwBTC = artifacts.require('MockwBTC');
const Peg = artifacts.require('LFBTC');
const Share = artifacts.require('LIFT');
const Control = artifacts.require('CTRL');
const Hedge = artifacts.require('HAIF');

const Oracle = artifacts.require('Oracle');
const MockLinkOracle = artifacts.require('MockLinkOracle');

const DevFund = artifacts.require('DevFund');
const IdeaFund = artifacts.require('IdeaFund');
const HedgeFund = artifacts.require('HedgeFund');
const Treasury = artifacts.require('Treasury');
const Boardroom = artifacts.require('Boardroom');
const GenesisVault = artifacts.require('GenesisVault');

const lfbtcliftLPPool = artifacts.require('lfBTCLIFTLPTokenSharePool');
const wBTClfBTCLPPool = artifacts.require('wBTClfBTCLPTokenSharePool');

const singlePoolalUSD = artifacts.require('shortStakealUSDPool');
const singlePooliFARM = artifacts.require('shortStakeiFARMPool');
const singlePoolKBTC = artifacts.require('shortStakeKBTCPool');
const singlePoolOHM = artifacts.require('shortStakeOHMPool');

const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');

const DAY = 86400;

async function migration(deployer, network, accounts) {
    let uniswap, uniswapRouter;
  
    console.log(`Network: ${network}`);
    if (['dev'].includes(network)) {
      console.log('Deploying uniswap on dev network.');
      await deployer.deploy(UniswapV2Factory, accounts[0]);
      uniswap = await UniswapV2Factory.deployed();
  
      await deployer.deploy(UniswapV2Router02, uniswap.address, accounts[0]);
      uniswapRouter = await UniswapV2Router02.deployed();
    } else {
      uniswap = await UniswapV2Factory.at(knownContracts.UniswapV2Factory[network]);
      uniswapRouter = await UniswapV2Router02.at(knownContracts.UniswapV2Router02[network]);
    }

    const wbtc = network === 'mainnet'
    ? await IERC20.at(knownContracts.WBTC[network])
    : await MockwBTC.deployed();

    const linkOracle = network !== 'mainnet'
    ? await deployer.deploy(MockLinkOracle)
    : await MockLinkOracle.at(knownContracts.LINK_ORACLE[network]);

    const peg = await Peg.deployed();
    const share = await Share.deployed();
    const control = await Control.deployed();
    const hedge = await Hedge.deployed();

    // Deploy DevFund
    await deployer.deploy(DevFund)

    // Deploy HedgeFund
    const hedgefund = await deployer.deploy(HedgeFund, wbtc.address, peg.address, share.address, control.address, hedge.address, HEDGEFUND_START_DATE);

    // Deploy IdeaFund
    const ideafund = await deployer.deploy(IdeaFund, wbtc.address, peg.address, share.address, control.address, hedge.address, HedgeFund.address, uniswapRouter.address);

    // Deploy Oracle
    const oracle = await deployer.deploy(Oracle, uniswap.address, wbtc.address, peg.address, share.address, control.address, hedge.address, HedgeFund.address, IdeaFund.address, linkOracle.address);
    
    await hedgefund.updateOracle(Oracle.address);
    await ideafund.updateOracle(Oracle.address);

    // Deploy Boardroom
    //constructor(address _share, address _control, address _ideafund, address _theOracle) {
    await deployer.deploy(Boardroom, share.address, control.address, IdeaFund.address, Oracle.address);

    // Deploy Treasury    constructor(
    //address _lfbtc, address _lift, address _ctrl, address _theOracle, address _boardroom, address _ideafund, address _devfund, uint256 _startTime
    await deployer.deploy(Treasury, peg.address, share.address, control.address, Oracle.address, Boardroom.address, IdeaFund.address, DevFund.address, TREASURY_START_DATE);

    console.log(uniswap.address);

    const wbtcpegPair = await oracle.pairFor(uniswap.address, wbtc.address, peg.address);
    const pegsharePair = await oracle.pairFor(uniswap.address, peg.address, share.address);

    console.log(wbtcpegPair);
    console.log(pegsharePair);
    hedgefund.setLPPoolValues(wbtcpegPair, pegsharePair);
    
    // Deploy Pools
    await deployer.deploy(wBTClfBTCLPPool, Boardroom.address, share.address, wbtcpegPair, POOL_START_DATE);
    await deployer.deploy(lfbtcliftLPPool, Boardroom.address, share.address, pegsharePair, POOL_START_DATE);

    const alUSD = "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9";
    await deployer.deploy(singlePoolalUSD, share.address, alUSD, POOL_START_DATE);

    const iFARM = "0x1571ed0bed4d987fe2b498ddbae7dfa19519f651";
    await deployer.deploy(singlePooliFARM, share.address, iFARM, POOL_START_DATE);

    const KBTC = "0xe6c3502997f97f9bde34cb165fbce191065e068f";
    await deployer.deploy(singlePoolKBTC, share.address, KBTC, POOL_START_DATE);
    
    const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";
    await deployer.deploy(singlePoolOHM, share.address, OHM, POOL_START_DATE);
    
    //constructor(address _theOracle, address _peg, address _share, address _stakingToken, address _lfbtcliftLPPool, address _router, address _ideaFund) {
    await deployer.deploy(GenesisVault, Oracle.address, peg.address, share.address, wbtc.address, lfbtcliftLPPool.address, uniswapRouter.address, ideafund.address, GENESIS_START_DATE);
}

module.exports = migration;