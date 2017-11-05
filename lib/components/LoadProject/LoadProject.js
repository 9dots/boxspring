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
import FileNameModal from 'components/FileNameModal'
import ConfirmModal from 'components/ConfirmModal'
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

    * openModalToRenameProject({props, context, actions}, key, name) {
      yield context.openModal(() => <FileNameModal
      label={`Enter a new name for ${name}`}
      field="new_name"
      onSubmit={props.renameProject(key, name)}
      submitMessage="Rename"
      name="new_name"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="input"
      />)
    },
    * openModalToDeleteProject({props, context, actions}, key, name) {
      yield context.openModal(() => <ConfirmModal
      label={`Are you sure you want to delete ${name}?`}
      field="delete_success"
      onSubmit={props.deleteProject(key)}
      submitMessage="Delete"
      name="delete_success"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="input"
      />)
    },
    * openModalToLoadProject({props, context, actions}, key, name) {
      yield context.openModal(() => <ConfirmModal
      label={`Are you sure you want to load ${name}?`}
      field="delete_success"
      onSubmit={props.loadProject(key)}
      submitMessage="Delete"
      name="delete_success"
      dismiss={context.closeModal()}
      value=""
      textarea={false}
      actionType="input"
      />)
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
    let {openModalToRenameProject, openModalToDeleteProject, openModalToLoadProject} = actions
    let {project} = props
    return (
      <MenuItem onClick={openModalToLoadProject(project.key, project.name)}>
          <Flex align='space-between center'>
          <Block flex fs="16px">{project.name}</Block>
          <Button circle bgColor='white' onClick={[stopPropagation, openModalToRenameProject(project.key, project.name)]}><Icon color='#333' fs='15px' bolder name='mode_edit' /></Button>
          <Button circle bgColor='white' onClick={[stopPropagation, openModalToDeleteProject(project.key, project.name)]}><Icon color='#333' fs='15px' bolder name='delete' /></Button>
          </Flex>
      </MenuItem>
    )
  }
})