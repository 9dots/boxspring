/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'
import FileListing from 'components/FileListing'
// import createAction from '@f/create-action'

/**
 * <File Manager/>
 */

export default component({

	render ({props, actions, state, context}) {
		let {files, fileTree} = context.state
		return (
			<Block
				id="file-manager"
				backgroundColor={props.backgroundColor} 
				borderLeft
        borderBottom
				borderWidth={1}
				borderColor="#aaa"
				fontSize={props.fontSize}
				tall
				w={props.w}
				p={3}>
				<Flex align='space-between center' h="35px">
          <h2 style={{margin:"4px 0px 4px 0px", fontSize: "20px"}}>Files</h2>
          <GameButton onClick={context.createFile} bg='blue' px='5px' py='3px' h="25px" fs="14px" color="black">
              New
              <Icon fs='inherit' bolder name='note_add' ml='3px'/>
          </GameButton>
        </Flex>
				<Block id="file-tree">
					<ul style={{paddingLeft: "20px"}}>
						{fileTree.map(fid => 
							<FileListing fid={fid} />
						)}
					</ul>
				</Block>
			</Block>
		)
	}
})
