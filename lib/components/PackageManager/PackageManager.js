/**
 * Imports
 */

import {component, element, decodeValue} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import {Input} from 'vdux-containers'
import GameButton from 'components/GameButton'
import PackageListing from 'components/PackageListing'
import mapValues from '@f/map-values'
import Form from 'vdux-form'

/**
 * <Package Manager/>
 */

export default component({
	initialState:{
		newPkg: "",
		waiting:false,
	    msg:"Add an npm package to your project",
	    error:false,
  	},
	//onCreate
	//function: checks whether or not the files from firebase have loaded in and tries to load the file tree if they're ready
	* onCreate({state, props, actions}) {
	},

	controller: {

		//loadFileTree
		//function: uses props.files to generate the list of files to grab using gcs. Sets state.ready to true after it has finished loading the file tree
		* loadFileTree({props, actions, context}) {

		  // let fileTree = gcs.listObjects({
		  //         bucket: context.BUCKET_NAME,
		  //         projectId: context.projectId,
		  //         files: props.files.value
		  //       })
		  // yield props.onFileTreeDownload(fileTree)
		  // yield actions.setReady(true)
		},
		* deletePkg({props,actions,context}, key){
			console.log("deleting")
			console.log(key)

			yield context.firebaseUpdate(`projects/${context.projectId}/pkg/${key}`, {loading:true})
			yield actions.setMsg(`Deleting ${props.project.value.pkg[key].name}`)
			yield actions.setError(false)

			var payload = yield context.deletePkgOnServer(context.projectId, props.project.value.pkg[key].name)
			console.log(payload)

			if(payload && payload.ok){
				console.log("Package succesfully deleted")
				yield actions.setMsg(`Succesfully deleted ${props.project.value.pkg[key].name}`)
				yield actions.setError(false)
				yield context.firebaseSet(`projects/${context.projectId}/pkg/${key}`, {})
				// yield props.setBundleName(payload.tag)
			} else {
				yield actions.setMsg(`Failed to delete ${props.project.value.pkg[key].name}`)
				yield actions.setError(true)
				yield context.firebaseUpdate(`projects/${context.projectId}/pkg/${key}`, {loading:false})
				console.log(payload.error)
			}
		},
		* openNPMLink({props,actions,context}, name){
			console.log("going to link")
			window.open(`http://www.npmjs.com/package/${name}`,'_blank');
		},

		//function: takes in a pkg name, creates an entry in the pkg branch, waits for server to add package, removes package if server was unable to add package
		* downloadPkg({props,actions,context}, pkg){
			yield actions.setWaiting(true)
			var {key} = yield context.firebasePush(`projects/${context.projectId}/pkg`, {
				name:pkg,
				loading:true,
			})
			yield actions.setMsg(`Adding ${pkg}`)
			yield actions.setError(false)

			var payload = yield context.addPkgOnServer(context.projectId, pkg)
			// console.log(payload)

			if(payload && payload.ok){
				yield actions.setMsg(`Added ${pkg}`)
				yield actions.setError(false)
				yield context.firebaseUpdate(`projects/${context.projectId}/pkg/${key}`, {loading:false})
				yield actions.setNewPkg("")
				// yield props.setBundleName(payload.tag)
			} else {
				yield actions.setMsg(`Unable to add ${pkg}`)
				yield actions.setError(true)
				yield context.firebaseSet(`projects/${context.projectId}/pkg/${key}`, {})
				console.log(payload.error)
			}
			yield actions.setWaiting(false)
		},

		* openModalToCreateFile({props, context, actions}) {
		  // yield context.openModal(() => <FileNameModal
		  //   label="Choose a file name"
		  //   field="filename"
		  //   onSubmit={actions.createFile}
		  //   submitMessage="Create"
		  //   name="filename"
		  //   dismiss={context.closeModal()}
		  //   value=""
		  //   textarea={false}
		  //   actionType="input"
		  // />)
		},

	},

	reducer:{
		setReady: (state, ready) => {
		  return {ready}
		},
		setNewPkg: (state, newPkg) => {
		  return {newPkg}
		},
		setWaiting: (state, waiting) => {
		  return {waiting}
		},
		setMsg: (state, msg) => {
		  return {msg}
		},
		setError: (state, error) => {
		  return {error}
		},
	},

	render ({props, actions, state, context}) {
		let {project} = props
		let {newPkg, error, msg} = state
		let {setNewPkg, downloadPkg} = actions
		var packageJSX = <span>Loading packages</span>
		var textColor = error ? "red" : "black" 
		if(!project.loading){
			if(project.value.pkg){
		    	packageJSX = mapValues((entry, key) => {
		    		return(
		    			<PackageListing
		    				key={key}
		    				entry={key}
		    				hoverProps={{hovering: true, bgColor: "#c0e8ff"}}
		    				deletePkg={actions.deletePkg}
		    				openNPMLink={actions.openNPMLink}
		    				name={entry.name}
		    				loading={entry.loading}
		    				setError={actions.setError}
		    				setMsg={actions.setMsg}
						>
							{entry.name}
						</PackageListing>
					)
		    	}, project.value.pkg || {})
			}else {
				packageJSX = <span>None</span>
			}
		} 

		//need to change the display property on the package listing to anything other than flex
		return (
		  <Block
		    id="package-manager"
		    backgroundColor={props.backgroundColor} 
		    fontWeight={2}
		    fontSize={props.fontSize}
		    tall
		    w="90%"
		    h={props.h}
		    align-self="center"
		    px={4}
		    pt={4}>
		    	<Flex align="center" flex-direction="column">
					<h3 py={2} align="center">PACKAGES</h3>
					<Flex color={textColor}>
						<span align="center">{msg}</span>
					</Flex>
		    		<Form m={0} id='pkg-form' onSubmit={downloadPkg(newPkg)}>
						<Input
							autofocus
							inputProps={{p: '4px'}}
							name="package-input"
							fs='12px'
							value={newPkg}
							onKeyUp={decodeValue(setNewPkg)}
							disabled={state.waiting}
						/>
					</Form>
					<span style={{overflowY:"scroll", overflowX:"hidden", width:"100%", height:"80px"}}>	
	  	  				{packageJSX}
		  			</span>
	  			</Flex>
		  </Block>
		)
	}
})
