/**
 * Imports
 */
import {component, element} from 'vdux'
/**
 * <Sandbox/>
 */

export default component({
// 	function Sandbox(opts) {
//   var self = this
//   if (!opts) opts = {}
//   this.name = opts.name
//   this.container = opts.container || document.body
//   this.iframeHead = opts.iframeHead || ""
//   this.iframeBody = opts.iframeBody || ""
//   this.iframeSandbox = opts.iframeSandbox || ""
//   this.cdn = opts.cdn || window.location.protocol + '//' + window.location.host
//   this.iframe = iframe({ container: this.container, scrollingDisabled: true, sandboxAttributes: this.iframeSandbox })
//   this.iframeStyle = "<style type='text/css'>" +
//     "html, body { margin: 0; padding: 0; border: 0; }\n" +
//     opts.iframeStyle +
//     "</style>"
//   this.cache = createCache(opts.cacheOpts)
//   sandbox.iframeHead = '<head></head>'
//   sandbox.iframeBody = '<body><div id="app"></div></body>'

// }

  render ({props}) {
  	// let html = `<p>Build and preview your code here...</p>`
	  let {script} = props
	  let iframeHead = `<head><style type='text/css'>` + `html, body { margin: 0; padding: 0; border: 0; }\n` + `</style></head>`
	  let iframeBody ='<body><div id="app"></div></body>'

    // setTimeout is because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded!
    script = `setTimeout(function(){\n${script}\n}, 0)`
		let scriptTag = `<script type="text/javascript">${script}</script>`	   
    let html = iframeHead + iframeBody + scriptTag
  	return <iframe srcdoc={html} scrolling="no"></iframe>
  }
})
