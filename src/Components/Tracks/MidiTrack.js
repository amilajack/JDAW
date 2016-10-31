import MVC     from "DAW/_lib/MVC"
import Plugins from "DAW/Plugins"
import types   from "./types"

class Model extends MVC.Model
{
	pan = 0
	vol = 1

	type = types.MIDI
	title = "MIDI Track"

	bpm = 120
	sig = [4,4]
	notes = []
	plugin = Plugins.collection.oscillator

	view = {
		scroll: { x: null, y: null }
	}

	playback = {
		cursor: 0,
		start: 0,
		end: 0,
		paused: true
	}
}

export default Model