/**
 * Imports
 */

import {component, element, stopPropagation, decodeValue, decodeRaw} from 'vdux'
import ModalMessage from 'components/ModalMessage'
import {Input, Textarea} from 'vdux-containers'
import Button from 'components/Button'
import {Block} from 'vdux-ui'
import Form from 'vdux-form'

/**
 * <Edit Modal/>
 */

export default component({
	initialState ({props}) {
		return {
			textValue: props.value || ''
		}
	},
  render ({props, actions, state}) {
	  const {field, label, onSubmit, dismiss, validate, textarea, submitMessage, ...restProps} = props
	  const {textValue} = state

	  const footer = (
	    <Block>
	      <Button
	      	bgColor='grey'
	      	color='primary'
	      	fs='xs'
	      	onClick={[stopPropagation, dismiss]}>Cancel</Button>
	      <Button
	      	type='submit'
	      	form='submit-form'
	      	ml={10}
	      	bgColor='blue'
	      	fs='xs'
	      	onClick={[stopPropagation, dismiss, onSubmit]}>{submitMessage}</Button>
	    </Block>
	  )

	  const body = <Block m={0} >
	    <Form m={0} p={0} id='submit-form' validate={validate}>
	    </Form>
	  </Block>

	  return (
	    <ModalMessage
	      fullscreen={textarea}
	      dismiss={dismiss}
	      header={`${label}`}
	      noFooter={textarea}
	      headerColor='blue'
	      bgColor='#FAFAFA'
	      onSubmit={actions.submit()}
	      footer={footer}
	      {...restProps} />
	  )
  },
  controller: {
  	* submit ({props, state}) {
  		console.log("ConfirmModal submit action...")
  		const {onSubmit, dismiss} = props
	    yield onSubmit()
	    yield dismiss()
	  }
  },
  reducer: {
  	setTextValue: (state, textValue) => ({textValue})
  }
})

function handleTab (evt) {
  if (evt.keyCode === 9) {
    evt.preventDefault()
    evt.stopPropagation()
    const target = evt.target
    var v = target.value
    var s = target.selectionStart
    var e = target.selectionEnd
    target.value = v.substring(0, s) + '\t' + v.substring(e)
    target.selectionStart = target.selectionEnd = s + 1
    return false
  }
}
