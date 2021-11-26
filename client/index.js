const cool = require('cool-ascii-faces');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/node/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))
  .use('/node/web3', express.static(__dirname + '/node_modules/web3/dist/'))
  .use('/node/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/create-event', (req, res) => res.render('pages/create-event'))
  .get('/event-details', (req, res) => res.render('pages/event-details'))
  .get('/open-events', (req, res) => res.render('pages/open-events'))
  .get('/my-events', (req, res) => res.render('pages/my-events'))
  .get('/set-price', (req, res) => res.render('pages/set-price'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Listening on ${ PORT }`)
  })
