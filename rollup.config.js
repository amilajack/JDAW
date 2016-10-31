var babl = require("rollup-plugin-babel")
var comj = require("rollup-plugin-commonjs")
var ugly = require("rollup-plugin-uglify")
var json = require("rollup-plugin-json")
var text = require("rollup-plugin-string")
var node = require("rollup-plugin-node-resolve")

var plugins = [
	node({ preferBuiltins: false }),
	comj({ include: "node_modules/DAW/_lib/external/cjs/**", exclude: "node_modules/DAW/_lib/external/cjs/zipjs/extra/*.js" }),
	text({ include: ["node_modules/DAW/_assets/tpl/**/*.tpl", "node_modules/DAW/_lib/external/cjs/zipjs/extra/*.js"] }),
	json({ include: "node_modules/DAW/_assets/json/**/*.json"}),
	babl()
]

process.env.final == "true" && plugins.push(ugly())

export default {
	format: "iife",
	entry: "node_modules/DAW/index.js",
	dest: "www/bundle.js",
	useStrict: false,
	plugins: plugins
}