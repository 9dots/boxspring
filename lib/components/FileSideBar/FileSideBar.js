/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileManager from 'components/FileManager'
import PackageManager from 'components/PackageManager'
import gcs from 'client/gcsClient.js'
import fire from 'vdux-fire'

/**
 * <File Side Bar/>
 */


export default fire((props) => ({
  files: `/projects/${props.keyId}/files`          //oldProjects={welcome:username of email projectList:contains keys of projects={date:date project was made in microseconds projectName:name of project}}
}))(component({

  initialState: {
    ready:false,
    fileTree: [],
    files: {},
  },

  //onCreate
  //function: checks whether or not the files from firebase have loaded in and tries to load the file tree if they're ready
  * onCreate({state, props, actions}) {
  },

  controller: {

    //loadFileTree
    //function: uses props.files to generate the list of files to grab using gcs. Sets state.ready to true after it has finished loading the file tree
    * loadFileTree({props, actions, context}) {

      let fileTree = gcs.listObjects({
              bucket: context.BUCKET_NAME,
              prefix: context.projectId + "/",
              files: props.files.value
            })
      yield props.onFileTreeDownload(fileTree)
      yield actions.setReady(true)
    },
    //pens a modal that allows you to rename a file by entering the name.
    * openModalToRenameFile({props, context, actions}, file) {
      yield context.openModal(() => <FileNameModal
      label={`Enter a new name for ${file.displayPath}`}
      field="filename"
      onSubmit={actions.renameFile(file.name)}
      submitMessage="Rename"
      name="filename"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="input"
      />)
    },

    //openModalToCreateFile
    //function: opens a modal that allows you to upload and preview an image
    * openModalToAddPictures({props, context, actions}) {
      yield context.openModal(() => <MediaUploadModal
      label={`Upload a picture file ('.jpg', '.png', '.gif')`}
      field="filename"
      onSubmit={actions.uploadFile}
      submitMessage="Upload"
      name="filename"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="input"
      />)
    }
  },

  reducer:{
    setReady: (state, ready) => {
      return {ready}
    }
  },

  render ({props, actions, state, context}) {
    let {files, fileTree, activeFile} = props
    var buttonJSX = (<span/>)
    var displayedFile = activeFile ? activeFile.substring(props.activeFile.indexOf('/') + 1) : ''
    return (
    	<Block
    	 	id="sideBar"
    		borderRight
        borderColor="#8e8e8e"
        borderWidth={2}
    	 	column
        w={props.w}
	 		>
  			<FileManager
  				wide
  				h="40%"
  				fontSize="12px"
  				backgroundColor="#fff"
  				getFileContentsFromName={props.getFileContentsFromName}
  				onFileDownload={props.onFileDownload}
  				onFileDelete={props.onFileDelete}
  				onFileTreeDownload={props.onFileTreeDownload}
  				setActiveFile={props.setActiveFile}
  				fileTree={props.fileTree}
  				keyId={props.keyId}
  				activeFile={props.activeFile}
  			/>
        <PackageManager
  				wide
  				h="60%"
  				fontSize="12px"
  				backgroundColor="#fff"
  				project={props.project}
          setBundleName={props.setBundleName}
      	/>
    	</Block>
    )
  }
}))
