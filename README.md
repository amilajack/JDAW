JDAW - Digital Audio Workstation
================================

## Installation

JDAW is available in three formats:

| format  | instructions                                                                      |
| ------- | --------------------------------------------------------------------------------- |
| binary  | download and extract zip, choose your platform and launch/execute `nw`            |
| web     | download and extract zip and open `index.html` on a server/localhost              |
| nw file | download nw file, install node-webkit (`npm i -g nw`) and run `nw jdaw-<version>` |

**Downloads:** https://github.com/literallylara/JDAW/releases  
**Web version:** https://literallylara.github.io/JDAW

## Documentation

* [Getting started](docs/getting-started.md)
* [Plugin development](docs/plugin-development.md)

## Milestone

### Implemented
* Track panel
* Resizable panels
* Dynamic context menu
* JSON based forms with input checking
* Plugin loading
* Plugin configuration

### Partially working
* I/O with workers
* MIDI editor
* Sample editor
* Mixer panel
* File browser panel

### ToDo
* Note editor
* Beat editor
* Song editor
* Global hint
* Live wave display
* Track rendering
* MIDI import/export
* Project saving/loading
* Plugin UI

## Contribution

1. **Setup:** Install [Node.js](https://nodejs.org/en/) and inside the repository run `npm install`  
2. **Bundle (dev)**: `npm start` (this will start a local server and compile automatically everytime a file changes)  
3. **Bundle**: `npm run bundle:html` (this will insert `tmp/bundle.css` and `tmp/bundle.js` into `www/index.html`)

The source is written in es6 and transpiled with babel using the `es2015` preset and `transform-class-properties` plugin.   Bundling is done with [rollupjs](http://rollupjs.org/) and the following plugins: `babel`, `commonjs`, `json`, `node-resolve`, `string`, `uglify`

### Module Dependency Graph

* install [node-madge](https://github.com/pahen/madge) and [Graphviz](http://www.graphviz.org/Download..php) globally
* run `npm run madge`
* see `res/dependency-graph.svg`

## License

MIT ([LICENSE.txt](LICENSE.txt))  

See `/licenses` for external libraries and resources