import MVC          from "DAW/_lib/MVC"
import Tracks       from "DAW/Components/Tracks"
import MidiEditor   from "./MidiEditor"
import BeatEditor   from "./BeatEditor"
import SampleEditor from "./SampleEditor"

class View extends MVC.View
{
	render() { this.$el = $("<div class='center'>Please select or create a track to display the corresponding editor.</div>") }
	constructor(model) { super(model); this.render() }
}

let modelEmpty = new MVC.Model()
let viewEmpty = new View(modelEmpty)

let Editor = {
	model: modelEmpty,
	view: viewEmpty,
	icon: "piano"
}

function updateEditor(track)
{
	let $parent = Editor.view.$el.parent()

	Editor.view.onDetach && Editor.view.onDetach()
	Editor.view.$el.detach()

	if (track)
	{
		let editor = [MidiEditor,BeatEditor,SampleEditor][track.type]
		editor.model.track = track

		Editor.model = editor.model
		Editor.view = editor.view

		Editor.view.render()
	}
	else
	{
		Editor.model = modelEmpty
		Editor.view = viewEmpty
	}

	Editor.view.$el.appendTo($parent)
}

updateEditor(Tracks.model.focus)
Tracks.model.listen("focus", updateEditor)

export default Editor