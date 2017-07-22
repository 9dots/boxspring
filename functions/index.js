const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
// const fileTester = require('./file-test')
const buildProject = require('./build-project')

admin.initializeApp(functions.config().firebase);
// exports.fileTest = functions.https.onRequest(fileTester)

exports.buildProject = functions.https.onRequest(buildProject)