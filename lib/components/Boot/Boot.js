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
import FileManager from 'components/FileManager'
import CodeManager from 'components/CodeManager'
import PreviewManager from 'components/PreviewManager'
import deepFreeze from 'deep-freeze'

/**
 * <Boot/>
 */

export default component({

  getContext ({state, actions}) {
    return {
      ...actions,
      state,
      uiTheme: theme,
    }
  },

  initialState: {
    nextId: 0,
    currentFile: null,
    fileTree: [],
    openTabs: [],
    files: {
      // "file-1": {
      //   fid: 'file-1',
      //   name: 'index.js',
      //   url: '',
      //   contents: '// type code here to get started'
      // },
      // "file-2": {
      //   fid: 'file-2',
      //   name: 'package.json',
      //   url: '',
      //   contents: '// your package.json file will eventually be used to set up your project\'s dependencies.'
      // }
    }
  },

  reducer: {

    createFile (state) {
      deepFreeze(state)
      let {files, fileTree, nextId} = state
      nextId++
      let tempName = 'untitled-' + nextId
      let newFile = {
        fid: nextId,
        name: tempName,
        contents: '',
        rename: tempName
      }
      // console.log(fileTree)
      files = {...files}
      files[newFile.fid] = newFile
      fileTree = [...fileTree, newFile.fid]
      return {...state, fileTree, files, nextId}
    },

    updateFileName: (state, fid, name) => ({
      files: {
        ...state.files,
        [fid]: {
          ...state.files[fid],
          name,
          rename: null
        } 
      }
    }),

    updateFileContents (state, fid, contents) {
      deepFreeze(state)
      // console.log('updateFileContents...', state, fid, contents)
      return {
        files: {
          ...state.files,
          [fid]: {
            ...state.files[fid],
            contents
          }
        }
      }
    },

    openFile (state, fid) {
      deepFreeze(state)
      let newState = {}
      newState['currentFile'] = fid
      if (state.openTabs.indexOf(fid) === -1)
        newState['openTabs'] = [...state.openTabs, fid]
      return newState
    },

    displayFile: (state, fid) => {
      return { currentFile: fid }
    }
  },

  render ({props, state, actions}) {
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
            fontSize="14px"
            backgroundColor="#ddf0f5"
          />
          <CodeManager
            w="42.5%"
            h="100%"
            backgroundColor="#ddf0f5"
            updateCode={actions.updateCode}
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
  }
})
