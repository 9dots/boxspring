/**
 * Imports 
 */
import {component, element, decodeValue, stopPropagation} from 'vdux'
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
import {
  MenuItem,
  Button
} from 'vdux-containers'
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
  


  reducer: {
    setProjectId: (state, projectId) => {
      console.log(state.projectId)
      return {projectId}
    },
  },
    
  render ({props, state, actions, context}) {

    let {error} = state
    let {project, loadProject, deleteProject, renameProject} = props
    return (
      <MenuItem onClick={loadProject(project.key)}>
          <Flex align='space-between center'>
          <Block flex fs="16px">{project.name}</Block>
          <Button circle bgColor='white' onClick={[stopPropagation, renameProject(project.key, project.name)]}><Icon color='#333' fs='15px' bolder name='mode_edit' /></Button>
          <Button circle bgColor='white' onClick={[stopPropagation, deleteProject(project.key)]}><Icon color='#333' fs='15px' bolder name='delete' /></Button>
          </Flex>
      </MenuItem>
    )
  }
})