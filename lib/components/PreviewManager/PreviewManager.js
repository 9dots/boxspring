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
import {h32} from 'xxhashjs'
import gcs from 'client/gcsClient.js'

/**
 * <Preview Manager/>
 */

export default component({
  initialState: {
    appHTML: '',
    buildInProgress: false,
  },

  * onCreate({state, props, actions}) {
    yield props.setBuildApp(actions.buildAndRunApp)
    yield sleep()
  },

  controller: {
    //onClick function for building app
    * buildAndRunApp({props, state, actions, context}, server) {
      console.log(props)
      console.log(props.buildApp)
      let {bundle, bundleName} = props
      console.log("Building and running project...")
      
      yield actions.setBuildInProgress(true)

      console.time('buildAndRunApp')
       
      props.saveOpenFilesToGCS()
      
      // initiate build processes for depsBundle and appBundle
      let html = yield props.getFileContentsFromName(`${context.projectId}/index.html`)
      let appBundle = ""

      // let jsFiles = props.fileTree.filter((file) => {
      //   let arr = file.displayName.split(".")
      //   if(arr.length == 0)
      //     return false
      //   else if(arr[arr.length-1] == "js")
      //       return true
      //   return false
      // })

      // let failedUpload = false

      // for(var i=0; i < jsFiles.length; i++){
      //   let file = jsFiles[i]
      //   let content = yield props.getFileContentsFromName(file.name)
      //   let {ok} = yield context.uploadSourceFileToServer(context.projectId, file.displayName, content)
      //   if(!ok)
      //     failedUpload = true
      // }
      // if(failedUpload){
      //   console.log("Failed while uploading files to server")
      //   return
      // }

      let {ok, output} = yield context.getAppBundleFromServer(context.projectId)  //need to add state for app bundle cache name
      
      if(!ok){
        console.log("Failed to get app bundle from server")
        // yield props.setError('server', false)
        // yield props.setError('appBundle', false)
        // yield props.setError('depsBundle', false)
        yield actions.setBuildInProgress(false)
        // yield props.setBundle(bundle)
        return
      }
      appBundle = output
      // let [depsBundle, appBundle, html] = yield [
      //   actions.getDepsBundleFromServer(server),
      //   actions.getAppBundleFromServer(server),
      //   props.getFileContentsFromName(`${context.projectId}/index.html`)
      // ]
      if(bundleName == ""){
        console.log("no bundle name")
        bundle = {content:"", name:"EMPTY_DEFAULT"}
      } else if(bundleName == "LOADING"){
        console.log("bundleName still loading")
        bundle = {content:"", name:"EMPTY_LOADING"}
      }
      else if(bundleName != bundle.name){
        console.log("Getting bundle from server: " + bundleName)
        let {ok, output} = yield context.getBundleFromServer(context.projectId, bundleName)
        if(ok){
          bundle = {content:output, name:bundleName}
        } else {
          console.log("request failed")
        }
      }else {
        console.log("Re-using cache bundle")
      }
      console.timeEnd('buildAndRunApp')
      // console.log('Got depsBundle: ', depsBundle)
      // console.log('Got appBundle: ', appBundle)

      // error handling for failed bundles
      // clear old server error
      yield props.setError('server', false)
      yield props.setError('appBundle', false)
      yield props.setError('depsBundle', false)

      // if (appBundle.status == 200)
      //   yield props.setError('appBundle', false)
      // else {
      //   if (appBundle.status == 500)
      //     yield props.setError('server', true)
      //   else
      //     yield props.setError('appBundle', true)
      // }

      // if (depsBundle.status == 200)
      //   yield props.setError('depsBundle', false)
      // else {
      //   if (depsBundle.status == 500)
      //     yield props.setError('server', true)
      //   else
      //     yield props.setError('depsBundle', true)
      // }            
      
      // if (appBundle.status!=200 || depsBundle.status!=200) {
      //   yield actions.setBuildInProgress(false)
      //   return
      // }

      // on response, set iframe to bundle contents
      console.log(bundle)
      console.log(appBundle)
      console.log(html)
      yield actions.updateBuild(bundle, {content:appBundle}, html)

      yield actions.setBuildInProgress(false)
      yield props.setBundle(bundle)
    },

    * getDepsBundleFromServer({context, props}, server) {
      console.time("GET_DEPS_BUNDLE")
      console.log("Getting depsBundle...")
      let {depsBundleCache} = props

      // first we hash package.json
      let packageJSON = yield props.getFileContentsFromName(context.packageJSONPath)

      let packageHash = h32(packageJSON, 0xABCD).toString(36)
      console.log("packageHash", packageHash)

      // then we check in browser cache for bundle with matching hash
      // if found, we use.
      if (depsBundleCache.hasOwnProperty(packageHash)) {
        console.log("FOUND depsBundle in in-memory app cache...")
        console.timeEnd("GET_DEPS_BUNDLE")
        return {status: 200, value: depsBundleCache[packageHash]}
      } else {
        console.log("depsBundle NOT FOUND in in-memory app cache...")
      }

      // otherwise
      // we check if bundle was previously built by trying to DL deps bundle
      // if found, we use
      let preBuiltBundle = yield gcs.fetchBundleByHash(
        packageHash, context.projectId
      )
      if (preBuiltBundle) {
        console.log("Found & downloaded depsBundle pre-built in GCS...")
        console.timeEnd("GET_DEPS_BUNDLE")
        return {
          status: 200,
          value: {
            bundleType: 'deps',
            hash: packageHash,
            contents: preBuiltBundle
          }
        }
      }
      
      // otherwise
      // we send buildDepsBundle request to server
      // server assumes not built. so it won't check the cache
      let depsBundle = {}
      let url = getBuildServerURL(server, 'deps', context.projectId)
      let response = yield fetch(url).catch((err) => {
          console.log("Error connecting to Deps Build Server:", err)
          return { status: 500 }
        })
      if (response.status == 200) {
        depsBundle.status = 200
        depsBundle.value = yield response.json()
      } else {
        depsBundle = { status: response.status }
      }
      
      console.log("Fetched fresh depsBundle from cloud function...")
      console.timeEnd("GET_DEPS_BUNDLE")
      return depsBundle
    },

    * getAppBundleFromServer({context, props}, server) {
      console.time("GET_APP_BUNDLE")
      console.log("Getting appBundle...")

      // we check in browser cache for app bundle
      // if found, we use.
      if (props.appBundleCache) {
        console.log("appBundle found in in-memory app cache...")
        console.timeEnd("GET_APP_BUNDLE")
        return { status: 200, value: props.appBundleCache }
      }

      // otherwise, we ask the server to build it
      let appBundle = {}
      let url = getBuildServerURL(server, 'app', context.projectId)
      let response = yield fetch(url)
        .catch((err) => {
          console.log("Error connecting to App Build Server:", err)
          appBundle = { status: 500 }
        })

      if (appBundle.status != 500 && response.status == 200) {
        let json = yield response.json()
        appBundle = { status: 200, value: json }
      }

      console.log('appBundle after initial request', appBundle)
      if (appBundle.status != 200)
        return appBundle

      // server may have returned cached build URL or actual bundle contents
      if (appBundle.value.resultType === 'bundleContents') {
        console.log("Server built a fresh appBundle...")
        console.timeEnd("GET_APP_BUNDLE")
        return appBundle
      }

      // otherwise, we've been given a mediaLink to download...
      // fetch cached bundle
      console.log("Server returned link to cached appBundle in GCS...", appBundle.value.mediaLink)
      
      let cachedBundle = {}
      response = yield fetch(appBundle.value.mediaLink)
        .catch((err) => {
          console.log("Error downloading cached App Build:", err)
          cachedBundle = { status: 500 }
        })

      if (response.ok) {
        let text = yield response.text()
        cachedBundle = {
          status: 200,
          value: {
            contents: text,
            hash: appBundle.value.hash
          }
        }
      } else {
        cachedBundle = { status: response.status }
      }

      console.timeEnd("GET_APP_BUNDLE")
      return cachedBundle
    }
  },

  reducer: {
    updateBuild: (state, depsBundle, appBundle, appHTML) => {
      return {depsBundle, appBundle, appHTML}
    },

    setBuildInProgress: (state, buildInProgress) => ({buildInProgress}),
  },

  render ({state, props, actions}) {
    let {buildInProgress, depsBundle, appBundle, appHTML} = state

    let buildFailure = props.error['packageJSON'] || props.error['appBundle'] || props.error['depsBundle'] || props.error['server']

    console.log("props.error: ", props.error)
    console.log(props.fileTree)
    return props.collapsed ? <span /> : (
    	<Block
    		id="preview-manager"
    		backgroundColor={props.backgroundColor} 
        borderRight
    		w={props.w}
        px={6} pt={3}
        borderColor="#8e8e8e"
    		tall
    	>
    		<Flex align='space-between center' h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "15px"}}>Preview</h2>
            <Flex align='flex-end center' h="35px">
              <GameButton 
                onClick={props.setPreviewManagerCollapsed(true)}
                bg='#ddd' px='5px' py='3px' h="25px" fs="14px" color="black"mr="4px">
                  <Icon fs='inherit' bolder name='last_page' mr='3px'/>
                  Hide
              </GameButton>
              <GameButton disabled={buildInProgress} onClick={actions.buildAndRunApp} bg={buildInProgress ? "gray" : "#42a8ff" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" }>
                  {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
                  {buildInProgress ? "Building..." : "Build Project" }
              </GameButton>
            </Flex>
        </Flex>

        <Block id="preview-pane" backgroundColor={buildFailure ? "#ff5555" :"white"} h='95%' w='100%'>
          { !buildFailure ?
            <Sandbox buildInProgress={buildInProgress}
                     depsBundle={depsBundle ? depsBundle.content : ''}
                     appBundle={appBundle ? appBundle.content : ''}
                     appHTML={appHTML}
            />
           :
           <div style={{padding: "2px 8px 5px 8px", color:"white"}} >
              <h3 style={{marginTop: 15}}>Application failed to build.</h3>
              <h4 style={{marginTop: 0, marginBottom: 0, paddingBottom: 0,textDecoration:"underline", fontSize: "0.91em"}}>Fix the following error(s) and try again:</h4>
              <ul style={{paddingLeft:25, fontSize: "0.91em", marginTop: 10, paddingTop: 0}}>
                {props.error['packageJSON'] && <li><strong>Error:</strong> Your <strong>package.json</strong> is not valid JSON.</li>}
                {props.error['appBundle'] && <li><strong>Error:</strong> Your application contains invalid JavaScript code.</li> }
                {props.error['depsBundle'] && <li><strong>Error:</strong> Your application attempts to import modules that do not exist. See package.json for more details.</li> }
                {props.error['server'] && <li><strong>Error:</strong> The Boxspring build server failed due to an internal error.</li> }
              </ul>
            </div>
          }
        </Block>
      </Block>
    )
  }
})

function getBuildServerURL(server, bundleType, projectId) {
  let url

  const serverPort = 8082

  // first choose server (local or GCS Cloud Function)
  //if (server === "local")
  url = 'http://localhost:' + serverPort
  //else
  //  url = 'https://us-central1-boxspring-88.cloudfunctions.net'

  // then choose bundle type: dependencies bundle or app bundle
  //if (bundleType === 'app')
  //  url += '/buildAppBundle?'
  //else
    url += '/getBundle'

  // finally add projectId as querystring param
  let params = {projectId: projectId}
  url += querystring.stringify(params)

  return url
}

/* 'Local Build' Button */
//   {false && <GameButton disabled={buildInProgress} onClick={actions.buildAndRunApp('local')} bg={buildInProgress ? "gray" : "green" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
//       {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
//       {buildInProgress ? "Building..." : "Local Build" }
//   </GameButton>}

// <div style={{position:"absolute", top: 50, left: "0%", textAlign: "center", backgroundColor: "red", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", width: "50%", marginLeft: "25%", marginRight: "25%" }}>