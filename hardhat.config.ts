import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";

export default {
  solidity: "0.7.3",
  gasReporter: {
    enabled: false
  },
  mocha: {
    timeout: 50000
  }
};