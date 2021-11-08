#!/bin/bash

current_dir=$(pwd)

npm i @truffle/hdwallet-provider --save
npm i dotenv --save

cd client
npm i web3 --save
npm i jquery --save
npm i bootstrap --save
npm i ejs --save
npm i express --save
npm i cool-ascii-faces --save
npm i got --save-dev
npm i tape --save-dev

cd $current_dir