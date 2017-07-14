var fsPath = require('fs-path');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const bundleHandler = require('./bundler')
exports.build = functions.https.onRequest(bundleHandler)


  // Optimization for later:
	  // Concat and hash all files
	  // Look for build in GCS/projectId/builds/hash
	  // If exists, serve that instead of re-building

	// Extract entry from package.json

	// Run browserify from projectId directory, find package.json
	// let b = browserify(projectId)
	// b.bundle()
	// Npm install modules, start with very few modules
	
	// Keep user modules and node modules together for now
	// use b.external()?

	// TODO: Check for build errors...

	// After build, upload to cloud storage
	// Return the path to the build to the client, use hash of build as filename