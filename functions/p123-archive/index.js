var react = require('react')

  document.getElementById("app").appendChild(
    document.createElement("p").appendChild(
      document.createTextNode("This paragraph was added by javascr...")
    )
  )
  document.getElementById("actionButton").onclick = function() {
    alert("Hell")
  }
console.log(react)
 