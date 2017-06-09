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
    px={18}
    relative
    align='center center'
    fs='xs'
    bgColor='#ccc'
    textAlign='center'
    textTransform='uppercase'
    fontWeight='500'
    lineHeight='2.6em'
    hoverProps={active && {color: '#666'}}
    color={active ? '#333' : '#999'}
    onClick={handleClick(name)}
    highlight={true}
    {...restProps}>
    <Text display='block'>{label || name}</Text>
    {active && <Block absolute bgColor={underlineColor} left='0' wide bottom='-1px' h='4px' />}
  </MenuItem>
	  )
  }
})
