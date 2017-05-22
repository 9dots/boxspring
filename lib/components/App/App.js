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

	initialState: {
		userCode: ''
	},


	reducer: {
		updateCode: (state, userCode) => ({userCode})
	},

  render ({props, state, actions}) {
    return (
    	<Block w="97.5vw" fontFamily='ornate'>
	    	<Block
	    		id="header"
	    		h="8vh"
	    		wide
	    		border
	    	>
	    		<h1>boxspring</h1>
	    	</Block>
	    	<Flex
	    		id="workspace"
	    		h="88vh"
	    		wide
	    		border
	    	>
	    		<FileManager w="15%"/>
	    		<CodeManager w="42.5%" updateCode={actions.updateCode}/>
	    		<PreviewManager w="42.5%" userCode={state.userCode}/>
	    	</Flex>
	    </Block>
    )
  }
})
