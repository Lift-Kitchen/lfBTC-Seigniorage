const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

function distributionPoolContracts() {
    return fs.readdirSync(path.resolve(__dirname, '../contracts/distribution'))
      .filter(filename => filename.endsWith('Pool.sol'))
      .map(filename => filename.replace('.sol', ''));
}

function Tokens() {
    return fs.readdirSync(path.resolve(__dirname, '../contracts/token'))
    .filter(filename => filename.endsWith('.sol'))
    .map(filename => filename.replace('.sol', ''));
}

function Utils() {
    return fs.readdirSync(path.resolve(__dirname, '../contracts/utils'))
    .filter(filename => filename.endsWith('Oracle.sol'))
    .map(filename => filename.replace('.sol', ''));
}
// function Utils() {
//   return fs.readdirSync(path.resolve(__dirname, '../contracts/test'))
//   .filter(filename => filename.endsWith('MockOracle.sol'))
//   .map(filename => filename.replace('.sol', ''));
// }

// Deployment and ABI will be generated for contracts listed on here.
// The deployment thus can be used on lift.kitchen-frontend.
const exportedContracts = [
  'Boardroom',
  'DevFund',
  'GenesisVault',
  'HedgeFund',
  'IdeaFund',
  'Treasury',
  ...distributionPoolContracts(),
  ...Tokens(),
  ...Utils()
];

module.exports = async (deployer, network, accounts) => {
  const deployments = {};

  for (const name of exportedContracts) {
    const contract = artifacts.require(name);
    deployments[name] = {
      address: contract.address,
      abi: contract.abi,
    };
  }
  const deploymentPath = path.resolve(__dirname, `../build/deployments.${network}.json`);
  await writeFile(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log(`Exported deployments into ${deploymentPath}`);
};
