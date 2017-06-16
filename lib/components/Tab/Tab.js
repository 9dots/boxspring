/**
 * Imports
 */

import {MenuItem} from 'vdux-containers'
import {component, element} from 'vdux'
import {Text, Block} from 'vdux-ui'

/**
 * <Tab/>
 */

export default component({
  render ({props}) {
	  const {underlineColor, name, label, active, handleClick, ...restProps} = props
	  return (
  <MenuItem
    mx={2}
    px={8}
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
    onClick={handleClick(name)}
    highlight={false}
    {...restProps}>
    <Text display='block'>{label || name}</Text>
    {false && <Block absolute bgColor="#3344ff" left='0' wide bottom='-1px' h='4px' />}
  </MenuItem>
	  )
  }
})
