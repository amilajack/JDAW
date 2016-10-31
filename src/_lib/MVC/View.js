import Utils from "DAW/_lib/Utils"
import Event from "DAW/_lib/Event"

import vHTML from "DAW/_lib/external/cjs/vdom-virtualize"
import vDOM  from "DAW/_lib/external/cjs/virtual-dom"

class View
{
	$el       = null
	model     = null
	container = null
	template  = null
	events    = {}

	constructor(model)
	{
		this.model = model
	}

	init()
	{
		this.$el = this.element ? $(this.element) : this.template ? $(Utils.template(this.template, this.model)) : $()
		this.toggleEvents(true)
	}

	toggleEvents(enabled)
	{
		for (let k in this.events)
		{
			let event = this.events[k]
			let $el = this.$el

			if (event[0] == "@")
			{
				event = event.substr(1)

				let split = event.split(" ")
				let selector = split.shift()

				if (selector == "window") selector = window
				if (selector == "document") selector = document

				$el = $(selector)
				event = split.join(" ")
			}

			let split = event.split(" ")
			let events = split.shift().replace(/\|/g," ")
			let selector = split.join(" ")

			if (enabled)
			{
				this.events[k] = new Event()
				let trigger = this.events[k].getTrigger()

				if (this[k]) this.events[k].listen(this[k].bind(this))
				selector ? $el.on(events, selector, trigger) : $el.on(events, trigger)
			}
			else
			{
				$el.off(events, selector)
			}
		}
	}

	afterRender(){}
	beforeRender(){}

	render()
	{
		if (!this.template) return

		this.beforeRender()

		this.diff($(Utils.template(this.template, this.model))[0])

		this.afterRender()
	}

	diff(tree)
	{
		vDOM.patch(this.$el[0], vDOM.diff(
			vHTML(this.$el[0]),
			vHTML(tree)
		))
	}

	listen(event, fn)
	{
		this.events[event].listen(fn)
	}

	ignore(event, fn)
	{
		this.events[event].ignore(fn)
	}

	destroy()
	{
		this.$el.remove();
	}
}

export default View