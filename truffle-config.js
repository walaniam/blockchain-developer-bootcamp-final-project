const path = require("path");
const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const dotenv = require('dotenv');

function loadEnv(envFile) {
  const envPath = __dirname + '/../' + envFile;
  const envPathLocalDir = __dirname + '/' + envFile;
  if (fs.existsSync(envPathLocalDir)) {
    console.log("Loading .env from: " + envPathLocalDir);
    dotenv.config({path: envPathLocalDir});
  } else if (fs.existsSync(envPath)) {
    console.log("Loading .env from: " + envPath);
    dotenv.config({path: envPath});
  }
}

loadEnv('.env');
loadEnv('.env_ropsten');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/public/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: process.env.DEVELOP_FROM
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          process.env.INFURA_URL          
          )
      },
      network_id: 3,
      from: process.env.ROPSTEN_FROM
    }
  },
  compilers: {
    solc: {
      version: "0.8.10",
    }
  }
};
