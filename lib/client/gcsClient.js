import querystring from 'querystring'

export default {
	
	listObjects({bucket, projectId, path}) {
		let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
		let params = {
			prefix: (path ? `${projectId}/${path}` : projectId),
		}
		url += querystring.stringify(params)

		return fetch(url)
			.then(response => response.json())
			.then(result => result.items)
			.catch(err => console.log("Error making GCS list request", err))
	},

	getObject({bucket, projectId, name}) {
		console.log("GCS getting object...", name)
		let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`
		return fetch(url)
			.then(response => response.json())
			.catch(err => console.log("Error making GCS get request", err))
	},

	getMedia(file) {
		console.log("GCS downloading media...", file.name)
		return fetch(file.mediaLink)
			.then(response => response.blob())
			.catch(err => console.log("Error making GCS media request", err))
	},

	insertObject({bucket, projectId, name, path, body}) {
		console.log("GCS Inserting object...")
		let url = `https://www.googleapis.com/upload/storage/v1/b/${bucket}/o?`
		let params = {
			name: (path ? `${projectId}${path}${name}` : `${projectId}/${name}`),
			uploadType: 'media',
		}
		url += querystring.stringify(params)

		let init = {
			method: 'POST',
			headers: new Headers({
			  "Content-Type": "text/plain",
			  "Content-Length": body.length.toString(),
			}),
			body: body
		}

		return fetch(url, init)
			.then(response => response.json())
			// .then(json => console.log(json))
			.catch(err => console.log("Error making GCS insert request", err))
	},
}