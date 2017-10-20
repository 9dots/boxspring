import * as actions from './actions'
import LoginMiddleware from './LoginMiddleware'

const set = (ref, payload) => actions.set({ref, value: payload})
const transaction = (ref, payload) => actions.transaction({ref, value: payload})
const update = (ref, payload) => actions.update({ref, value: payload})
const push = (ref, payload) => actions.push({ref, value: payload})
const refMethod = actions.refMethod
const once = (ref, listener) => actions.once({ref, listener})
const signUp = (email, pass) => actions.signUp({email, pass})
const signIn = (email, pass) => actions.signIn({email, pass})
const signOut = () => actions.signOut()



export {
  transaction,
  LoginMiddleware,
  refMethod,
  update,
  push,
  once,
  set,
  signUp,
  signIn,
  signOut
}