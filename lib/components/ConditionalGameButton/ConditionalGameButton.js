/**
 * Imports
 */

import {component, element} from 'vdux'
import GameButton from 'components/GameButton'

/**
 * <Conditional Game Button/>
 */

export default component({
  render ({props, children}) {
    return (props.condition ?
    	<GameButton {...props} > {children} </GameButton>
			: <span/>
    )
  }
})
