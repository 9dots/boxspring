import querystring from 'querystring'

function listObjects({bucket, prefix}) {
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	let params = {
		prefix: prefix,
		// delimiter: "/"
	}
	url += querystring.stringify(params)

	return fetch(url)
		.then(response => response.json())
		.then(json => {console.log(json); return json})
		.then(result => result.items)
		.catch(err => console.log("Error making GCS list request", err))
}

function getMedia(file) {
	// console.log("GCS downloading media...", file.name)
	return fetch(file.mediaLink)
		.catch(err => console.log("Error making GCS media request", err))
}

function insertObject({bucket, name, contents}) {
	// console.log("GCS Inserting object...", name)
	let url = `https://www.googleapis.com/upload/storage/v1/b/${bucket}/o?`
	let params = {
		name: name,
		uploadType: 'media',
	}
	url += querystring.stringify(params)

	let init = {
		method: 'POST',
		headers: new Headers({
		  "Content-Type": "text/plain",
		  "Content-Length": contents.length.toString(),
		}),
		body: contents
	}

	return fetch(url, init)
		.then(response => response.json())
		.catch(err => console.log("Error making GCS insert request", err))
}

function deleteObject({bucket, name}) {
	// console.log("GCS Deleting object...", name)
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`

	return fetch(url, { method: 'DELETE'})
		.catch(err => console.log("Error making GCS delete request", err))
}

function rewriteObject({bucket, oldName, newName}) {
	// console.log("GCS Rewriting object to, from...", oldName, newName)
	oldName = encodeURIComponent(oldName)
	newName = encodeURIComponent(newName)
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o/${oldName}/rewriteTo/b/${bucket}/o/${newName}`

	return fetch(url, { method: 'POST'})
		.then(response => response.json())
		.catch(err => console.log("Error making GCS rewrite request", err))
}

export default {
	listObjects,
	getMedia,
	insertObject,
	deleteObject,
	rewriteObject
}