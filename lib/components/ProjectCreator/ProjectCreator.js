/**
 * Imports 
 */

import {Input} from 'vdux-containers'
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

import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'

import Loading from 'components/Loading'
import GameButton from 'components/GameButton'
import FileNameModal from 'components/FileNameModal'
import Form from 'vdux-form'

const DEFAULT_BUNDLE_NAME = "default-bundle.js"

function defaultIndexHTML(projectName) {
   return (
`<html>
  <head>
    <style type='text/css'>
      html, body {
        margin: 0;
        padding-top: 0px;
        border: 0;
        font-family: sans-serif;
        background: #222;
        color: green;
        text-align: center;
      } 
    </style>
  </head>
  <body>
    <div id="app">
      <h1>${projectName} v1.0.0</h1>
    </div>
  </body>
</html>`)
}

function defaultIndexJS(projectName) {
  return (
`/* index.js for ${projectName} */
function helloWorld(){
  console.log("Hello world!")  
}
`)
}

function defaultPackageJSON(projectName) {
   return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "author": "",
  "license": "",
  "description": "a new project developed using boxspring...",
  "main": "index.js",
  "dependencies": {}
}`
}

function defaultIndexCSS(projectName) {
  return (
    `/* index.css for ${projectName} */
body{
  background-color:"gray";
}
`)
}

/**
 * <ProjectCreator/>
 */

export default component({

  initialState: {
    error: ''
  },

  controller: {
    * createNewProject ({context, state, actions}, {projectname}) {

      // must not be empty name
      if (!projectname) {
        yield actions.setError("Project name cannot be empty.")
        return
      }

      const {firebaseOnce, firebaseSet, firebasePush} = context

      /*// first check if a project with that id already exists
      let snapshot =  yield firebaseOnce(projectPath)
      let projectExists = (snapshot.val() ? true : false)

      // if it exists, display error
      if (projectExists) {
        yield actions.setError("A project with that name already exists. Please choose another.")
        return
      }*/


      // otherwise, create new project in firebase and redirect user's path
      var {key} = yield firebasePush(`/projects/`, {                          //add the new project to the list of projects
        projectId: projectname,
        buildAvail: false,
        bundleName: DEFAULT_BUNDLE_NAME,
      })

      var time = Date.now()
      yield firebaseSet(`/users/${context.uid}/projectList/${key}`, {         //add the project to the users list of projects
        lastUpdated: time,
        projectName: projectname,
      })
      const projectPath = `/projects/${key}`


      // create default project starting files
      yield [
        context.insertObject({
          bucket: context.BUCKET_NAME, 
          projectId: key,
          filename: `index.html`,
          contents: defaultIndexHTML(projectname)
        }, true),
        context.insertObject({
          bucket: context.BUCKET_NAME, 
          projectId: key,
          filename: `index.js`,
          contents: defaultIndexJS(projectname)
        }, true),
        context.insertObject({
          bucket: context.BUCKET_NAME, 
          projectId: key,
          filename: `style.css`,
          contents: defaultIndexCSS(projectname)
        }, true),
        context.insertObject({
          bucket: context.BUCKET_NAME, 
          projectId: key,
          filename: `package.json`,
          contents: defaultPackageJSON(projectname)
        }, true),
        context.insertObject({
          bucket: context.BUCKET_NAME, 
          projectId: key,
          filename: `yarn.lock`,
          contents: "",
        }, true),
      ]

      var payload = yield context.createProjectOnServer(key)
      if(!payload.ok){
        console.log("Failed to create project")
        yield firebaseSet(`/users/${context.uid}/projectList/${key}`, {})
        yield firebaseSet(`/projects/${key}`, {})
        return
      }

      // redirect user to view newly created project
      yield context.setUrl(projectPath)
    },
    
    * openModalToCreateProject({props, context, actions}) {
      yield context.openModal(() => <FileNameModal
        label="Name your new project"
        field="projectname"
        onSubmit={actions.createNewProject}
        submitMessage="Create"
        name="projectname"
        dismiss={context.closeModal()}
        value=""
        textarea={false}
        actionType="input"
      />)
    },
  },

  reducer: {

    setError: (state, error) => {
      return {error}
    }
  },
    
  render ({props, state, actions, context}) {

    if(props.oldProjects.loading)         //oldProjects grabbed from users/uid/projectList, passed down from Home
      return <span/>
    var errorJSX = state.error && <h3 style={{textAlign: "center", backgroundColor: "red", color: "white", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", marginTop: 0, marginBottom: 0}}>{ state.error }</h3>
    return (
      <div>
        <Flex column id="workspace" h="92%"  pt={30}>
          {errorJSX}
          <Flex align='space-between center'>
            <Flex flex align='center'>
                <GameButton onClick={actions.openModalToCreateProject} bg='blue' px='12px' py='6px' h="34px" fs="15px" color="black" ml="5px" >
                  <Icon fs='20px' bolder name='library_add' mr='6px'/>
                  Create New Project
                </GameButton>
            </Flex>
          </Flex>
        </Flex>
      </div>
    )
  }
})
