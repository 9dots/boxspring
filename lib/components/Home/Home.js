/**
 * Imports 
 */
import {
  Block,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  DropdownMenu,
  Icon
} from 'vdux-ui'

import {
  Dropdown,
} from 'vdux-containers'

import {component, element, decodeValue} from 'vdux'
// import validator from 'schema/link'

import fire from 'vdux-fire'
import gcs from 'client/gcsClient.js'
import ProjectCreator from 'components/ProjectCreator'
import ProjectLoader from 'components/ProjectLoader'
import TemplateCreator from 'components/TemplateCreator'
import Footer from 'components/Footer'
import GameButton from 'components/GameButton'

/**
 * <ProjectLoader/>
 */

export default fire((props) => ({
  oldProjects: `/users/${props.uid}`          //oldProjects={welcome:username of email projectList:contains keys of projects={date:date project was made in microseconds projectName:name of project}}
})) (component({

  

  controller: {
    * loadProject ({context, state, actions}, projectKey) {               //used by the ProjectLoader
      const projectPath = `/projects/${projectKey}`
      yield context.setUrl(projectPath)
    },
  },
    
  render ({props, state, actions, context}) {


    return (
      <div>
        <Block fontFamily='Roboto' id="container" ml="auto"
             mr= "auto" fontWeight='300' color='#333'>
          <Block id="header" border="#aaa" textAlign="right">
            <Flex align='space-between center'>
            <h2 flex style={{margin: 0, padding:"3px 3px 3px 3px",}}>
              boxspring: Welcome {context.welcome}
            </h2>
            <GameButton float="right" bg='red'  px='12px'py='6px' h="34px" fs="15px" color="black" onClick={actions.handleSignOut()}>
              Log Out
            </GameButton>
            </Flex>
          </Block>
  	      <ProjectCreator {...props} />
  	      <ProjectLoader {...props} />
          <Footer/>
        </Block>

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