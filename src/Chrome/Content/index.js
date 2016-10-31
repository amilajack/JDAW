import MVC        from "DAW/_lib/MVC"
import Project    from "DAW/Project"
import Components from "DAW/Components"
import layouts    from "./layouts"

class Model extends MVC.Model
{
	layout = layouts.default

	constructor()
	{
		super()
		Project.onUpdate.listen(() => this.layout = layouts[Project.layout])
	}
}

class View extends MVC.View
{
	element = "#content"
	handleWidth = 16

	events = {
		switchComponent: "click .component-tabs .tab",
		dragHandle: "drag .handle",
		dropHandle: "dragstop .handle"
	}

	constructor(model)
	{
		super(model)
		this.init()

		this.registerObservers()
		Project.onUpdate.listen(() => this.render())
	}

	registerObservers()
	{
		$("#content").observe(".gui-knob", { childList: true, subtree: true }, function(e)
		{
			let $el = $(this)

			$el.knob("instance") && $el.knob("destroy")
			$el.knob()
		})

		$("#content").observe(".gui-slider", { childList: true, subtree: true }, function(e)
		{
			let $el = $(this)

			$el.slider("instance") && $el.slider("destroy")

			let steps = $el.attr("data-steps") || 100
			let value = $el.attr("data-value") || 0
			let orientation = $el.attr("data-orientation") || "horizontal"

			$el.slider({
				orientation: orientation,
				step: 100/steps,
				value: value*100
			})
		})

		$("#content").observe("[data-simplescroll]", { childList: true, subtree: true }, function(e)
		{
			$(this).simplescroll()
		})
	}

	switchComponent(e)
	{
		let $t = $(e.currentTarget)
		let $c = $t.closest(".container")

		let c = $c.data("model")
		let v = Components[Components.types._keys[c.components[c.activeComponent || 0]]].view

		v.onDetach && v.onDetach()
		v.$el.detach()

		v = Components[Components.types._keys[c.components[c.activeComponent = $t.index()]]].view

		v.render()
		v.$el.appendTo($c.find(".component-wrapper"))

		$c.find(".component-tabs .tab").removeClass("active").eq(c.activeComponent).addClass("active")
	}

	dragHandle(e, ui)
	{
		let $el = $(e.target)
		let p = $el.data("properties")

		ui.position[p.edge] = Math.max(ui.position[p.edge], this.handleWidth/2)

		let c = p.container
		let s = 100 * (ui.position[p.edge])/c.$el[p.dimension]()

		c.containers[0].$el.css(p.dimension, `calc(${s}% - ${this.handleWidth/2}px)`)
		c.containers[1].$el.css(p.dimension, `calc(${100-s}% - ${this.handleWidth/2}px)`)
	}

	dropHandle(e, ui)
	{
		let $el = $(e.target)
		let p = $el.data("properties")
		let c = p.container

		c.size = 100 * (ui.position[p.edge])/c.$el[p.dimension]()

		$el.css(p.edge, c.size + "%")

		$("[data-simplescroll]").simplescroll()
	}

	insertContainers(c, _c, i)
	{
		// split = 0 => horizontally
		// split = 1 => vertically

		let dimension = ["height","width"][_c.split]
		let size      = [_c.size,100-_c.size][i]
		let edge      = [["bottom","top"][i],["right","left"][i]][_c.split]
		let hwidth    = this.handleWidth/2

		// insert container
		c.$el = $(_c.isRoot
		? `<div class="container">`
		: `<div class="container" style="${dimension}:calc(${size}% - ${hwidth}px);margin-${edge}:${hwidth}px">`
		).data("model", c).appendTo(_c.$el)

		// insert handle
		if (c.containers)
		{
			let length    = ["width","height"][c.split]
			let dimension = ["height","width"][c.split]
			let edgeLong  = ["top","left"][c.split]
			let edgeShort = ["left","top"][c.split]

			$(`<span class="handle handle-${["h","v"][c.split]}">`).css({

				[length]    : "100%",
				[edgeLong]  : c.size + "%",
				[edgeShort] : 0,
				padding: hwidth

			}).draggable({

				containment: "parent",
				axis: ["y","x"][c.split]

			}).data("properties", {

				container: c,
				edge: edgeLong,
				dimension: dimension

			}).appendTo(c.$el)

			c.containers.forEach((v,i)=>this.insertContainers(v,c,i))
		}

		// insert component
		else if (c.components)
		{
			let active = c.activeComponent || 0
			let comp = Components[Components.types._keys[c.components[active]]]

			comp.view.$el.detach()
			comp.view.onDetach && comp.view.onDetach()

			comp.view.render()
			comp.view.$el.appendTo(c.$el)

			if (c.components.length > 1)
			{
				c.$el.wrapInner("<div class='component-wrapper'>")
				let $tabs = $("<div class='component-tabs'>").prependTo(c.$el)

				c.components.forEach(function(c,i)
				{
					c = Components[Components.types._keys[c]]
					$tabs.append(`<div class="tab${i == active ? " active" : ""}"><span class="icon-${c.icon}"></span></div>`)
				})
			}
			else
			{
				c.$el.attr("data-simplescroll", "")
			}
		}
	}

	render()
	{
		let $html  = $("<div>")

		this.insertContainers(this.model.layout, { $el: $html, size: 100, isRoot: true })
		$html.children().appendTo(this.$el.empty())
	}
}

let model = new Model()
let view = new View(model)

export default { model, view }