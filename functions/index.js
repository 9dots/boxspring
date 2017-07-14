const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
// const fileTester = require('./file-test')
const bundleHandler = require('./bundler')

admin.initializeApp(functions.config().firebase);
// exports.fileTest = functions.https.onRequest(fileTester)

exports.build = functions.https.onRequest((req,res) => {
	cors(req, res, () => bundleHandler(req,res))
})