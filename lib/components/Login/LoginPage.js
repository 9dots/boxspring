import 'regenerator-runtime/runtime'
import vdux from 'vdux/dom'
import {component, element} from 'vdux'
import LoginUser from './LoginUser'


const LoginPage = component({
	render({props, actions, state}){
		return <LoginUser {...props} {...actions} {...state}/>
	}


})

export default LoginPage