const fsPath = require('fs-path');

module.exports = {
  
  logAndReturnError(res, err) {
    let errmsg = "Error in cloud function: " + err.message + err.stack
    res.status(500).end(errmsg)
  },

  writeFile({name, contents}) {
    console.log("Writing file to disk..", name)
    return new Promise((resolve, reject) => {
      fsPath.writeFile(name, contents, (err) => {
        console.log("error in fsPath.writeFile:", err)
        return err ? reject(err) : resolve(true)
      })
    })
  },

  createBundle(b) {
    console.log("Bundling with browserify..")
    return new Promise((resolve, reject) => {
      b.bundle((err, buf) => {
        console.log("Error occurred while running browserify: ", err)
        return err ? reject('browserify') : resolve(buf)
      })
    })  
  },

  TOTAL_BUILD_TIME: "TOTAL_BUILD_TIME",

  GET_METADATA: "GET_METADATA",

  HASH: "HASH",

  CHECK_BUNDLE_EXISTS: "CHECK_BUNDLE_EXISTS",

  DOWNLOAD_PROJECT: "DOWNLOAD_PROJECT",

  BROWSERIFY: "BROWSERIFY",

  UPLOAD_BUNDLE: "UPLOAD_BUNDLE",

  SEND_RESPONSE: "SEND_RESPONSE",

  GET_PACKAGE_JSON: "GET_PACKAGE_JSON",

  INSTALL_DEPENDENCIES: "INSTALL_DEPENDENCIES",

  UPLOAD_BUNDLE:  "UPLOAD_BUNDLE"
}