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
      // isAnonymous: state.isAnonymous,
      // username: state.username,
      // url: state.url,
      // uid: state.uid,
      // uiTheme: {spinnerAnimation: ''},
      uiTheme: theme,
      state: state,
      ...actions
    }
  },

  initialState: {
    nextId: 0,
    currentFile: false,
    fileTree: [],
    openTabs: [],
    files: {
      // "file-1": {
      //   id: 'file-1',
      //   name: 'index.js',
      //   url: '',
      //   contents: '// type code here to get started'
      // },
      // "file-2": {
      //   id: 'file-2',
      //   name: 'package.json',
      //   url: '',
      //   contents: '// your package.json file will eventually be used to set up your project\'s dependencies.'
      // }
    }
  },

  reducer: {
    // updateCode (state, code, fileId) => {
    //  files = files.slice().forEach(f => {
    //    if (f.id === fileId)
    //      f.contents = code
    //  })
    //   window.localStorage.setItem(fileId, files[fileId])
    //  return {...state, files}
    // },

    updateCode(state, code) {
      console.log("update code called")
    },

    createFile: (state) => {
      deepFreeze(state)
      let {files, fileTree, nextId} = state
      nextId++
      let tempName = 'untitled-' + nextId
      let newFile = {
        id: nextId,
        name: tempName,
        contents: '',
        rename: tempName
      }
      // console.log(fileTree)
      files = {...files}
      files[newFile.id] = newFile
      fileTree = [...fileTree, newFile.id]
      return {...state, fileTree, files, nextId}
    },

    updateFileName: (state, fid, name) => ({
      files: {
        ...state.files,
        [fid]: {
          ...state.files[fid],
          name,
          rename: false,
        } 
      }
    })
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
            files={state.files}
            currentFile={state.currentFile}
            openTabs={state.openTabs}
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
