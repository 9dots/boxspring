/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import CodeEditor from 'components/CodeEditor'
import GameButton from 'components/GameButton'
/**
 * <Code Manager/>
 */

export default component({
  render ({props}) {
    return (
    	<Block
    		id="code-manager"
    		backgroundColor="#ccc" 
    		border
    		borderWidth={1}
    		borderColor="black"
    		w={props.w}
    		tall
    	>
    		<Flex align='space-between center'>
                <h1>Code</h1>
                <GameButton disabled={false} bg='green' mr='s' px='5px' py='5px' h="35px" fs="16px" color="black">
                    New <Icon fs='inherit' bolder name='note_add' ml='3px'/>
                </GameButton>
            </Flex>
            
    	</Block>
    )
  }
})
