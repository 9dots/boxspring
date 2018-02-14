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


    let inProgressHTML = `<html><head><style type="text/css">
    body {
      font-face: sans-serif;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
}

svg {
  margin-top: 55%;
}

.spinner {
  -webkit-animation: rotator 1.4s linear infinite;
          animation: rotator 1.4s linear infinite;
}

@-webkit-keyframes rotator {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
  }
}

@keyframes rotator {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
  }
}
.path {
  stroke-dasharray: 187;
  stroke-dashoffset: 0;
  -webkit-transform-origin: center;
          transform-origin: center;
  -webkit-animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
          animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
}

@-webkit-keyframes colors {
  0% {
    stroke: #4285F4;
  }
  25% {
    stroke: #DE3E35;
  }
  50% {
    stroke: #F7C223;
  }
  75% {
    stroke: #1B9A59;
  }
  100% {
    stroke: #4285F4;
  }
}

@keyframes colors {
  0% {
    stroke: #4285F4;
  }
  25% {
    stroke: #DE3E35;
  }
  50% {
    stroke: #F7C223;
  }
  75% {
    stroke: #1B9A59;
  }
  100% {
    stroke: #4285F4;
  }
}
@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 187;
  }
  50% {
    stroke-dashoffset: 46.75;
    -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
  }
  100% {
    stroke-dashoffset: 187;
    -webkit-transform: rotate(450deg);
            transform: rotate(450deg);
  }
}
@keyframes dash {
  0% {
    stroke-dashoffset: 187;
  }
  50% {
    stroke-dashoffset: 46.75;
    -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
  }
  100% {
    stroke-dashoffset: 187;
    -webkit-transform: rotate(450deg);
            transform: rotate(450deg);
  }
}
</style>
</head>
<body>
      <svg class="spinner" width="190px" height="190px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
      </svg>
</body>
</html>
    `

    let placeholderScript = `
      var h = document.createElement("h2");
      var text = document.createTextNode("Build your project and preview here...");
      h.appendChild(text)
      document.body.appendChild(h)`

    let placeholderHTML = `<head><style type='text/css'>html, body { margin: 0; padding-top: 0px; border: 0;} h2 { margin-top: 65%; text-align: center;}</style></head><body><div id="app"></div></body>`

    let appJS = depsBundle || ''
    appJS += '/* END DEPS BUNDLE */'
    appJS += appBundle + '/* END APP BUNDLE */'
    let appHTML = props.appHTML || placeholderHTML
    appHTML = appHTML.replace('</body>', '') // HACK remove
    appHTML = appHTML.replace('</html>', '') // HACK remove
    // setTimeout because iframes report inaccurate window.innerWidth/innerHeight, even after DOMContentLoaded
    appJS = `<script type="text/javascript">${appJS}</script>`
    let iframeHTML = appHTML + appJS + '</body></html><!-- END iframeHTML-->'

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
