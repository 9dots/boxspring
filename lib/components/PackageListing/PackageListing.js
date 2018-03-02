/**
 * Imports
 */

import {component, element, stopPropagation} from 'vdux'
import {Flex, Icon, Box} from 'vdux-ui'
import {CSSContainer, wrap} from 'vdux-containers'
import GameButton from 'components/GameButton'
import ConditionalGameButton from 'components/ConditionalGameButton'
import Hover from 'components/Hover'

/**
 * <File Listing/>
 */
var DISPLAY_NAME_CUTOFF = 17
var FULL_NAME_CUTOFF = 21

export default wrap(CSSContainer, {})(component({

  render ({props, actions, context}) {
    let {name, entry} = props
    var fixedDisplayName = name
    if(!name){
    	return <span/>
    }
    if(props.hovering && name.length > DISPLAY_NAME_CUTOFF){
      fixedDisplayName = name.substr(0,DISPLAY_NAME_CUTOFF-3) + "..."
    } else if(name.length > FULL_NAME_CUTOFF){
      fixedDisplayName = name.substr(0,FULL_NAME_CUTOFF-3) + "..."
    }
    var backgroundColor = ""
    if(props.loading){
      backgroundColor = "#cccccc"
    } else if (props.hovering){
      backgroundColor = "#c0e8ff"
    }

    return (
      <Flex h='18px' align="space-between center" bg={backgroundColor} px={2}>
        <Flex align="flex-begin center" onClick={[stopPropagation, props.openNPMLink(name)]}>
          <Icon fs='inherit' color="gray" bolder name='pregnant_woman' ml='0px' mr='3px'/>
          {fixedDisplayName}
        </Flex>
        { props.hovering && !props.loading && <Flex align="flex-end center">
            <Icon fs='17px' color="red" bolder name='delete_forever' onClick={[stopPropagation, props.deletePkg(entry)]} ml='0px' />
          </Flex>
        }
      </Flex>
    )
  }
}))