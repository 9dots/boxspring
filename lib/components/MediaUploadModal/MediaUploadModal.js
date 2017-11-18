/**
 * Imports
 */

import {component, element, stopPropagation, decodeValue, decodeRaw} from 'vdux'
import readerMw, {startRead} from 'components/MediaUploadModal/readerMw'
import ModalMessage from 'components/ModalMessage'
import {Input, Textarea} from 'vdux-containers'
import Button from 'components/Button'
import {Block, Flex} from 'vdux-ui'
import Form from 'vdux-form'

/**
 * <Edit Modal/>
 */

export default component({
	initialState ({props}) {
		return {
			textValue: props.value || '',
			fileSrc: '',
			fileName: '',
		}
	},
  render ({props, actions, state}) {
	  const {field, label, onSubmit, dismiss, validate, textarea, submitMessage, ...restProps} = props
	  const {textValue, fileSrc, fileName} = state

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
	      	onClick={stopPropagation}>{submitMessage}</Button>
	    </Block>
	  )
	  const body =
	  (<Block column m={0} >
		    <Form m={0} p={0} id='submit-form' onSubmit={actions.submit(fileSrc, fileName)} validate={validate}>
		      {
		      	textarea 
		      		? <MyTextArea
		      				flex
		      				field={field}
		      				textValue={textValue}
		      				setTextValue={actions.setTextValue}/>
		      		: <Input
		      				flex
					      autofocus
					      inputProps={{p: '12px'}}
					      type="file"
					      id="modalImgInp"
					      name={field}
					      onChange={actions.readFile} />
		      }
		    </Form>
		    <span>Preview:</span>
        	<img flex id="imagePreview" src={fileSrc}/>
	  </Block>)

      console.log(state)
	  return (
	    <ModalMessage
	      fullscreen={textarea}
	      dismiss={dismiss}
	      header={`${label}`}
	      noFooter={textarea}
	      headerColor='blue'
	      bgColor='#FAFAFA'
	      body={(props.actionType == 'input') && body}
	      onSubmit={actions.submit(fileSrc, fileName)}
	      footer={footer}
	      {...restProps} />
	  )
  },
  middleware: [readerMw],
  controller: {
  	* submit ({props, state}) {
  		const {field, onSubmit, dismiss} = props
  		const {textValue,fileName,fileSrc} = state || 'empty'
	    yield dismiss()
	    yield onSubmit({fileName, fileSrc})
	  },
    * readFile({state, actions, props, context}) {
      var inputs = document.getElementsByClassName('vui-input')
	  var input = inputs[0].files
      if(input && input[0]){
      	yield actions.setFileName(input[0].name)
      	yield startRead(input[0])
      }
      console.log(state)
    },
  },
  reducer: {
  	setTextValue: (state, textValue) => ({textValue}),
  	setFileSrc: (state, fileSrc) => ({fileSrc}),
  	setFileName: (state, fileName) => ({fileName}),
  }
})

const MyTextArea = component({
	render ({props}) {
		const {field, textValue, setTextValue} = props
		return (
			<Textarea
	      p='7px'
	      autofocus
	      w='60%'
	      margin='0 auto'
	      border='1px solid #ccc'
	      borderWidth='0'
	      borderBottomWidth='1px'
	      lineHeight='1.4'
	      bgColor='transparent'
	      resize='none'
	      focusProps={{borderColor: 'blue', borderBottomWidth: '2px'}}
	      name={field}
	      fs='18px'
	      value={textValue}
	      onKeyDown={decodeRaw(handleTab)}
	      color="green"
	      onKeyUp={decodeValue(setTextValue)} />
     )
  }
})

const EditInput = component({
	render ({props}) {
		const {field, textValue, setTextValue} = props
		return 
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
