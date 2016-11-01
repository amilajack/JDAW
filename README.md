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
* MIDI import/export/input/recording
* Audio recording
* Project saving/loading
* Suport for custom themes
* Plugin UI

## Motivation

Why JavaScript? Why yet another DAW? The answer is simple, there are not a whole lot of free DAWs out there and the ones that do exist are either heavily platform dependent or horribly designed. The main reason however is my personal interest in learning more about digital signal processing, and what better way could there be than developing a fully featured audio work station? Plus, it turns out to be a great distraction from depression! Another goal of this project is to come up with a simple and robust cross-platform plugin interface, see [docs/plugin-development.md](docs/plugin-development.md) for the current draft.

## Contribution

**Setup:** Install [Node.js](https://nodejs.org/en/) and inside the repository run `npm install`  
**Development**: `npm start` (this will start a local server and compile automatically everytime a file changes)  
**Bundle**: `npm run bundle` (this will copy `www/` to `build/www/<version>`)  
**Build**: `npm run build`  (this will create binary executables for all common platforms in `build/bin/<version>`)

The source is written in es6 and transpiled with babel using the `es2015` preset and `transform-class-properties` plugin.   Bundling is done with [rollupjs](http://rollupjs.org/) and the following plugins: `babel`, `commonjs`, `json`, `node-resolve`, `string`, `uglify`

### Module Dependency Graph

* install [node-madge](https://github.com/pahen/madge) and [Graphviz](http://www.graphviz.org/Download..php) globally
* run `npm run madge`
* see `res/dependency-graph.svg`

## License

MIT ([LICENSE.txt](LICENSE.txt))  

See `/licenses` for licenses regarding external libraries and resources

## Special Thanks

Anders Kaare ([@sqaxomonophonen](https://github.com/sqaxomonophonen)) - technical consulting  
Tommy Hodgins ([@tomhodgins](https://github.com/tomhodgins)) - design consulting
