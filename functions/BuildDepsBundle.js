const browserify = require('browserify')
const npmi = require('npmi')
const exec = require('child-process-promise').exec
const {h32} = require('xxhashjs')
const fsPath = require('fs-path');
const gcs = require('@google-cloud/storage')({
  keyFilename: __dirname + '/gcs-key.json'
});
const bh = require('./BuildHelpers')

module.exports = buildDepsBundle

function buildDepsBundle(req, res) {
  console.log("buildDepsBundle cloud function starting............")
  res.header('Access-Control-Allow-Origin', '*')
  console.time(bh.TOTAL_BUILD_TIME)
  
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
    console.time(bh.GET_PACKAGE_JSON)

    packageJSONFile = bucket.file(`${projectId}/package.json`)


    return packageJSONFile.download()
    .then((response) => { 
      console.timeEnd(bh.GET_PACKAGE_JSON)

      // get package.json contents from response      
      let contents = response[0]
      let textContents = contents.toString()

      if (textContents === "Not Found")
        throw packageJSONFile.name + ": FILE NOT FOUND"
      
      // parse and hash package.json 
      console.log(textContents)
      packageHash = h32(textContents, 0xABCD).toString(36)
      console.log('Generated package hash...', packageHash)

      let pkg = JSON.parse(textContents)
      deps = Object.keys(pkg.dependencies)
      console.log(deps)
      
      // write package json to disk
      return bh.writeFile({
        name: `${tmpDirParent}/${packageJSONFile.name}`,
        contents: contents
      })
    })
    .then(() => {
      console.time(bh.INSTALL_DEPENDENCIES)
      return installPackages().catch((err) => {
        if (err.statusCode == 404) {
          console.log("Detected erroneous module name in package.json")
          res.status(400).end("Detected erroneous module name in package.json")
        } else {
          console.log("Server failed while installing modules")
          res.status(500).end("Server failed while installing modules")
        }
        throw err
      })
    })
    .then(() => {
      console.timeEnd(bh.INSTALL_DEPENDENCIES)

      console.log("Generating bundle with browserify...")
      console.time(bh.BROWSERIFY)
      let depsBundle = browserify({
        basedir: tmpDir,
        paths: `${tmpDir}/node_modules`
      })
      .require(deps)
      return bh.createBundle(depsBundle)
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
        bundleType: 'deps',
        contents: bundleContents.toString(),
        hash: packageHash,
      })
      console.timeEnd(bh.SEND_RESPONSE)

      // after we return res to user, we upload to GCS
      console.time(bh.UPLOAD_BUNDLE)
      console.log("Uploading bundle to GCS...")

      let bundleFileName = `${bundlePathPrefix}/${packageHash}.js`
      console.log("Uploading bundle as", bundleFileName)
      let bundleFile = bucket.file(bundleFileName)
      return bundleFile.save(bundleContents)
    })
    .then(() => {
      console.timeEnd(bh.UPLOAD_BUNDLE)

      // TODO: Delete node_modules folder??

      return true
    })
    .catch((err) => {
      if (err == 'browserify') {
        res.status(400).end('Invalid module name detected')
      } else {
        bh.logAndReturnError(res, err)
      }
    })
  }
  
  function installPackages() {
    console.log("Installing packages with NPMI...")
    return new Promise((resolve, reject) => {
      npmi({path: tmpDir}, (err, result) => {
        if (err) {
          console.log("NPMI Error occurred:")
          console.log(err.code)
          console.log(err.statusCode)
          return reject(err)
        } else {
          return resolve(true)
        }
      })
    })
  }
}