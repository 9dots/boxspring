/**
 * Imports
 */
import {component, element} from 'vdux'
import enroute from 'enroute'
import Project from 'components/Project'

/**
 * <Router/>
 */

const router = enroute({
  
  '/projects/:projectId': (params, props) => <Project {...params} {...props} />,
  '/404': (params, props) => <h1>404</h1>,
  '*': (params, props) => <h1>*</h1>
})

export default component({
  render ({props, context}) {
    console.log("context = ", context)
    return (
      router(context.url, props)
    )
  }
})