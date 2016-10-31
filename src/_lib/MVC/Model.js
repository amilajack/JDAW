import Event from "DAW/_lib/Event"

class Model
{
	subscriptions = { global: new Event(), prop: [] }

	constructor()
	{
		let _this = this

		return new Proxy(this, {
			get: function(t,p,r)
			{
				return t[p]
			},

			set: function(t,p,v,r)
			{
				_this.subscriptions.global.trigger(v, t[p])
				_this.subscriptions.prop[p] && _this.subscriptions.prop[p].trigger(v, t[p])

				t[p] = v
			}
		})
	}

	listen(arg, fn)
	{
		if (typeof arg == "function")
		{
			this.subscriptions.global.listen(arg)
			return
		}

		let e = this.subscriptions.prop[arg]

		if (!e)
		{
			e = this.subscriptions.prop[arg] = new Event()
		}

		e.listen(fn)
	}

	ignore(arg, fn)
	{
		if (typeof arg == "Function")
		{
			this.subscriptions.global.ignore(arg)
			return
		}

		this.subscriptions.prop[arg].ignore(fn)
	}
}

export default Model