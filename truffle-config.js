const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const dotenv = require('dotenv');
dotenv.config({path:__dirname+'/../.env'});

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/public/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          process.env.INFURA_URL          
          )
      },
      network_id: 3
    }
  },
  compilers: {
    solc: {
      version: "^0.8",    // Fetch latest 0.8.x Solidity compiler 
    }
  }
};
