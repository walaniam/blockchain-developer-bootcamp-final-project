#!/bin/bash

current_dir=$(pwd)
cd client

mkdir -p public/js
mkdir -p public/stylesheets/bootstrap

cp -r node_modules/bootstrap/dist/css public/stylesheets/bootstrap
cp -r node_modules/bootstrap/dist/fonts public/stylesheets/bootstrap
cp -r node_modules/bootstrap/dist/js public/stylesheets/bootstrap

cp node_modules/jquery/dist/jquery.min* public/js
cp node_modules/web3/dist/web3.min* public/js

cd $current_dir