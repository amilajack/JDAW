import Event   from "DAW/_lib/Event"
import Utils   from "DAW/_lib/Utils"
import Plugins from "DAW/Plugins"

class Project
{
	onUpdate = new Event()

	constructor()
	{
		this.cached = Utils.localStorage("project")
		Object.assign(this, this.cached || {})
		Plugins.onInit.listen(() => this.init())
	}

	init()
	{
		this.cached && this.onUpdate.trigger()
		$("#dialog").on("click","form[name=file_newProject] [name=create]", () => this.create())
	}

	create()
	{
		let props = {
			projectName: $("#dialog [name=projectName]").val(),
			layout:      $("#dialog [name=layout]"     ).val(),
			voices:     +$("#dialog [name=voices]"     ).val(),
			sampleRate: +$("#dialog [name=sampleRate]" ).val(),
			bufferSize: +$("#dialog [name=bufferSize]" ).val() || 0,
			channels:   +$("#dialog [name=channels]"   ).val()
		}

		Object.assign(this, props)
		Utils.localStorage("project", props)

		$("#dialog").dialog("destroy")
		this.onUpdate.trigger()
	}
}

export default new Project()