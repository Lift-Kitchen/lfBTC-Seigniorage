// ============ Contracts ============

// Token
// deployed first
const MockwBTC = artifacts.require('MockwBTC');
const Peg = artifacts.require('LFBTC')
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
    //console.log(`MockwBTC address: ${mockwbtc.address}`);
  }

  await deployer.deploy(Peg);
  await deployer.deploy(Share);
  await deployer.deploy(Control);
  await deployer.deploy(Hedge);
}
