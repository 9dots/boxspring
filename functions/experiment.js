var mkdirp = require('mkdirp')
var fsPath = require('fs-path');

var path = require('path'),
    execFile = require('child_process').execFile,
    spawn = require('child_process').spawn

var gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const browserify = require('browserify');

main()
function main() {
	console.log("Cloud function starting...")
	const projectId = "p123"
	writeProjectFileTreeToDisk(projectId)
	.then((val) => {
		console.log("About to create bundle...", val)
		return createBundle(projectId)
	})
	.catch((err) => {console.log("Error writing project tree to disk: ", err)})
}

function writeProjectFileTreeToDisk(projectId) {
	console.log("Writing file tree to disk...")
	let bucket = gcs.bucket('boxspring-data');
	return bucket.getFiles({
		prefix: projectId,
	})
	.then((response) => {
		let files = response[0]
		return Promise.all(files.map(writeGCSObjectToDisk))
	})
}

function writeGCSObjectToDisk(obj) {
	console.log(`Creating promise to DL and write object '${obj.name}'`)
	return obj.download()
	.then((data) => { 
		console.log(`Downloaded file ${obj.name}`)
		return writeFile({
			name: obj.name,
			contents: data 
		})
	})
}

function writeFile({name, contents}) {
	console.log("Writing file to disk..", name)
	return new Promise((resolve, reject) => {
		fsPath.writeFile(name, contents, (err) => {
			return err ? reject("error happened") : resolve(true)
		})
	})
}

// Run browserify from projectId directory, find package.json
function createBundle(projectId) {
	console.log("Creating bundle...")
		
	console.log("Installing modules...")		
	npm = execFile('npm', ['install'], {cwd: projectId}, function (err, stdin, stdout) {
		if (err) { throw err }

		console.log("Bundling with browserify...")
		let b = spawn('browserify index.js > bundle2.js', [], {
			cwd:projectId,
			shell: true
		}, function (e) {
			console.log("Checking final status of bundle...")
			if (e) {
				console.log(e)
			} else {
				console.log("Bundle success")
			}
		})
	});
}
// TODO: Check for build errors...

// After build, upload to cloud storage
// Return the path to the build to the client, use hash of build as filename
