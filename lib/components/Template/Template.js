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
import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate, 
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from 'vdux-fire'
import {setUrl} from 'redux-effects-location'
import deepFreeze from 'deep-freeze'
import Loading from 'components/Loading'
import TemplateFileManager from 'components/TemplateFileManager'
import CodeManager from 'components/CodeManager'
import PreviewManager from 'components/PreviewManager'
import GameButton from 'components/GameButton'
import TemplateNotFound from 'components/TemplateNotFound'
import gcs from 'client/gcsClient.js'
import {throttle} from 'redux-timing'
import locationMw, * as location from 'redux-effects-location'
// const latestVersion = require('latest-version')
import detective  from 'detective'
const _ = require('lodash')
/**
 * <Template/>
 */

export default fire((props) => {
return{
    template: { ref: `/templates/${props.keyId}`, type: 'once' },
  }
})(
  component({
    initialState: {
      ready: false,
      templateNotFound: false,
      activeFile: null,
      openTabs: [],
      files: {},
      fileTree: [],
      previewManagerCollapsed: false,
      saveInProgress: false,
      depsBundleCache: {},
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
      let {template} = props
      if (!state.templateNotFound && !props.template.loading && props.template.value == null) {
        yield actions.setTemplateNotFound(true)
      }

      if (!state.ready && !props.template.loading) {
        yield actions.setReady()
        yield context.setProjectId(props.keyId)
      }
    },

    middleware: [
      throttle('saveOpenFilesToGCS', 1000),
      throttle('updatePackageJSONDependencies', 2000),
      locationMw()
    ],

    controller: {

      * createNewTemplate() {
        console.log("Creating new template...")
        yield location.setUrl("/")
      },

      * openFile({actions}, file) {
        yield actions.updateFileContents(file.name, file.contents)
        yield actions.openTabForFile(file)
      },

      * onFileChange({context,actions}, name, contents) {
        console.log("File changed...", name)

        if (name !== context.packageJSONPath) {
          yield actions.updatePackageJSONDependencies(name, contents)
          // don't invalidate appBundle cache if package.json modified
          yield actions.updateAppBundleCache(null)
        }

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
        })
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

          if (file.dirty) {
            yield actions.setSaveInProgress(true)
            yield gcs.insertObject({
              bucket: context.BUCKET_NAME,
              name: name,
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

      * getFileContentsFromName({actions, state, props}, name){
        // return cached contents if available
        if (state.files[name] && state.files[name].contents) {
          // console.log("Fetching cached version of ", name)
          return state.files[name].contents
        }

        // otherwise, search fileTree for file metadata
        let {fileTree} = state
        let file = null
        for (let i = 0; i < fileTree.length; i++) {
          if (fileTree[i].name === name) {
            file = fileTree[i]
            break
          }
        }
        if (file == null)
          throw `Error: could not find ${name} in fileTree`
        
        // download file using mediaLink in metadata
        let response = yield gcs.getObject(file)
        let contents = yield response.text()
          .catch(err => console.log("Error getting text from GCS response", err))

        return contents
      }

    },

    reducer: {
      setReady: () => ({ready: true}),
      setTemplateNotFound: () => ({templateNotFound: true}),
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
            displayName: file.name.substring(file.name.lastIndexOf('/')+1)
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
        console.log('setActiveFile...', name)
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

      updateAppBundleCache(state, appBundle) {
        return { appBundleCache: appBundle }
      },
    },

    render ({props, state, actions, context}) {
      let {openTabs, activeFile, files, fileTree} = state

      let fileTreeWidth = 20.0
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
      } else if (state.templateNotFound) {
        return <TemplateNotFound templateId={props.templateId} createNewTemplate={actions.createNewTemplate} />
      }

      return (
        <Block id="container"
          w="98vw"
          h="98vh"
          ml="auto"
          mr= "auto"
          fontFamily='ornate'
        >
          <Block id="header" borderTop borderLeft borderRight borderColor="#aaa">
            <Flex wide align='space-between center'>
              <h2 style={{margin: 0, padding:"3px"}}>
                {context.welcome}&nbsp;/&nbsp;
                <span style={{color: "#00aaf0"}}>{props.template.value.templateId}</span>
              </h2>
              <GameButton onClick={actions.createNewTemplate} bg='#ddd' px='6px' py='0px' h="24px" fs="14px" color="black" mt="3px" mr="3px" >
                <Icon fs='17px' bolder name='keyboard_arrow_left'/>
              </GameButton>
            </Flex>
          </Block>
          <Flex
            id="workspace"
            h="92%"
            wide
          >
            <TemplateFileManager
              w={fileTreeWidth+"%"}
              h="100%"
              fontSize="13px"
              backgroundColor="#ddf0f5"
              onFileDownload={actions.openFile}
              onFileTreeDownload={actions.processFileTree}
              fileTree={fileTree}
            />
            <CodeManager
              w={codeManagerWidth+"%"}
              h="100%"
              backgroundColor="#ddf0f5"
              openTabs={openTabs}
              files={files}
              activeFile={activeFile}
              onTabClick={actions.setActiveFile}
              previewManagerCollapsed={state.previewManagerCollapsed}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              onFileChange={actions.onFileChange}
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
              closeTab={actions.closeTab}
              saveInProgress={state.saveInProgress}
            />
            <PreviewManager
              w={previewManagerWidth+"%"}
              h="100%"
              backgroundColor="#ddf0f5"
              saveOpenFilesToGCS={actions.saveOpenFilesToGCS}
              getFileContentsFromName={actions.getFileContentsFromName}
              setPreviewManagerCollapsed={actions.setPreviewManagerCollapsed}
              collapsed={state.previewManagerCollapsed}
              depsBundleCache={state.depsBundleCache}
              appBundleCache={state.appBundleCache}
              updateDepsBundleCache={actions.updateDepsBundleCache}
              updateAppBundleCache={actions.updateAppBundleCache}
              validatePackageJSON={actions.validatePackageJSON}
              setError={actions.setError}
              error={state.error}
            />
          </Flex>
          <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
        </Block>
      )
    }
  })
)