/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
import FileNameModal from 'components/FileNameModal'
import ConfirmModal from 'components/ConfirmModal'
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
      let fileTree = yield gcs.listObjects({
        bucket: context.BUCKET_NAME,
        projectId: context.projectId,
      })
      console.log(fileTree)
      yield props.onFileTreeDownload(fileTree)
    },

    * createFile({actions, context}, {filename}) {
      console.log("Creating file...")
      // todo: check if that file already exists

      // todo: add as validator
      // insert empty file with name to GCS
      yield gcs.insertObject({
        bucket: context.BUCKET_NAME,
        name: context.projectId + "/" + filename,
        contents: ""
      })

      yield actions.loadFileTree()
    },
    
    * deleteFile({actions, context}, name) {
      console.log("Deleting file...")
      
      // todo: check if that file already exists
      // todo: add as validator
      // insert empty file with name to GCS
      yield gcs.deleteObject({
        bucket: context.BUCKET_NAME,
        projectId:context.projectId,
        filename: name,
      })

      yield actions.loadFileTree()
    },

    * renameFile({actions, context}, oldName, {filename}) {
      console.log("Renaming file...", oldName, filename)
      // todo: check if file already exists

      // todo: add as validator
      // insert empty file with name to GCS
      yield gcs.rewriteObject({
        bucket: context.BUCKET_NAME,
        oldName: oldName,
        newName: context.projectId + "/" + filename
      })

      yield gcs.deleteObject({
        bucket: context.BUCKET_NAME,
        name: oldName,
      })

      yield actions.loadFileTree()
    },

    * downloadFile({actions, props}, file) {
      // console.log("In downloadFile...", file.name)
      let response = yield gcs.getObject(file)

      file.contents = yield response.text()
        .catch(err => console.log("Error getting text from GCS response", err))

      yield props.onFileDownload(file)
    },
    
    * openModalToCreateFile({props, context, actions}) {
      yield context.openModal(() => <FileNameModal
        label="Choose a file name"
        field="filename"
        onSubmit={actions.createFile}
        submitMessage="Create"
        name="filename"
        dismiss={context.closeModal()}
        value=""
        textarea={false}
        actionType="input"
      />)
    },

    * openModalToDeleteFile({props, context, actions}, file) {
      yield context.openModal(() => <ConfirmModal
      label={`Are you sure you want to delete '${file.displayPath}' ?`}
      field="filename"
      onSubmit={actions.deleteFile(file.name)}
      submitMessage="Delete"
      name="filename"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="confirm"
      />)
    },

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
  },

  render ({props, actions, state, context}) {
    let {files, fileTree} = props

    return !fileTree ? <ul>Loading...</ul> : (
      <Block
        id="file-manager"
        backgroundColor={props.backgroundColor} 
        borderLeft borderBottom borderWidth={1} borderColor="#aaa"
        fontSize={props.fontSize}
        tall w={props.w} p={3}>
        <Flex align='space-between center' h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "20px"}}>Files</h2>
          <GameButton onClick={actions.openModalToCreateFile} bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black">
            <Icon fs='inherit' bolder name='note_add' mr='5px'/>
            New File
          </GameButton>
        </Flex>
        <Block id="fileTree" fs="14px" h="85vh"> 
          { fileTree.map(file => (<FileListing 
                        file={file}
                        mb="1px"
                        hoverProps={{hovering: true, bgColor: "#c0e8ff"}}
                        downloadFile={actions.downloadFile}
                        renamePressed={actions.openModalToRenameFile} 
                        deletePressed={actions.openModalToDeleteFile} 
                      />))}  
        </Block>
      </Block>
    )
  }
})
