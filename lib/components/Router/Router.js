/**
 * Imports 
 */
import {component, element} from 'vdux'
import enroute from 'enroute'
import Project from 'components/Project'
import LoginPage from 'components/Login/LoginPage'
import ProjectCreator from 'components/ProjectCreator'
import ProjectLoader from 'components/ProjectLoader/ProjectLoader'

/**
 * <Router/>
 */

const router = enroute({
  '/projects/:keyId': (params, props) => {
  	return <Project keyId={params.keyId}/>
  },
  '/': (params, props) => {

    return (
      <div>
      <ProjectCreator {...params} {...props} />
      <ProjectLoader {...params} {...props} />
      </div>
      );
  },
  '/signin': (params, props) => {

    return (<LoginPage {...params} {...props} />);
  },
  '/404': (params, props) => <h1>404</h1>,
  '*': (params, props) => <h1>Unknown route</h1>
})

export default component({
  render ({props, context}) {
    return (
      router(context.url, props)
    )
  }
})
