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
    depsBundle: {},
    appBundle: {},
    appHTML: '',
    buildInProgress: false,
  },

  * onCreate({state, actions}) {
    yield sleep()
  },

  controller: {
    * buildAndRun({props, state, actions, context}, server) {
      console.log("Building and running project...")
      
      yield actions.setBuildInProgress(true)

      console.time('buildAndRun')
      
      // flush all files to GCS
      yield props.save()
      
      // Download bundles from given URL
      let [depsBundle, appBundle, html] = yield [
        actions.getDepsBundleFromServer(server),
        actions.getAppBundleFromServer(server),
        props.getFileContentsFromName(`${context.projectId}/index.html`)
      ]
      
      console.timeEnd('buildAndRun')
      
      // on response, set iframe to bundle contents
      yield actions.updateBuild(depsBundle, appBundle, html)

      yield actions.setBuildInProgress(false)
    },

    * getDepsBundleFromServer({context}, server) {
      let url = getBuildServerURL(server, 'deps', context.projectId)
      let responseObj = yield fetch(url)
      .then((response) => response.json())
      .catch((err) => console.log(err))
      
      console.log(responseObj)
      return responseObj
    },

    * getAppBundleFromServer({context}, server) {
      let url = getBuildServerURL(server, 'app', context.projectId)
      let responseObj = yield fetch(url)
        .then((response) => response.json())
        .catch((err) => console.log(err))

      console.log(responseObj)
      if (responseObj.responseType === 'bundleContents')
        return responseObj

      // otherwise, we've been given a mediaLink to download...
      // fetch cached bundle
      let bundleObj = { hash: responseObj.hash }
      bundleObj.contents = yield fetch(responseObj.mediaLink)
      .then((response) => response.text())
      .catch(err => console.log("Error making GCS media request", err))
      
      return bundleObj
    },

  },

  reducer: {
    updateBuild: (state, depsBundle, appBundle, appHTML) => {
      return {depsBundle, appBundle, appHTML}
    },

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
    let {buildInProgress, depsBundle, appBundle, appHTML} = state

    // console.log("depsBundle", depsBundle)
    // console.log("appBundle", appBundle)

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
                   depsBundle={depsBundle.contents}
                   appBundle={appBundle.contents}
                   appHTML={appHTML}
          />
        </Block>
      </Block>
    )
  }
})

function getBuildServerURL(server, bundleType, projectId) {
  let url

  // first choose server (local or GCS Cloud Function)
  if (server === "local")
    url = 'http://localhost:3000'
  else
    url = 'https://us-central1-boxspring-88.cloudfunctions.net'

  // then choose bundle type: dependencies bundle or app bundle
  if (bundleType == 'app')
    url += '/buildAppBundle?'
  else
    url += '/buildDepsBundle?'

  // finally add projectId as querystring param
  let params = {projectId: projectId}
  url += querystring.stringify(params)

  return url
}

            // <GameButton disabled={buildInProgress} onClick={actions.buildAndRun('local')} bg={buildInProgress ? "gray" : "yellow" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
            //     {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
            //     {buildInProgress ? "Building..." : "Build Local" }
            // </GameButton>