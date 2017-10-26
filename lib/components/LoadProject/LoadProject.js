/**
 * Imports 
 */
import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'

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
      yield location.setUrl(projectPath)
    },
  },

  reducer: {
    setProjectId: (state, projectId) => {
      console.log(state.projectId)
      return {projectId}
    },
  },
    
  render ({props, state, actions, context}) {

    let {error} = state
    let {project, loadProject, deleteProject} = props
    return (
      <li>
        <a onClick={loadProject(project.key)}>
          {project.name}
        </a>
        <button onClick={deleteProject(project.key)}>Delete Project</button>
      </li>
    )
  }
})