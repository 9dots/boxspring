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
import fire from 'vdux-fire'

/**
 * <File Manager/>
 */


function defaultIndexHTML(projectName) {
   return (
    `<html>
      <head>
        <style type='text/css'>
          html, body {
            margin: 0;
            padding-top: 0px;
            border: 0;
            font-family: sans-serif;
            background: #222;
            color: green;
            text-align: center;
          } 
        </style>
      </head>
      <body>
        <div id="app">
          <h1>${projectName} v1.0.0</h1>
        </div>
      </body>
    </html>`)
}

function defaultIndexJS(projectName) {
  return (
    `/* index.js for ${projectName} */
    function helloWorld(){
      console.log("Hello world!")  
    }
`)
}

function defaultIndexCSS(projectName) {
  return (
    `/* index.css for ${projectName} */
body{
  background-color:"gray";
}
`)
}

const checkFileType = (fileType) =>{
  console.log(fileType)
  switch(fileType){
    case 'js':
      return 'javascript'
    case 'html':
    case 'json':
    case 'css':
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



export default fire((props) => ({
    files: `/projects/${props.keyId}/src`          //oldProjects={welcome:username of email projectList:contains keys of projects={date:date project was made in microseconds projectName:name of project}}
  }))(component({

  initialState: {
    ready:false,
    fileTree: [],
    files: {},
  },

  //onCreate
  //function: checks whether or not the files from firebase have loaded in and tries to load the file tree if they're ready
  * onCreate({state, props, actions}) {
    // console.log("Creating FileManager component")
    if(!props.files.loading && !state.ready){
      yield actions.loadFileTree()
    }
  },

  //onUpdate
  //function: checks whether or not the files from firebase have loaded in and tries to load the file tree if they're ready
  * onUpdate(prev, {state, props, actions}) {       //FIX: should be much better way to do this
    if((prev.props.files.loading && !props.files.loading && !state.ready && props.files.value) || prev.props.files.value != props.files.value){
      yield actions.loadFileTree()
    }
  },

  controller: {

    //loadFileTree
    //function: uses props.files to generate the list of files to grab using gcs. Sets state.ready to true after it has finished loading the file tree
    * loadFileTree({props, actions, context}) {
      let fileTree = gcs.listObjects({
              bucket: context.BUCKET_NAME,
              projectId: context.projectId,
              files: props.files.value
            })
      console.log(fileTree)
      yield props.onFileTreeDownload(fileTree)
      yield actions.setReady(true)
    },

    //findFileByName
    //params:
      //fileName:the name of a file within the project. For instance if the project is -Kwv7460doG2u8yVJs3C
        //and fileName is index.html, the value at /projects/-Kwv7460doG2u8yVJs3C/files/${someKey}/title will be index.html
    //function: given the name of a file, looks through props.file for the key that has a file with the same title as filename
    //returns: the key in props.files with the same title as fileName. If fileName isn't found or the files are still loading returns ""
    * findFileByName({props, actions, context}, fileName) {
      if(props.files.loading){
        console.log("files still loading")
        return ""
      }
      var files = props.files.value
      for(var file in files){
        if(files[file].title == fileName){
          return file
        }
      }

      return ""
    },

    //checkNewFileName
    //param:
      //filename: name of a file to be added. Ex. bananas.html
    //function: checks whether the filename is valid. Checks if it's not empty, has a file type, and has a proper file type (html, js, json)
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
        result.errorMessage += "Incorrect file type. Supported types are .html, .js, .css, and .json"
        return result
      }
      result.passed = true
      return result
    },

    //createFile
    //param:
      //payload:
        //filename: name of a file to be added. Ex. bananas.html
        //fileContent: content that should be put into the file. Mostly used for picture sources. If it is "" uses the default content for the file type
    //function: creates a file using gcsClient; also changes the activeFile to the created file
    * createFile({actions, context, props}, {filename, fileContent}) {
      console.log("Creating file...")
      var content = ""
      var goodName = yield actions.checkNewFileName(filename)
      // todo: add as validator
      // insert empty file with name to GCS
      if(goodName.passed){                                                                  //if the name is fine

        if(fileContent){
          content = fileContent
        } else {
          var ending = filename
          while(ending.indexOf('.') != -1){
            ending = ending.substring(ending.indexOf('.') + 1)
          }

          switch(ending){
            case 'js':
              content = defaultIndexJS(filename)
              break
            case 'html':
              content = defaultIndexHTML(filename)
              break
            case 'css':
              content = defaultIndexCSS(filename)
              break
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'json':
              console.log("need to figure out how to do something for pictures")
              content = ""
              break
            default:
              console.log("normal file type not found")
              return
          }
        }
        var contentAtFileName = yield props.getFileContentsFromName(context.projectId + "/" + filename)
        if(contentAtFileName == null){                                                      //if the file doesn't exist
          console.log("creating file")
          yield context.insertObject({
            bucket: context.BUCKET_NAME,
            projectId: context.projectId,
            filename,
            contents: content
          })
          yield actions.loadFileTree()
          var file = {                                                              //rather than searching through the file tree, just creates the base file using the name
            displayName:filename,
            displayPath:'/' + filename,
            name: context.projectId + "/" + filename,
            selfLink: `https://storage.googleapis.com/${context.BUCKET_NAME}/projects/${encodeURIComponent(`${context.projectId}/src/${filename}`)}`,
          }
          yield actions.downloadFile(file)       
          yield props.setActiveFile(context.projectId + "/" + filename)                                    
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
    
    //deleteFile
    //param:
      //name: both the project name and the file name concatenated with a /. Ex. -Kwv7460doG2u8yVJs3C/index.html
    //function: deletes a file using gcsClient; also changes the activeFile to "" if the file to be deleted is the activeFile
    * deleteFile({actions, props, context}, name) {
      console.log("Deleting file...")
      
      yield props.onFileDelete(name)
      yield props.setActiveFile(null)

      var fileName = name.substring(name.indexOf('/') + 1)
      var fileKey = yield actions.findFileByName(fileName)
      // todo: check if that file already exists
      // todo: add as validator
      // insert empty file with name to GCS
      yield context.deleteObject({
        bucket: context.BUCKET_NAME,
        projectId:context.projectId,
        filename: fileName,
        fileKey
      })

      yield actions.loadFileTree()
      if(props.activeFile != "" && props.activeFile != null && props.activeFile.indexOf('/') != -1){
        if(props.activeFile == name){
          yield props.setActiveFile("")
        } else {
          var fileName = props.activeFile.substring(props.activeFile.indexOf('/') + 1)
          var file = {                                                //rather than searching for the file in the fileTree, just creating the default one
            displayName:fileName,
            displayPath:'/' + fileName,
            name: props.activeFile,
            selfLink: `https://www.googleapis.com/storage/v1/b/${context.BUCKET_NAME}/o/` + encodeURIComponent(props.activeFile)
          }
          yield actions.downloadFile(file)
        }

      }else{
        console.log("delete fail" + props.activeFile)
      }
    },

    //renameFile
    //param:
      //oldName: the name of the file originally with the project name. Ex: -Kwv7460doG2u8yVJs3C/index.html
      //filename: the new name for the file without the project name. Ex: banana.html
    //function: renames a file using gcsClient; also changes the activeFile to the new file name if the old name was the activeFile.
      //and checks whether the oldName actually exists
    * renameFile({actions, context, props, state}, oldName, {filename}) {
      console.log("Renaming file...", oldName, filename)
      
      var files = props.files.value
      // todo: check if file already exists

      // todo: add as validator
      // insert empty file with name to GCS
      var fileName = oldName.substring(oldName.indexOf('/') + 1)
      var fileKey = yield actions.findFileByName(fileName)

      if(fileKey == ""){
        console.log("file not found in files")
        return 
      }

      yield context.rewriteObject({
        bucket: context.BUCKET_NAME,
        oldName: oldName,
        newName: filename,
        projectId: context.projectId,
        fileKey
      })

      yield actions.loadFileTree()
      if(props.activeFile != "" && props.activeFile != null && props.activeFile.indexOf('/') != -1){
        if(props.activeFile == oldName){
          yield props.setActiveFile(context.projectId + "/" + filename)
          var file = {
            displayName:filename,
            displayPath:'/' + filename,
            name: context.projectId + "/" + filename,
            selfLink: `https://www.googleapis.com/storage/v1/b/${context.BUCKET_NAME}/o/` + encodeURIComponent(context.projectId + "/" + filename)
          }
          yield actions.downloadFile(file)
        } else {
          var fileName = props.activeFile.substring(props.activeFile.indexOf('/') + 1)
          var file = {
            displayName:fileName,
            displayPath:'/' + fileName,
            name: props.activeFile,
            selfLink: `https://www.googleapis.com/storage/v1/b/${context.BUCKET_NAME}/o/` + encodeURIComponent(props.activeFile)
          }
          yield actions.downloadFile(file)
        }

      }
      
    },

    //uploadFile
    //param:
      //payload
        //fileSrc: the pixel data that composes the picture. Used as the fileContent for the new file.
        //fileName: the new name for the file without the project name. Ex: banana.jpg. It is pre-pended with img/ to create a quasi img folder
    //function: creates a file with name fileName and content fileSrc
    * uploadFile({actions, props}, {fileSrc, fileName}){
        yield actions.createFile({
          filename:'img/' + fileName,
          fileContent:fileSrc,
        })
    },

    //uploadFile
    //param:
      //file: a file object from the fileTree
        //always has displayName, displayPath, name, and selfLink. may have contents
    //function: downloads the object using gcsClient, and sends the updated contents to Project using onFileDownload
    * downloadFile({actions, props, context}, file) {
      console.log("In downloadFile...", file.name)
      let response = yield context.getObject(file)
      //yield actions.updateFileName(file)
      file.contents = yield response.text()
        .catch(err => console.log("Error getting text from GCS response", err))
      yield props.onFileDownload(file)
    },
    
    //openModalToCreateFile
    //function: opens a modal that allows you to create a file by entering the name.
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

    //openModalToDeleteFile
    //function: opens a modal that confirms you want to delete a file
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

    //openModalToCreateFile
    //function: opens a modal that allows you to rename a file by entering the name.
    * openModalToRenameFile({props, context, actions}, file) {
      yield context.openModal(() => <FileNameModal
      label={`Enter a new name for ${file.displayPath}`}
      field="filename"
      onSubmit={actions.renameFile(file.displayName)}
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
    return !fileTree ? <ul>Loading...</ul> : (
      <Block
        id="file-manager"
        backgroundColor={props.backgroundColor} 
        column
        fontWeight={2}
        fontSize={props.fontSize}
        tall
        w={props.w}
        px={6}
        pt={4}>
        <Flex align="space-evenly center" py={3}>
          <GameButton onClick={actions.openModalToCreateFile} bg='#42a8ff' px='5px' py='3px' h="25px" w="80px" fs="14px" color="black">
            <Icon fs='inherit' bolder name='note_add' mr='5px'/>
            File
          </GameButton>
          <GameButton onClick={actions.openModalToAddPictures} bg='#42a8ff' px='5px' py='3px' h="25px" w="80px" fs="14px" color="black">
            <Icon fs='inherit' bolder name='file_upload' mr='5px'/>
            Picture
          </GameButton>
        </Flex>
        <Block id="fileTree" flex> 
          { state.ready ? fileTree.map(file => (<FileListing 
                        file={file}
                        displayedFile={displayedFile}
                        hoverProps={{hovering: true, bgColor: "#c0e8ff"}}
                        downloadFile={actions.downloadFile}
                        renamePressed={actions.openModalToRenameFile} 
                        deletePressed={actions.openModalToDeleteFile} 
                      />))
                        : <span>Loading</span>}  
        </Block>
      </Block>
    )
  }
}))
