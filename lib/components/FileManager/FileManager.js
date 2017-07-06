/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
import NewFileModal from 'components/NewFileModal'
import gcs from 'client/gcsClient.js'

/**
 * <File Manager/>
 */

export default component({

	initialState: {
		fileTree: [],
		files: {}
	},

	* onCreate({state, props, actions}) {
		// console.log("Creating FileManager component")
		yield actions.loadFileTree()
	},

	controller: {
		// triggered when page loads and when files created or deleted
		* loadFileTree({props, actions, context}) {
			let projectId = "p123"
			let fileTree = yield gcs.listObjects({
				bucket: context.BUCKET_NAME, 
				prefix: projectId
			})
			// console.log("fileTree contents = ", fileTree)
			yield props.onFileTreeDownload(fileTree)
		},

		* createFile({actions, context}, {filename}) {
			console.log("Creating file...")
			// todo: check if that file already exists

			// todo: add as validator
			let projectId = "p123"
			// insert empty file with name to GCS
			yield gcs.insertObject({
				bucket: context.BUCKET_NAME,
				name: projectId + "/" + filename,
				contents: ""
			})

			yield actions.loadFileTree()
		},

		* downloadFile({actions, props}, file) {
			console.log("In downloadFile...", file)
			let response = yield gcs.getMedia(file)
			
			if (!(file.contentType.startsWith('text') || file.contentType.startsWith('application'))) {
        console.log("Binary File Detected ... Not Yet Supported...")
        // return
      }

      file.contents = yield response.text()
      	.catch(err => console.log("Error getting text from GCS response", err))

      console.log(file)

			yield props.onFileDownload(file)
		},

		* createNewFileModal({props, context, actions}) {
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

	render ({props, actions, state, context}) {
		let {files, fileTree} = props

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
					<ul style={{listStyleType: "none", paddingLeft: "3px"}}>
						{fileTree.map(file => <FileListing file={file} downloadFile={actions.downloadFile}/>)}
					</ul>
				</Block>
			</Block>
		)
	}
})
