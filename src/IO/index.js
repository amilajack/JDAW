import Plugins from "DAW/Plugins"
import Project from "DAW/Project"
import Utils   from "DAW/_lib/Utils"
import Tracks  from "DAW/Components/Tracks"
import Mixer   from "DAW/Components/Mixer"

class IO
{
	atx    = null
	spn    = null
	worker = null
	buffer = [[],[]]

	constructor()
	{
		Project.onUpdate.listen(this.init.bind(this))
	}

	init()
	{
		let p = Project;

		this.atx = new AudioContext()
		this.spn = this.atx.createScriptProcessor(p.bufferSize, p.channels, p.channels)
		
		this.spn.onaudioprocess = this["out"+p.channels].bind(this)
		this.spn.connect(this.atx.destination)

		this.worker = new Worker(URL.createObjectURL(new Blob(["("+this.workerScript+"())"], { type: "application/javascript" })))
		this.worker.onmessage = this.workerMessage.bind(this)

		p.sampleRate = this.atx.sampleRate
		p.bufferSize = this.spn.bufferSize

		this.worker.postMessage({ type: "project", data: {
			s: Project.sampleRate,
			b: Project.bufferSize,
			v: Project.voices,
		}})

		Object.keys(Plugins.collection).forEach(k => this.registerPlugin(Plugins.collection[k]))
		Plugins.onConfigUpdate.listen(this.updatePlugin.bind(this))
	}

	addVoice(d)
	{
		this.worker.postMessage({ type: "voice:on", data: d })
	}

	delVoice(d)
	{
		this.worker.postMessage({ type: "voice:off", data: d })
	}

	registerPlugin(p)
	{
		this.worker.postMessage({ type: "plugin", data: {
			identifier: p.identifier,
			type:       p.meta.type,
			channels:   p.meta.channels,
			config:     Object.assign({},p.configValues),
			script:     p.script
		}})
	}

	updatePlugin(p,k,v)
	{
		this.worker.postMessage({ type: "pluginConfig", data: { identifier: p.identifier, key: k, value: v } })
	}

	workerScript()
	{
		let project = {}
		let plugins = {}
		let voices  = []
		
		// prevent XSS
		delete self.XMLHttpRequest
		// unwrap Math
		Object.getOwnPropertyNames(Math).forEach(k => self[k] = Math[k])

		// helper functions / variables
		self.squ = f => sign(sin(f))
		self.saw = f => (f/PI/2%1-.5*sign(f))*2
		self.tri = f => abs(abs(f/PI*2-1)%4-2)-1

		self.squHQ = f => { let a = 0; for(let i = 1; i < 10; i++) a += sin(f*(2*i-1))/(2*i-1);                  return a * 4/PI      }
		self.sawHQ = f => { let a = 0; for(let i = 1; i < 10; i++) a += sin(f*i)/i;                              return a * 2/PI      }
		self.triHQ = f => { let a = 0; for(let i = 0; i < 10; i++) a += sin(f*(2*i+1))*(1-2*(i%2))/pow(2*i+1,2); return a * 8/(PI*PI) }

		self.clamp = (v,a,b) => min(max(v,a),b)
		self.mix   = (a,b,f) => a + (b-a) * f
		self.TAU   = PI*2

		// register message handler
		onmessage = function(e)
		{
			let msg = e.data

			switch(msg.type)
			{
				case "project":      return (project = msg.data)
				case "voice:on":     return addVoice(msg.data)
				case "voice:off":    return delVoice(msg.data)
				case "plugin":       return registerPlugin(msg.data)
				case "pluginConfig": return updatePlugin(msg.data)
				case "request":      return buffer()
			}
		}

		function addVoice(v)
		{
			v.t = 0
			v.persistant ? (voices[0] = v) : voices.push(v) > project.v+1 && voices.splice(1,1)
		}

		function delVoice(identifier)
		{
			let index

			voices.forEach(function(v,i)
			{
				if (v.identifier == identifier)
				{
					index = i;
					return false;
				}
			})

			index !== undefined && voices.splice(index,1)
		}

		function registerPlugin(p)
		{
			plugins[p.identifier] = p
			p.script = eval(`(${p.script})`)(project)
		}

		function updatePlugin(d)
		{
			plugins[d.identifier].config[d.key] = d.value
		}

		function buffer()
		{
			let ps = project.s
			let pb = project.b
			let lv = voices.length
			let b = [new Float64Array(pb), new Float64Array(pb)]

			for (let i = 0; i < lv; i++)
			{
				let v = voices[i]

				if (v.isPlugin)
				{
					let p = plugins[v.source]
					let n = v.data.note

					let d = {
						d: n.duration/v.data.bpm*60,
						n: n.index,
						v: n.velocity,
						f: pow(2,(n.index-69)/12) * 440,
						c: p.config
					}

					for (let j = 0; j < pb; j++)
					{
						d.t = v.t++/ps

						let a = p.script(d)

						b[0][j] += [a,a[0]][p.channels-1] * d.v
						b[1][j] += [a,a[1]][p.channels-1] * d.v
					}
				}
				else
				{
					let s = samples[v.source]
				}
			}

			postMessage(b)
		}
	}

	workerMessage(e)
	{
		this.buffer = e.data
	}

	out1(e)
	{
		this.worker.postMessage({ type: "request" })

		e.outputBuffer.getChannelData(0).set(this.buffer[0])
	}

	out2(e)
	{
		this.worker.postMessage({ type: "request" })

		e.outputBuffer.getChannelData(0).set(this.buffer[0])
		e.outputBuffer.getChannelData(1).set(this.buffer[1])
	}
}

export default new IO()