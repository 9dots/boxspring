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

import Router from 'components/Router'
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
      uiTheme: theme,
    }
  },

  initialState: {
    url: window.location.pathname,
    title: 'Boxspring',
    nextId: 0,
    currentFile: null,
    // fileTree: [],
    openTabs: [],
    files: {}
  },

  onCreate ({actions}) {
    return [
      actions.initializeApp()
      // actions.initializeMedia()
    ]
  },

  onUpdate (prev, next) {
    if (prev.state.title !== next.state.title && typeof document !== 'undefined') {
      document.title = next.state.title
    }
  },

  render ({props, state, actions}) {
    return <App {...state} />
  },

  middleware: [
    locationMw(),
    // fetchEncodeJSON,
    fetchMw,
    // mediaMw,
    firebaseMw(firebaseConfig),
    // auth
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
    // // scrollTo: wrapEffect(scrollToEffect),
    // fetch: wrapEffect(fetch),
    // firebaseTask: wrapEffect((state, obj) => firebasePush('/queue/tasks', {_state: state, ...obj})),
    ...map(wrapEffect, location)
  },

  reducer: {
    updateUrl: (state, url) => ({url, test:console.log(url)}),
    setTitle: (state, title) => ({title}),

    setProjectState(state, {fileDescriptors, project}) {
      return {...state, project}
    },

    // createFile (state) {
    //   deepFreeze(state)
    //   let {files, fileTree, nextId} = state
    //   nextId++
    //   let tempName = 'untitled-' + nextId
    //   let newFile = {
    //     fid: nextId,
    //     name: tempName,
    //     contents: '',
    //     rename: tempName
    //   }
    //   // console.log(fileTree)
    //   files = {...files}
    //   files[newFile.fid] = newFile
    //   fileTree = [...fileTree, newFile.fid]
    //   return {...state, fileTree, files, nextId}
    // },

    // updateFileName: (state, fid, name) => ({
    //   files: {
    //     ...state.files,
    //     [fid]: {
    //       ...state.files[fid],
    //       name,
    //       rename: null
    //     } 
    //   }
    // }),

    // updateFileContents (state, fid, contents) {
    //   deepFreeze(state)
    //   // console.log('updateFileContents...', state, fid, contents)
    //   return {
    //     files: {
    //       ...state.files,
    //       [fid]: {
    //         ...state.files[fid],
    //         contents
    //       }
    //     }
    //   }
    // },

    // openFile (state, fid) {
    //   deepFreeze(state)
    //   let newState = {}
    //   newState['currentFile'] = fid
    //   if (state.openTabs.indexOf(fid) === -1)
    //     newState['openTabs'] = [...state.openTabs, fid]
    //   return newState
    // },

    // displayFile: (state, fid) => {
    //   return { currentFile: fid }
    // }
  }
})

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}