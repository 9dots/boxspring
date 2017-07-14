/**
 * Imports
 */
import {component, element} from 'vdux'
/**
 * <Sandbox/>
 */

export default component({

  render ({props}) {
  	let placeholderScript = `
			var h = document.createElement("h2");
			var text = document.createTextNode("Build your project and preview here...");
  		h.appendChild(text)
  		document.body.appendChild(h)`
	  let placeholderHTML = `<head><style type='text/css'>html, body { margin: 0; padding-top: 0px; border: 0; font-family: monospace; } h2 { margin-top: 65%; text-align: center;}</style></head><body><div id="app"></div></body>`
	  let userScript = props.userScript || placeholderScript
	  let userHTML = props.userHTML || placeholderHTML

    // setTimeout because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded
    userScript = `<script type="text/javascript">setTimeout(function(){\n${userScript}\n}, 0)</script>`
    let iframeHTML = userHTML + userScript

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
