import MVC     from "DAW/_lib/MVC"
import Utils   from "DAW/_lib/Utils"
import Event   from "DAW/_lib/Event"
import Plugins from "DAW/Plugins"
import Mixer   from "DAW/Components/Mixer"
import tpl     from "DAW/_assets/tpl/components/tracks.tpl"

import MidiTrack   from "./MidiTrack"
import BeatTrack   from "./BeatTrack"
import SampleTrack from "./SampleTrack"
import types       from "./types"

class Model extends MVC.Model
{
	collection = []
	focus = null
	Mixer = Mixer.model

	addTrack(type)
	{
		let track = new [MidiTrack, BeatTrack, SampleTrack][type]()

		track.channel = 0

		this.collection.push(track)
		this.focus = track

		return track
	}

	delTrack(index)
	{
		let track = this.collection.splice(index,1)
		this.focus = this.collection[Math.max(index-1,0)]

		return track
	}
}

class View extends MVC.View
{
	template = tpl

	events = {
		addTrack: "click .toolbar li[data-action=add-track]",
		delTrack: "click .toolbar li[data-action=del-track]",
		focusTrack: "mousedown .tracks li",
		renameTrack: "dblclick .title",

		selectChannel: "change .channel select",
		sortStart: "sortstart .tracks",
		sortStop: "sortstop .tracks"
	}

	constructor(model)
	{
		super(model)
		this.init()

		Plugins.onInit.listen(() => { this.model.addTrack(types.MIDI); this.render() })
	}

	afterRender()
	{
		this.$el.find(".toolbar li[data-action=del-track]").toggleClass("disabled", !this.model.collection.length)
		this.$el.find(".tracks").sortable({ containment: "parent", tolerance: "pointer" })
	}

	addTrack(e)
	{
		this.model.addTrack(+$(e.currentTarget).attr("data-type"))

		$(".toolbar li[data-action=del-track]").removeClass("disabled")
		this.render()
	}

	delTrack(e)
	{
		Utils.confirm("Are you sure you want to delete this track?", function()
		{
			let $el = this.$el.find(".tracks .focus")
			let index = $el.index()

			$el.prev().addClass("focus")
			$el.remove()

			this.model.delTrack(index)
			!this.model.collection.length && $(e.currentTarget).addClass("disabled")

		}.bind(this))
	}

	focusTrack(e)
	{
		let $target = $(e.currentTarget)
		let track = this.model.collection[$target.index()]

		if (this.model.focus == track) return

		$target.addClass("focus").siblings().removeClass("focus")

		this.model.focus = track
	}

	renameTrack(e)
	{
		let $target = $(e.currentTarget)
		let index = $target.closest("li").index()

		$target.attr("contenteditable","").focus().on("blur keydown", function(e)
		{
			if (e.type == "blur" || e.type == "keydown" && e.keyCode == 13)
			{
				e.type == "keydown" && e.preventDefault()

				$target.off("blur keydown").removeAttr("contenteditable")
				window.getSelection().removeAllRanges()

				this.model.collection[index].title = $target.text()
			}
		}.bind(this))

		document.execCommand("selectAll", false, null)
	}

	selectChannel(e)
	{
		let $target = $(e.currentTarget)
		let trIndex = $target.closest("li").index()
		let chIndex = $target[0].selectedIndex

		this.model.collection[trIndex].channel = chIndex
	}

	sortStart(e,ui)
	{
		this.$el.find("[contenteditable]").blur()
		this.sortIndex = ui.item.index()
	}

	sortStop(e,ui)
	{
		this.model.collection.splice(
			ui.item.index(),0,
			this.model.collection.splice(this.sortIndex,1)[0]
		)
	}
}

let model = new Model()
let view = new View(model)

export { model, view, types }
export default { model, view, types }