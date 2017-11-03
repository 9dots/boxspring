

/**
 * Imports 
 */
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

import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'

import fire from 'vdux-fire'
import gcs from 'client/gcsClient.js'

/**
 * <ProjectLoader/>
 */

export default component({

  

  render ({props, state, actions, context}) {

    return (
      <div>
        <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
      </div>
    )
  },
})