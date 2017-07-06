/**
 * Imports
 */

import {component, element} from 'vdux'
import theme from 'utils/theme'
import {
  Block,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalHeader,
  Text
} from 'vdux-ui'
import fire from 'vdux-fire'
import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate,
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from 'vdux-fire'
import {setUrl} from 'redux-effects-location'
import deepFreeze from 'deep-freeze'
import Loading from 'components/Loading'
import FileManager from 'components/FileManager'
import CodeManager from 'components/CodeManager'
import PreviewManager from 'components/PreviewManager'
import gcs from 'client/gcsClient.js'

// import {interval} from 'redux-effects-timeout'
// import timeoutMiddleware from 'redux-effects-timeout'
// import {createAction} from 'redux-actions'
// import {bind} from 'redux-effects'
// var initAutoSave = createAction('initAutoSave')
// function initAutoSaveInterval () {
//   return bind(interval(() => console.log("Interval triggered"), 500), initAutoSave)
// }


/**
 * <Project/>
 */

export default fire((props) => ({
  // test: console.log("projectId = ", props),
  // project: { ref: `/projects/${props.projectId}`, type: 'once' },
  project: { ref: `/projects/p123`, type: 'once' },
  }))(
  component({
    initialState: {
      ready: false,
      error: false,
      activeFile: null,
      openTabs: [],
      files: {},
      fileTree: [],
      collapsePreviewManager: false
    },

    * onUpdate (prev, {props, state, actions, context}) {
      let {project} = props
      if (!state.error && !props.project.loading && props.project.value == null) {
        // console.log
        // yield actions.setError()
        yield actions.emptyProject()
      }

      if (!state.ready && !props.project.loading) {
        yield actions.setReady()
      }

      // if (state.ready) {
      //   yield context.setProjectState({project: project.value})
      // }
    },

    * onCreate ({props, context, actions, state}) {
      const {projectId} = props
      console.log("Project#onCreate...")
      // initAutoSaveInterval()    

      // if (!initialData) {
      //   if (inProgress && inProgress[gameRef] && inProgress[gameRef].saveRef) {
      //     yield actions.setSaveRef(inProgress[gameRef].saveRef)
      //   } else if (completedByGame && completedByGame[gameRef] && !state.saveRef) {
      //     yield context.openModal(() => <NewGameModal
      //       dismiss={actions.exit}
      //       createNew={actions.createNewSave}
      //       load={actions.setSaveRef(completedByGame[gameRef])}
      //       />)
      //   } else {
      //     yield actions.createNewSave()
      //   }
      // }
    },

    // middleware: [
    //   timeoutMiddleware
    // ],

    controller: {
      * openFile({actions}, file) {
        console.log('In actions.openFile...', file)
        yield actions.updateFileContents(file.name, file.contents)
        yield actions.setDirty(file.name, false)
        yield actions.openTabForFile(file)
      },

      * initAutoSave({actions}) {
        console.log("Init auto save...")
        // setTimer({
        //   f: () => console.log("hello from initautosave"),
        //   delay: 1000
        // })
      },

      * saveFileLocally({actions, state, props}, name, contents) {
        console.log("In saveFileLocally...")
        yield actions.updateFileContents(name, contents)
        yield actions.setDirty(name, true)
      },

      * saveOpenFilesToGCS({state, actions, props, context}) {
        console.log("Saving open files to GCS...")
        let {files, openTabs} = state

        for (let name of openTabs) {
          let file = files[name]
          console.log("Looking at", file)
          if (file.dirty) {
            console.log("Saving dirty file ", file.name)
            yield gcs.insertObject({
              bucket: context.BUCKET_NAME,
              name: name,
              contents: file.contents
            })
            yield actions.setDirty(name, false)
          }
        }
      },
    },

    reducer: {
      setReady: () => ({ready: true}),
      setError: () => ({error: true}),
      
      setCollapsePreviewManager(state, collapse) {
        return { collapsePreviewManager: collapse } 
      },

      emptyProject: () => {project: {}},

      processFileTree(state, fileTree) {
        let files = {}
        let newFileTree = []
        for (let file of fileTree) {
          let augmentedFile = {
            ...file,
            displayPath: file.name.substring(file.name.indexOf('/')),
            displayName: file.name.substring(file.name.lastIndexOf('/')+1)
          }
          newFileTree.push(augmentedFile)
          files[file.name] = augmentedFile
        }
        console.log(fileTree)
        return {fileTree: newFileTree, files}
      },
     
      updateFileContents(state, name, contents) {
        console.log('In updateFileContents...')
        return {
          files: {
            ...state.files,
            [name]: {
              ...state.files[name],
              contents: contents
            }
          }
        }
      },

      setActiveFile(state, name) {
        return { activeFile: name }
      },

      openTabForFile (state, file) {
        let newState = { activeFile: file.name}
        if (state.openTabs.indexOf(file.name) === -1)
          newState['openTabs'] = [...state.openTabs, file.name]
        return newState
      },

      setDirty(state, name, dirty) {
        console.log("In setDirty...", name, dirty)
        return {
          files: {
            ...state.files,
            [name]: {
              ...state.files[name],
              dirty: dirty
            }
          }
        }
      },
  
      // createFile (state) {
      //   deepFreeze(state)
      //   let {files, fileTree, nextId} = state
      //   nextId++
      //   let tempName = 'untitled-' + nextId
      //   let newFile = {
      //     fid: nextId,
      //     name: tempName,
      //     contents: '',
      //     rename: tempName
      //   }
      //   // console.log(fileTree)
      //   files = {...files}
      //   files[newFile.fid] = newFile
      //   fileTree = [...fileTree, newFile.fid]
      //   return {...state, fileTree, files, nextId}
      // },

      // updateFileName: (state, fid, name) => ({
      //   files: {
      //     ...state.files,
      //     [fid]: {
      //       ...state.files[fid],
      //       name,
      //       rename: null
      //     } 
      //   }
      // }),
    },

    render ({props, state, actions, context}) {
      let {openTabs, activeFile, files, fileTree} = state
      // const {project, fileTree, fileDescriptors} = props
      // console.log("In project#render: state = ", context.state)
      // console.log("In project#render: project = ", project)

      let fileTreeWidth = 20.0
      let codeManagerWidth = 0
      let previewManagerWidth = 0
      let remainingWidth = 100.0 - fileTreeWidth
      if (state.collapsePreviewManager)
        codeManagerWidth = remainingWidth
      else {
        codeManagerWidth = remainingWidth/2
        previewManagerWidth = remainingWidth/2
      }

      if (!state.ready) return <Loading />
      else if (state.error) return <h1>Project does not exist</h1>

      return (
        <Block id="container"
          w="98vw"
          h="98vh"
          ml="auto"
          mr= "auto"
          fontFamily='ornate'
        >
          <Block id="header" borderTop borderLeft borderRight borderColor="#aaa">
            <h2 style={{margin: 0, padding:"3px 3px 3px 3px",}}>boxspring</h2>
          </Block>
          <Flex
            id="workspace"
            h="92%"
            wide
          >
            <FileManager
              w={fileTreeWidth+"%"}
              h="100%"
              fontSize="13px"
              backgroundColor="#ddf0f5"
              onFileDownload={actions.openFile}
              onFileTreeDownload={actions.processFileTree}
              fileTree={fileTree}
            />
            <CodeManager
              w={codeManagerWidth+"%"}
              h="100%"
              backgroundColor="#ddf0f5"
              updateCode={actions.updateCode}
              openTabs={openTabs}
              files={files}
              activeFile={activeFile}
              onTabClick={actions.setActiveFile}
              collapsePreviewManager={state.collapsePreviewManager}
              setCollapsePreviewManager={actions.setCollapsePreviewManager}
              saveFileLocally={actions.saveFileLocally}
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
            />
            <PreviewManager
              w={previewManagerWidth+"%"}
              h="100%"
              backgroundColor="#ddf0f5"
              userCode={state.userCode}
              setCollapsePreviewManager={actions.setCollapsePreviewManager}
              collapsed={state.collapsePreviewManager}
            />
          </Flex>
          <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
        </Block>
      )
    }
  })
)

// function timerMiddleware ({dispatch, actions}) {
//   return next => action => {
//     console.log("In timerMiddleware...", action.type)
//     if (action.type === setTimer.toString()) {
//       console.log("timerMiddleware action called...")
//       setTimeout(() => console.log("Hello"), 1000)
//       dispatch(actions.setTimer)
//       // let {delay} = action.value
//       // setTimeout(() => console.log("Hello"),delay)
//     }
//     return next(action)
//   }
// }