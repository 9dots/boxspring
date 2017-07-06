import querystring from 'querystring'

export default {
	
	listObjects({bucket, prefix}) {
		let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
		let params = {
			prefix: prefix
		}
		url += querystring.stringify(params)

		return fetch(url)
			.then(response => response.json())
			.then(result => result.items)
			.catch(err => console.log("Error making GCS list request", err))
	},

	getMedia(file) {
		console.log("GCS downloading media...", file.name)
		return fetch(file.mediaLink)
			.catch(err => console.log("Error making GCS media request", err))
	},

	insertObject({bucket, name, contents}) {
		console.log("GCS Inserting object...")
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
	},
}