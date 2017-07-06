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
    const {activeFile} = props
	  return props.value ? (
      <Ace
        name='code-editor'
        mode='javascript'
        height="95%"
        width="100%"
        key='something'
        fontFamily='code'
        highlightActiveLine={false}
        // activeLine={hasRun ? activeLine - 1 : -1}
        onChange={props.onChange(activeFile)}
        value={props.value}
        theme='tomorrow'
        // jsOptions={jsOptions}
      />
	  ) : <span/>
  }

})

