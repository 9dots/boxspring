const browserify = require('browserify')
const npmi = require('npmi')
const exec = require('child-process-promise').exec
const {h32} = require('xxhashjs')
const fsPath = require('fs-path');
const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});

module.exports = buildProject

const BUILD_TOTAL = "BUILD_TOTAL"
const GET_METADATA = "GET_METADATA"
const HASH = "HASH"
const BUNDLE_EXISTS = "BUNDLE_EXISTS"
const DOWNLOAD_PROJECT = "DOWNLOAD_PROJECT"
const GENERATE_BUNDLE = "GENERATE_BUNDLE"
const INSTALL ="INSTALL"
const BROWSERIFY = "BROWSERIFY"
const UPLOAD_BUNDLE = "UPLOAD_BUNDLE"
const BUILD_URL = "BUILD_URL"
const SEND_RESPONSE = "SEND_RESPONSE"

function buildProject(req, res) {
	console.log("Cloud function starting.....................................")
	res.header('Access-Control-Allow-Origin', '*')
	console.time(BUILD_TOTAL)
	
	let projectId = req.query.projectId;
	console.log("Building project...", projectId)

	const bucketName = 'boxspring-data'
	let bucketURL = `gs://${bucketName}`
	let projectURL = `${bucketURL}/${projectId}`

	let bundlePathPrefix = `bundles/${projectId}`
	const tmpDirParent = `/tmp/boxspring/projects`
	const tmpDir = `${tmpDirParent}/${projectId}`

	let projectHash = ''
	let file = null
	let bucket = gcs.bucket('boxspring-data');
	
	return main()
	function main() {

		console.log("Getting metadata for all files in project from GCS...")
		console.time(GET_METADATA)
		return bucket.getFiles({
			prefix: projectId + "/",
		})
		.then((gcsResponse) => {
			console.timeEnd(GET_METADATA)
			let files = gcsResponse[0]
			return generateProjectHash(files)
		})
		.then((hash) => {
			console.log("Checking if bundle already exists...")
			console.time(BUNDLE_EXISTS)
			file = bucket.file(`${bundlePathPrefix}/${hash}`)
			return file.exists()
		})
		.then((response) => {
			console.timeEnd(BUNDLE_EXISTS)
			let fileExists = response[0]
			if (fileExists) {
				console.log("Bundle exists, returning cached bundle to client...")
				console.timeEnd(BUILD_TOTAL)
				res.end(file.metadata.mediaLink)
				return true
			} else {
				console.log("Bundle does not exist...")
				return generateBundle()
			}
		})
	}

	function generateBundle() {
		console.time(GENERATE_BUNDLE)
		return exec(`mkdir -p ${tmpDirParent}`)
		.then(() => {
			console.time(DOWNLOAD_PROJECT)
			// return exec(`gsutil -m cp -r "${projectURL}" "${tmpDirParent}"`)
			return writeProjectFileTreeToDisk(projectId)
		})
		.then(() => {
			console.timeEnd(DOWNLOAD_PROJECT)
			console.time(INSTALL)
			// console.log("Installing packages with yarn...")
			// return exec(`yarn install`, {cwd: tmpDir})
			return installPackages()
		})
		.then(() => {
			console.timeEnd(INSTALL)
			console.time(BROWSERIFY)
			console.log("Generating bundle with browserify...")
			let b = browserify(`${tmpDir}/index.js`, {
				basedir: tmpDir,
				paths: tmpDir + '/' + 'node_modules'
			})
			return createBundle(b)
		})
		.then((bundleContents) => {
			console.timeEnd(BROWSERIFY)
			console.time(UPLOAD_BUNDLE)
			console.log("Uploading bundle to GCS...")
			return file.save(bundleContents)
		})
		.then(() => {
			console.timeEnd(UPLOAD_BUNDLE)
			console.timeEnd(GENERATE_BUNDLE)
			
			let bundleURL = buildMediaLink(projectHash, projectId)
			console.log("Build complete. Bundle URL:\n", bundleURL)
			console.timeEnd(BUILD_TOTAL)
			res.end(bundleURL)
			return true
		})
		.catch(function (err) {
			res.status = 500
			console.log(err)
			res.end("ERROR: something went wrong...")
		})
	}

	function buildMediaLink(hash, projId) {
		let bundleName = encodeURIComponent(`${bundlePathPrefix}/${hash}`)
		let mediaLink = `https://www.googleapis.com/download/storage/v1/b/${bucketName}/o/${bundleName}?alt=media`
		console.log("Built mediaLink...", mediaLink)
		return mediaLink
	}

	function generateProjectHash(files) {
		console.log("Concatting & hashing md5s fetched from GCS...")
		console.time(HASH)
		// console.log(files.map((file) => file.name))
		console.log(files.map((file) => file.name))
		
		let concattedHashes = files
			.filter((file) => (file.kind = 'storage#object'))
			.map((file) => file.metadata.md5Hash)
			.sort().join('')

		projectHash = h32(concattedHashes, 0xABCD).toString(36)
		console.log('Generated project hash...', projectHash)
		console.timeEnd(HASH)
		return projectHash
	}
	
	function writeProjectFileTreeToDisk(projectId) {
		console.log("Writing file tree to disk...")

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
						return writeFile({
							name: tmpDirParent + '/' + obj.name,
							contents: data[0] 
						})
					})
				})
			)
		})
	}

	function writeFile({name, contents}) {
		console.log("Writing file to disk..", name)
		return new Promise((resolve, reject) => {
			fsPath.writeFile(name, contents, (err) => {
				return err ? reject("error in fsPath.writeFile: ", err) : resolve(true)
			})
		})
	}

	function installPackages() {
		console.log("Installing packages with NPMI...")
		return new Promise((resolve, reject) => {
			npmi({path: tmpDir}, (err, result) => {
				return err ? reject("NPMI error: ", err) : resolve(true)
			})
		})
	}

	function createBundle(b) {
		console.log("Bundling with browserify..")
		return new Promise((resolve, reject) => {
			b.bundle((err, buf) => {
				return err ? reject("error in browserify: ", err) : resolve(buf)
			})
		})	
	}
}