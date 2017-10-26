/**
 * Imports 
 */
import {component, element} from 'vdux'
import enroute from 'enroute'
import Project from 'components/Project'
import LoginPage from 'components/LoginPage'
import Home from 'components/Home'

/**
 * <Router/>
 */

const router = enroute({
  '/projects/:keyId': (params, props) => {
    console.log(props)
  	return <Project keyId={params.keyId}/>
  },
  '/': (params, props) => {

    return (
      <Home {...params} {...props} />
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
