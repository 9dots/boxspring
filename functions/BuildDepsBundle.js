const browserify = require('browserify')
const npmi = require('npmi')
const exec = require('child-process-promise').exec
const {h32} = require('xxhashjs')
const fsPath = require('fs-path');
const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});

module.exports = buildDepsBundle

const TOTAL_BUILD_TIME = "TOTAL_BUILD_TIME"
const GET_PACKAGE_JSON ="GET_PACKAGE_JSON"
const INSTALL_DEPENDENCIES ="INSTALL_DEPENDENCIES"
const BROWSERIFY = "BROWSERIFY"
const UPLOAD_BUNDLE = "UPLOAD_BUNDLE"
const SEND_RESPONSE = "SEND_RESPONSE"

function buildDepsBundle(req, res) {
	console.log("buildDepsBundle cloud function starting.....................................")
	res.header('Access-Control-Allow-Origin', '*')
	console.time(TOTAL_BUILD_TIME)
	
	let projectId = req.query.projectId;
	console.log("Building dependencies for project...", projectId)

	const bucketName = 'boxspring-data'
	let bucketURL = `gs://${bucketName}`
	let projectURL = `${bucketURL}/${projectId}`

	let bundlePathPrefix = `bundles/${projectId}`
	const tmpDirParent = `/tmp/boxspring/projects`
	const tmpDir = `${tmpDirParent}/${projectId}`

	let bucket = gcs.bucket('boxspring-data');
	let packageJSONFile = null
	let packageHash = ''
	let deps = []
	let bundleContents = ''
	
	return main()

	function main() {
		console.log("Downloading project package.json from GCS...")
		console.time(GET_PACKAGE_JSON)

		packageJSONFile = bucket.file(`${projectId}/package.json`)

		return packageJSONFile.download()
		.then((response) => { 
			console.timeEnd(GET_PACKAGE_JSON)

			// get package.json contents from response			
			let contents = response[0]
			let textContents = contents.toString()

			if (textContents === "Not Found")
				throw packageJSONFile.name + ": FILE NOT FOUND"
			
			// parse and hash package.json 
			console.log(textContents)
			let pkg = JSON.parse(textContents)
			packageHash = h32(textContents, 0xABCD).toString(36)
			console.log('Generated package hash...', packageHash)

			deps = Object.keys(pkg.dependencies)
			console.log(deps)
			
			// write package json to disk
			return writeFile({
				name: `${tmpDirParent}/${packageJSONFile.name}`,
				contents: contents
			})
		})
		.then(() => {
			console.time(INSTALL_DEPENDENCIES)
			return installPackages()
		})
		.then(() => {
			console.timeEnd(INSTALL_DEPENDENCIES)
			
			console.log("Generating bundle with browserify...")
			console.time(BROWSERIFY)
			let depsBundle = browserify({
				basedir: tmpDir,
				paths: `${tmpDir}/node_modules`
			})
			.require(deps)
			return createBundle(depsBundle)
		})
		.then((output) => {
			console.timeEnd(BROWSERIFY)
			console.log("Bundle generated...")
			bundleContents = output

			console.timeEnd(TOTAL_BUILD_TIME)

			console.log("Sending bundle to user...")
			console.time(SEND_RESPONSE)
			res.json({
				bundleType: 'deps',
				bundleHash: packageHash,
				bundleContents: bundleContents
			})
			console.timeEnd(SEND_RESPONSE)

			// after we return res to user, we upload to GCS
			console.time(UPLOAD_BUNDLE)
			console.log("Uploading bundle to GCS...")

			let bundleFile = bucket.file(`${bundlePathPrefix}/${packageHash}.js`)
			return bundleFile.save(bundleContents)
		})
		.then(() => {
			console.timeEnd(UPLOAD_BUNDLE)

			// TODO: Delete node_modules folder??

			return true
		})
		.catch(function (err) {
			let errmsg = "Error in cloud function buildDepsBundle: " + err.message + err.stack
			console.log(errmsg)
			res.status(500).end(errmsg)
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
		console.log("In createBundle...")
		return new Promise((resolve, reject) => {
			b.bundle((err, buf) => {
				return err ? reject("error in browserify: ", err) : resolve(buf)
			})
		})	
	}
}