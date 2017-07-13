/**
 * Imports
 */
import {component, element} from 'vdux'
/**
 * <Sandbox/>
 */

export default component({

  render ({props}) {
  	// let html = `<p>Build and preview your code here...</p>`
	  let {script} = props
	  let iframeHead = `<head><style type='text/css'>` + `html, body { margin: 0; padding: 0; border: 0; }\n` + `</style></head>`
	  let iframeBody ='<body><div id="app"></div></body>'

    // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
    script = `setTimeout(function(){\n${script}\n}, 0)`
		let scriptTag = `<script type="text/javascript">${script}</script>`	   
    let iframeHTML = iframeHead + iframeBody + scriptTag
  	return (
  		<iframe srcdoc={iframeHTML}
  			width="100%" height="100%"
  			scrolling="no"
  			frameborder={0}
  			
  		>
  		</iframe>
  	)
  }
})
