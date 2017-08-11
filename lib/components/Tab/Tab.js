/**
 * Imports
 */

import {MenuItem} from 'vdux-containers'
import {component, element} from 'vdux'
import {Text, Block, Icon} from 'vdux-ui'

/**
 * <Tab/>
 */

export default component({
  render ({props}) {
	  const {underlineColor, name, label, active, handleClick, ...restProps} = props
	  return (
  <MenuItem
    ml={2}
    mr={2}
    pl={6}
    pr={3}
    relative
    align='center center'
    fs='xs'
    borderTop
    borderLeft
    borderRight
    borderColor="#aabbcc"
    textAlign='center'
    fontWeight='500'
    lineHeight='2.6em'
    bgColor={active ? '#fff' : '#f0f0f0'}
    color={active ? '#444' : '#888'}
    hoverProps={active && {color: '#666'}}
    highlight={false}
    {...restProps}>
    <Text w={80} onClick={handleClick(name)} display='block'>{label || name}</Text>
    <Icon fs='inherit' bolder name='close' mt='1px' ml='4px' mr='0px' onClick={props.closeTab(name)} />
    {false && <Block absolute bgColor="#3344ff" left='0' wide bottom='-1px' h='4px' />}
  </MenuItem>
	  )
  }
})
