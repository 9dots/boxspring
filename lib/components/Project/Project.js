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
  project: { ref: `/projects/${props.projectId}`, type: 'once' },
  fileTree: { ref: `/fileTrees/${props.projectId}`, type: 'once' },
  fileDescriptors: { ref: `/fileDescriptors/${props.projectId}`, type: 'once' }
  }))(
  component({
    initialState: {
      ready: true
    },

    render ({props, state, actions}) {
      const {project, filTree, fileDescriptors} = props
      console.log("project =", project)
      if (!state.ready) return <Loading />

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
    },

    * onUpdate (prev, {props, state, actions}) {
      if (!state.ready && (!props.project.loading && !props.fileTree.loading && !props.fileDescriptors.loading)) {
        yield actions.setReady()
      }
    },

    controller: {

    },

    reducer: {
      setReady: () => ({ready: true})
    }
  })
)