/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import Ace from 'vdux-ace'

require('brace/mode/javascript')
// require('brace/theme/tomorrow_night')

// let setValue
// let scrollToLine

/**
 * <Code Editor/>
 */

// enable localStorage save when the user is working on a new gist


export default component({
  render ({props, actions}) {

	  return props.value ? (
      <Ace
      	// ref='something'
        name='code-editor'
        mode='javascript'
        height="95%"
        width="100%"
        // key={'editor-' + saveRef}
        key='something'
        // fontSize='14px'
        // readOnly={!canCode}
        // jsOptions={jsOptions}
        fontFamily='code'
        highlightActiveLine={false}
        // activeLine={hasRun ? activeLine - 1 : -1}
        onChange={props.updateCode}
        value={props.value}
      />
	  ) : <span/>
  }

})

