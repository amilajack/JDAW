import Event from "DAW/_lib/Event"
import Utils from "DAW/_lib/Utils"
import zip   from "DAW/_lib/external/cjs/zipjs"

class Plugins {

	onInit = new Event({ once: true })
	onConfigUpdate = new Event()

	collection = {}
	effects = {}

	gather(cb)
	{
		let _this = this

		let callback = function(data)
		{
			let files  = data.split("\n")
			let count  = files.length
			let result = (file, pass) => --count ? cb(file, pass) : cb(file, pass, true) + _this.onInit.trigger()

			files.forEach(function(v)
			{
				_this.load("plugins/" + v, () => result(v,true), (e) => result(v,[false,e]))
			})
		}

		window.nw ? callback(window.nw.require("fs").readFileSync("plugins/index", "utf-8")) : $.get({ url: "plugins/index", beforeSend: x => x.overrideMimeType("text/plain") }).done(callback)
	}

	load(file, onSuccess, onError)
	{
		let _this = this

		let isURL = typeof file == "string"
		let name = (isURL ? file : file.name).match(/([^/]+)\.jap/)[1]

		zip.createReader(window.nw
		? new zip.Data64URIReader("data:application/zip;base64,"+window.nw.require("fs").readFileSync(file,"base64"))
		: new (isURL ? (Utils.tests.cache.XMLHttRequestRange ? zip.HttpRangeReader : zip.HttpReader) : zip.BlobReder)(file),
		
		function(reader)
		{
			reader.getEntries(function(entries)
			{
				if (!entries.length) { onError("empty archive"); return }

				let files = ["meta.json", "config.json", "script.js", "index.html"]
				let count = files.length
				let errors = []

				function checkProgress()
				{
					if (!--count || errors.length)
					{
						reader.close()
						
						if (errors.length)
						{
							onError("error parsing: " + errors.join())
						}
						else
						{
							if ("config" in _this.collection[name]) _this.loadConfig(_this.collection[name])
							onSuccess()
						}
					}
				}

				files.forEach(function(f)
				{
					if (errors.length) return false

					let entry = entries.filter(v=>v.filename == f)[0]

					if (!entry)
					{
						(f == "meta.json" || f == "script.js") && errors.push(f)

						delete _this.collection[name]
						checkProgress()

						return true
					}

					let split = f.split(".")
					let fname = split[0]
					let fext  = split[1]

					entry.getData(new zip.TextWriter(), function(text)
					{
						let error = false

						try
						{
							if (!_this.collection[name]) _this.collection[name] = { identifier: Utils.guid() }
							_this.collection[name][fname] = fext == "json" ? JSON.parse(text) : text
						}
						catch(e)
						{
							errors.push(f)
							error = true
						}

						checkProgress()
					})
				})
			})

		}, () => onError("unable to read plugin"));
	}

	loadConfig(p)
	{
		if ("index" in p)
		{
			p.configValues = Object.assign({}, p.config)
		}
		else
		{
			p.configValues = {}

			for (let k in p.config)
			{
				let c = p.config[k]
				let $tr = $("<tr>")

				p.configValues[k] = c.type == "select" ? c.options[c.default || 0] : c.value || 0
			}
		}

		let _this = this
		p.configValues = new Proxy(p.configValues, { set: (t,k,v) => { _this.onConfigUpdate.trigger(p,k,v); t[k] = v } })
	}

	openConfig(p)
	{
		if (!p.config) return Utils.alert("This plugin is not configurable")

		let $html

		if ("index" in p)
		{
			$html = $(`<iframe frameborder="0" src="data:text/html;base64,${btoa(p.index)}">`)

			window.onmessage = function(e)
			{
				console.log(e)
			}
		}
		else
		{
			$html = $("<table>")

			for (let k in p.config)
			{
				let c = p.config[k]
				let cv = p.configValues[k]
				let $tr = $("<tr>")
				
				switch(c.type)
				{
					case "knob-vol": $tr.append(`<td>${k}</td><td><div class="gui-knob" data-config="${k}" data-type="vol" ${"min" in c?"data-min='"+c.min+"'":""} ${"max" in c?"data-max='"+c.max+"'":""} ${"steps" in c?"data-steps='"+c.steps+"'":""} data-value="${cv}"></div></td>`); break
					case "knob-pan": $tr.append(`<td>${k}</td><td><div class="gui-knob" data-config="${k}" data-type="pan" ${"min" in c?"data-min='"+c.min+"'":""} ${"max" in c?"data-max='"+c.max+"'":""} ${"steps" in c?"data-steps='"+c.steps+"'":""} data-value="${cv}"></div></td>`); break
					case "slider":   $tr.append(`<td>${k}</td><td><div class="gui-slider" data-config="${k}" ${"orientation" in c ? "data-orientation='"+c.orientation+"'":""} ${"min" in c?"data-min='"+c.min+"'":""} ${"max" in c?"data-max='"+c.max+"'":""} ${"step" in c?"data-step='"+c.step+"'":""} data-value="${cv}"></div></td>`); break
					case "select":   $tr.append(`<td>${k}</td><td><div class="select-wrapper"><select data-config="${k}">${c.options.map(o=>`<option${o==cv?" selected":""}>${o}</option>`).join("")}</select></div></td>`); break
				}

				$html.append($tr)
			}

			$html.find(".gui-knob").knob().on("release", (e,v) => p.configValues[$(e.currentTarget).attr("data-config")] = v)
			$html.find("select").on("change", (e) => p.configValues[$(e.currentTarget).attr("data-config")] = $(e.currentTarget).val())

			let $slider = $html.find(".gui-slider")
			$slider.slider($slider.data()).on("slidestop", (e,ui) => p.configValues[$(e.currentTarget).attr("data-config")] = ui.value)
		}

		$("#dialog").html($html).dialog({
			title: p.meta.title + ("index" in p ? "" : " (no UI)"),
			dialogClass: "plugin-config",
			width: "auto",
			resizable: false,
			modal: true
		})
	}
}

export default new Plugins()