/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import Ace from 'vdux-ace'

require('brace/mode/javascript')
require('brace/mode/json')
require('brace/mode/html')
require('brace/mode/jsx')
require('brace/theme/tomorrow')

var MAX_IMAGE_WIDTH = 300
var MAX_IMAGE_HEIGHT = 900
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
function temp(){
  console.log("hey")
}

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
    var scaledJSX = "oi"
    switch(fileType){
      case 'html':
      case 'json':
        break;
      case 'js':
        fileType = 'javascript'
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        console.log("need to figure out how to do something for pictures")
        fileType = 'picture'
        break;
      default:
        fileType = 'file'
        break;
    }
    if(fileType == 'picture'){
      var temp = new Image()
      temp.src = props.value

      temp.onload = function(){
        document.getElementById('codeEditorImage').src = props.value
        var {width, height} = temp
        var head = "Size: "
        var end = width + "x" + height
        if(width > MAX_IMAGE_WIDTH){
          height = height / width * MAX_IMAGE_WIDTH
          width = MAX_IMAGE_WIDTH
          head = "Original size: "
        }
        if(height > MAX_IMAGE_HEIGHT){
          width = width / height * MAX_IMAGE_HEIGHT
          height = MAX_IMAGE_HEIGHT
          head = "Original size: "
        }
        document.getElementById('scaledElement').innerHTML = head + end
        document.getElementById('codeEditorImage').width = width
        document.getElementById('codeEditorImage').height = height
      }

      return (
      <Block column textAlign="center">
        <Flex flex align="center">
          <img id="codeEditorImage"/>
        </Flex>
        <span id="scaledElement"></span>
      </Block>
      )
    }
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
        saveKeyBindFunc={props.onChange(activeFile)}
        value={props.value}
        theme='tomorrow'
        // jsOptions={jsOptions}
      />
	  ) : <span/>
  }

})

