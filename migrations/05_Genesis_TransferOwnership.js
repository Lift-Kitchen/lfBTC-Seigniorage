const Peg = artifacts.require('LFBTC');
const Share = artifacts.require('LIFT');
const Control = artifacts.require('CTRL');
const Hedge = artifacts.require('HAIF');

const Oracle = artifacts.require('Oracle');
const DevFund = artifacts.require('DevFund');
const IdeaFund = artifacts.require('IdeaFund');
const HedgeFund = artifacts.require('HedgeFund');
const Treasury = artifacts.require('Treasury');
const Boardroom = artifacts.require('Boardroom');
const GenesisVault = artifacts.require('GenesisVault');
const lfbtcliftLPPool = artifacts.require('lfBTCLIFTLPTokenSharePool');
const wBTClfBTCLPPool = artifacts.require('wBTClfBTCLPTokenSharePool');

// const DAY = 86400;

module.exports = async (deployer, network, accounts) => {

   const peg = await Peg.deployed();
   const share = await Share.deployed();
   const control = await Control.deployed();
   const hedge = await Hedge.deployed();

   const devfund = await DevFund.deployed();
   const ideafund = await IdeaFund.deployed();
   const hedgefund = await HedgeFund.deployed();

   const oracle = await Oracle.deployed();
   const treasury = await Treasury.deployed();
   const boardroom = await Boardroom.deployed();
   const genesisvault = await GenesisVault.deployed();
   const pegpool = await wBTClfBTCLPPool.deployed();
   const sharepool = await lfbtcliftLPPool.deployed();


   for await (const contract of [ peg, share ]) {
     await contract.transferOperator(genesisvault.address);
     await contract.transferOwnership(genesisvault.address);
   }

   await hedge.transferOperator(hedgefund.address);
   await hedge.transferOwnership(hedgefund.address);

   await boardroom.transferOperator(treasury.address);
   await boardroom.transferOwnership(treasury.address);

 }
