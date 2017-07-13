const mkdirp = require('mkdirp')
const fsPath = require('fs-path');
const {h64} = require('xxhashjs')
const {execFile, spawn} = require('child_process')

const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const browserify = require('browserify');
let bucket = gcs.bucket('boxspring-data');

const express = require('express')

app = express()

app.get('/bundle', main)

app.listen(3000, function () {
  console.log('App listening on port 3000!')
})

function main(req, res) {
	console.log("Cloud function starting...")

	// CORS
	res.set('Access-Control-Allow-Origin', '*');

	const projectId = req.query.projectId;
	console.log("Got projectId ", projectId)
	writeProjectFileTreeToDisk(projectId)
		.then((val) => {
			console.log("About to create bundle...", val)
			createAndSendBundle(projectId, req, res)
		})
		.catch((err) => {console.log("Error writing project tree to disk: ", err)})
}

function writeProjectFileTreeToDisk(projectId) {
	console.log("Writing file tree to disk...")
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

// Run browserify from projectId directory
// Currently assumes package.json and index.js exist
function createAndSendBundle(projectId, req, res) {
	console.log("Creating bundle...")
	let bundle = ''
	console.log("Installing modules...")		
	execFile('npm', ['install'], {cwd: projectId}, function (err, stdin, stdout) {
		if (err) { throw err }

		console.log("Bundling with browserify...")
		let b = spawn('browserify', ['index.js'], {cwd:projectId})

		b.stdout.on('data', (data) => {
			bundle += data
		})

		b.on('close', (exitCode) => {
			if (exitCode == 0)
				sendBundleToClient(bundle, projectId, req, res)
			else 
				bundleError(exitCode, res)
		})
	});
}
// TODO: Check for build errors...

function bundleError(exitCode, res) {
	res.write("Error: Browserify exited with ", exitCode)
	res.status(503)
	res.end()
}
// returnBundleToClient('this is a bundle....', 'p123')

function sendBundleToClient(bundle, projectId, req, res) {
	// console.log(h64)
	let bundleHash = h64(bundle, 0xABCD).toString(36)
	console.log(bundleHash)

	// After build, upload to cloud storage
	let file = bucket.file(`${projectId}-bundles/${bundleHash}`)
	let stream = file.createWriteStream({
		metadata: { contentType: 'text/javascript'},
  })
		.on('finish', function() {
			console.log(file)
			console.log("Upload complete")
			console.log("Download here: ", file.metadata.mediaLink)
			res.end(file.metadata.mediaLink)
		})
	stream.write(bundle)
	stream.end()
}
