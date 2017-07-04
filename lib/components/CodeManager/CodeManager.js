/**
* Imports
*/

import {component, element} from 'vdux'
import {Block, Flex, Icon, Box} from 'vdux-ui'
import CodeEditor from 'components/CodeEditor'
import GameButton from 'components/GameButton'
import Tabs from 'components/Tabs'
/**
* <Code Manager/>
*/

export default component({
  render ({props, context}) {
    let {currentFile, openTabs, files} = context.state
    // console.log('currentFile',currentFile)
    // console.log('openTabs', openTabs)
    // console.log('files', files)
    // console.log('files[currentFile].name', currentFile && files[currentFile].name)
    // const nameOfCurrentFile = (currentFile && files[currentFile].name)
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
            active={currentFile}
          />
          <GameButton
            // onClick={context.createFile}
            bg='blue'
            px='5px'
            py='3px'
            h='25px'
            fs='14px'
            color='black'
          >
            Save
            <Icon
              fs='inherit'
              bolder
              name='save'
              ml='3px'
            />
          </GameButton>
        </Flex>
        <CodeEditor
          id='code-editor'
          // value={currentFile &&
          //   (files[currentFile].contents || '// Edit ' + nameOfCurrentFile)}
        />
      </Block>
    )
  }
})