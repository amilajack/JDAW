import Utils from "DAW/_lib/Utils"
import Event from "DAW/_lib/Event"

let events = {}
let input = {}

function triggerEvents(e)
{
	let keys = Object.keys(input)
	let keyEvent = ~["keydown","keyup"].indexOf(e.type)
	let inp = keyEvent ? input[e.keyCode] : undefined

	if (inp && inp.lastState == inp.state) return

	for (let k in events)
	{
		let shortcut = events[k].input
		if (!keyEvent && !/LMB|RMB|MMB/.test(shortcut.join("+"))) continue
		if (inp && keyEvent && !shortcut.some(v=>v==inp.key)) continue

		let pressed = keys.filter(v=>input[v].state).map(v=>input[v].key)
		let allDown = shortcut.every(v=>~pressed.indexOf(v))
		let allUp   = shortcut.every(v=>!~pressed.indexOf(v))

		;(allDown || allUp) && events[k].trigger(e, allDown ? true : false)
	}

	if (inp) inp.lastState = inp.state
}

// numbers
Utils.range(48,57).map(v=>input[v]={key:(v-48)})

// alphabet
Utils.range(65,90).map(v=>input[v]={key:String.fromCharCode(v)})

// Function keys
Utils.range(112,123).map(v=>input[v]={key:"F"+(v-111)})

// special inputs
"AL|AU|AR|AD".split("|").forEach((v,i)=>input[v]=input[37+i]={key:v})
"SHIFT|CTRL|ALT".split("|").forEach((v,i)=>input[v]=input[16+i]={key:v})
"LMB|MMB|RMB".split("|").forEach(v=>input[v]={key:v})

input["SPACE"] = input[32]={key:"SPACE"}

// register keyboard events
window.addEventListener("keydown", e => { input[e.keyCode] && (input[e.keyCode].state = true ), triggerEvents(e) })
window.addEventListener("keyup",   e => { input[e.keyCode] && (input[e.keyCode].state = false), triggerEvents(e) })

// register mouse events
window.addEventListener("mousedown", e => { input[["LMB","MMB","RMB"][e.button]].state = true,  triggerEvents(e) })
window.addEventListener("mouseup",   e => { input[["LMB","MMB","RMB"][e.button]].state = false, triggerEvents(e) })

export default {

	state: new Proxy(input,{get:(t,v)=>(t[v]||t[v.charCodeAt(0)]||{}).state}),

	on: function(shortcut, fn)
	{
		shortcut = shortcut.replace(/\s*/g,"").toUpperCase()

		if (!events[shortcut])
		{
			events[shortcut] = new Event()
			events[shortcut].input = shortcut.split("+")
		}

		events[shortcut].listen(fn)
	},

	off: function(shortcut, fn)
	{
		shortcut = shortcut.replace(/\s*/g,"").toUpperCase()

		if (events[shortcut])
		events[shortcut].ignore(fn)
	}
}