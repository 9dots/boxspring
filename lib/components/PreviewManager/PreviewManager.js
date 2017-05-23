/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import sleep from '@f/sleep'

var createSandbox = require('browser-module-sandbox')

/**
 * <Preview Manager/>
 */

function stringifyPackageJson () {
  return JSON.stringify(packagejson, null, '  ')
}

export default component({
  initialState: {
    packagejson: {
      name: "boxspring-project",
      version: "1.0.0",
      dependencies: {},
    }
  },

  * onCreate({state, actions}) {
    yield sleep()

    var sandboxOpts = { // TODO: remove hardcoded values
      cdn: 'https://wzrd.in',
      container: document.getElementById('preview-pane'), 
      iframeStyle: 'body, html { height: 100% width: 100% }'
    }
    // sandboxOpts.cacheOpts = { inMemory: true }
    var sandbox = createSandbox(sandboxOpts)

    sandbox.iframeHead = '<head></head>'
    sandbox.iframeBody = '<body><div id="app"></div></body>'

    sandbox.on('bundleStart', function () {
      console.log("starting bundle...")
    })

    // sandbox.on('modules', actions.updatePackageJson)
    sandbox.on('modules', function(modules) {
      console.log('modules fired')
      // console.log(modules)
    })

    sandbox.on('bundleEnd', function (bundle) {
      console.log("bundleEnd")
    })

    sandbox.on('bundleError', function (err) {
      console.log('Bundling error: \n\n' + err)
    })

    yield actions.setSandbox(sandbox)
  },

  controller: {
    buildAndRun({props, state}) {
      console.log("Building and running...")
      console.log('packagejson:')
      // console.log(state.packagejson)
      state.sandbox.bundle(props.userCode)
    }
  },

  reducer: {
    setSandbox: (state, sandbox) => ({sandbox}),
    
    // updatePackageJson: function(state, modules) {
    //   console.log("Got module list from detective...")
    //   if (!modules) return
      
    //   let {packagejson} = state
      
    //   packagejson.dependencies = {}
    //   modules.forEach(function (mod) {
    //     if (mod.core) return
    //     packagejson.dependencies[mod.name] = mod.version
    //   })
    //   return {packagejson}
    // }
  },

  render ({props, actions}) {
    return (
    	<Block
    		id="preview-manager"
    		backgroundColor="#ccc" 
    		border
    		borderWidth={1}
    		borderColor="black"
    		w={props.w}
    		tall
    	>
    		<Flex align='space-between center'>
          <h1>Preview</h1>
          <GameButton onClick={actions.buildAndRun} bg='blue' mr='s' px='5px' py='5px' h="35px" fs="16px" color="black">
              Run
              <Icon fs='inherit' bolder name='play_arrow' ml='3px'/>
          </GameButton>
        </Flex>
        <Block id="preview-wrapper" px="5px" wide tall>
          <Block id="preview-pane" backgroundColor="white" h='87.5%' w='97.5%'>
          </Block>
        </Block>
    	</Block>
    )
  }
})


