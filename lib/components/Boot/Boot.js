/**
 * Imports
 */

import {component, element} from 'vdux'
import App from 'components/App'
import theme from 'utils/theme'

/**
 * <Boot/>
 */

export default component({

  getContext ({state, actions}) {
    return {
      // isAnonymous: state.isAnonymous,
      // username: state.username,
      // url: state.url,
      // uid: state.uid,
      uiTheme: {spinnerAnimation: ''},
      ...actions
    }
  },
  render ({props}) {
    return (
    	<App />
    )
  }
})
