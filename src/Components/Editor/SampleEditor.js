import MVC    from "DAW/_lib/MVC"
import Tracks from "DAW/Components/Tracks"
import Utils  from "DAW/_lib/Utils"
import tpl    from "DAW/_assets/tpl/components/editor/sampleEditor.tpl"

class Model extends MVC.Model
{
	track = null
	atx = new AudioContext()
	ctx = document.createElement("canvas").getContext("2d")
	resolution = 2048

	constructor()
	{
		super()
	}
}

class View extends MVC.View
{
	template = tpl

	events = {
		selectSampleBrowse: "change input[name=sample]",
		selectSampleDrop: "drop .dropspace",
		preventDefaultDrop: "dragover .dropspace"
	}

	constructor(model)
	{
		super(model)
		this.init()
	}

	generateWave()
	{
		let track  = this.model.track
		let ctx    = this.model.ctx
		let buffer = track.sample.buffer

		let w = ctx.canvas.width = this.$el.width()
		let h = ctx.canvas.height = this.$el.height()

		let data = buffer.getChannelData(0)
		let res  = Math.min(this.model.resolution,w)

		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 1
		ctx.translate(0,h/2)
		ctx.beginPath()

		for(let i = 0; i < res; i++)
		{
			let t = i/res
			let x = t * w
			let y = data[t*data.length|0] * h/2

			ctx.lineTo(x,y)
		}

		ctx.stroke()

		track.sample.wave = ctx.canvas.toDataURL()
	}

	processSample(file)
	{
		if (!Utils.canPlayType(file.type))
		{
			Utils.alert("No decoder available for type: " + file.type)
			return
		}

		this.$el.find(".button-browse label").html("processing...")
		this.$el.find(".button-browse input").attr("disabled")

		let _this  = this
		let track  = this.model.track
		let reader = new FileReader()

		reader.onload = function(e)
		{
			_this.model.atx.decodeAudioData(e.target.result).then(function(buffer)
			{
				track.sample = {
					identifier: Utils.guid(),
					file: file,
					buffer: buffer
				}

				Utils.alert("That's all you can do here at this point")

				_this.generateWave()
				_this.render()

			}).catch(e => Utils.alert("An error occured: " + e))
		}

		reader.readAsArrayBuffer(file)
	}

	selectSampleBrowse(e)
	{
		this.processSample(e.currentTarget.files[0])
	}

	selectSampleDrop(e)
	{
		e.preventDefault()
		this.processSample(e.originalEvent.dataTransfer.files[0])
	}

	preventDefaultDrop(e)
	{
		e.preventDefault()
	}
}

let model = new Model()
let view = new View(model)
let icon = "soundwave"

export default { model, view, icon }