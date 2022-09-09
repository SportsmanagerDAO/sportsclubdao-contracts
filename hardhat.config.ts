import "@nomiclabs/hardhat-waffle";
import '@nomiclabs/hardhat-etherscan';
import './tasks/deploy-all';
import dotenv from 'dotenv';

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 1,
    },
    bob: {
      default: 2,
    },
    carol: {
      default: 3,
    },
  },
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
      tags: ["local"],
    },
    hardhat: {
      forking: {
        enabled: true,
        url: "https://eth-mainnet.alchemyapi.io/v2/zjx8baDblg7pbUjvc4zuRARLT28Ft2PC",
        blockNumber: 12886725,
      },
      allowUnlimitedContractSize: true,
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
    },
    goerli: {
      //url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      //url: `https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      url: `https://patient-clean-dust.ethereum-goerli.discover.quiknode.pro/f332f155d79a962383d0b41351408de714243858/`,
      accounts: process.env.MNEMONIC
        ? { mnemonic: process.env.MNEMONIC }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.14",
        settings: {
          optimizer: {
            enabled: true,
            runs: 11111,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 200000,
  },
};
