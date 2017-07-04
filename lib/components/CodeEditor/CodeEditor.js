/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import Ace from 'vdux-ace'

require('brace/mode/javascript')
require('brace/theme/tomorrow')

// let setValue
// let scrollToLine

/**
 * <Code Editor/>
 */

// enable localStorage save when the user is working on a new gist

// const jsOptions = {
//   undef: true,
//   esversion: 6,
//   asi: true,
//   browserify: true,
//   $blockScrolling: Infinity,
//   predef: [
//     // ...Object.keys(docs),
//     'require',
//     'console'
//   ]
// }

export default component({
  render ({props, actions, context}) {
    const currentFile = context.state.currentFile
	  return props.value ? (
      <Ace
        name='code-editor'
        mode='javascript'
        height="95%"
        width="100%"
      	// ref='something'
        key='something'
        // fontSize='14px'
        // readOnly={!canCode}
        // jsOptions={jsOptions}
        fontFamily='code'
        highlightActiveLine={false}
        // activeLine={hasRun ? activeLine - 1 : -1}
        // onChange={context.updateFileContents(currentFile)}
        value={props.value}
        theme='tomorrow'
        // jsOptions={jsOptions}
      />
	  ) : <span/>
  }

})

