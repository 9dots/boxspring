/**
 * Imports
 */

import {Block} from 'vdux-ui'
import Loading from 'components/Loading'
import {component, element} from 'vdux'
import Router from 'components/Router'
import fire from 'vdux-fire'

/**
 * <App/>
 */

export default fire((props) => ({
  userProfile: `/users/${props.uid}`
}))(
  component({
    initialState: {
      ready: true
    },

    * onUpdate (prev, next) {
      const {props, actions, state} = next
      const {userProfile = {}} = props

      // if (state.ready && prev.props.uid !== next.props.uid) {
      //   return yield actions.changeUsers()
      // }

      if (!state.ready && (!userProfile.loading || userProfile.error)) {
        yield actions.appDidInitialize()
      }
    },

    reducer: {
      appDidInitialize: () => ({ready: true}),
      changeUsers: () => ({ready: false})
    },

    render ({props, context, state}) {
      // const {userProfile} = props
      return (
      	state.ready
          ? <Router {...props} {...state} />
          : <Loading />
      )
    },
  })
)