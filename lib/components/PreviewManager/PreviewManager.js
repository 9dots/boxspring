/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'

var createSandbox = require('browser-module-sandbox')
// var request = require('browser-request')
// var keydown = require('keydown')
// var uglify = require('uglify-js')
// var editors = window.editors = require('./lib/editors')

/**
 * <Preview Manager/>
 */

var packagejson = {'name': 'requirebin-sketch', 'version': '1.0.0'}

function stringifyPackageJson () {
  return JSON.stringify(packagejson, null, '  ')
}

export default component({

  initialState() {
    var sandboxOpts = { // TODO: remove hardcoded values
      cdn: 'https://wzrd.in',
      container: document.getElementById('preview-pane'), 
      iframeStyle: 'body, html { height: 100% width: 100% }'
    }

    return {
      sandbox: createSandbox(sandboxOpts)
    }
  },

  onCreate({state}) {

    state.sandbox.iframeHead = '<head></head>'
    state.sandbox.iframeBody = '<body></body>'

    state.sandbox.on('modules', function (modules) {
      console.log("Got module list from detective...")
      // if (!modules) return
      // packagejson.dependencies = {}
      // modules.forEach(function (mod) {
      //   if (mod.core) return
      //   packagejson.dependencies[mod.name] = mod.version
      // })
    })

    state.sandbox.on('bundleStart', function () {
      console.log("starting bundle...")
    })

    state.sandbox.on('bundleEnd', function (bundle) {
      console.log("bundle complete")
    })

    state.sandbox.on('bundleError', function (err) {
      console.log('Bundling error: \n\n' + err)
    })

  },

  controller: {
    buildAndRun({props, state}) {
      console.log("Building and running...")
      console.log(props.userCode)
      state.sandbox.bundle(props.userCode)
    }
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


