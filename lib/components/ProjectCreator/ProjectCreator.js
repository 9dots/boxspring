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
import Loading from 'components/Loading'
import GameButton from 'components/GameButton'
import Form from 'vdux-form'
import locationMw, * as location from 'redux-effects-location'
import gcs from 'client/gcsClient.js'


function defaultIndexHTML(projectId) {
   return `<html>
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
      <h1>${projectId} v1.0.0</h1>
    </div>
  </body>
</html>`
}

function defaultIndexJS(projectId) {
  return `/* index.js for ${projectId} */`
}

function defaultPackageJSON(projectId) {
   return `{
  "name": "${projectId}",
  "version": "1.0.0",
  "author": "",
  "license": "",
  "description": "a new project developed using boxspring...",
  "main": "index.js",
  "dependencies": {}
}`
}

/**
 * <ProjectCreator/>
 */

export default component({

  initialState: {
    projectId: '',
    error: ''
  },

  middleware: [
    locationMw()
  ],

  controller: {

    * createNewProject ({context, state, actions}) {
      const {projectId} = state

      // must not be empty name
      if (!projectId) {
        yield actions.setError("Project name cannot be empty.")
        return
      }

      const {firebaseOnce, firebaseSet} = context
      const projectPath = `/projects/${projectId}`

      // first check if a project with that id already exists
      let snapshot =  yield firebaseOnce(projectPath)
      let projectExists = (snapshot.val() ? true : false)

      // if it exists, display error
      if (projectExists) {
        yield actions.setError("A project with that name already exists. Please choose another.")
        return
      }

      // otherwise, create new project in firebase and redirect user's path
      yield firebaseSet(projectPath, {
        projectId: projectId,
      })

      // create default project starting files
      yield [
        gcs.insertObject({
          bucket: "boxspring-data", 
          name: `${projectId}/index.html`,
          contents: defaultIndexHTML(projectId)
        }),
        gcs.insertObject({
          bucket: "boxspring-data", 
          name: `${projectId}/index.js`,
          contents: defaultIndexJS(projectId)
        }),
        gcs.insertObject({
          bucket: "boxspring-data", 
          name: `${projectId}/package.json`,
          contents: defaultPackageJSON(projectId)
        })
      ]

      // redirect user to view newly created project
      yield location.setUrl(projectPath)
    }
  },

  reducer: {
    setProjectId: (state, projectId) => {
      console.log(state.projectId)
      return {projectId}
    },

    setError: (state, error) => {
      return {error}
    }
  },
    
  render ({props, state, actions, context}) {

    let {error} = state

    return (
      <Block id="container" w="98vw" h="30vh" ml="auto"
             mr= "auto" fontFamily='ornate'>
        <Block id="header" borderTop borderLeft borderRight
               borderColor="#aaa">
          <h2 style={{margin: 0, padding:"3px 3px 3px 3px",}}>boxspring</h2>
        </Block>
        <Flex column id="workspace" h="92%" borderTop borderBottom borderLeft
              borderRight borderColor="#aaa" pt={30}>
          { error && 
              <h3 fontFamily='ornate' style={{textAlign: "center", backgroundColor: "red", color: "white", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", marginTop: 0, marginBottom: 0}}>
              { error }
              </h3>
          }
          <h2 fontFamily='ornate' style={{textAlign: "center"}}>
            Choose a name for your new project:
          </h2>
          <Form id='new-project-form' onSubmit={actions.createNewProject} 
            w="80%" px="15%">
            <Flex>
              <Input autofocus
                inputProps={{p: '9px', borderWidth: '1px', border: '#aaa'}}
                name='link' fs='16px' onKeyUp={decodeValue(actions.setProjectId)}
                w="65%"
                />
              <GameButton onClick={actions.createNewProject} bg='blue' px='12px' py='6px' h="34px" fs="15px" color="black" ml="5px" >
                <Icon fs='20px' bolder name='library_add' mr='6px'/>
                Create Project
              </GameButton>
            </Flex>
          </Form>
        </Flex>
        <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
      </Block>
    )
  }
})
