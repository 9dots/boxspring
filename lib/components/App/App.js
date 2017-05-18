/**
 * Imports
 */

import {component, element} from 'vdux'

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

/**
 * <App/>
 */

export default component({
  render ({props}) {

    return (
    	<Block w="100vw">
	    	<Block
	    		id="header"
	    		h="10vh"
	    		wide
	    		border
	    	>
	    		<h1>boxspring</h1>
	    	</Block>
	    	<Flex
	    		id="workspace"
	    		h="80vh"
	    		wide
	    		border
	    	>
	    		<FileManager w="15%"/>
	    		<CodeManager w="42.5%"/>
	    		<PreviewManager w="42.5%"/>
	    	</Flex>
	    </Block>
    )
  }
})