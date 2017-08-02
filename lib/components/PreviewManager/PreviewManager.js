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
    bundle: ``,
    html: ``,
    buildInProgress: false,
  },

  * onCreate({state, actions}) {
    yield sleep()
  },

  controller: {
    * buildAndRun({props, state, actions, context}, server) {
      console.log("Building and running project...")
      
      yield actions.setBuildInProgress(true)

      console.time('project.buildAndRun')
      
      // flush all files to GCS
      yield props.save()
      
      // send req to bundle server, which returns URL
      let bundleURL = yield actions.getBuildFromServer(server)

      // console.log("Response from buildserver", bundleURL)
      
      // Download bundle from given URL
      let [bundle, html] = yield [
        fetch(bundleURL)
        .then((response) => response.text())
        .catch(err => console.log("Error making GCS media request", err)),
        props.getFileContentsFromName(`${context.projectId}/index.html`)
      ]
      
      console.timeEnd('project.buildAndRun')
      
      yield actions.setBuildInProgress(false)

      // on response, set iframe to bundle contents
      yield actions.setBundleAndHTML(bundle, html)
    },

    * getBuildFromServer({context}, server) {
      let url
      if (server === "local")
        url = `http://localhost:3000/buildProject?`
      else
        url = 'https://us-central1-boxspring-88.cloudfunctions.net/buildProject?'
        // url = `https://us-central1-boxspring-81172.cloudfunctions.net/buildProject?`
      let params = {projectId: context.projectId}
      url += querystring.stringify(params)
      let bundleURL = yield fetch(url)
        .then((response) => response.text())
        .catch((err) => console.log("Error building bundle", err))
      return bundleURL
     },
  },

  reducer: {
    setBundleAndHTML: (state, bundle, html) => ({bundle, html}),
    setBuildInProgress: (state, buildInProgress) => ({buildInProgress}),
    
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
    let {buildInProgress} = state
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
            <GameButton disabled={buildInProgress} onClick={actions.buildAndRun('local')} bg={buildInProgress ? "gray" : "green" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
                {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
                {buildInProgress ? "Building..." : "Local Build" }
            </GameButton>
            <GameButton disabled={buildInProgress} onClick={actions.buildAndRun} bg={buildInProgress ? "gray" : "blue" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
                {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
                {buildInProgress ? "Building..." : "Build Project" }
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
          <Sandbox buildInProgress={buildInProgress}
                   userScript={state.bundle}
                   userHTML={state.html} 
          />
        </Block>
      </Block>
    )
  }
})

            // <GameButton disabled={buildInProgress} onClick={actions.buildAndRun('local')} bg={buildInProgress ? "gray" : "yellow" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
            //     {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
            //     {buildInProgress ? "Building..." : "Build Local" }
            // </GameButton>