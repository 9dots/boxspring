/**
 * Imports
 */

import {component, element} from 'vdux'
import Tab from 'components/Tab'
import {Flex, Block} from 'vdux-ui'

/**
 * <Tabs/>
 */

const colors = [
  'red',
  'blue',
  'green',
  'yellow'
]

export default component({
  initialState: function ({props}) {
  	return {
    	active: props.active || props.tabs[0]
  	}
  },

  render ({props, actions, context}) {
	  const {tabs, onClick, tabHeight, ...restProps} = props
    let {files} = context.state
    return (
      <Flex
        wide
        bottom='0'
        minHeight='25px'
        height='25px'
        {...restProps}>
        {tabs.map((fid, i, arr) => <Tab
          label={files[fid].name}
          name={files[fid].name}
          h={tabHeight}
          active={fid === props.active}
          handleClick={context.displayFile(fid)}
          underlineColor={colors[i % 4]}
	      />)}
      </Flex>
    )
  },
  // controller: {
  // 	* handleClick ({actions, props}, tab) {
  // 		const {onClick = () => {}} = props
  // 		yield onClick(tab)
  // 		yield actions.setActive(tab)
  // 	}
  // },
  // reducer: {
  // 	setActive: (state, tab) => ({active: tab})
  // }
})

function removeEmpty (elem) {
  return !!elem
}
