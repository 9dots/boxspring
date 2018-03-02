import querystring from 'querystring'
import mapValues from '@f/map-values'
import {push, set, update} from 'vdux-fire'
import firebase from 'firebase'

let server = "http://localhost:8082"

const DEFAULT_APP_BUNDLE_NAME = ""

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

function * createAppBundleOnServer(projectId, fileTree){
	console.log("GCS Getting App Bundle on Server")

    let srcFiles = fileTree.map((file) => (`src/${file.displayName}`))

	let bundleName = ""
	let url = server + "/createAppBundle"

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "application/json",
		}),
		body: JSON.stringify({
			name:projectId,
			files:JSON.stringify(srcFiles)
		})
	}	

	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => {
			console.log("Error making GCS rewrite request", err)
			return {ok:false, output:err}
	})
}

function * createProjectOnServer(projectId){
	console.log("GCS Creating Project on Server")

	let url = server + "/init"
	let init = {
		method: 'POST',
		body: JSON.stringify({
			name:projectId,
		}),
		headers: new Headers({
		    'Content-Type': 'application/json',
	    }),
	}	

	return yield fetch(url, init)
		.then(response => response.json())
		.catch(err => {
			console.log("Error making GCS rewrite request", err)
			return {ok:false}
		})

}

function * deleteObject({bucket, projectId, filename, fileKey}) {
	console.log("GCS Deleting object...", filename)

	yield set(`projects/${projectId}/src/${fileKey}`, null)
	return yield firebase.storage().ref(`projects/${projectId}/src/${filename}`).delete()
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


/*function * getBundleFromServer(projectId, bundleName=""){
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

}*/

function getObject(file) {
	console.log("GCS downloading object...", file.name)
	// console.log(file)
	return fetch(file.selfLink)
		.catch(err => {
			console.log("Error making GCS dl request", err)
			return {ok:false}
		})

	// return fetch(file.selfLink+"?alt=media")
	// 	.catch(err => console.log("Error making GCS dl request", err))
}

function * insertObject({bucket, projectId, filename, contents}, isFile= true) {
	console.log("GCS Inserting object...", projectId + '/' + filename)
	if(!filename || !projectId){
		console.log("Invalid filename or projectID")
	}

	// if(isFile){
	yield push(`projects/${projectId}/src`, {
		title:filename
	})

	console.log(contents)

	return yield firebase.storage().ref(`projects/${projectId}/src/${filename}`).putString(contents)	
}


function listObjects({bucket, projectId, files}) {
	console.log("GCS listing objects for...", projectId)

    console.log(files)

	return mapValues(file => ({
		displayName:file.title,
		displayPath:'/' + file.title,
		name: projectId+ '/' + file.title,
		selfLink: `https://storage.googleapis.com/${bucket}/projects/${encodeURIComponent(`${projectId}/src/${file.title}`)}`,
	}), files || {})
	// return fetchURLs
}

//oldName and newName are in the format ${projectName}/${fileName}
function * rewriteObject({bucket, oldName, newName, projectId, fileKey}) {
	console.log("GCS Rewriting object to, from...", oldName, newName)

	yield set(`projects/${projectId}/src/${fileKey}`,{title:newName})
	let response = yield getObject({
		selfLink:`https://storage.googleapis.com/${bucket}/projects/${encodeURIComponent(`${projectId}/src/${oldName}`)}`,
		name:oldName,
	})
	if(!(response.ok)){
		console.log("Failed to download file")
	}
	yield firebase.storage().ref(`projects/${projectId}/src/${oldName}`).delete()

	return yield firebase.storage().ref(`projects/${projectId}/src/${newName}`).putString(contents)
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

export default {
	addPkgOnServer,
	createAppBundleOnServer,
	createProjectOnServer,
	deleteObject,
	deletePkgOnServer,
	getObject,
	insertObject,
	listObjects,
	rewriteObject,
	uploadSourceFileToServer,
}






//example of url fetch
	// let url = `https://storage.googleapis.com/${bucket}/`
	// let params = {
	// 	prefix: prefix,
	// 	// delimiter: "/"
	// }
	// url += querystring.stringify(params)
	// // let test = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	// // let testParam = {

	// // }

	// console.log(url)

	// let res = yield fetch(url)
	// 	.then(response => response.json())
	// 	.then(json => {return json})
	// 	.then(result => result.items)
	// 	.catch(err => console.log("Error making GCS list request", err))

	// console.log(res)
	// return res
