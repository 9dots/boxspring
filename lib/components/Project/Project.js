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
import {throttle} from 'redux-timing'

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
      previewManagerCollapsed: false,
      saveInProgress: false,
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
    },

    middleware: [
      throttle('saveOpenFilesToGCS', 2000)
    ],

    controller: {
      * openFile({actions}, file) {
        // console.log('In actions.openFile...', file)
        yield actions.updateFileContents(file.name, file.contents)
        // yield actions.setDirty(file.name, false)
        yield actions.openTabForFile(file)
      },

      * save({actions}, name, contents) {
        yield actions.saveFileLocally(name, contents)
        yield actions.saveOpenFilesToGCS()
      },

      * saveFileLocally({actions, state, props}, name, contents) {
        // console.log("In saveFileLocally...")
        yield actions.updateFileContents(name, contents)
      },

      * saveOpenFilesToGCS({state, actions, props, context}) {
        // console.log("Saving open files to GCS...")

        let {files, openTabs} = state

        for (let name of openTabs) {
          let file = files[name]
          if (file.dirty) {
            console.log("Saving dirty file ", file.name)
            // console.log('About to set save in progress to true', state)
            yield actions.setSaveInProgress(true)
            yield gcs.insertObject({
              bucket: context.BUCKET_NAME,
              name: name,
              contents: file.contents
            })
            yield actions.setDirty(name, false)
          }
        }

        // console.log('About to set save in progress to false', state)
        yield actions.setSaveInProgress(false)
      },

      * closeTab({actions, state, props}, name) {
        let {openTabs} = state
        
        // yield actions.setActiveFile(null)
        yield actions.saveOpenFilesToGCS()

        console.log("State before update", state)
        yield actions.updateOpenTabs(name)
        console.log("State After update", state)
      }

    },

    reducer: {
      setReady: () => ({ready: true}),
      setError: () => ({error: true}),
      
      setSaveInProgress: (state, inProgress) => {
        // console.log("In reducer, setSaveInProgress to ", inProgress)
        return { saveInProgress: inProgress}
      },
      setPreviewManagerCollapsed: (state, collapse) => {
        return { previewManagerCollapsed: collapse }
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
        // console.log(fileTree)
        return {fileTree: newFileTree, files}
      },
     
      updateFileContents(state, name, contents) {
        // console.log('In updateFileContents...')
        let prevContents = (state.files[name] && state.files[name].contents)
        return {
          files: {
            ...state.files,
            [name]: {
              ...state.files[name],
              contents: contents,
              dirty: (prevContents && (prevContents != contents))
            }
          }
        }
      },

      setActiveFile(state, name) {
        console.log('setActiveFile...', name)
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

      updateOpenTabs(state, name) {
        console.log("In updateOpenTabs", state)
        let activeTabIndex = state.openTabs.indexOf(name)
        let remainingTabs = state.openTabs.filter(tab => tab != name)        
        let nextTabIndex = Math.min(activeTabIndex, remainingTabs.length - 1)
        let nextActiveFile = (remainingTabs.length ? remainingTabs[nextTabIndex] : null)
        return { 
          openTabs: remainingTabs,
          activeFile: nextActiveFile
        }
      }
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
      if (state.previewManagerCollapsed)
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
              openTabs={openTabs}
              files={files}
              activeFile={activeFile}
              onTabClick={actions.setActiveFile}
              previewManagerCollapsed={state.previewManagerCollapsed}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              saveFileLocally={actions.save}
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
              closeTab={actions.closeTab}
              saveInProgress={state.saveInProgress}
            />
            <PreviewManager
              w={previewManagerWidth+"%"}
              h="100%"
              backgroundColor="#ddf0f5"
              userCode={state.userCode}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              collapsed={state.previewManagerCollapsed}
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
//       setTimeout(function() {
//         dispatch(actions.value)
//         console.log("Hello"), 1000)
//       }
//       // let {delay} = action.value
//       // setTimeout(() => console.log("Hello"),delay)
//     }
//     return next(action)
//   }
// }