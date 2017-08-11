/**
 * Imports
 */

import {component, element} from 'vdux'
import {Flex, Icon, Box} from 'vdux-ui'
import {CSSContainer, wrap} from 'vdux-containers'
import GameButton from 'components/GameButton'
import ConditionalGameButton from 'components/ConditionalGameButton'
import Hover from 'components/Hover'

/**
 * <File Listing/>
 */

export default wrap(CSSContainer, {})(component({
  render ({props, actions, context}) {
    let file = props.file
    return (
      <Flex align="space-between center" bg={props.bgColor} mb={props.mb}>
        <Flex align="flex-begin center" onClick={props.downloadFile(file)}>
          <Icon fs='inherit' bolder name='insert_drive_file' ml='0px' mr='3px'/>
          {file.displayName}
        </Flex>
        { props.hovering && <Flex align="flex-end center" style={{display: 'none'}}>
            <Icon fs='inherit' color="gray" bolder name='edit'  onClick={props.renamePressed(file)} ml='0px' />
            <Icon fs='17px' color="red" bolder name='delete_forever' onClick={props.deletePressed(file)} ml='0px' />
          </Flex>
        }
      </Flex>
    )
  }
}))

/*
<ConditionalGameButton
                condition={hover}
                onClick={props.deletePressed(file)}
                bg='red'
                pr='0px'
                py='0px'
                ml='2px'
                h='12px'
                fs='12px'
                color='black'
              >
                 <Icon fs='inherit' bolder name='delete_forever' ml='0px' />
               </ConditionalGameButton>
*/
// <ConditionalGameButton
//                 condition={hover}
//                 onClick={props.renamePressed(file)}
//                 bg='gray'
//                 pr='0px'
//                 py='0px'
//                 ml='4px'
//                 h='12px'
//                 fs='12px'
//                 color='white'
//               >
//                 <Icon fs='inherit' bolder name='edit' ml='0px' />
//               </ConditionalGameButton>