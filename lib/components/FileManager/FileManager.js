/**
 * Imports
 */

import querystring from 'querystring'
import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
import NewFileModal from 'components/NewFileModal'


/**
 * <File Manager/>
 */

function gcsListObjects(bucket, projectId, path) {
	let url = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	let params = {
		prefix: (path ? `${projectId}/${path}` : projectId),
	}
	url += querystring.stringify(params)

	return fetch(url)
		.then(response => response.json())
		.then(result => result.items)
		.catch(err => console.log("Error making GCS list request", err))
}

function gcsInsertObject({bucket, projectId, name, path, body}) {
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
		.then(json => console.log(json))
		.catch(err => console.log("Error making GCS list request", err))
}

export default component({

	initialState: {
		fileTree: [],
		files: {}
	},

	* onCreate({state, props, actions}) {
		console.log("Creating FileManager component")
		yield actions.loadFileTree()
	},

	controller: {
		// triggered when page loads and when files created or deleted
		* loadFileTree({actions}) {
			let objects = yield gcsListObjects("boxspring-data", "p123")
			console.log("IN loadFileTree:", objects)
			yield actions.setFileTree(objects)
		},

		* createFile({actions}, {filename}) {
			console.log("Creating files...")
			// todo: check if that file already exists

			// todo: add as validator

			// insert empty file with name to GCS
			yield gcsInsertObject({
				bucket: "boxspring-data", 
				projectId: "p123",
				name: filename,
				body: ""
			})

			yield actions.loadFileTree()
		},

		* createNewFileModal({props, context, actions}) {
			console.log("createNewFileModal...")
	  	yield context.openModal(() => <NewFileModal
        label="Choose a file name"
        field="filename"
        onSubmit={actions.createFile}
        submitMessage="Create"
        name="filename"
        dismiss={context.closeModal()}
        value=""
        textarea={false}
      />)
	  }
	},

	reducer: {
		setFileTree(state, objects) {
			return {fileTree: objects}
		}
	},

	render ({props, actions, state, context}) {
		let {fileTree} = state
		let {files} = props

		return !fileTree ? <ul>Loading...</ul> : (
			<Block
				id="file-manager"
				backgroundColor={props.backgroundColor} 
				borderLeft
        borderBottom
				borderWidth={1}
				borderColor="#aaa"
				fontSize={props.fontSize}
				tall
				w={props.w}
				p={3}>
				<Flex align='space-between center' h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "20px"}}>Files</h2>
          <GameButton onClick={actions.createNewFileModal} bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black">
              New
              <Icon fs='inherit' bolder name='note_add' ml='3px'/>
          </GameButton>
        </Flex>
				<Block id="file-tree">
					<ul style={{paddingLeft: "20px"}}>
						{fileTree.map(fid => <li>{fid.name}</li>)}
					</ul>
				</Block>
			</Block>
		)
	}
})
						// {fileTree.map(fid => <FileListing fid={fid} />)}
