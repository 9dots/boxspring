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
    errorMsg:"No error message received...",
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
      let css = yield props.getFileContentsFromName(`${context.projectId}/style.css`)
      let appBundle = ""

      // let res = yield actions.uploadSourceJSFiles()

      // if(!(res.ok)){
      //   console.log("Failed while uploading files to server")
      //   yield actions.setErrorMsg(res.output)
      //   yield props.setError('appBundle', true)
      //   yield actions.setBuildInProgress(false)
      //   yield actions.updateBuild("", {content:""}, "")
      //   return
      // }

      let {ok, output} = yield context.createAppBundleOnServer(context.projectId, props.fileTree)  //need to add state for app bundle cache name
      // console.log(output)
      if(!ok){
        console.log("Failed to get app bundle from server")
        // yield props.setError('server', false)
        // yield props.setError('appBundle', false)
        // yield props.setError('depsBundle', false)
        console.log(output)
        yield actions.setErrorMsg(output)
        yield props.setError('appBundle', true)
        yield actions.setBuildInProgress(false)
        yield actions.updateBuild("", {content:""}, "")
        // yield props.setBundle(bundle)
        return
      }
      console.log(output)

      appBundle = output

      // let [depsBundle, appBundle, html] = yield [
      //   actions.getDepsBundleFromServer(server),
      //   actions.getAppBundleFromServer(server),
      //   props.getFileContentsFromName(`${context.projectId}/index.html`)
      // ]
      // if(bundleName == ""){
      //   console.log("no bundle name")
      //   bundle = {content:"", name:"EMPTY_DEFAULT"}
      // } else if(bundleName == "LOADING"){
      //   console.log("bundleName still loading")
      //   bundle = {content:"", name:"EMPTY_LOADING"}
      // }
      // else if(bundleName != bundle.name){
      //   console.log("Getting bundle from server: " + bundleName)
      //   let {ok, output} = yield context.getBundleFromServer(context.projectId, bundleName)
      //   if(ok){
      //     bundle = {content:output, name:bundleName}
      //   } else {
      //     console.log("request failed")
      //   }
      // }else {
      //   console.log("Re-using cache bundle")
      // }
      console.timeEnd('buildAndRunApp')

      // error handling for failed bundles
      // clear old server error
      yield props.setError('server', false)
      yield props.setError('appBundle', false)
      yield props.setError('depsBundle', false)


      // on response, set iframe to bundle contents
      // console.log(bundle)
      // console.log(appBundle)
      // console.log(html)
      bundle = ""

      yield actions.updateBuild(bundle, {content:appBundle}, html, css)

      yield actions.setBuildInProgress(false)
      yield props.setBundle(bundle)
    },

    * uploadSourceJSFiles({props,context, state, actions}){
      let jsFiles = props.fileTree.filter((file) => {
        let arr = file.displayName.split(".")
        if(arr.length == 0)
          return false
        else if(arr[arr.length-1] == "js" || arr[arr.length-1] == "png" || arr[arr.length-1] == "jpg" || arr[arr.length-1] == "jpeg" || arr[arr.length-1] == "gif")
            return true
        return false
      })

      let failedUpload = false

      for(var i=0; i < jsFiles.length; i++){
        let file = jsFiles[i]
        let content = yield props.getFileContentsFromName(file.name)
        let {ok, output} = yield context.uploadSourceFileToServer(context.projectId, file.displayName, content)
        if(!ok){
          return {ok:false, output}
        }
      }
      return {ok:true}
    },
  },



  reducer: {
    updateBuild: (state, depsBundle, appBundle, appHTML, appCSS) => {
      return {depsBundle, appBundle, appHTML, appCSS}
    },

    setBuildInProgress: (state, buildInProgress) => ({buildInProgress}),

    setErrorMsg: (state, errorMsg) => {
      return {errorMsg}
    },
  },

  render ({state, props, actions}) {
    let {buildInProgress, depsBundle, appBundle, appHTML, appCSS} = state

    let errorMsg = state.errorMsg || ""
    let buildFailure = props.error['packageJSON'] || props.error['appBundle'] || props.error['depsBundle'] || props.error['server']

    console.log("props.error: ", props.error)
    // console.log(props.fileTree)
    // errorMsg = errorMsg.replace(/\n/g, '<br/>')
    //original error schema
    //<ul style={{paddingLeft:25, fontSize: "0.91em", marginTop: 10, paddingTop: 0}}>
    //             {props.error['packageJSON'] && <li><strong>Error:</strong> Your <strong>package.json</strong> is not valid JSON.</li>}
    //             {props.error['appBundle'] && <li><strong>Error:</strong> Your application contains invalid JavaScript code.</li> }
    //             {props.error['depsBundle'] && <li><strong>Error:</strong> Your application attempts to import modules that do not exist. See package.json for more details.</li> }
    //             {props.error['server'] && <li><strong>Error:</strong> The Boxspring build server failed due to an internal error.</li> }

                  //</ul>

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
                       appBundle={appBundle ? appBundle.content : ''}
                       appHTML={appHTML}
                       appCSS={appCSS}
              />
           :
          <div>
            <div style={{padding: "2px 8px 5px 8px", color:"white"}} >
              <h3 style={{marginTop: 15}}>Application failed to build.</h3>
              <h4 style={{marginTop: 0, marginBottom: 0, paddingBottom: 0,textDecoration:"underline", fontSize: "0.91em"}}>Fix the following error(s) and try again:</h4>
              <div id="errorMessageDiv" style={{fontSize: "12"}}>
              {errorMsg.split("\n").map(i => {
                return <div>{i}</div>;
               })}
              </div>
              
            </div>
          </div>
          }
        </Block>
      </Block>
    )
  }
})



/* 'Local Build' Button */
//   {false && <GameButton disabled={buildInProgress} onClick={actions.buildAndRunApp('local')} bg={buildInProgress ? "gray" : "green" }  px='5px' py='3px' h="25px" fs="14px" color={buildInProgress ? "#ccc" : "black" } mr="4px">
//       {buildInProgress || <Icon fs='inherit' bolder name='build' mr='3px'/>}
//       {buildInProgress ? "Building..." : "Local Build" }
//   </GameButton>}

// <div style={{position:"absolute", top: 50, left: "0%", textAlign: "center", backgroundColor: "red", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", width: "50%", marginLeft: "25%", marginRight: "25%" }}>