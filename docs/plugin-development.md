Plugin Development
==================

Writing plugins is very straight forward, essentially all you do is provide a function that returns the amplitude over time.
If you want to provide a GUI for your plugin, simply include an index.html file in your plugin folder and communicate your configuration via [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) (examples below).

## meta.json

This file stores information about the plugin and its author.
Properties marked with `*` are required.

| property    | type   | allowed values             |
| ----------- | ------ | -------------------------- |
| * title     | string | any                        |
| * type      | string | `"instrument"`, `"effect"` |
| * channels  | number | `1`, `2`                   |
| description | string | any                        |
| author      | string | any                        |
| website     | string | any                        |
| version     | string | any                        |
| tags        | Array  | any                        |

## script.js

This file defines your plugin's logic. It should contain exactly one anonymous function which can be used for initilizing local variables.
The return value of that function must also be a function which will later be called x times per second, where x is the host's sample rate.

### `fn(data : Object) : Array<number>`

The `data` parameter holds the following properties:

`t` : note playback time in seconds  
`f` : note frequency in Hz  
`d` : note press duration in seconds  
`v` : note velocity betwen 0 and 1  
`n` : note index by midi convention (A4:69 = 440 Hz)  
`c` : your plugin's configuration object  

The return value of `fn` should be an array of numbers, one for each channel (exception: plugins with only one channel must return a number instead of an array), between `-1` and `+1`, representing the amplitude at that given point in time.

### `on(data : Object) : void` (optional)

This function will be called once (before `fn`) when a note is being pressed and holds the same parameter as `fn`.

### `off(data : Object) : void` (optional)

This function will be called once when a note is being released and holds the same parameter as `fn`.

### `config : Object` (optional)
If you are too lazy to supply your own GUI, you can define a set of preferences in the `config` property.
The DAW will read these preferences and provide the user with a minimal UI composed of knobs, sliders, inputs and select boxes.  

Possible values are:
```json
"name": { type: "knob-pan", min: <number>, max: <number>, steps: <number> }
"name": { type: "knob-vol", min: <number>, max: <number>, steps: <number> }
"name": { type: "slider",   min: <number>, max: <number>, step:  <number> orientation: "horizontal|vertical" }
"name": { type: "select", options: <array>,  default: <number> }
```

### Scope

The scope in which your plugin logic is being evoked has all the `Math` properties unwrapped plus a few extras (see below).  
This allows for much shorter and clearer code, for example: `Math.sin( 2*Math.PI * ... )` becomes `sin( TAU * ... )`.

| name             | description                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `tri` `saw` `squ`      | geometric triangle, sawtooth and square wave functions with parameters: `(time)`                     |
| `triHQ` `sawHQ` `squHQ`| same as above but band limited                                                                       |
| `clamp(v,a,b)`         | constrain a number value to a range ( `min(max(v,a),b)` )                                            |
| `mix(a,b,f)`           | linear interpolation between two values ( `a + (b-a)*f` )                                            |
| `TAU`                  | `Math.PI * 2`                                                                                        |

The exported function takes the same argument as `fn` but with different properties:  

`s` : sample rate in Hz  
`b` : buffer size in samples
`c` : number of channels
`v` : number of voices

This allows you to do some initilization before exporting your plugin and also provides you with your own scope.

### Example

Nothing explains things better than a simple example:

**meta.json**
```json
{
	"title": "Oscillator",
	"type": "instrument",
	"author": "@literallylara",
	"channels": 1
}
```

**config.json**
```json
{
	"cents": { "min": -12000, "max": 12000, "steps": 120, "value": 0, "type": "knob-pan" },
	"wave": { "options": ["sin", "tri", "saw", "squ","triHQ","sawHQ","squHQ"], "type": "select" }
}
```

**script.js**
```js
function(data)
{
	let sampleRate = data.s
	let bufferSize = data.b
	let TAU440 = TAU * 400

	return d => self[d.c.wave](TAU440 * d.t * pow(2,(d.n-69+d.c.cents/100)/12) ) * exp(-max(d.t-d.d,0))
}
```

##index.html (optional)

In this file you can define your GUI in anyway you like. It will later be included in a sandboxed iframe. You may also include js, css and image files local to your plugin's directory. To communicate your GUI's configuration with the DAW you use [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). The target window will be `window.top`.

For example:

```js
window.postMessage({ cents: 300, wave: "saw" }, window.top)
```

Tip: to display knobs and sliders, you can include the [internal GUI framework](gui-framework.md).