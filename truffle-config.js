const path = require("path");
const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const dotenv = require('dotenv');
const envPath = __dirname + '/../.env';
const envPathLocalDir = __dirname + '/.env';
if (fs.existsSync(envPath)) {
  console.log("Loading .env from: " + envPath);
  dotenv.config({path: envPath});
} else if (fs.existsSync(envPathLocalDir)) {
  console.log("Loading .env from: " + envPathLocalDir);
  dotenv.config({path: envPathLocalDir});
}

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/public/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: '0xfa5e6a302d3f8de3393d547c109867e8f497813f'
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          process.env.INFURA_URL          
          )
      },
      network_id: 3,
      from: '0x1E779e81d7AB2441317E5acc60546b925DCAb923' // bootcamp2
    }
  },
  compilers: {
    solc: {
      version: "0.8.10",
    }
  }
};
