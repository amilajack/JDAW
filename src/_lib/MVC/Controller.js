class Controller
{
	actions = {}

	constructor(view)
	{
		this.view = view
		this.model = view.model
	}

	enable()
	{
		for (let k in this.actions)
		{
			this.view.listen(k,this.actions[k].bind(this))
		}
	}

	disable()
	{
		for (let k in this.actions)
		{
			this.view.ignore(k,this.actions[k].bind(this))
		}
	}
}

export default Controller