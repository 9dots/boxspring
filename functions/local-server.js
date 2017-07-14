const express = require('express')
const bundleHandler = require('./bundler')

app = express()

app.get('/bundle', bundleHandler)

app.listen(3000, function () {
  console.log('Listening on port 3000...')
})