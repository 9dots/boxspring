/**
* Imports
*/

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box, Button} from 'vdux-ui'
import CodeEditor from 'components/CodeEditor'
import ConditionalGameButton from 'components/ConditionalGameButton'
import Tabs from 'components/Tabs'
/**
* <Code Manager/>
*/

export default component({

  
  render ({state, actions, props, context}) {
    let {activeFile, openTabs, files} = props
    var codeViewJSX
    if(activeFile != "" && activeFile != null){
      if(files[activeFile] && files[activeFile].contents != undefined){
        codeViewJSX = (<CodeEditor
          id='code-editor'
          activeFile={activeFile}
          value={activeFile && (files[activeFile].contents || ' ')}
          onChange={props.onFileChange}
        />)

      } else {
        codeViewJSX = <span>Content loading. Try re-clicking the file if the page doesn't load</span>
      }
    } else {
      codeViewJSX = <span style={{fontSize:"18px", textAlign:"center"}}> Click a file in the side bar to open it... </span>
    }

    return (
      <Block
        fontFamily='code'
        id='code-manager'
        backgroundColor={props.backgroundColor} 
        borderWidth={2}
        borderColor='#8e8e8e'
        borderRight = {props.activeFile ? true : true}
        textAlign="center"
        tall
        w={props.w}
        px={6} pt={3}
      >
        <Flex align='space-between center' borderColor='#d5d5d5' h='35px'>
          <h2 style={{margin: '4px 0px 4px 0px', fontSize: '15px',}}>
            {props.header}
          </h2>
          {props.saveInProgress ? <span w={400} mr={5}>Saving...</span> : <span />}
          <ConditionalGameButton
            condition={props.previewManagerCollapsed}
            onClick={props.setPreviewManagerCollapsed(false)}
            bg='#ddd'
            px='5px'
            py='3px'
            h='25px'
            fs='14px'
            color='black'
          >
            <Icon fs='inherit' bolder name='first_page' mr='3px'/>
            Show
          </ConditionalGameButton>
        </Flex>
        {codeViewJSX}
      </Block>
    )
  }
})