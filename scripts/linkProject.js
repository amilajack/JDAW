var fs = require("fs")

try { fs.unlinkSync("node_modules/DAW") } catch(e) {}
fs.symlinkSync("../src", "node_modules/DAW", "junction")