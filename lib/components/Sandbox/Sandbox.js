/**
 * Imports
 */
import {component, element} from 'vdux'
/**
 * <Sandbox/>
 */

export default component({

  render ({props}) {
    let {depsBundle, appBundle} = props


    let inProgressHTML = `<h1 style="margin-top: 50%; text-align: center; font-family: monospace;">Building project...</h1>`

    let placeholderScript = `
      var h = document.createElement("h2");
      var text = document.createTextNode("Build your project and preview here...");
      h.appendChild(text)
      document.body.appendChild(h)`

    let placeholderHTML = `<head><style type='text/css'>html, body { margin: 0; padding-top: 0px; border: 0; font-family: monospace; } h2 { margin-top: 65%; text-align: center;}</style></head><body><div id="app"></div></body>`

    let appJS = depsBundle || ''
    appJS += '/* END DEPS BUNDLE */'
    appJS += appBundle + '/* END APP BUNDLE */'
    let appHTML = props.appHTML || placeholderHTML
    appHTML = appHTML.replace('</html>', '') // HACK remove

    // setTimeout because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded
    appJS = `<script type="text/javascript">setTimeout(function(){\n${appJS}\n}, 0)</script>`
    let iframeHTML = appHTML + '<!-- END APP HTML -->' + appJS + '</html><!-- END iframeHTML-->'

  	return ( 
  		<iframe srcdoc={props.buildInProgress ? inProgressHTML : iframeHTML}
  			width="100%" height="100%"
  			scrolling="no"
  			frameborder={0}
  		>
  		</iframe>
  	)
  }
})
