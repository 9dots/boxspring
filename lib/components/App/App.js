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
		userCode: '',
	},


	reducer: {
		updateCode: function(state, userCode) {
		  window.localStorage.setItem('userCode', userCode)
			return {userCode}
		}
	},

  render ({props, state, actions}) {
    return (
    	<Block id="container"
    		w="96vw"
    		h="98vh"
    		ml="1vw"
    		mr= "1vw"
    		fontFamily='ornate'
    	>
	    	<Block id="header" borderTop borderLeft borderRight>
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
		    <Flex align="center" fontSize="13px"><p>boxspring footer</p></Flex>
	    </Block>
    )
  }
})
