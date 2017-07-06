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
  render ({props, context}) {
    let {activeFile, openTabs, files} = props
    console.log('activeFile',activeFile)
    console.log('openTabs', openTabs)
    console.log('files', files)
    console.log('files[activeFile].name', activeFile && files[activeFile].name)
    return (
      <Block
        id='code-manager'
        backgroundColor={props.backgroundColor} 
        borderLeft
        borderBottom
        borderWidth={1}
        borderColor='#aaa'
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
          />
          <ConditionalGameButton
            condition={props.collapsePreviewManager}
            onClick={props.setCollapsePreviewManager(false)}
            bg='blue'
            px='5px'
            py='3px'
            h='25px'
            fs='14px'
            color='black'
          >
            <Icon
              fs='inherit'
              bolder
              name='first_page'
              ml='3px'
            />
          </ConditionalGameButton>
        </Flex>
        <CodeEditor
          id='code-editor'
          value={activeFile &&
            (files[activeFile].contents || '// Edit ' + activeFile)}
        />
      </Block>
    )
  }
})