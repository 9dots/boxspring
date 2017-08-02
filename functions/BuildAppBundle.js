const browserify = require('browserify')
const npmi = require('npmi')
const exec = require('child-process-promise').exec
const {h32} = require('xxhashjs')
const fsPath = require('fs-path');
const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const bh = require('./BuildHelpers')

module.exports = buildAppBundle

function buildAppBundle(req, res) {
	console.log("buildAppBundle cloud function starting......................")
	res.header('Access-Control-Allow-Origin', '*')
	console.time(bh.TOTAL_BUILD_TIME)
	
	let projectId = req.query.projectId;
	console.log("Building app bundle for project...", projectId)

	const bucketName = 'boxspring-data'
	let bucketURL = `gs://${bucketName}`
	let projectURL = `${bucketURL}/${projectId}`

	let bundlePathPrefix = `bundles/${projectId}`
	const tmpDirParent = `/tmp/boxspring/projects`
	const tmpDir = `${tmpDirParent}/${projectId}`

	let projectHash = ''
	let bundleFile = null
	let bucket = gcs.bucket('boxspring-data');
	let bundleContents = ''
	
	return main()
	function main() {

		console.log("Getting metadata for all files in project from GCS...")
		console.time(bh.GET_METADATA)
		return bucket.getFiles({
			prefix: projectId + "/",
		})
		.then((gcsResponse) => {
			console.timeEnd(bh.GET_METADATA)
			let files = gcsResponse[0]
			return generateProjectHash(files)
		})
		.then((hash) => {
			console.log("Checking if bundle already exists...")
			console.time(bh.CHECK_BUNDLE_EXISTS)
			bundleFile = bucket.file(`${bundlePathPrefix}/${hash}.js`)
			return bundleFile.exists()
		})
		.then((response) => {
			console.timeEnd(bh.CHECK_BUNDLE_EXISTS)
			let fileExists = response[0]
			if (fileExists) {
				console.log("Bundle exists, returning cached bundle to client...")
				console.timeEnd(bh.TOTAL_BUILD_TIME)
				res.json({
					resultType: 'mediaLink',
					bundleType: 'app ',
					mediaLink: bundleFile.metadata.mediaLink,
					hash: projectHash
				})
				return true
			} else {
				console.log("Bundle does not exist...")
				return generateBundle()
			}
		})
	}

	function generateBundle() {
		console.time(bh.DOWNLOAD_PROJECT)
		return downloadProjectFiles(projectId)
		.then(() => {
			console.timeEnd(bh.DOWNLOAD_PROJECT)
			console.time(bh.BROWSERIFY)
			console.log("Generating bundle with browserify...")

			let appBundle = browserify(`${tmpDir}/index.js`, {
				basedir: tmpDir,
				bundleExternal: false
			})
			return bh.createBundle(appBundle)
		})
		.then((output) => {
			console.timeEnd(bh.BROWSERIFY)
			
			console.log("Bundle generated...")
			bundleContents = output

			console.timeEnd(bh.TOTAL_BUILD_TIME)

			console.log("Sending bundle to user...")
			console.time(bh.SEND_RESPONSE)
			res.json({
				resultType: 'bundleContents',
				bundleType: 'app',
				contents: bundleContents.toString(),
				hash: projectHash,
			})
			console.timeEnd(bh.SEND_RESPONSE)

			// after we return res to user, we upload to GCS
			console.time(bh.UPLOAD_BUNDLE)
			console.log("Uploading bundle to GCS...")

			let bundleFile = bucket.file(`${bundlePathPrefix}/${projectHash}.js`)
			return bundleFile.save(bundleContents)
		})
		.catch(bh.logAndReturnError)
	}

	function generateProjectHash(files) {
		console.log("Concatting & hashing md5s fetched from GCS...")
		console.time(bh.HASH)
		// console.log(files.map((file) => file.name))
		console.log(files.map((file) => file.name))
		
		let concattedHashes = files
			.filter((file) => (
				(file.kind === 'storage#object') && (file.name !== `${projectId}/package.json`)
			))
			.map((file) => file.metadata.md5Hash)
			.sort().join('')

		projectHash = h32(concattedHashes, 0xABCD).toString(36)
		console.log('Generated project hash...', projectHash)
		console.timeEnd(bh.HASH)
		return projectHash
	}
	
	function downloadProjectFiles(projectId) {
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
						return bh.writeFile({
							name: tmpDirParent + '/' + obj.name,
							contents: data[0] 
						})
					})
				})
			)
		})
	}
}