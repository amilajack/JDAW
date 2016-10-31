import MVC from "DAW/_lib/MVC"
import tpl from "DAW/_assets/tpl/components/editor/beatEditor.tpl"

class Model extends MVC.Model
{
	bpm = 120
	sig = [4,4]

	constructor()
	{
		super()
	}
}

class View extends MVC.View
{
	template = tpl

	events = {
	}

	constructor(model)
	{
		super(model)
		this.init()
	}
}

let model = new Model()
let view = new View(model)
let icon = "drums"

export default { model, view, icon }