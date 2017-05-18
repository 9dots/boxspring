/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
/**
 * <Preview Manager/>
 */

export default component({
  render ({props}) {
    return (
    	<Block
    		id="code-manager"
    		backgroundColor="#ddd" 
    		border
    		borderWidth={1}
    		borderColor="black"
    		tall
    		w={props.w}
    	>
    		<Flex align='space-between center'>
                <h1>Preview</h1>
                <GameButton disabled={false} bg='green' mr='s' px='5px' py='5px' h="35px" fs="16px" color="black">
                    Run <Icon fs='inherit' bolder name='play_arrow' ml='3px'/>
                </GameButton>
            </Flex>
    	</Block>
    )
  }
})
