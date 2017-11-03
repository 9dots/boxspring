/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import Ace from 'vdux-ace'

require('brace/mode/javascript')
require('brace/mode/json')
require('brace/mode/html')
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
    var fileType = 'file'
    if(activeFile){
      var ids = activeFile.split('.')
      if(ids.length > 1){
        fileType = ids[ids.length - 1]
      }
    }
    switch(fileType){
      case 'html':
      case 'json':
        break;
      case 'js':
        fileType = 'javascript'
        break;
      default:
        fileType = 'file'
        break;
    }
    console.log(fileType)
	  return props.value ? (
      <Ace
        name='code-editor'
        mode={fileType}
        height="95%"
        width="100%"
        key={activeFile}
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

