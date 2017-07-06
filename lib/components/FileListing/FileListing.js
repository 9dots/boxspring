/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import GameButton from 'components/GameButton'

/**
 * <File Listing/>
 */

export default component({

  render ({props, actions, context}) {
  	let file = props.file
    return (file['rename'] ?
    	<li>
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
      </li>
      : 
      <li onClick={props.downloadFile(file)}>
        <Icon fs='inherit' bolder name='insert_drive_file' ml='0px' mr='5px'/>
        {file.displayPath}
      </li>
    )
  }
})
