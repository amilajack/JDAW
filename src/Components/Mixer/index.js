import MVC     from "DAW/_lib/MVC"
import Channel from "./Channel"
import tpl     from "DAW/_assets/tpl/components/mixer.tpl"

class Model extends MVC.Model
{
	channels = []

	constructor()
	{
		super()
		this.reset()
	}

	reset()
	{
		this.channels = []

		for(let i = 0; i < 11; i++)
		{
			this.channels.push(new Channel())
		}
	}
}

class View extends MVC.View
{
	template = tpl

	events = {
		changePanning: "turn .panning",
		changeVolume: "slidechange .volume",
		toggleMute: "click .mute"
	}

	constructor(model)
	{
		super(model)
		this.init()
	}

	changePanning(e,v)
	{
		this.model.channels[$(e.currentTarget).closest("ul").index()].pan = v
	}

	changeVolume(e)
	{
		this.model.channels[$(e.currentTarget).closest("ul").index()].vol = $(e.currentTarget).slider("value")/100
	}

	toggleMute(e)
	{

	}
}

let model = new Model()
let view = new View(model)
let icon = "mixer"

export default { model, view, icon }