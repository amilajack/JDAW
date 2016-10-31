import Form    from "DAW/_lib/Form"
import MVC     from "DAW/_lib/MVC"
import Project from "DAW/Project"
import Plugins from "DAW/Plugins"
import Utils   from "DAW/_lib/Utils"

import tpl     from "DAW/_assets/tpl/chrome/toolBar.tpl"
import menu    from "DAW/_assets/json/chrome/toolBarMenu.json"
import popups  from "DAW/_assets/tpl/popups"
import forms   from "DAW/_assets/json/forms"

class Model extends MVC.Model
{
	menu = menu
	toggles = {}
	project = Project

	constructor()
	{
		super()
		this.menu.forEach(v=>this.assignMenuIds(v,[]))
	}

	assignMenuIds(item, id)
	{
		id.push(Utils.camelCase(item.name))
		item.id = id.join("_")

		;(item.items || []).forEach(v => this.assignMenuIds(v,id.slice(0)))
	}
}

class View extends MVC.View
{
	element = "#toolBar"
	template = tpl

	events = {
		menuItemClicked: "click .menu .item"
	}

	constructor(model)
	{
		super(model)
		this.init()

		Plugins.onInit.listen(() => this.render())
	}

	afterRender()
	{
		!Project.cached && this.simulateMenuItemClick("file_newProject")
	}

	menuItemClicked(e)
	{
		let $el = $(e.currentTarget)
		let id = $el.attr("data-id")
		let type = $el.attr("data-type")

		// open a popup/form dialog
		if (type == "popup" || type == "form")
		{
			let tpl = type == "popup" ? popups[$el.attr("data-id")] : new Form(forms[$el.attr("data-id")])
			let html = type == "form" ? tpl.$form.attr("name",id) : tpl

			$.ui.dialog.prototype._focusTabbable = $.noop

			$("#dialog").dialog("instance") && $("#dialog").dialog("destroy")

			$("#dialog").html("").append(html).dialog({

				title: $el.find(".name").text(),
				modal: true,
				width: "auto",
				resizable: false,

				open: function()
				{
					$(this).dialog("option", "minWidth", $(".ui-dialog").width())
					$(this).dialog("option", "minHeight", $(".ui-dialog").height())
				},

				close: function()
				{
					$(this).dialog("destroy")
				}
			})
		}
		// toggle a checkbox and update the model
		else if (type == "toggle")
		{
			let checked = $el.find(".icon").toggleClass("icon-check icon-check-empty").hasClass("icon-check")
			this.model.set("toggles."+id,checked)
		}
	}

	simulateMenuItemClick(id)
	{
		$("[data-id=" + id + "]").click()
	}
}

let model = new Model()
let view = new View(model)

export default { model, view }