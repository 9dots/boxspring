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
      currentFile: null,
      openTabs: [],
      files: {},
      fileTree: [],
    },

    render ({props, state, actions, context}) {
      let {openTabs, currentFile, files, fileTree} = state
      // const {project, fileTree, fileDescriptors} = props
      // console.log("In project#render: state = ", context.state)
      // console.log("In project#render: project = ", project)
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
              w="15%"
              h="100%"
              fontSize="13px"
              backgroundColor="#ddf0f5"
              onFileDownload={actions.openFile}
              onFileTreeDownload={actions.setFileTree}
              fileTree={fileTree}
            />
            <CodeManager
              w="42.5%"
              h="100%"
              backgroundColor="#ddf0f5"
              updateCode={actions.updateCode}
              openTabs={openTabs}
              files={files}
              currentFile={currentFile}
            />
            <PreviewManager
              w="42.5%"
              h="100%"
              backgroundColor="#ddf0f5"
              userCode={state.userCode}
            />
          </Flex>
          <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
        </Block>
      )
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

    controller: {
      * openFile({actions}, file) {
        console.log('In actions.openFile...', file)
        
      }
    },

    reducer: {
      setReady: () => ({ready: true}),
      setError: () => ({error: true}),
      
      emptyProject: () => {project: {}},

      setFileTree(state, fileTree) {
        return {fileTree: fileTree}
      },
     
      saveFileLocally(state, file) {

      },

      setCurrentFile(state, filename) {

      },

    //   updateFileContents (state, fid, contents) {
    //     deepFreeze(state)
    //     // console.log('updateFileContents...', state, fid, contents)
    //     return {
    //       files: {
    //         ...state.files,
    //         [fid]: {
    //           ...state.files[fid],
    //           contents
    //         }
    //       }
    //     }
    //   },

    // openFile (state, fid) {
    //   deepFreeze(state)
    //   let newState = {}
    //   newState['currentFile'] = fid
    //   if (state.openTabs.indexOf(fid) === -1)
    //     newState['openTabs'] = [...state.openTabs, fid]
    //   return newState
    // },

    // displayFile: (state, fid) => {
    //   return { currentFile: fid }
    // }
    }
  })
)