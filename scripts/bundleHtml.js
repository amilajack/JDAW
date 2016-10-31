var fs = require("fs")
var pkg = require("../package.json")

fs.writeFileSync("www/index.html", fs.readFileSync("src/index.html", "utf8").replace(/{{VERSION}}/g, pkg.version))
