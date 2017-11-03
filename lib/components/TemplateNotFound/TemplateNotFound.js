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
  Text,
  Icon
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
import GameButton from 'components/GameButton'
import gcs from 'client/gcsClient.js'
import {throttle} from 'redux-timing'

/**
 * <TemplateNotFound/>
 */

export default component({
    
  render ({props, state, actions, context}) {
    return (
      <Block id="container"
        w="98vw"
        h="30vh"
        ml="auto"
        mr= "auto"
        fontFamily='ornate'
      >
        <Block id="header" borderTop borderLeft borderRight borderColor="#aaa">
          <h2 style={{margin: 0, padding:"3px 3px 3px 3px",}}>boxspring</h2>
        </Block>
        <Flex
          column
          id="workspace"
          h="92%"
          borderTop borderBottom borderLeft borderRight borderColor="#aaa"
          pt={40}
        >
          <h2 fontFamily='ornate' style={{textAlign: "center"}}>Error: Template '{props.templateId}' could not be found.</h2>
          <GameButton onClick={props.createNewTemplate} ml="auto" mr="auto" bg='blue' px='12px' py='7px' h="35px" fs="15px" color="black">
            <Icon fs='20px' bolder name='library_add' mr='6px'/>
            Create Template
          </GameButton>
        </Flex>
        <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
      </Block>
    )
  }
})