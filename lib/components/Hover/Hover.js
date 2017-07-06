/**
 * Imports
 */

import {component, element} from 'vdux'
import maybeOver from '@f/maybe-over'

/**
 * initialState
 */

export default component({

	initialState: {
  	hovering: false
	},

	controller: {
		* hoverOver({actions}) {
			// console.log("HoverOver called...")
			actions.hoverOver()
		},
		* hoverOut({actions}) {
			// console.log("HoverOut called...")
			actions.hoverOut()
		},
	},

	reducer: {
	  hoverOver: state => ({ ...state, hovering: true }),
	  hoverOut: state => ({ ...state, hovering: false }),
	},

	render ({state, actions, children, local}) {
	  return (
	    <span onMouseOver={actions.hoverOver()} onMouseOut={actions.hoverOut()}>
	      {
	        maybeOver(state.hovering, children)
	      }
	    </span>
	  )
	}
})