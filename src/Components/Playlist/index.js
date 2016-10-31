import MVC     from "DAW/_lib/MVC"
import tpl     from "DAW/_assets/tpl/components/playlist.tpl"

class Model extends MVC.Model
{
	constructor(track)
	{
		super()
	}
}

class View extends MVC.View
{
	template = tpl
	events = {}

	constructor(model)
	{
		super(model)
		this.init()
	}
}

let model = new Model()
let view = new View(model)
let icon = "th-list"

export default { model, view, icon }