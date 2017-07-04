/**
 * Imports
 */

import querystring from 'querystring'
import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
// import createAction from '@f/create-action'

/**
 * <File Manager/>
 */

function gcsListObjects(bucket, projectId, path) {
	console.log("GCS LIST OBJECTS")
	let GCS_URL = `https://www.googleapis.com/storage/v1/b/${bucket}/o?`
	let options = {
		prefix: (path ? `${projectId}/${path}` : projectId),
	}
	GCS_URL += querystring.stringify(options)

	console.log(GCS_URL)

	return fetch(GCS_URL)
	.then(function(response) { 
		return response.json()
	}).then(function(result) {
		return result.items
	}).catch(function(err) {
		console.log("Error making GCS list request", err)
	})
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
		}
	},

	reducer: {
		setFileTree(state, objects) {
			return {fileTree: objects}
		}
	},

	render ({props, actions, state, context}) {
		console.log("FileManager#render: state = ", state)
		let {fileTree} = state
		let {files} = props

		console.log("FILE TREE", fileTree)

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
          <GameButton onClick={context.createFile} bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black">
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
