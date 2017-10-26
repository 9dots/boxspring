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
import mapValues from '@f/map-values'
import LoadProject from 'components/LoadProject'
import locationMw, * as location from 'redux-effects-location'
import gcs from 'client/gcsClient.js'

/**
 * <ProjectLoader/>
 */

export default component({

  initialState: {
    projectId: '',
    projectNames: [],
    error: ''
  },
  
  middleware: [
    locationMw()
  ],

  controller: {
    * loadProject ({context, state, actions}, projectKey) {
      const projectPath = `/projects/${projectKey}`
      yield location.setUrl(projectPath)
    },
    * deleteProject ({context, props, state, actions}, projectKey) {
      yield context.firebaseSet(`projects/${projectKey}`, null)
      yield context.firebaseSet(`users/${props.uid}/projectList/${projectKey}`, null)
    },
  },

  reducer: {
    setProjectId: (state, projectId) => {
      console.log(state.projectId)
      return {projectId}
    },
    loadProjectAtValue: (state, value) =>{
    },
    setProjectNames: (state, projectNames) => {
      return {projectNames}
    },

    setError: (state, error) => {
      return {error}
    }
  },
    
  render ({props, state, actions, context}) {

    let {error} = state
    let {oldProjects} = props
    if (oldProjects.loading) {
      console.log("loading")
      return <span/>
    }

    var projectList = []  
    if(oldProjects.value && oldProjects.value.projectList){                             //if there is a project list, take it from oldProjects
      projectList = oldProjects.value.projectList   
    }
    const projects = mapValues((val, key) => ({name:val.projectName, key}), projectList)       //map the projectList into an array of objects containing the key and the name of the project
    
    var projectJSX
    if(projects.length == 0){
      projectJSX = "No previous projects found..."
    }
    else {
      projectJSX = projects.map(project => ((<LoadProject project={project} {...actions}/>)))
    }
    return (
      <Block id="container" w="98vw" h="30vh" ml="auto"
             mr= "auto" fontFamily='ornate'>
        <Block id="header" borderTop borderLeft borderRight
               borderColor="#aaa">
          <h2 style={{margin: 0, padding:"3px 3px 3px 3px",}}>boxspring: Welcome {context.welcome}</h2>
        </Block>
        <Flex column id="workspace" h="92%" borderTop borderBottom borderLeft
              borderRight borderColor="#aaa" pt={30}>
          { error && 
              <h3 fontFamily='ornate' style={{textAlign: "center", backgroundColor: "red", color: "white", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", marginTop: 0, marginBottom: 0}}>
              { error }
              </h3>
          }
          <h2 fontFamily='ornate' style={{textAlign: "center"}}>
            Load your previous projects:
          </h2>
          <ul>
            {projectJSX}
          </ul>
        </Flex>
        <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
      </Block>
    )
  }
})