const express = require('express')
const bundleHandler = require('./bundler')
const fileTester = require('./file-test')
const cors = require('cors')({origin:true})

app = express()
app.get('/bundle', (req,res) => {
	cors(req, res, () => {
		bundleHandler(req,res)
	})
})
app.get('/fileTest', fileTester)

app.listen(3000, function () {
  console.log('Listening on port 3000...')
})