import querystring from 'querystring'
import mapValues from '@f/map-values'
import {push, set, update} from 'vdux-fire'

let server = "http://localhost:8082"

const DEFAULT_APP_BUNDLE_NAME = ""

function listObjects({bucket, prefix, files}) {

	// let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	// let params = {
	// 	prefix: prefix,
	// 	// delimiter: "/"
	// }
	// url += querystring.stringify(params)
	// let test = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	// let testParam = {

	// }
	// return fetch(url)
	// 	.then(response => response.json())
	// 	.then(json => {return json})
	// 	.then(result => result.items)
	// 	.catch(err => console.log("Error making GCS list request", err))
	// let fetchURLs = []
	// for(var file in files){
	// 	fetchURLs.push({
			
	// 	})
	// }
	// console.log(fetchURLs)
	console.log("GCS listing objects for...", prefix)

	return mapValues(file => ({
		displayName:file.title,
		displayPath:'/' + file.title,
		name: prefix + file.title,
		selfLink: `https://www.googleapis.com/storage/v1/b/${bucket}/o/` + encodeURIComponent(`${prefix}${file.title}`),
	}), files || {})
	// return fetchURLs
}

function getObjectByName(name) {
	return true
}

function getObject(file) {
	//https://firebasestorage.googleapis.com/v0/b/dummyboxspring.appspot.com/o/test%2Ftest.txt?alt=media&token=349c7530-b22c-4243-9b5f-81210a34ac56
	//https://firebasestorage.googleapis.com/v0/b/dummyboxspring.appspot.com/o/test%2Ftest2.txt?alt=media&token=a821e625-660b-48ff-a063-6224f539179f
	//console.log(app.ref('/test/test2.txt').getMetadata())
	console.log("GCS downloading object...", file.name)
	// console.log(file)
	return fetch(file.selfLink+"?alt=media")
		.catch(err => console.log("Error making GCS dl request", err))
}

function fetchBundleByHash(hash, projId) {

	// construct bundle GCS media link (may not exist)
  let bucketName = 'boxspring-data'
  let bundlePathPrefix = `bundles/${projId}`
  let bundleName = encodeURIComponent(`${bundlePathPrefix}/${hash}.js`)
  let mediaLink = `https://www.googleapis.com/download/storage/v1/b/${bucketName}/o/${bundleName}?alt=media`
  // console.log("Built mediaLink...", mediaLink)

  // attempt to download
  return fetch(mediaLink)
	  .then((response) => {
	  	return response.ok ? response.text() : null
	  })
	  .catch((err) => { console.log(err); return null })
}

function * insertObject({bucket, name, contents}, isFile= true) {
	console.log("GCS Inserting object...", name)
	var slashIndex = name.indexOf('/')
	var projectName = name.substring(0,slashIndex)

	if(isFile){
		yield push(`projects/${projectName}/files`, {
			title:name.substring(slashIndex + 1)
		})
	}
	// app.ref().push().set({title:name.substring(slashIndex + 1)})
	
	let url = `https://www.googleapis.com/upload/storage/v1/b/${bucket}/o?`
	let params = {
		name: name,
		uploadType: 'media',
	}

	url += querystring.stringify(params)
	console.log(contents)
	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "text/plain",
		  "Content-Length": contents.length.toString(),
		}),
		body: contents
	}

	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS insert request", err))
	
}
/*function insertImage({bucket, name, contents, type}) {
	console.log()
	console.log("GCS Inserting object...", name)
	let url = `https://www.googleapis.com/upload/storage/v1/b/${bucket}/o?`
	let params = {
		name: name,
		uploadType: 'media',
	}
	url += querystring.stringify(params)

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "image/jpeg",
		  "Content-Length": contents.length.toString(),
		}),
		body: contents
	}

	return fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS insert request", err))
}*/

function * deleteObject({bucket, name, fileKey}) {
	console.log("GCS Deleting object...", name)
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`
	var slashIndex = name.indexOf('/')
	var projectName = name.substring(0,slashIndex)
	yield set(`projects/${projectName}/files/${fileKey}`, null)

	return yield fetch(url, { method: 'DELETE'})
		.catch(err => console.log("Error making GCS delete request", err))
}

//oldName and newName are in the format ${projectName}/${fileName}
function * rewriteObject({bucket, oldName, newName, fileKey}) {
	// console.log("GCS Rewriting object to, from...", oldName, newName)
	var slashIndex = newName.indexOf('/')
	var projectName = newName.substring(0,slashIndex)
	var fileName = newName.substring(slashIndex + 1)

	yield set(`projects/${projectName}/files/${fileKey}`,{title:fileName})

	oldName = encodeURIComponent(oldName)
	newName = encodeURIComponent(newName)
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o/${oldName}/rewriteTo/b/${bucket}/o/${newName}`
	return yield fetch(url, { method: 'POST'})
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))
}
function * createProjectOnServer(projectId){
	console.log("GCS Creating Project on Server")

	let url = server + "/init"

	let init = {
		method: 'POST',
		body: JSON.stringify({name:projectId}),
		headers: new Headers({
		    'Content-Type': 'application/json',
	    }),
	}	

	console.log(init)
	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))

}

function * addPkgOnServer(projectId, pkg){
	console.log("GCS Adding Package on Server")

	let url = server + "/add"

	let init = {
		method: 'POST',
		body: JSON.stringify({
			name:projectId,
			pkg:pkg,
		}),
		headers: new Headers({
		    'Content-Type': 'application/json',
	    }),
	}	


	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))

}

function * deletePkgOnServer(projectId, pkg){
	console.log("GCS Deleting Package on Server")

	let url = server + "/remove"

	let init = {
		method: 'POST',
		body: JSON.stringify({
			name:projectId,
			pkg:pkg,
		}),
		headers: new Headers({
		    'Content-Type': 'application/json',
	    }),
	}	


	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))

}

function * getBundleFromServer(projectId, bundleName=""){
	console.log("GCS Getting Project Bundle on Server")

	let url = server + "/getBundle"

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "application/json",
		}),
		body: JSON.stringify({
			name:projectId,
			bundle:bundleName,
		})
	}	

	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))

}

function * uploadSourceFileToServer(projectId, fileName, fileContent){
	console.log("GCS Uploading File to Server")
	let url = server + "/uploadSource"

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "application/json",
		}),
		body: JSON.stringify({
			name:projectId,
			fileName,
			content:fileContent
		})
	}	

	let {ok, bundle} = yield fetch(url, init)
		.then(response => response.json())
		.catch(err => {
			console.log("Error making GCS rewrite request", err)
			return {ok:false, output:err}
		})

	if(!ok)
		return {ok:false, output:"Failed to upload file to server"}

	return {ok:true, output:"Succesfully added file"}
}

function * getAppBundleFromServer(projectId, firstBundle=true){
	console.log("GCS Getting App Bundle on Server")
	let bundleName = ""
	if(firstBundle){
		let url = server + "/createAppBundle"

		let init = {
			method: 'POST',
			headers: new Headers({
			  "Content-Type": "application/json",
			}),
			body: JSON.stringify({
				name:projectId,
			})
		}	

		let {ok, bundle, output} = yield fetch(url, init)
			.then(response => response.json())
			.catch(err => {
				console.log("Error making GCS rewrite request", err)
				return {ok:false, output:err}
		})
		if(!ok)
			return {ok:false, output}
		bundleName = bundle
	}

	let url = server + "/getAppBundle"

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "application/json",
		}),
		body: JSON.stringify({
			name:projectId,
			bundle:bundleName,
		})
	}	

	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))
}
export default {
	addPkgOnServer,
	createProjectOnServer,
	deleteObject,
	deletePkgOnServer,
	fetchBundleByHash,
	getAppBundleFromServer,
	getBundleFromServer,
	getObject,
	insertObject,
	listObjects,
	rewriteObject,
	uploadSourceFileToServer,
}