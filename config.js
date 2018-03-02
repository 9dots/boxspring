var fs = require('fs')

const setups = {
  dev: {
    apiKey: "AIzaSyC9bsf70eTpA7v6j8zf1ZxrRg1g7A1oZb8",
    authDomain: "boxspring-81172.firebaseapp.com",
    databaseURL: "https://boxspring-81172.firebaseio.com",
    projectId: "boxspring-81172",
    storageBucket: "boxspring-81172.appspot.com",
    messagingSenderId: "421029558857"
  };
}

fs.writeFileSync('lib/client/firebaseConfig.js', 'module.exports = ' + JSON.stringify(setups["dev"]))
