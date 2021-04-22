<!-- deploying the genesis code (14 days prior) - 4/12/2021

will require all of the tokens be minted and created
genesisVault will need to be operator on the tokens to mint them for distribution

executing the genesis code (day 15) - 4/27/2021

will require everything to be live

Must Terminate (stop staking) before starting Genesis -->


  const MockERC20 = artifacts.require('MockERC20');
  const mockerc20 = await MockERC20.deployed();

    const alUSD = "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9";
    await deployer.deploy(singlePoolalUSD, share.address, mockerc20.address, POOL_START_DATE);

    const iFARM = "0x1571ed0bed4d987fe2b498ddbae7dfa19519f651";
    await deployer.deploy(singlePooliFARM, share.address, mockerc20.address, POOL_START_DATE);

    const KBTC = "0xe6c3502997f97f9bde34cb165fbce191065e068f";
    await deployer.deploy(singlePoolKBTC, share.address, mockerc20.address, POOL_START_DATE);
    
    const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";
    await deployer.deploy(singlePoolOHM, share.address, mockerc20.address, POOL_START_DATE);

    
const singlePoolalUSD = artifacts.require('shortStakealUSDPool');
const singlePooliFARM = artifacts.require('shortStakeiFARMPool');
const singlePoolKBTC = artifacts.require('shortStakeKBTCPool');
const singlePoolOHM = artifacts.require('shortStakeOHMPool');