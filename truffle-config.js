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
  //contracts_build_directory: path.join(__dirname, "bin/truffle/contracts"),
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
  },
  build: function(options, callback) {
    console.log("=== Running custom build script ===");
    // working_directory: root location of the project
    // contracts_directory: root directory of .sol files
    // destination_directory: directory where truffle expects the built assets (important for `truffle serve`)
    var compiledContractFile = path.join(options.destination_directory, "contracts/SignMeUp.json");
    var clientTargetDir = path.join(options.working_directory, "client/public/contracts/");
    var clientTargetContractFile = path.join(clientTargetDir, "SignMeUp.json");

    if (!fs.existsSync(clientTargetDir)) {
      throw new Error("Target dir not found: " + clientTargetDir);
    }

    if (!fs.existsSync(compiledContractFile)) {
      throw new Error("Compiled contract not found: " + compiledContractFile);
    }

    console.log("Copying " + compiledContractFile + " to " + clientTargetContractFile);
    fs.copyFile(compiledContractFile, clientTargetContractFile, function(err) {
      if (err) throw err
    });
  }
};
