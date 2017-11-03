/**
* Imports
*/

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import CodeEditor from 'components/CodeEditor'
import ConditionalGameButton from 'components/ConditionalGameButton'
import Tabs from 'components/Tabs'
/**
* <Code Manager/>
*/

export default component({

  
  render ({state, actions, props, context}) {
    let {activeFile, openTabs, files} = props
    return (
      <Block
        fontFamily='code'
        id='code-manager'
        backgroundColor={props.backgroundColor} 
        borderLeft
        borderBottom
        borderWidth={1}
        borderColor='#aaa'
        borderRight={props.previewManagerCollapsed ? true : false}
        tall
        w={props.w}
        p={3}
      >
        <Flex align='space-between center' borderColor='#ccc' h='35px'>
          <h2 style={{
              margin: '4px 0px 4px 0px', 
              fontSize: '20px',
            }}
          >Code</h2>
          <Tabs
            ml='10px'
            tabs={openTabs}
            tabHeight='18px'
            files={files}
            active={activeFile}
            onTabClick={props.onTabClick}
            closeTab={props.closeTab}
          />
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
        <CodeEditor
          id='code-editor'
          activeFile={activeFile}
          value={activeFile && (files[activeFile].contents || ' ')}
          onChange={props.onFileChange}
        />
      </Block>
    )
  }
})