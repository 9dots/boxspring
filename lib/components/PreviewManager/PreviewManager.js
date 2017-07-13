/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import createAction from '@f/create-action'
import sleep from '@f/sleep'
import Sandbox from 'components/Sandbox'
import querystring from 'querystring'

// var createModuleSandbox = require('browser-module-sandbox')
// var createSandbox = createAction('createSandbox')

/**
 * <Preview Manager/>
 */

// function stringifyPackageJson (pj) {
//   return JSON.stringify(pj, null, '  ')
// }

// // in progress
// function updatePackageJson (code) {
//   try {
//     window.packagejson = packagejson = JSON.parse(code)
//   } catch (e) {
//     // don't allow running the code if package.json is invalid
//     console.log('Code was invalid -- could not update package json')
//   }
// }
// var modules = detective(editors.get('bundle').getValue())

export default component({
  initialState: {
    bundle: `document.body.appendChild(
      document.createTextNode("Build your code and preview here...")
    )`
  },

  * onCreate({state, actions}) {
    yield sleep()
  },

  controller: {
    // bundleStart: () => console.log('bundle start...'),
    // bundleEnd: () => console.log('bundle end...'),
    // bundleError: (err) => console.log('bundle error: ', err),
    * buildAndRun({props, state, actions}) {
      console.log("Building and running...")
      
      // flush all files to GCS
      yield props.save()
      
      // send req to bundle server, which returns URL
      let bundleURL = yield actions.buildBundle()
      
      // Download bundle from given URL
      let bundle = yield fetch(bundleURL)
        .then((response) => response.text())
        .catch(err => console.log("Error making GCS media request", err))
      
      // on response, set iframe to bundle contents
      yield actions.setBundle(bundle)
    },

    * buildBundle({context}) {
      let url = `http://localhost:3000/bundle?`
      let params = {projectId: context.projectId}
      url += querystring.stringify(params)
      let bundleURL = yield fetch(url)
        .then((response) => response.text())
        .catch((err) => console.log("Error building bundle", err))
      return bundleURL
     },
  },

  reducer: {
    setBundle: (state, bundle) => ({bundle}),
    
    // updatePackageJson (state, modules) {
    //   console.log("modules event emitted...")
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

  render ({state, props, actions}) {
    return props.collapsed ? <span /> : (
    	<Block
    		id="preview-manager"
    		backgroundColor={props.backgroundColor} 
    		borderLeft
        borderBottom
        borderRight
    		w={props.w}
        p={3}
        borderColor="#aaa"
    		tall
    	>
    		<Flex align='space-between center' h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "20px"}}>Preview</h2>
          <Flex align='flex-end center' h="35px">
            <GameButton onClick={actions.buildAndRun} bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black" mr="4px">
                <Icon fs='inherit' bolder name='build' mr='5px'/>
                Build Project
            </GameButton>
            <GameButton 
              onClick={props.setPreviewManagerCollapsed(true)}
              bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black">
                <Icon fs='inherit' bolder name='last_page' mr='3px'/>
                Hide
            </GameButton>
          </Flex>
        </Flex>
        <Block id="preview-pane" backgroundColor="white" h='95%' w='100%'>
          <Sandbox script={state.bundle} />
        </Block>
    	</Block>
    )
  }
})

// function sandboxMiddleware ({dispatch, actions}) {
//   return next => action => {
//     if (action.type === createSandbox.toString()) {
//       var sandboxOpts = {
//         // TODO: remove hardcoded values
//         cdn: 'https://wzrd.in',
//         container: document.getElementById('preview-pane'), 
//         iframeStyle: 'body, html { height: 100% width: 100% }'
//       }
//       // sandboxOpts.cacheOpts = { inMemory: true }
//       var sandbox = createModuleSandbox(sandboxOpts)

//       sandbox.iframeHead = '<head></head>'
//       sandbox.iframeBody = '<body><div id="app"></div></body>'

//       sandbox.on('bundleStart', () => dispatch(actions.bundleStart()))
//       sandbox.on('modules', modules => dispatch(actions.updatePackageJson(modules)))
//       sandbox.on('bundleEnd', () => dispatch(actions.bundleEnd()))
//       sandbox.on('bundleError', err => dispatch(actions.bundleError(err)))
//       dispatch(actions.setSandbox(sandbox))
//     }
//     return next(action)
//   }
// }