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

import {setUrl} from 'redux-effects-location'
import Loading from 'components/Loading'
import GameButton from 'components/GameButton'
import Form from 'vdux-form'
import locationMw, * as location from 'redux-effects-location'
import gcs from 'client/gcsClient.js'


function defaultIndexHTML(templateId) {
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
      <h1>${templateId} v1.0.0</h1>
    </div>
  </body>
</html>`
}

function defaultIndexJS(templateId) {
  return `/* index.js for ${templateId} */`
}

function defaultPackageJSON(templateId) {
   return `{
    "name": "${templateId}",
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
    templateId: '',
    error: ''
  },

  middleware: [
    locationMw()
  ],

  controller: {
    * createNewTemplate ({context, state, actions}) {
      const {templateId} = state
      const {firebasePush, firebaseSet} = context
      // must not be empty name
      if (!templateId) {
        yield actions.setError("Template name cannot be empty.")
        return
      }



      // otherwise, create new project in firebase and redirect user's path
      var {key} = yield firebasePush(`/templates/`, {
        templateId, 
      })
      var time = Date.now()
      yield firebaseSet(`/users/${context.uid}/templateList/${key}`, {
        lastUpdated: time,
        projectName: templateId
      })
      const templatePath = `/templates/${key}`


      // create default project starting files


      // redirect user to view newly created project
      yield location.setUrl(templatePath)
    },
  },

  reducer: {
    setTemplateId: (state, templateId) => {
      console.log(state.templateId)
      return {templateId}
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
            Create a new template:
          </Block>
          <Flex align='space-between center'>
            <Flex flex align='center'>
            <Form id='new-project-form' onSubmit={actions.createNewTemplate} 
              w="70%" px="15%">
              <Flex flex align='center'>
                <Input autofocus
                  inputProps={{p: '9px', borderWidth: '1px', border: '#aaa'}}
                  name='link' fs='16px' onKeyUp={decodeValue(actions.setTemplateId)}
                  w="65%"
                  />
                <GameButton onClick={actions.createNewTemplate} bg='blue' px='12px' py='6px' h="34px" fs="15px" color="black" ml="5px" >
                  <Icon fs='20px' bolder name='library_add' mr='6px'/>
                  Create Template
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