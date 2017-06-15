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
  render ({props}) {
    let {currentFile, openTabs, files} = props
    return (
      <Block
        id="code-manager"
        backgroundColor={props.backgroundColor} 
        borderLeft
        borderBottom
        borderWidth={1}
        borderColor="#aaa"
        tall
        w={props.w}
        p={3}
      >
        <Flex align='space-between center' borderColor="#ccc" h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "20px"}}>Code</h2>
          <Tabs
            ml="50px"
            tabs={openTabs.map(t => files[t].name)}
            tabHeight="18px"
            active={currentFile && files[currentFile].name}
          />
        </Flex>
        <CodeEditor id="code-editor"
          updateCode={props.updateCode}
          value={(currentFile && files[currentFile].contents) || ''}
        />
      </Block>
    )
  }
})