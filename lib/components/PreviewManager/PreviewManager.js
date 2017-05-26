/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import createAction from '@f/create-action'
import sleep from '@f/sleep'

var createModuleSandbox = require('browser-module-sandbox')
var createSandbox = createAction('createSandbox')

/**
 * <Preview Manager/>
 */

function stringifyPackageJson (pj) {
  return JSON.stringify(pj, null, '  ')
}

// in progress
function updatePackageJson (code) {
  try {
    window.packagejson = packagejson = JSON.parse(code)
  } catch (e) {
    // don't allow running the code if package.json is invalid
    console.log('Code was invalid -- could not update package json')
  }
}

// var modules = detective(editors.get('bundle').getValue())



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
    yield createSandbox()
  },

  controller: {
    bundleStart: () => console.log('bundle start...'),
    bundleEnd: () => console.log('bundle end...'),
    bundleError: (err) => console.log('bundle error: ', err),
    buildAndRun({props, state}) {
      console.log("Building and running...")
      console.log('packagejson:')
      console.log(state.packagejson)
      state.sandbox.bundle(props.userCode, state.packagejson.dependencies)
    }
  },

  reducer: {
    setSandbox: (state, sandbox) => ({sandbox}),
    
    updatePackageJson: function(state, modules) {
      console.log("Got module list from detective...")
      if (!modules) return
      
      let {packagejson} = state
      
      packagejson.dependencies = {}
      modules.forEach(function (mod) {
        if (mod.core) return
        packagejson.dependencies[mod.name] = mod.version
      })
      return {packagejson}
    }
  },

  middleware: [
    sandboxMiddleware
  ],

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


function sandboxMiddleware ({dispatch, actions}) {
  return next => action => {
    if (action.type === createSandbox.toString()) {
      var sandboxOpts = { // TODO: remove hardcoded values
        cdn: 'https://wzrd.in',
        container: document.getElementById('preview-pane'), 
        iframeStyle: 'body, html { height: 100% width: 100% }'
      }
      // sandboxOpts.cacheOpts = { inMemory: true }
      var sandbox = createModuleSandbox(sandboxOpts)

      sandbox.iframeHead = '<head></head>'
      sandbox.iframeBody = '<body><div id="app"></div></body>'

      sandbox.on('bundleStart', () => dispatch(actions.bundleStart()))
      sandbox.on('modules', modules => dispatch(actions.updatePackageJson(modules)))
      sandbox.on('bundleEnd', () => dispatch(actions.bundleEnd()))
      sandbox.on('bundleError', err => dispatch(actions.bundleError(err)))
      dispatch(actions.setSandbox(sandbox))
    }

    return next(action)
  }
}