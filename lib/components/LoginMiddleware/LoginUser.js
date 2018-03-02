import vdux from 'vdux/dom'
import {component, element, decodeValue} from 'vdux'
import fire from 'vdux-fire'
import {Input, Textarea} from 'vdux-containers'
import {middleware as firebaseMw} from 'vdux-fire' 
import locationMw, * as location from 'redux-effects-location'
import firebaseConfig from 'client/firebaseConfig.js'
import Form from 'vdux-form'

let username;

const LoginUser = component({
	  initialState: {
	    email: '',
	    password: '',
	    errorMessage: ''
	  },
  middleware: [
    locationMw(),
    ],
	  render({props, state, actions}) {
	    return (
	     <div>
	        <div>{state.errorMessage}</div>
	        <button class="log-in-existing"onClick={actions.submit(true)}>Sign in</button>
	      </div>
	    )
	  },

	controller: {
		* handleCreateUser({props, state, actions, context}, email, pass){
			var signInFailed = yield context.firebaseSignUp()
			console.log(signInFailed)
			if(typeof(signInFailed) == "string"){
				yield actions.updateErrorMessage(signInFailed)
		        yield actions.clearLogin()
			}
			else{
				yield actions.updateErrorMessage("loading")
		        yield context.updateUrl('/')
		        yield location.setUrl('/')
			}
			
		},
		* handleExistingUser({props, state, actions, context}, email, pass){
			var signInFailed = yield context.firebaseSignIn(email, pass)
			if(typeof(signInFailed) == "string"){
				yield actions.updateErrorMessage(signInFailed)
		        yield actions.clearPassword()
			}
			else{
		        yield actions.clearLogin()
			    yield context.updateUrl('/')
		        yield location.setUrl('/')
			}
			
		},
	    * submit ({state, props, actions,context}, existingUser) {
	    	if(existingUser){
		        yield actions.handleExistingUser()

	    	} else {
		        yield actions.handleCreateUser(state.email, state.password)
		    }
	    }
	},
	reducer: {
		updateErrorMessage: (state, errorType) => { 
			var errorMessage = "Error: " + errorType
			if(errorType == "auth/wrong-password"){
				errorMessage = "Email and password do not match. Check caps lock and spelling please."
			}
			else if(errorType == "auth/user-not-found"){
				errorMessage = "Email not found. If new user, press the 'Create User' button to create an account."
			}
			else if(errorType == "auth/weak-password"){
				errorMessage = "Weak password detected. Passwords must be at least 6 characters and contain at least 1 digit"
			}
			else if(errorType == "auth/invalid-email"){
				errorMessage = "Incorrect email detected. Make sure to include the domain"
			}
			else if(errorType == "auth/email-already-in-use"){
				errorMessage = "Email already in use. If you're an existing user, click 'Login Existing User' button instead"
			}
			else if(errorType == "loading"){
				errorMessage = "Loading..."
			}
			return{errorMessage}

		},

		clearLogin: (state) => ({
		  email:'',
		  password:''
		}),
		clearPassword: (state) => ({
		  password:''
		}),
		updateEmail: (state, email) => ({
		  email
		}),
		updatePassword: (state, password) => ({
		  password
		}),
	}

})

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}

export default 	LoginUser