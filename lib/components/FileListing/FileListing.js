/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import GameButton from 'components/GameButton'
import ConditionalGameButton from 'components/ConditionalGameButton'
import Hover from 'components/Hover'

/**
 * <File Listing/>
 */

export default component({

  render ({props, actions, context}) {
  	let file = props.file
    return (file['rename'] ?
    	<Block>
    		<input
    			type="text"
    			value={file.rename}
    			size={18}
    			onChange={context.updateFileName(props.fid)}
    		/>
    		<GameButton
    			bg='blue'
    			onClick={context.updateFileName(file.fid, file.rename)}
    			ml={1}
    			px={0}
    			py={0}
    			h={14}
    			fs={12}
    			color="black"
    		>
        	<Icon
        		fs='inherit'
        		bolder
        		name='done'
        		ml='3px'
        	/>
      	</GameButton>
      </Block>
      :
      <Flex align="space-between center">
        <Flex align="flex-begin center" onClick={props.downloadFile(file)}>
          <Icon fs='inherit' bolder name='insert_drive_file' ml='0px' mr='5px'/>
          {file.displayPath}
        </Flex>
        <Hover>
          { hover => (
            <Flex align="flex-end center">
              <ConditionalGameButton
                condition={hover}
                onClick={props.renamePressed(file)}
                bg='yellow'
                pr='0px'
                py='0px'
                ml='4px'
                h='12px'
                fs='12px'
                color='white'
              >
                <Icon fs='inherit' bolder name='title' ml='0px' />
              </ConditionalGameButton>
              <ConditionalGameButton
                condition={hover}
                onClick={props.deletePressed(file)}
                bg='red'
                pr='0px'
                py='0px'
                ml='2px'
                h='12px'
                fs='12px'
                color='white'
              >
                <Icon fs='inherit' bolder name='cancel' ml='0px' />
              </ConditionalGameButton>
            </Flex>
          )
          }
        </Hover>
      </Flex>
    )
  }
})
