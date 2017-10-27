/**
 * Imports 
 */


import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'

import fire from 'vdux-fire'
import gcs from 'client/gcsClient.js'
import ProjectCreator from 'components/ProjectCreator'
import ProjectLoader from 'components/ProjectLoader'

/**
 * <ProjectLoader/>
 */

export default fire((props) => ({
  oldProjects: `/users/${props.uid}`
})) (component({

  

  controller: {
    * loadProject ({context, state, actions}, projectKey) {
      const projectPath = `/projects/${projectKey}`
      yield location.setUrl(projectPath)
    },
  },
    
  render ({props, state, actions, context}) {


    return (
      <div>
        <button onClick={actions.handleSignOut()}>Sign Out</button>
	      <ProjectCreator {...props} />
	      <ProjectLoader {...props} />
      </div>
    )
  },

  controller:{
    *handleSignOut({context}){
      yield context.updateLoadingAuth(true)
      yield context.updateUID(null)
      yield context.updateWelcome(null)
      yield context.setProjectId('')
      yield context.firebaseSignOut()
      yield context.setUrl('/signin')
    },
  }
}))