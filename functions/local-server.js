const express = require('express')
const oldBundler = require('./old-bundler')
const buildProject = require('./BuildProject')
const cors = require('cors')({origin:true})

app = express()
app.get('/buildProject', buildProject)
// app.get('/buildProject', (req,res) => {
// 	cors(req, res, () => {
// 		buildProject(req, res)
// 	})
// })
app.get('/old-bundle', (req,res) => {
	cors(req, res, () => {
		oldBundler(req, res)
	})
})

app.listen(3000, function () {
  console.log('Listening on port 3000...')
})