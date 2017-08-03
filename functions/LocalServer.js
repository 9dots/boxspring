const express = require('express')
const buildDepsBundle = require('./BuildDepsBundle')
const buildAppBundle = require('./BuildAppBundle')

app = express()
app.get('/buildDepsBundle', buildDepsBundle)
app.get('/buildAppBundle', buildAppBundle)

app.listen(3000, function () {
  console.log('Listening on port 3000...')
})