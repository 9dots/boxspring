/**
 * Imports
 */

import {component, element} from 'vdux'
import theme from 'utils/theme'
import {
  Block,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  Icon
} from 'vdux-ui'
import fire from 'vdux-fire'
import deepFreeze from 'deep-freeze'
import gcs from 'client/gcsClient.js'
import {throttle} from 'redux-timing'
import Loading from 'components/Loading'
import FileSideBar from 'components/FileSideBar'
import CodeManager from 'components/CodeManager'
import PreviewManager from 'components/PreviewManager'
import GameButton from 'components/GameButton'
import ProjectNotFound from 'components/ProjectNotFound'
// const latestVersion = require('latest-version')
import detective  from 'detective'
const _ = require('lodash')
/**
 * <Project/>
 */
 function testCurried(prop){
  console.log(prop)
 }

const DEFAULT_BUNDLE_NAME = "default-bundle.js"

export default fire((props) => {
return{
    project: { ref: `/projects/${props.keyId}`, type: 'once' },     //project={projectId:name of the project}
    buildAvail: { ref: `/users/${props.uid}/`}
  }
})(component({
    initialState: {
      ready: false,
      projectNotFound: false,
      activeFile: null,
      openTabs: [],
      files: {},
      fileTree: [],
      previewManagerCollapsed: false,
      saveInProgress: false,
      bundle:{},
      buildApp:testCurried,
      bundleName: DEFAULT_BUNDLE_NAME, 
      depsBundleCache: "",
      appBundleCache: null,
      error: {
        packageJSON: false,
        depsBundle: false,
        appBundle: false,
        server: false
      }
    },

    * onCreate ({props, context, actions, state}) {
        return [
          yield context.setProjectId(props.keyId),
        ]
    },

    * onUpdate (prev, {props, state, actions, context}) {
      let {project} = props
      if (!state.projectNotFound && !props.project.loading && props.project.value == null) {
        yield actions.setProjectNotFound(true)
      }

      if (!state.ready && !props.project.loading) {
        yield actions.setReady()
        yield context.setProjectId(props.keyId)
        yield actions.setBundleName(props.project.value.bundleName)
      }
    },

    middleware: [
      throttle('saveOpenFilesToGCS', 1000),
      // throttle('updatePackageJSONDependencies', 2000),
    ],

    controller: {

      * goToHomePage({context}) {
        yield context.setUrl("/")
      },

      * openFile({actions}, file) {                                           //used by the FileManager to open a file in the code manager
        console.log(file)
        yield actions.updateFileContents(file.name, file.contents)
        yield actions.openTabForFile(file)
      },

      * onFileChange({context,actions, state}, name, contents) {
        console.log("File changed...", name)
        // if (name !== context.packageJSONPath) {
        //   yield actions.updatePackageJSONDependencies(name, contents)
        //   // don't invalidate appBundle cache if package.json modified
        //   yield actions.updateAppBundleCache(null)
        // }

        yield actions.saveFileLocally(name, contents)
        yield actions.saveOpenFilesToGCS()
      },

      * validatePackageJSON({props, actions, context}) {
        let packageJSONText = yield actions.getFileContentsFromName(context.packageJSONPath)
        try {
          let packageJSONObj = JSON.parse(packageJSONText)
          yield actions.setError('packageJSON', false)
          return packageJSONObj
        } catch (e) {
          console.log('Error: package.json is not valid JSON')
          yield actions.setError('packageJSON', true)
          return null
        }
      },

      * updatePackageJSONDependencies({state, context,actions}, name, contents) {
        // run detective & filter module names that are empty strings
        let detectedDeps = detective(contents).filter((mod) => mod)
        console.log("detectedDeps: ", detectedDeps)

        if (detectedDeps.length == 0)
          return

        let pj = yield actions.validatePackageJSON()
        if (pj == null)
          return

        let oldDeps = pj["dependencies"]
        // if no new modules detected, we're done
        let required_by_file = pj["required_by_file"] || {}
        if (_.isEqual(detectedDeps, required_by_file[name]))
          return

        // otherwise, regenerate dependencies, only add dependency if currently required by a file or manually added
        required_by_file[name] = detectedDeps
        let required_manually = pj["required_manually"] || {}
        let allDeps = {...required_manually}

        for (let fileName of Object.keys(required_by_file)) {
          for (let dep of required_by_file[fileName]) {
            // add dep to allDeps if not already included
            if (!allDeps.hasOwnProperty(dep)) {
              if (oldDeps.hasOwnProperty(dep)) {
                allDeps[dep] = oldDeps[dep]
              } else {
                // console.log("Looking for latest version of: ", dep)
                // let version = yield latestVersion(dep)
                // console.log("Found latest version of: ", dep, version)
                // allDeps[dep] = '^' + version
                allDeps[dep] = "*"
              }
            }
          }
        }

        pj["dependencies"] = allDeps
        pj["required_by_file"] = required_by_file
        let pjString = JSON.stringify(pj, null, 2)
        
        // save to GCS and local cache
        yield gcs.insertObject({
          bucket: context.BUCKET_NAME,
          name: context.packageJSONPath,
          contents: pjString
        }, false)
        yield actions.saveFileLocally(
          context.packageJSONPath,
          pjString
        )
      },

      * saveFileLocally({actions, state, props}, name, contents) {
        // console.log("In saveFileLocally...")
        yield actions.updateFileContents(name, contents)
      },

      * saveOpenFilesToGCS({state, actions, props, context}) {
        let {files, openTabs} = state

        for (let name of openTabs) {
          let file = files[name]
          if(file == undefined){
            console.log("File " + name + " not found in Project.saveOpenFilesToGCS")
          } else if (file.dirty) {
              yield actions.setSaveInProgress(true)
              yield gcs.insertObject({
                bucket: context.BUCKET_NAME,
                projectId: context.projectId,
                filename: file.displayName,
                contents: file.contents
              })
              yield actions.setDirty(name, false)
          }
        }
          
        yield actions.setSaveInProgress(false)
      },

      * closeTab({actions, state, props}, name) {
        let {openTabs} = state
        
        // yield actions.setActiveFile(null)
        yield actions.saveOpenFilesToGCS()
        yield actions.updateOpenTabs(name)
      },

      * closeTab({actions, state, props}, name) {
        let {openTabs} = state
        
        // yield actions.setActiveFile(null)
        yield actions.saveOpenFilesToGCS()
        yield actions.updateOpenTabs(name)
      },

      * getFileContentsFromName({actions, state, props}, name){
        // return cached contents if available
        console.log("get file contents by name")
        console.log(name)
        if (state.files[name] && state.files[name].contents) {
          // console.log("Fetching cached version of ", name)
          return state.files[name].contents
        }

        // otherwise, search fileTree for file metadata
        let {fileTree} = state
        let file = null
        console.log(fileTree)
        console.log(name)
        for (let i = 0; i < fileTree.length; i++) {
          if (fileTree[i].name === name) {
            file = fileTree[i]
            break
          }
        }
        if (file == null){
          console.log(`Error: could not find ${name} in fileTree`)
          //throw `Error: could not find ${name} in fileTree`
          return null
        }
        
        // download file using mediaLink in metadata
        let response = yield gcs.getObject(file)
        let contents = yield response.text()
          .catch(err => console.log("Error getting text from GCS response", err))

        return contents
      },

      * changeBundleName({props,actions, context}, bundleName){
        yield context.firebaseUpdate(`projects/${props.keyId}`, {bundleName})
        yield actions.setBundleName(bundleName)
      }

    },

    reducer: {
      setReady: () => ({ready: true}),
      setProjectNotFound: () => ({projectNotFound: true}),
      setBundleName: (state, bundleName) => ({bundleName}),
      setBundle: (state, bundle) => ({bundle}),
      setError: (state, key, val) => {
        return {
          error: {
            ...state.error,
            [key]: val
          }
        }
      },
      setSaveInProgress: (state, inProgress) => {
        // console.log("In reducer, setSaveInProgress to ", inProgress)
        return { saveInProgress: inProgress}
      },
      setPreviewManagerCollapsed: (state, collapse) => {
        return { previewManagerCollapsed: collapse }
      },

      processFileTree(state, fileTree) {
        if (!fileTree)
          return state
        let files = {}
        let newFileTree = []
        for (let file of fileTree) {
          let augmentedFile = {
            ...file,
            displayPath: file.name.substring(file.name.indexOf('/')),
            displayName: file.name.substring(file.name.indexOf('/') + 1) //original: displayName: file.name.substring(file.name.lastIndexOf('/')+1)
          }
          newFileTree.push(augmentedFile)
          files[file.name] = augmentedFile
        }
        // console.log(fileTree)
        return {fileTree: newFileTree, files}
      },
     
      updateFileContents(state, name, contents) {
        let prevContents = (state.files[name] && state.files[name].contents)
        return {
          files: {
            ...state.files,
            [name]: {
              ...state.files[name],
              contents: contents,
              dirty: (prevContents && (prevContents != contents))
            }
          }
        }
      },

      setActiveFile(state, name) {
        return { activeFile: name }
      },

      openTabForFile (state, file) {
        let newState = { activeFile: file.name}
        if (state.openTabs.indexOf(file.name) === -1)
          newState['openTabs'] = [...state.openTabs, file.name]
        return newState
      },

      setDirty(state, name, dirty) {
        // console.log("In setDirty...", name, dirty)
        return {
          files: {
            ...state.files,
            [name]: {
              ...state.files[name],
              dirty: dirty
            }
          }
        }
      },

      updateOpenTabs(state, name) {
        console.log("In updateOpenTabs", state)
        let activeTabIndex = state.openTabs.indexOf(name)
        let remainingTabs = state.openTabs.filter(tab => tab != name)        
        let nextTabIndex = Math.min(activeTabIndex, remainingTabs.length - 1)
        let nextActiveFile = (remainingTabs.length ? remainingTabs[nextTabIndex] : null)
        return { 
          openTabs: remainingTabs,
          activeFile: nextActiveFile
        }
      },

      updateDepsBundleCache(state, depsBundle) {
        return {
          depsBundleCache: {
            ...state.depsBundleCache,
            [depsBundle.hash]: depsBundle
          }
        }
      },

      setBuildApp(state, buildApp){
        return {buildApp}
      },

      updateAppBundleCache(state, appBundle) {
        return { appBundleCache: appBundle }
      },
    },

    render ({props, state, actions, context}) {
      let {openTabs, activeFile, files, fileTree} = state

      let fileTreeWidth = 15.0
      let codeManagerWidth = 0
      let previewManagerWidth = 0
      let remainingWidth = 100.0 - fileTreeWidth
      if (state.previewManagerCollapsed)
        codeManagerWidth = remainingWidth
      else {
        codeManagerWidth = remainingWidth/2
        previewManagerWidth = remainingWidth/2
      }

      if (!state.ready) {
        return <Loading />
      } else if (state.projectNotFound) {
        return <ProjectNotFound projectId={props.projectId} goToHomePage={actions.goToHomePage} />
      }

      var headerName = props.project.value.projectId
      var codeManagerHeader = ""
      if(activeFile){
        //headerName += activeFile.substr(activeFile.indexOf('/'))
        codeManagerHeader = activeFile.substr(activeFile.indexOf('/') + 1)      //need to shorten if it's too
      }
      return (
        <Block id="container"
          w="100vw"
          h="100vh"
          ml="auto"
          mr= "auto"
        >
          <Block id="header" >
            <Flex wide align='space-between center' py={2} borderBottom borderWidth={2} borderColor="#8e8e8e" bg="#d5d5d5">
              <h2 style={{margin: 0, fontSize:"20px"}}>
                boxspring/{context.welcome}/
                <span style={{color: "#42a8ff"}}>{headerName + '/'}</span>
                <span style={{color: "#ba1212"}}>{codeManagerHeader}</span>
              </h2>
              <GameButton onClick={actions.goToHomePage} bg='#ddd' px='6px' py='0px' h="24px" fs="14px" color="black" mt="3px" mr="3px" >
                <Icon fs='17px' bolder name='home'/>
              </GameButton>
            </Flex>
          </Block>
          <Flex id="workspace" h="92%" wide>
            <FileSideBar
              w={fileTreeWidth+"%"}
              h="100%"
              fontSize="12px"
              backgroundColor="#d5d5d5"
              getFileContentsFromName={actions.getFileContentsFromName}
              onFileDownload={actions.openFile}
              onFileDelete={actions.closeTab}
              onFileTreeDownload={actions.processFileTree}
              setActiveFile={actions.setActiveFile}
              fileTree={fileTree}
              keyId={props.keyId}
              activeFile={state.activeFile}
              project={props.project}
              setBundleName={actions.changeBundleName}
            />
            <CodeManager
              w={codeManagerWidth+"%"}
              header={codeManagerHeader}
              h="100%"
              backgroundColor="#fff"
              openTabs={openTabs}
              files={files}
              activeFile={activeFile}
              openFile={actions.openFile}
              onTabClick={actions.setActiveFile}
              previewManagerCollapsed={state.previewManagerCollapsed}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              onFileChange={actions.onFileChange}
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
              closeTab={actions.closeTab}
              saveInProgress={state.saveInProgress}
              buildApp={state.buildApp}
            />
            <PreviewManager
              w={previewManagerWidth+"%"}
              h="100%"
              backgroundColor="#fff"
              bundle={state.bundle}
              bundleName={props.project.loading ? "LOADING" : props.project.value.bundleName}
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
              getFileContentsFromName={actions.getFileContentsFromName}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              setBundle={actions.setBundle}
              collapsed={state.previewManagerCollapsed}
              depsBundleCache={state.depsBundleCache}
              appBundleCache={state.appBundleCache}
              updateDepsBundleCache={actions.updateDepsBundleCache}
              updateAppBundleCache={actions.updateAppBundleCache}
              setError={actions.setError}
              error={state.error}
              buildApp={state.buildApp}
              setBuildApp={actions.setBuildApp}
              project={props.project}
              fileTree={state.fileTree}
            />
          </Flex>
        </Block>
      )
    }
  })
)