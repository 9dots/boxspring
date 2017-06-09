/**
 * Imports
 */

import {component, element} from 'vdux'
import {Block, Box, Icon, Flex} from 'vdux-ui'
import GameButton from 'components/GameButton'

/**
 * <File Manager/>
 */

export default component({
	render ({props}) {
		return (
			<Block
				id="file-manager"
				backgroundColor="#aaa" 
				borderLeft
        borderBottom
				borderWidth={1}
				borderColor="black"
				fontSize={props.fontSize}
				tall
				w={props.w}>
				<Flex align='space-between center'>
					<h2>Files</h2>
					<GameButton disabled={false} bg='green' mr='s' px='5px' py='5px' h="35px" fs="16px" color="black">
						New <Icon fs='inherit' bolder name='note_add' ml='3px'/>
					</GameButton>
				</Flex>
				<Block id="file-tree">
					<ul>
						<li>index.js</li>
						<li>index.html</li>
						<li>style</li>
						<li>
						<ul>
						<li>style.css</li>
						<li>theme.css</li>
						</ul>
						</li>
					</ul>
				</Block>
			</Block>
		)
	}
})
