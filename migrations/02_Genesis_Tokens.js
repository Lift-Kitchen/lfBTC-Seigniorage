// ============ Contracts ============

// Token
// deployed first
const MockwBTC = artifacts.require('MockwBTC');
const MockwETH = artifacts.require('MockwETH');
//const MockERC20 = artifacts.require('MockERC20');
const PegBTC = artifacts.require('LFBTC')
const PegETH = artifacts.require('LFETH')
const Share = artifacts.require('LIFT')
const Control = artifacts.require('CTRL')
const Hedge = artifacts.require('HAIF')


// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([deployToken(deployer, network, accounts)])
}

module.exports = migration

// ============ Deploy Functions ============

async function deployToken(deployer, network, accounts) {
  if (network !== 'mainnet') {
    const mockwbtc = await deployer.deploy(MockwBTC);
    const mockweth = await deployer.deploy(MockwETH);
    //const mockerc20 = await deployer.deploy(MockERC20);
    //console.log(`MockwBTC address: ${mockwbtc.address}`);
  }

  await deployer.deploy(PegBTC);
  await deployer.deploy(PegETH);
  await deployer.deploy(Share);
  await deployer.deploy(Control);
  await deployer.deploy(Hedge);
}
