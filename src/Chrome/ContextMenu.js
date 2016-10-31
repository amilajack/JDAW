import Utils from "DAW/_lib/Utils"
import MVC   from "DAW/_lib/MVC"
import tpl   from "DAW/_assets/tpl/chrome/contextMenu.tpl"

class Model extends MVC.Model
{
	menus = {}
	callbacks = {}

	registerMenu(id, menu , callbackOpen, callbackSelect)
	{
		this.set("callbacks."+id, { open: callbackOpen, select: callbackSelect })
		this.set("menus."+id, menu)
	}
}

class View extends MVC.View
{
	element = "#contextMenu"
	template = tpl
	target = null

	events = {
		itemClicked: "click .item"
	}

	constructor(model)
	{
		super(model)
		this.init()

		// show menu on right click
		$(document.body).on("contextmenu", function(e)
		{
			// find the closest available context menu
			let $target = $(e.target).closest("[data-contextmenu]")
			if (!$target.length) return

			// get the corresponding menu model and callback
			let menuID = $target.attr("data-contextmenu")
			let menu = this.model.menus[menuID]
			let callbacks = this.model.callbacks[menuID]

			this.target = { root: $target[0], child: e.target, menuID: menuID }

			// does the menu exist and is it allowed to open?
			if (!menu || !callbacks || !callbacks.open(this.target)) return

			e.preventDefault() && this.render()
			$("#contextMenu").css({ left: e.pageX, top: e.pageY }).show()

		}.bind(this))

		// hide menu when unfocused
		$(document.body).on("click", e => !$(e.target).closest("#contextMenu").length && $("#contextMenu").hide())
	}

	itemClicked(e)
	{
		this.target.itemID = Utils.camelCase($(e.currentTarget).find(".name").text())
		this.model.callbacks[this.target.menuID].select(this.target)

		$("#contextMenu").hide()
	}
}

let model = new Model()
let view = new View(model)

export default { model, view }