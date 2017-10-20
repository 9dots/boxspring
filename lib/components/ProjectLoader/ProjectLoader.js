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
import Loading from 'components/Loading'
import GameButton from 'components/GameButton'
import Form from 'vdux-form'
import locationMw, * as location from 'redux-effects-location'
import gcs from 'client/gcsClient.js'

/**
 * <ProjectLoader/>
 */

export default fire((props) => ({
  oldProjects: `/users/${props.uid}`
}))(component({

  initialState: {
    projectId: '',
    projectNames: [],
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
      console.log(key)
      yield firebaseSet(`/users/${context.uid}/projectList/${key}`, {
        date: "Figure out how to add date added",
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
    * checkLogin({context}){

      if(context.uid != null){
        console.log(context.uid)
      }
      else{
        yield context.updateUrl('/signin')
      }
    }
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

    const projects = mapValues((val, key) => ({name: val.name, key}), oldProjects)
      //actions.setProjectNames(oldProjects.map(todo => todo.projectName))
    console.log(oldProjects)


    console.log(projectNames.map(project => project))

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
            {projectNames.map(project => (<li id={"oldProject" + projectNames.indexOf(project)} onClick={actions.loadProjectAtValue(projectNames.indexOf(project))}>{project}</li>) )}
          </ul>
        </Flex>
        <Flex align="center" fontSize="13px" mt="12px" ><p style={{padding:0,margin:0}}>boxspring footer</p></Flex>
      </Block>
    )
  }
})
)
