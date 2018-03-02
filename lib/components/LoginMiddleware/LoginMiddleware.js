import vdux from 'vdux/dom'
import {component, element, decodeValue} from 'vdux'
import firebase from 'firebase'
import Switch from '@f/switch'
import {
  unsubscribe,
  transaction,
  invalidate,
  subscribe,
  refMethod,
  getLast,
  update,
  push,
  once,
  signIn,
  signOut,
  set,
} from './actions'

var provider = new firebase.auth.GoogleAuthProvider();

let db
const LoginMiddleware = (newUser, email, password) =>{
	return mw
}


function mw({dispatch, getState, actions}) {
	firebase.auth().onAuthStateChanged(function(user) {
  		if (user) {
  			console.log("auth'd user")
    		dispatch(actions.updateUID(user.uid))
    		dispatch(actions.updateWelcome(user.email.substr(0, user.email.indexOf("@"))))
    		dispatch(actions.firebaseSet(`/users/${user.uid}/welcome`, user.email.substr(0, user.email.indexOf("@"))))
    		dispatch(actions.updateLoadingAuth(false))
  		} else {
    		// No user is signed in.
  			console.log("no auth'd user")
    		dispatch(actions.updateLoadingAuth(false))
  		}
	})
	return (next) => (action) => {
	    return Switch({
	      [signIn.type]:sign_in,
	      [signOut.type]:sign_out,
	      default: () => next(action)
	    })(action.type, action.payload)

	}
}

function sign_in(){
	return firebase.auth().signInWithRedirect(provider).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("Error " + errorCode + ": " + errorMessage)
		return errorCode;
		// ...
		});
}

function sign_out(payload){
	return firebase.auth().signOut().catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("Error " + errorCode + ": " + errorMessage)
		return errorCode;
		// ...
		});
}

export default LoginMiddleware