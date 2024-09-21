require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.18",

  networks: {
    'sepolia-testnet': {
      url: 'https://sepolia.infura.io/v3/2SHg9nYGwUEpcXJuBTdkDcT2tYV',
      accounts: [process.env.PRIVATE_KEY],
    },
    
    'airdao-testnet': {
      url: 'https://network.ambrosus-test.io ',
      accounts: [process.env.PRIVATE_KEY],
    },

  },

  etherscan: {
    apiKey: {
      "gnosis-testnet": "abc",
      "base-testnet": "abc"
    },

    customChains: [
      {
        network: "gnosis-testnet",
        chainId: 10200,
        urls: {
          apiURL: "https://gnosis-chiado.blockscout.com/api",
          browserURL: '',
        },
      },

      {
        network: "base-testnet",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: '',
        },
      },
    ],

  },
}