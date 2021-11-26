# "Sign up" project

## The problem

Recently I wanted to sign up my kid for a school event with limited number of participants. The sign up process was a kind of "first come, first served". Unfortunately by the time I heard about the event, all the places were booked.

## The solution

My idea is to create a web site where people can register for an event. It should be transparent how many spots are available and what's the due date for registration. After the due date, the application automatically and randomly chooses who got successfully signed up.

### Example

1. Event is created with due date of 1st December 2021, 10 spots available.
2. Link to this event is distributed externally (e.g. by email).
3. People get registered for the event and wait for the due date. Let's say there are 22 people who registered and wait.
4. At the due date, the application randomly chooses among the registrants, 10 lucky ones who got signed up.
5. The result of sign up proess is avaiable on the event site.<br/><br/>

# Sample deployment

This dapp is available on Heroku hosting https://sign-me-up-dapp.herokuapp.com/

# Development

## Directory Structure

client - UI code of nodejs application, written with https://ejs.co/, HTML5, https://jquery.com/ and https://getbootstrap.com/  
contracts - Solidity contracts  
migrations - Solidity contracts migrations  
test - Solidity contracts js tests

## Setup

### Metamask plugin
Install metamask plugin for your browser. It's a crypto wallet that you'll need to interact with this site. More on https://metamask.io/

### Development tools

The easiets way is to run it on some linux distribution or in case of Windows use [WSL](https://docs.microsoft.com/en-us/windows/wsl/about) like [Ubuntu on WSL](https://ubuntu.com/wsl)

Install [Node](https://nodejs.org/en/), [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) and [truffle](https://www.trufflesuite.com/docs/truffle/getting-started/installation)

This app has been tested with:
- node v14.18.0
- npm 6.14.15
- truffle v5.4.19
- Solidity 0.8.10

### Clone and setup the project
Clone the project with
```shell
git clone git@github.com:walaniam/blockchain-developer-bootcamp-final-project.git
```

Run following scripts to install nodejs modules
```shell
install_modules.sh
```

In case bootstrap, jquery or web3 version is changed in package.json you need to run below script
```shell
copy_ui_modules.sh
```

Create .env file in project dir with following variables
```shell
# Metamask mnemonic
MNEMONIC=
# Infura project URL
INFURA_URL=
# Account address of contract owner in develop network
DEVELOP_FROM=
# Account address of contract owner in ropsten network
ROPSTEN_FROM=
```

## How to run on local environment

Start a local development blockchain network. In project dir run below command.

```
truffle develop
```

In the develop console migrate the contract into develop network.

```
migrate --network develop
```

Run the web client. In project root dir run below commands
```
cd client
heroku local web
```

## Deploy to Heroku

This applications uses https://elements.heroku.com/buildpacks/timanovsky/subdir-heroku-buildpack build pack.
UI is built basing on https://devcenter.heroku.com/articles/getting-started-with-nodejs sample application.

Create and configure the app

```
APP_NAME=<your app name here>

heroku login

heroku create -a $APP_NAME --region eu

git remote rm heroku
git remote add heroku https://git.heroku.com/${APP_NAME}.git

# Add build pack for subdir nodejs app located in client directory
heroku buildpacks:clear
heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack
heroku buildpacks:add heroku/nodejs
heroku config:set PROJECT_PATH=client
```

Deploy app

```
# From development branch named html
git push heroku html:main

# From main branch
git push heroku main
```

Check logs

```
heroku logs --tail
```
