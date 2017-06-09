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
    return (
      <Block
        id="code-manager"
        backgroundColor="#ccc" 
        borderLeft
        borderBottom
        borderWidth={1}
        borderColor="black"
        w={props.w}
        p={5}
      >
        <Flex align='space-between center'>
          <h2>Code</h2>
        </Flex>
        <Tabs
          mt='-1em'
          tabs={['index.js', 'other.html']}
          tabHeight="25px"
        />
        <CodeEditor id="code-editor"
          updateCode={props.updateCode}
          height={props.height-10}
          width={props.height-10}
        />    
      </Block>
    )
  }
})