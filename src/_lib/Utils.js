let seed = 1

let Utils = {
	range: (a,b) => Array(b-a+1).fill(0).map(v=>a++),
	camelCase: s => s.replace(/\s(.)/g,v=>v.toUpperCase()).replace(/\W/g,'').replace(/^(.)/,v=>v.toLowerCase()),
	localStorage: (k,v) => !v ? JSON.parse(localStorage.getItem(k)) : localStorage.setItem(k,JSON.stringify(v)),
	srand: () => { let x = Math.sin(seed++) * 10000; return x - Math.floor(x) },
	guid: () => "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX".replace(/X/g,c=>(Utils.srand()*16|0).toString(16)),
	canPlayType: t => !!new Audio().canPlayType(t),

	enum: function()
	{
		let o = {};
		[].forEach.call(arguments, (v,i) => o[v] = i); o._keys = Object.keys(o);
		return Object.freeze(o)
	},

	template: function(s,o)
	{
		let html = ""

		try { html = eval("let _='';with(o){"+s.split(/({{[^]+?}})/g).map(s=>(s.match(/{{([^]+?)}}/)||[,';_+=`'+s+'`;'])[1]).join("")+"}_") }
		catch(e) { console.log(e,s) }

		return html
	},

	// [scope ,] fn, onMessage
	executeInWorker: function(arg1, arg2, arg3)
	{
		let arg1Obj = typeof arg1 == "object"
		let scope   = arg1Obj ? arg1 : {}
		let func    = arg1Obj ? arg2 : arg1
		let onMsg   = arg1Obj ? arg3 : arg2

		let fn = `(function(){onmessage=function(e){onmessage=null;for(let k in e.data)self[k]=e.data[k];(${func})}}())`
		let worker = new Worker(URL.createObjectURL(new Blob([fn], { type: "application/javascript" })))

		worker.postMessage(scope)
		onMsg && (worker.onmessage = onMsg)
	},

	findObject: function(o,p,v)
	{
		for (k in o)
		{
			if (typeof o[k] == "object")
			{
				let r = Utils.findObject(o[k],p,v)
				if (r) return r
			}
			else if (k == p && o[k] == v) return o
		}
	},

	alert: function(text)
	{
		$("#dialog").empty().append(text).dialog({

			dialogClass: "no-title",
			modal: true,
			resizable: false,

			buttons: [
				{ text: "dismiss", click: () => $("#dialog").dialog("destroy") }
			]
		})
	},

	confirm: function(text, ok, cancel)
	{
		$("#dialog").empty().append(text).dialog({

			dialogClass: "no-title",
			modal: true,
			resizable: false,

			buttons: [
				{ text: "ok", click: () => $("#dialog").dialog("destroy") + ok && ok() },
				{ text: "cancel", click: () => $("#dialog").dialog("destroy") + cancel && cancel() }
			]
		})
	},

	prompt: function(opts)
	{
		let valid = true
		let lastValid = true

		let $text = $(opts.text ? `<div style="margin-bottom:1em">${opts.text}</div>`: "")
		let $input = $(`<input type="text" class="prompt" value="${opts.placeholder||""}">`)

		let ok = () => valid && ($("#dialog").dialog("destroy") + opts.ok && opts.ok($("#dialog").find(".prompt").val()))
		let cancel = () => $("#dialog").dialog("destroy") + (opts.cancel && opts.cancel())

		$input.on("keyup", function(e)
		{
			if (e.keyCode == 13) return ok()
			if (opts.pattern) valid = opts.pattern.test($input.val())
			if (!valid && lastValid) $(".ui-dialog").effect("shake")

			$input.toggleClass("invalid",!valid)
			lastValid = valid
		})

		$("#dialog").empty().append($text,$input).dialog({

			title: opts.title || "Prompt",
			modal: true,
			resizable: false,
			dialogClass: "no-close",

			buttons: [
				{ text: "Cancel", click: cancel },
				{ text: "Ok", click: ok }
			]
		})
	},

	tests: {

		NodeWebkit: () => !!window.nw ? 1 : 2,

		FileReader: function()
		{
			window.FileReader = window.FileReader || window.webkitFileReader || window.mozFileReader
			return !!window.FileReader
		},

		MIDIAccess: function()
		{
			window.MIDIAccess = window.MIDIAccess || window.webkitMIDIAccess || window.mozMIDIAccess
			return window.MIDIAccess ? 1 : 2
		},

		AudioContext: function()
		{
			window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext
			return !!window.AudioContext
		},

		DirectoryBrowser: function()
		{
			return document.createElement("input").webkitdirectory !== undefined ? 1 : 2
		},

		ScriptProcessorNode: function()
		{
			try {
				let atx = new window.AudioContext()
				let scp = atx.createScriptProcessor(1024,1,1)
				return 1
			}
			catch(e)
			{
				return 0
			}
		},

		XMLHttpRequest: function(cb)
		{
			if (window.nw) return cb(true)

			let r = new XMLHttpRequest()

			r.onload = () => cb(true)
			r.onerror = () => cb(false)

			r.open("HEAD", ".")
			try { r.send() } catch(e) { cb(false) }
		},

		XMLHttpRequestRange: function(cb)
		{
			let r = new XMLHttpRequest()

			r.onload = () => cb(r.getResponseHeader("Accept-Ranges") == "bytes" ? 1 : 2)
			r.onerror = () => cb(2)

			r.open("HEAD", ".")
			try { r.send() } catch(e) { cb(2) }
		},

		cache: {},

		all: function(cb)
		{
			Utils.tests.cache = {}

			let tests = Object.keys(Utils.tests).filter(v=>v!="all"&&v!="cache").sort()
			let count = tests.length
			let pass = true

			let result = function(test, value)
			{
				Utils.tests.cache[test] = value
				pass && !value && (pass = false)

				--count ? cb(test, value) : cb(test, value, pass)
			}

			tests.forEach(function(v)
			{
				let test = Utils.tests[v]

				test.length ? test((r)=>result(v,r)) : result(v,test())
			})
		}
	}
}

export default Utils