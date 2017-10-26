/**
 * Imports 
 */

import {Block} from 'vdux-ui'
import Loading from 'components/Loading'
import {component, element} from 'vdux'
import Router from 'components/Router'
import fire from 'vdux-fire'
import locationMw, * as location from 'redux-effects-location'

/**
 * <App/>
 */


function createModal (modal) {
  return typeof modal === 'function'
    ? modal()
    : <ModalMessage
        dismiss={modal.dismiss}
        type={modal.type}
        header={modal.header}
        animals={modal.animals}
        body={modal.body} />
}

export default fire((props) => ({
  // userProfile: `/users/${props.uid}`
}))(
  component({
    initialState: {
      ready: true
    },
    middleware:[
      locationMw()
    ],
    * onUpdate (prev, next) {
      const {props, actions, state} = next
      // const {userProfile = {}} = props

      // if (state.ready && prev.props.uid !== next.props.uid) {
      //   return yield actions.changeUsers()
      // }

      // if (!state.ready && (!userProfile.loading || userProfile.error)) {
      //   yield actions.appDidInitialize()
      // }
    },
    controller:{

      * checkLogin({context,state, actions}){
        var tempUrl;
        if(context.uid != null){
          if(context.projectId == ''){
            tempUrl = '/'
          }else {
            tempUrl = `/projects/${state.projectId}`
          }
        }
        else{
          tempUrl = '/signin'
        }
        yield context.updateUrl(tempUrl)
        yield location.setUrl(tempUrl)
      },
    },
    reducer: {
      appDidInitialize: () => ({ready: true}),
      // changeUsers: () => ({ready: false})
    },

    render ({props, context, state, actions}) {
      const {modal} = props
      return (
      	state.ready ?
          <Block tall wide>
            <Router {...props} {...state} checkLogin={actions.checkLogin} />
            { modal && createModal(modal) }
          </Block>
          : <Loading />
      )
    }
  })
)
