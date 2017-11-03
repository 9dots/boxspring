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
      var {key} = yield firebasePush(`/projects/`, {
        projectId: projectId,
      })
      var time = Date.now()
      yield firebaseSet(`/users/${context.uid}/projectList/${key}`, {
        lastUpdated: time,
        projectName: projectId
      })
      const projectPath = `/projects/${key}`


      // create default project starting files
      yield [
        gcs.insertObject({
          bucket: context.BUCKET_NAME, 
          name: `${key}/index.html`,
          contents: defaultIndexHTML(projectId)
        }),
        gcs.insertObject({
          bucket: context.BUCKET_NAME, 
          name: `${key}/index.js`,
          contents: defaultIndexJS(projectId)
        }),
        gcs.insertObject({
          bucket: context.BUCKET_NAME, 
          name: `${key}/package.json`,
          contents: defaultPackageJSON(projectId)
        })
      ]



      // redirect user to view newly created project
      yield location.setUrl(projectPath)
    },
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
    if(props.oldProjects.loading)
      return <span/>
    let {error} = state
    return (
      <div>
        <Flex column id="workspace" h="92%"  pt={30}>
          { error && 
              <h3 style={{textAlign: "center", backgroundColor: "red", color: "white", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", marginTop: 0, marginBottom: 0}}>
              { error }
              </h3>
          }
          <Block textAlign='center' fs='24px' fontWeight='300' mb>
            Choose a name for your new project:
          </Block>
          <Flex align='space-between center'>
            <Flex flex align='center'>
            <Form id='new-project-form' onSubmit={actions.createNewProject} 
              w="70%" px="15%">
              <Flex flex align='center'>
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
          </Flex>
        </Flex>
      </div>
    )
  }
})
