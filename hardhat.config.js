require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const CHAIN_IDS = {
  hardhat: 31337,
};


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: CHAIN_IDS.hardhat,
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/sN54n7sULB_DNOW_hqNFao3F_lIEKmPc",
      },
    },
  },
  solidity: "0.8.17",
};