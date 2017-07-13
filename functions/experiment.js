var fsPath = require('fs-path');
var gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});

let bucket = gcs.bucket('boxspring-data');
const projectId = "p123"

bucket.getFiles({
	prefix: projectId,
})
.then(function(response) {
	let files = response[0]
	Promise.all(files.map(function(file) {
		file.download()
			.then(function(data) {
				return writeFile({
					name: file.name,
					contents: data
				})
			})
			.catch(function(err) {
				console.log("Error writing file: ", err)
			})
	}))
})
.then(buildBundle)
.catch(function(err) {
	console.log("Error...", err)
})

function buildBundle() {
	console.log("Downloading complete...")
}

function writeFile({name, contents}) {
	return new Promise(function(resolve, reject) {
		fsPath.writeFile(name, contents, function(err) {
		  if(err) {
		    reject(err);
		  } else {
		    resolve()
		  }
		})
	})
}

// writeFile({name:'folder2/testFile.txt', contents: "It worked!\n"})
// 	.then(function() { console.log("Victory!\n") })
// 	.catch(function() { console.log("Failed!\n") })

// files.forEach(function(file) {
	// fsPath.writeFile(file.name, 'content', function(err){
	//   if(err) {
	//     throw err;
	//   } else {
	//     console.log('wrote a file like DaVinci drew machines');
	//   }
	// });
// })
  	
  // }

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
// });