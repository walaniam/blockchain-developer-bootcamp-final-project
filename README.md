# blockchain-developer-bootcamp-final-project
## "Sign up" project
### The problem
Recently I wanted to sign up my kid for a school event with limited number of participants. The sign up process was a kind of "first come, first served". Unfortunately by the time I heard about the event, all the places were booked.
### The solution
My idea is to create a web site where people can register for an event. It should be transparent how many spots are available and what's the due date for registration. After the due date, the application automatically and randomly chooses who got successfully signed up.
#### Example
1. Event is created with due date of 1st December 2021, 10 spots available.
2. Link to this event is distributed externally (e.g. by email).
3. People get registered for the event and wait for the due date. Let's say there are 22 people who registered and wait.
4. At the due date, the application randomly chooses among the registrants, 10 lucky ones who got signed up.
5. The result of sign up proess is avaiable on the event site.

## Development - Contracts
###
Start a local development blockchain
```
truffle develop
```

Migrate the contract
```
truffle migrate --network develop
```

## Development - UI
### Pre-requisites
Install [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

Install node modules
```
cd bin
./install_modules.sh
```

Copy UI modules (only in case bootstrap, jquery or web3 version is changed in package.json)
```
cd bin
./copy_ui_modules.sh
```

### Run locally
```
cd client
heroku local web
```

### Deploy to Heroku

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