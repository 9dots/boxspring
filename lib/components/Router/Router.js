/**
 * Imports 
 */
import {component, element} from 'vdux'
import enroute from 'enroute'
import Project from 'components/Project'
import LoginPage from 'components/LoginPage'
import Home from 'components/Home'
import Redirect from 'components/Redirect'


/**
 * <Router/>
 */
const auth = (props, context) => {

    var overrideUrl = context.url
    if(overrideUrl == '/signin'){
      if(context.uid){
        overrideUrl = '/' 
        return <Redirect to={overrideUrl}/>
      }
    } else {
      if(!context.uid){
        overrideUrl = '/signin'
        return <Redirect to={overrideUrl}/>
      }
    }

    return (router(context.url, props))
}

const router = enroute({
  '/projects/:keyId': (params, props) => {
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
      auth(props, context)
    )
  }
})
