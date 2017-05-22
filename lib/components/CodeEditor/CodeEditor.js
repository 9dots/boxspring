/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import Ace from 'vdux-ace'

require('brace/mode/javascript')
require('brace/theme/tomorrow_night')

// let setValue
// let scrollToLine

/**
 * <Code Editor/>
 */

export default component({
  render ({props, actions}) {

	  return (
	  	<Block wide tall px="5px">
	      <Ace
	      	// ref='something'
	        name='code-editor'
	        mode='javascript'
	        height='87.5%'
	        width='97.5%'
	        // key={'editor-' + saveRef}
	        key='something'
	        // fontSize='14px'
	        // readOnly={!canCode}
	        // jsOptions={jsOptions}
	        fontFamily='code'
	        highlightActiveLine={false}
	        // activeLine={hasRun ? activeLine - 1 : -1}
	        onChange={props.updateCode}
	        // value={sequence.length > 0 ? sequence : startCode || ''}
	        theme='tomorrow_night'
	      />
	     </Block>
	  )
  }

})