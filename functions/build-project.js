const exec = require('child-process-promise').exec
const {h32} = require('xxhashjs')
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
const YARN ="YARN"
const BROWSERIFY = "BROWSERIFY"
const UPLOAD_BUNDLE = "UPLOAD_BUNDLE"
const BUILD_URL = "BUILD_URL"
const SEND_RESPONSE = "SEND_RESPONSE"

function buildProject(req, res) {
	console.log("Cloud function starting.....................................")
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
	
	main()
	function main() {

		console.log("Getting metadata for all files in project from GCS...")
		console.time(GET_METADATA)
		let bucket = gcs.bucket('boxspring-data');
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
			return exec(`gsutil -m cp -r "${projectURL}" "${tmpDirParent}"`)
		})
		.then(() => {
			console.timeEnd(DOWNLOAD_PROJECT)
			console.time(YARN)
			console.log("Installing packages with yarn...")
			return exec(`yarn install`, {cwd: tmpDir})
		})
		.then(() => {
			console.timeEnd(YARN)
			console.time(BROWSERIFY)
			console.log("Generating bundle with browserify...")
			return exec(`browserify index.js > bundle.js`, {cwd: tmpDir})
		})
		.then(() => {
			console.timeEnd(BROWSERIFY)
			console.time(UPLOAD_BUNDLE)
			console.log("Uploading bundle to GCS...")
			return exec(`gsutil cp bundle.js "${bucketURL}/${bundlePathPrefix}/${projectHash}"`,
				{cwd: tmpDir}
			)
		})
		.then(() => {
			console.timeEnd(UPLOAD_BUNDLE)
			console.timeEnd(GENERATE_BUNDLE)
			
			let bundleURL = buildMediaLink(projectHash, projectId)
			console.log("Build complete. Bundle URL:\n", bundleURL)
			res.end(bundleURL)

			console.timeEnd(BUILD_TOTAL)
		})
		.catch(function (err) {
			res.status = 500
			console.log(err)
			res.end("ERROR: something went wrong...")
		})
	}

	function buildMediaLink(hash, projId) {
		let bundleName = encodeURIComponent(
			`${bundlePathPrefix}/${hash}`
		)
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
}


// // later for node_modules sync
// // gsutil -m rsync -d -r /tmp/boxspring/bundles/projectId/node_modules gs://boxspring-data/packages/projectId/node_modules