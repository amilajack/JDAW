import MVC     from "DAW/_lib/MVC"
import Utils   from "DAW/_lib/Utils"
import Plugins from "DAW/Plugins"
import tpl     from "DAW/_assets/tpl/components/fileBrowser.tpl"

class Model extends MVC.Model
{
	Plugins = Plugins
	Utils = Utils
}

class View extends MVC.View
{
	template = tpl

	events = {
		toggleFolder: "click .folder > .title",
		addFolder: "change .button-browse input"
	}

	constructor(model)
	{
		super(model)
		this.init()
	}

	toggleFolder(e)
	{
		$(e.currentTarget).parent().toggleClass("open")
	}

	addFolder(e)
	{

	}
}

let model = new Model()
let view = new View(model)

export default { model, view }