import createAction from '@f/create-action'

const startRead = createAction('<readerMw/>: START_READ')
// const startRead = createAction('readFile')

export {
	startRead
}

export default ({getState, dispatch, actions}) => {
	const Reader = new FileReader()
	Reader.onload = function (e) {
		dispatch(actions.setFileSrc(e.target.result))
	}
	return next => action => {
		if (action.type === startRead.type) {
			Reader.readAsDataURL(action.payload)
		}
		return next(action)
	}
}