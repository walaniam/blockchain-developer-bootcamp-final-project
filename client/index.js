const cool = require('cool-ascii-faces');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/create-event', (req, res) => res.render('pages/create-event'))
  .get('/event-details', (req, res) => res.render('pages/event-details'))
  .get('/open-events', (req, res) => res.render('pages/open-events'))
  .get('/closed-events', (req, res) => res.render('pages/closed-events'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
