require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: "0.8.20",
};

if (process.env.SEPOLIA_RPC_URL && process.env.PRIVATE_KEY) {
  config.networks = {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  };
}

if (process.env.MAINNET_RPC_URL && process.env.PRIVATE_KEY) {
  config.networks = {
    ...config.networks,
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  };
}

if (process.env.ETHERSCAN_API_KEY) {
  config.etherscan = {
    apiKey: process.env.ETHERSCAN_API_KEY,
  };
}

module.exports = config;
