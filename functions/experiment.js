const mkdirp = require('mkdirp')
const fsPath = require('fs-path');
const {h64} = require('xxhashjs')

const path = require('path')
const {execFile, spawn} = require('child_process')

const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const browserify = require('browserify');

let bucket = gcs.bucket('boxspring-data');

// main()
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
	let bundle = ''
	console.log("Installing modules...")		
	npm = execFile('npm', ['install'], {cwd: projectId}, function (err, stdin, stdout) {
		if (err) { throw err }

		console.log("Bundling with browserify...")
		let b = spawn('browserify', ['index.js'], {cwd:projectId})

		b.stdout.on('data', (data) => {
			bundle += data
		})

		b.on('close', (exitCode) => {
			console.log(`browserify closed with code `, exitCode)
			returnBundleToClient(bundle)
		})
	});
}
// TODO: Check for build errors...

returnBundleToClient('this is a bundle....', 'p123')
function returnBundleToClient(bundle, projectId) {
	// console.log(h64)
	let bundleHash = h64(bundle, 0xABCD).toString(36)
	console.log(bundleHash)

	// After build, upload to cloud storage
	let stream = bucket.file(`${projectId}-bundles/${bundleHash}`)
	.createWriteStream({
		metadata: { contentType: 'text/javascript'},
  })
	stream.on('finish', function() {
		console.log("Upload complete!")
		console.log("Return URL to user here")
	})
	stream.write(bundle)
	stream.end()

	// Return the path to the build to the client, use hash of build as filename
}
