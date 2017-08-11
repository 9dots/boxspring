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

function removeEmpty (elem) {
  return !!elem
}


export default component({
  initialState: function ({props}) {
  	return {
    	active: props.active || props.tabs[0]
  	}
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

  render ({props, actions, context}) {
    const {tabs, onClick, tabHeight, ...restProps} = props
    let {files} = props
    return (
      <Flex
        id="tabsContainer"
        wide
        bottom='0'
        minHeight='25px'
        height='25px'
        {...restProps}>
        {tabs.map((name, i, arr) => <Tab
          label={files[name].displayName}
          name={name}
          h={tabHeight}
          active={name === props.active}
          handleClick={props.onTabClick(name)}
          underlineColor={colors[i % 4]}
          closeTab={props.closeTab}
          // style={{flexGrow:false,flexShrink:false}}
        />)}
      </Flex>
    )
  }
})