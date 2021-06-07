const INITIAL_LIFT_FOR_WBTC_LFBTC = 260714;
const INITIAL_LIFT_FOR_LFBTC_LIFT = 782143;
const INITIAL_CTRL = 6;
  
  // Pools
  // deployed first
  const Share = artifacts.require('LIFT');
  const Control = artifacts.require('CTRL');
  const InitialShareDistributor = artifacts.require('InitialShareDistributor');
  
  // ============ Main Migration ============
  
  async function migration(deployer, network, accounts) {
    const unit = web3.utils.toBN(10 ** 18);
    const totalBalanceForPegLP = unit.muln(INITIAL_LIFT_FOR_WBTC_LFBTC)
    const totalBalanceForShareLP = unit.muln(INITIAL_LIFT_FOR_LFBTC_LIFT)
    const totalBalance = totalBalanceForPegLP.add(totalBalanceForShareLP);
  
    const share = await Share.deployed();
    const control = await Control.deployed();
  
    const lpPoolPeg = artifacts.require('wBTClfBTCLPTokenSharePool');
    const lpPoolShare = artifacts.require('lfBTCLIFTLPTokenSharePool');
    const lpPoolPegEth = artifacts.require('wETHlfETHLPTokenSharePool');
  
    await deployer.deploy(
      InitialShareDistributor,
      share.address,
      lpPoolPeg.address,
      totalBalanceForPegLP.toString(),
      lpPoolShare.address,
      totalBalanceForShareLP.toString(),
    );
    const distributor = await InitialShareDistributor.deployed();
  
    await share.mint(distributor.address, totalBalance.toString());
    console.log(`Deposited ${INITIAL_LIFT_FOR_WBTC_LFBTC} + ${INITIAL_LIFT_FOR_LFBTC_LIFT} LIFT to InitialShareDistributor.`);
  
    await share.mint(lpPoolPegEth.address, INITIAL_LIFT_FOR_WBTC_LFBTC);

    console.log(`Setting distributor to InitialShareDistributor (${distributor.address})`);
    await lpPoolPeg.deployed().then(pool => pool.setRewardDistribution(distributor.address));
    await lpPoolShare.deployed().then(pool => pool.setRewardDistribution(distributor.address));
    //await lpPoolPegEth.deployed().then(pool => pool.notifyRewardAmount(INITIAL_LIFT_FOR_WBTC_LFBTC));
    
    await distributor.distribute();

    await control.mint(accounts[0], unit.muln(INITIAL_CTRL));
  }
  
  module.exports = migration;
  