const mkdirp = require('mkdirp')
const fsPath = require('fs-path');
const {h32} = require('xxhashjs')
const {execFile, spawn} = require('child_process')

const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const browserify = require('browserify');
let bucket = gcs.bucket('boxspring-data');

let newHash = ''
let fileContents = []

module.exports = main

function main(req, res) {
	console.log("----------Cloud function starting...--------------")
	
	// CORS
	res.set('Access-Control-Allow-Origin', '*');

	const projectId = req.query.projectId;
	console.log("Got projectId ", projectId)

	writeProjectFileTreeToDisk(projectId)
	.then((hash) => {
		console.log("Hash of contents = ", hash)
		let file = bucket.file(`bundles/${projectId}/${hash}`)
		file.exists()
		.then((data) => {
			let fileExists = data[0]
			if (fileExists) {
				console.log("Using cached bundle...")
				res.end(file.metadata.mediaLink)
			} else {
				console.log("Bundling from scratch...")
				newHash = hash
				createAndSendBundle(projectId, req, res)
			}
		})
	})
	.catch((err) => {
		console.log("Error writing project tree to disk: ", err)
		res.status = 503
		res.end("Error bundling!\n")
	})
}

function writeProjectFileTreeToDisk(projectId) {
	console.log("Writing file tree to disk...")
	// let concatenatedFiles = ''

	return bucket.getFiles({
		prefix: projectId + "/",
	})
	.then((response) => {
		let files = response[0]
		console.log(files.map(f => f.name))
		return Promise.all(files.map(
			function writeGCSObjectToDisk(obj) {
				return obj.download()
				.then((data) => { 
					let d = data[0]
					if (d == "Not Found")
						throw obj.name + ": FILE NOT FOUND"
					fileContents.push(data[0])
					return writeFile({
						name: obj.name,
						contents: data[0] 
					})
				})
			})
		)
	})
	.then((vals) => {
		console.log("Promise.all results", vals)
		if (vals.indexOf(false) === -1) {
			let cct = fileContents.sort().join('')
			console.log("Going to hash:\n", cct)
			return h32(cct, 0xABCD).toString(36)
		} else {
			throw "Error downloading files..."
		}
	})
}


function writeFile({name, contents}) {
	// console.log("Writing file to disk..", name)
	return new Promise((resolve, reject) => {
		fsPath.writeFile(name, contents, (err) => {
			return err ? reject("error in fsPath writefile callback") : resolve(true)
		})
	})
}

// Run browserify from projectId directory
// Currently assumes package.json and index.js exist
function createAndSendBundle(projectId, req, res) {
	console.log("Creating bundle...")
	let bundle = ''
	console.log("Installing modules...")		
	execFile('npm', ['install'], {cwd: projectId},
		function browserifyAndSend(err, stdin, stdout) {
			if (err) { throw err }
			console.log("Bundling with browserify...")
			
			let b = spawn('browserify', ['index.js'], {cwd:projectId})
			b.stdout.on('data', (data) => { bundle += data })
			b.on('close', (exitCode) => {
				if (exitCode == 0)
					sendBundleToClient(bundle, projectId, req, res)
				else 
					bundleError(exitCode, res)
			})
		}
	)
}


function sendBundleToClient(bundle, projectId, req, res) {
	// After build, upload to cloud storage
	let file = bucket.file(`bundles/${projectId}/${newHash}`)
	
	let stream = file.createWriteStream({
		metadata: { contentType: 'text/javascript'},
  })
	.on('finish', function() {
		console.log("Bundle download url: ", file.metadata.mediaLink)
		res.end(file.metadata.mediaLink)
	})
	stream.write(bundle)
	stream.end()
}

function bundleError(exitCode, res) {
	res.write("Error: Browserify exited with ", exitCode)
	res.status(503)
	res.end()
}
