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
		errorMsg: ""
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
		  //         prefix: context.projectId + "/",
		  //         files: props.files.value
		  //       })
		  // yield props.onFileTreeDownload(fileTree)
		  // yield actions.setReady(true)
		},
		* deletePkg({props,actions,context}, key){
			console.log("deleting")
			console.log(key)
			var payload = yield context.deletePkgOnServer(context.projectId, props.project.value.pkg[key].name)
			console.log(payload)
			if(payload.ok){
				console.log("Package succesfully deleted")
				yield context.firebaseSet(`projects/${context.projectId}/pkg/${key}`, {})
				yield props.setBundleName(payload.tag)
			} else {
				console.log(payload.error)
			}
		},
		* openNPMLink({props,actions,context}, name){
			console.log("going to link")
			window.open(`http://www.npmjs.com/package/${name}`,'_blank');
		},
		* downloadPkg({props,actions,context}, pkg){
			yield actions.setWaiting(true)
			var payload = yield context.addPkgOnServer(context.projectId, pkg)
			console.log(payload)
			if(payload.ok){
				console.log("Package succesfully added")
				yield context.firebasePush(`projects/${context.projectId}/pkg`, {name:pkg})
				yield actions.setNewPkg("")
				yield props.setBundleName(payload.tag)
			} else {
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
		setErrorMsg: (state, errorMsg) => {
		  return {errorMsg}
		},
	},

	render ({props, actions, state, context}) {
		let {project} = props
		let {newPkg} = state
		let {setNewPkg, downloadPkg} = actions
		var packageJSX = <span>Loading packages</span>
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
						>
							{entry.name}
						</PackageListing>
					)
		    	}, project.value.pkg || {})

			}else {
				packageJSX = <span>None</span>
			}
		} 
		return (
		  <Block
		    id="package-manager"
		    backgroundColor={props.backgroundColor} 
		    fontWeight={2}
		    fontSize={props.fontSize}
		    tall
		    w="92%"
		    h={props.h}
		    px={6}
		    pt={4}>
				<h3 align="center">PACKAGES</h3>
	    		<Form m={0} p={0} id='pkg-form' onSubmit={downloadPkg(newPkg)}>
	    			<div align="center">Add Package</div>
					<Input
						autofocus
						inputProps={{p: '4px'}}
						name="hey"
						fs='12px'
						mb='l'
						value={newPkg}
						onKeyUp={decodeValue(setNewPkg)}
						disabled={state.waiting}
					/>
				</Form>
	  	  		{packageJSX}
		  </Block>
		)
	}
})
