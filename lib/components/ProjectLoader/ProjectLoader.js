/**
 * Imports 
 */

import {Input} from 'vdux-containers'
import theme from 'utils/theme'
import {
  Block,
  Flex,
} from 'vdux-ui'

import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'
import mapValues from '@f/map-values'
import LoadProject from 'components/LoadProject'
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
  

  controller: {
    * loadProject ({context, state, actions}, projectKey) {
      const projectPath = `/projects/${projectKey}`
      yield context.setUrl(projectPath)
    },
    * deleteProject ({context, props, state, actions}, projectKey) {
      yield context.firebaseSet(`projects/${projectKey}`, null)
      yield context.firebaseSet(`users/${props.uid}/projectList/${projectKey}`, null)
    },
    * renameProject ({context, props, state, actions}, projectKey, projectName, {new_name}) {
      if(new_name){
        yield context.firebaseSet(`projects/${projectKey}/projectId`, new_name)
        yield context.firebaseSet(`users/${props.uid}/projectList/${projectKey}/projectName`, new_name)
      }
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
    let {oldProjects} = props                     //from Home.js
    if (oldProjects.loading) {
      return <span/>
    }

    var projectList = []  
    if(oldProjects.value && oldProjects.value.projectList){                             //if there is a project list, take it from oldProjects
      projectList = oldProjects.value.projectList   
    }
    const projects = mapValues((val, key) => ({name:val.projectName, key}), projectList)       //map the projectList into an array of objects containing the key and the name of the project
    
    var projectJSX
    if(projects.length == 0){
      console.log("No previous projects found...")
      return <span/>
    }
    projectJSX = projects.map(project => ((<LoadProject project={project} {...actions}/>)))    //map projectList to LoadProject components
    return (
      <div>
        <Flex column id="workspace" h="100%"  pt={10}>
          { error && 
              <h3  style={{textAlign: "center", backgroundColor: "red", color: "white", borderTop: "1px solid #aaa", borderBottom: "1px solid #aaa", marginTop: 0, marginBottom: 0}}>
              { error }
              </h3>
          }
          <Block m='0 auto' w="60%" column align="center">
            {projectJSX}
          </Block>
        </Flex>
      </div>
    )
  }
})