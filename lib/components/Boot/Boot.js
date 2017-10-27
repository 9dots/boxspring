/**
 * Imports 
 */

import {component, element} from 'vdux'
import theme from 'utils/theme'

import fetchMw, {fetch, fetchEncodeJSON} from 'redux-effects-fetch'
// import mediaMw, {watchMedia} from 'redux-effects-media'
import map from '@f/map'
import locationMw, * as location from 'redux-effects-location'
import firebaseConfig from 'client/firebaseConfig'
import deepFreeze from 'deep-freeze'
import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate,
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from 'vdux-fire'

import {
  LoginMiddleware as firebaseLogin,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut
} from 'components/LoginMiddleware/signInMiddleware'

import Router from 'components/Router'
import Loading from 'components/Loading'
import App from 'components/App'
/**
 * <Boot/>
 */

export default component({

  getContext ({state, actions}) {
    return {
      ...actions,
      state,
      url: state.url,
      uid: state.uid,
      welcome: state.welcome,
      uiTheme: theme,
      BUCKET_NAME: "boxspring-data",
      projectId: state.projectId,
      setProjectId: actions.setProjectId,
      packageJSONPath: `${state.projectId}/package.json`
    }
  },

  initialState: {
    url: window.location.pathname,
    projectId: '',
    uid: null,
    loadingAuth:true,
    welcome: null,
    title: 'Boxspring',
    modal: null
  },

  onCreate ({actions}) {
    return [
      actions.initializeApp()
    ]
  },

  onUpdate (prev, next) {
    if (prev.state.title !== next.state.title && typeof document !== 'undefined') {
      document.title = next.state.title
    }
  },

  middleware: [
    locationMw(),
    // fetchEncodeJSON,
    fetchMw,
    // mediaMw,
    firebaseMw(firebaseConfig),
    // auth
    firebaseLogin()
  ],

  controller: {
    * initializeApp ({actions}) {
      yield actions.bindUrl((url) => actions.updateUrl(url))
    },

    firebaseSet: wrapEffect(firebaseSet),
    firebaseUpdate: wrapEffect(firebaseUpdate),
    firebaseOnce: wrapEffect(firebaseOnce),
    firebaseTransaction: wrapEffect(transaction),
    firebasePush: wrapEffect(firebasePush),
    firebaseSignOut: wrapEffect(firebaseSignOut),
    firebaseSignIn: wrapEffect(firebaseSignIn),
    firebaseSignUp: wrapEffect(firebaseSignUp),
    setUrl: location.setUrl,
    // // scrollTo: wrapEffect(scrollToEffect),
    // fetch: wrapEffect(fetch),
    // firebaseTask: wrapEffect((state, obj) => firebasePush('/queue/tasks', {_state: state, ...obj})),
    ...map(wrapEffect, location)
  },

  reducer: {
    updateUrl: (state, url) => ({url}),
    updateUID: (state, uid) => {
      console.log(state.uid)
      return{uid}},
    updateWelcome: (state, welcome) => ({welcome}),
    updateLoadingAuth: (state, loadingAuth) => ({loadingAuth}),
    setTitle: (state, title) => ({title}),
    openModal: (state, modal) => ({modal}),
    closeModal: () => ({modal: null}),
    setProjectId(state, projectId) {
      return {projectId}
    }

  },

  render ({props, state, actions}) {
    if(state.loadingAuth){
      return <div>Loading</div>
    }
    return <App {...state} />
  },
})

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}