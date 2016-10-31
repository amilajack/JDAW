export default class Event
{
	subscribers = []
	dispatched = false
	once = false
	triggered = false

	constructor(opts)
	{
		opts = opts || {}
		this.once = opts.once
	}

	trigger()
	{
		let args = arguments
		this.subscribers.forEach(v=>v.apply(this,args))
		this.triggered = true
	}

	getTrigger()
	{
		if (this.dispatched == false)
		{
			this.dispatched = true

			let trigger = this.trigger.bind(this)
			delete this.trigger

			return trigger
		}
	}

	listen(fn)
	{
		this.once && this.triggered && fn()
		this.subscribers.push(fn)
	}

	ignore(fn)
	{
		this.subscribers.forEach(function(v,i)
		{
			if (v === fn)
			{
				this.subscribers.splice(i,1)
				return false
			}
		}, this)
	}
}