/**
 * Imports
 */
import {component, element} from 'vdux'
import enroute from 'enroute'
import Project from 'components/Project'
import ProjectCreator from 'components/ProjectCreator'

/**
 * <Router/>
 */

const router = enroute({
  '/projects/:projectId': (params, props) => {
  	return <Project projectId={params.projectId}/>
  },
  '/': (params, props) => {

    return (<ProjectCreator {...params} {...props} />);
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
