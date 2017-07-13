const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var fsPath = require('fs-path');


const browserify = require('browserify');
var gcs = require('@google-cloud/storage')();

// Realtime Database under the path /messages/:pushId/original
exports.build = functions.https.onRequest((req, res) => {

	let bucket = gcs.bucket('boxpsring-data');
  // For now, grab projectId for URL
  // TODO: add security, grab from signed cookie instead (?)
  const projectId = req.query.projectId;

  bucket.getFiles({
  	prefix: projectId,
  	delimiter: null
  }).then(function(files) {
  	files.forEach(function(file) {
  		downloadFileAndWriteToDisk(file);
  	})
  })
function downloadFileAndWriteToDisk(file) {
	let name;
	file.getMetadata()
	.then(function(metadata) {
		name = metadata[0].name
	})
	fsPath.writeFile('/folder1/folder2/file.txt', 'content', function(err){
	  if(err) {
	    throw err;
	  } else {
	    console.log('wrote a file like DaVinci drew machines');
	  }
	});
}

  	
  }

  // Download all files at prefix
	// And write to local tmp dir

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
});