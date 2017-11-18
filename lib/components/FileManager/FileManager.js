/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
import FileNameModal from 'components/FileNameModal'
import ConfirmModal from 'components/ConfirmModal'
import MediaUploadModal from 'components/MediaUploadModal'
import gcs from 'client/gcsClient.js'

/**
 * <File Manager/>
 */

 const checkFileType = (fileType) =>{
  console.log(fileType)
  switch(fileType){
    case 'js':
      return 'javascript'
    case 'html':
    case 'json':
      return fileType
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      console.log("need to figure out how to do something for pictures")
      return 'javascript'
    default:
      return ''
  }
 }

export default component({

  initialState: {
    fileTree: [],
    files: {},
    displayedFile:''
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
        prefix: context.projectId + "/",
      })
      // console.log("fileTree contents = ", fileTree)
      yield props.onFileTreeDownload(fileTree)
    },

    * checkNewFileName({context}, filename){
      var fileType = ''
      var result = {passed:false, errorMessage:"Bad File Name: "}
      if(filename){                               //if the filename is empty
        var ids = filename.split('.')            
        if(ids.length > 1)                        //if the file type is the only thing in the name
          fileType = ids[ids.length - 1]
        else{
          result.errorMessage += "File must have name and file type. Example: \"index.html\""
          return result
        }
      } else {
        result.errorMessage += "File name cannot be empty."
        return result
      }
      if(!checkFileType(fileType)){                 //if the file does not have a valid type
        result.errorMessage += "Incorrect file type. Supported types are .html, .js, and .json"
        return result
      }
      result.passed = true
      return result
    },

    * createFile({actions, context, props}, {filename, fileContent}) {
      console.log("Creating file...")
      console.log(filename)
      var content = ""
      if(fileContent){
        content = fileContent
      }
      var goodName = yield actions.checkNewFileName(filename)
      // todo: add as validator
      // insert empty file with name to GCS
      console.log(goodName)
      if(goodName.passed){                                                                  //if the name is fine

        var contentAtFileName = yield props.getFileContentsFromName(context.projectId + "/" + filename)
        if(contentAtFileName == null){                                                      //if the file doesn't exist
          console.log("creating file")
          yield gcs.insertObject({
            bucket: context.BUCKET_NAME,
            name: context.projectId + "/" + filename,
            contents: content
          })
          yield actions.loadFileTree()                                              
        }
        else if(contentAtFileName){                                                           //if there's data at the file location
          console.log("Filename already taken")
        }
        else{
          console.log("Happens when the file is there but empty possibly?")
        }
      } else {
        console.log(goodName.errorMessage)
      }

    },
    
    * deleteFile({actions, props, context}, name) {
      console.log("Deleting file...")
      
      yield props.onFileDelete(name)
      yield props.setActiveFile(null)
      // todo: check if that file already exists
      // todo: add as validator
      // insert empty file with name to GCS
      yield gcs.deleteObject({
        bucket: context.BUCKET_NAME,
        name: name,
      })

      yield actions.loadFileTree()
    },
  /*  * testFileReader({state, actions, props, context}) {
      var input = document.getElementById('imgInp').files
      if(input && input[0]){
          var reader = new FileReader()
          reader.onload = function(e){
            console.log(document.getElementById('testImage'))
            document.getElementById('testImage').width = 50;
            document.getElementById('testImage').src =  e.target.result;
            document.getElementById('testImage').label =  input[0].name;
            console.log(document.getElementById('testImage'))
        }                                 //need to figure out way to wait until src is updated to make the file

        reader.readAsDataURL(input[0])
      }
    },
*/
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

    * uploadFile({actions, props}, {fileSrc, fileName}){
        yield actions.createFile({
          filename:'img/' + fileName,
          fileContent:fileSrc
        })
    },

    * downloadFile({actions, props}, file) {
       console.log("In downloadFile...", file.name)
      let response = yield gcs.getObject(file)
      //yield actions.updateFileName(file)
      file.contents = yield response.text()
        .catch(err => console.log("Error getting text from GCS response", err))
        console.log(file)
      yield actions.setDisplayedFile(file.displayName)
      yield props.onFileDownload(file)
      console.log(file)
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
    },
    * doNothing(){
      return
    }
  },

  reducer:{
    setDisplayedFile: (state, displayedFile) => ({displayedFile})
  },

  render ({props, actions, state, context}) {
    let {files, fileTree} = props
    let {displayedFile} = state
    var buttonJSX = (<span/>)
    console.log(displayedFile)

    return !fileTree ? <ul>Loading...</ul> : (
      <Block
        id="file-manager"
        backgroundColor={props.backgroundColor} 
        borderLeft
        borderTop
        borderRight
        column
        borderWidth={1}
        borderColor="#d5d5d5"
        fontWeight={2}
        fontSize={props.fontSize}
        tall
        w={props.w}
        px={6}
        pt={4}>
        <Flex align="space-evenly center" py={3}>
          <GameButton onClick={actions.openModalToCreateFile} bg='#00aaf0' px='5px' py='3px' h="25px" w="80px" fs="14px" color="black">
            <Icon fs='inherit' bolder name='note_add' mr='5px'/>
            File
          </GameButton>
          <GameButton onClick={actions.openModalToAddPictures} bg='#00aaf0' px='5px' py='3px' h="25px" w="80px" fs="14px" color="black">
            <Icon fs='inherit' bolder name='file_upload' mr='5px'/>
            Picture
          </GameButton>
        </Flex>
        <Block id="fileTree" flex> 
          { fileTree.map(file => (<FileListing 
                        file={file}
                        displayedFile={displayedFile}
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
