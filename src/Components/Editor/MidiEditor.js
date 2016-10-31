import MVC     from "DAW/_lib/MVC"
import Utils   from "DAW/_lib/Utils"
import Plugins from "DAW/Plugins"
import Input   from "DAW/_lib/Input"
import IO      from "DAW/IO"
import tpl     from "DAW/_assets/tpl/components/editor/midiEditor.tpl"

class Model extends MVC.Model
{
	track = null

	timeline = {
		pixelsPerBar: 200,
		pixelsPerKey: 25
	}

	note = {
		color: 0,
		slide: false,
		snap: true
	}
}

class View extends MVC.View
{
	template  = tpl

	$wrapper  = null
	$staff    = null
	$timeline = null

	events = {
		setCursor: "click .timeline",

		toggleSlide: "click .slide",
		toggleSnap: "click .snap",
		handleModifiers: "keydown|keyup",

		changeBPM: "click .bpm",
		changeSIG: "click .sig",
		editPlugin: "click .plg",

		keyOn: "mousedown .keys .key",
		keyOff: "@document mouseup",

		addNote: "mousedown .staff .key",
		removeNote: "contextmenu .note",
		hoverNote: "mouseover .note",
		resizeNote: "resize .note",

		grabNote: "dragstart .note",
		dragNote: "drag .note",
		dropNote: "dragstop .note",

		scroll: "scroll .wrapper",
		scrollInit: "ss-init .wrapper"
	}

	constructor(model)
	{
		super(model)
		this.init()

		this.initShortcuts()
	}

	keyOn(e)
	{
		this.keyVoiceIdentifier = Utils.guid()

		IO.addVoice({
			identifier: this.keyVoiceIdentifier,
			source: this.model.track.plugin.identifier,

			data: {
				note: {
					index: +$(e.currentTarget).attr("data-index"),
					duration: Infinity,
					velocity: 1
				},
				bpm: this.model.track.bpm
			},

			isPlugin: true,
			persistant: true
		})
	}

	keyOff(e)
	{
		if (!this.keyVoiceIdentifier) return
		
		IO.delVoice(this.keyVoiceIdentifier)
		delete this.keyVoiceIdentifier
	}

	/* ================ */
	/* === TIMELINE === */
	/* ================ */

	setCursor(e)
	{
		let ppb = this.model.timeline.pixelsPerBar/this.model.track.sig[0]
		let offset = this.$wrapper[0].scrollLeft + e.pageX - this.$el.find(".timeline").offset().left

		this.$cursor.css("left", offset)
		this.model.track.playback.cursor = offset/ppb

		this.playOffset = offset/ppb
		this.playStart = +new Date
		this.model.track.notes.forEach(n => n && (n.playing = false))
	}

	updateTimeline(sig)
	{
		if (sig)
		{
			this.model.track.sig = sig.split("/").map(parseFloat)
			this.$el.find(".sig").html(`<span>${sig}<br>SIG</span>`)
		}

		sig = this.model.track.sig

		let t = this.model.timeline
		let $style = $("#time-signature-grid")

		!$style.length && ($style = $("<style id='time-signature-grid'>").appendTo(document.head))

		$style.html(`
			.piano-roll .staff .key::before {
				content:" ";position:absolute;top:0;left:0;width:100%;height:100%;background-image:
				linear-gradient(90deg,transparent,transparent calc(100% - 1px),#000 calc(100% - 1px),#000 100%),
				linear-gradient(90deg,transparent,transparent calc(100% - 4px),#000 calc(100% - 4px),#000 100%);
				background-size:${t.pixelsPerBar/sig[0]}px 100%,${t.pixelsPerBar}px 100%;
			}

			.piano-roll .staff .key { height: ${t.pixelsPerKey}px; }
			.piano-roll .staff .key .note { font-size: ${t.pixelsPerKey/2}px; }
			.piano-roll .keys .key { height: ${t.pixelsPerKey*3/2}px; }

			.piano-roll .keys .key:nth-of-type(12n-6),
			.piano-roll .keys .key:nth-of-type(12n-1),
			.piano-roll .keys .key:nth-of-type(12n+1) { height: ${t.pixelsPerKey*2}px; }

			.piano-roll .keys .key:first-child,
			.piano-roll .keys .key:last-child { height: ${t.pixelsPerKey*3/2}px !important; }

			.piano-roll .keys .key.black {
				height: ${t.pixelsPerKey}px;
				margin-top: -${t.pixelsPerKey/2}px;
			}
		`)

		let text = "", svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.pixelsPerBar}" height="30">
			<style>text{font-family:DroidSansMono,monospace;font-size:15px;dominant-baseline:hanging;fill:#999;}</style>
			{{text}}
		</svg>`

		// generate beat number image repating-background
		for(let i = 0; i < sig[0]; i++) text += `<text x="${i*t.pixelsPerBar/sig[0]}" y="10">${(i+sig[0]-1)%sig[0]+1}</text>`

		this.$timeline.css({
			backgroundImage: `url('data:image/svg+xml;base64,${btoa(svg.replace("{{text}}",text))}')`,
			backgroundPosition: "-7px 0",
			backgroundSize: `${t.pixelsPerBar}px 100%`
		})

		let ppb = this.model.timeline.pixelsPerBar/this.model.track.sig[0]

		// make existing notes draggable/resizable
		this.$staff.find(".note")
		.draggable({ axis: "x", containment: "parent" })
		.resizable({ handles: "e, w", alsoResize: ".note.ui-selected", minWidth: ppb/4 })
	}

	changeBPM()
	{
		Utils.prompt({
			title: "Beats Per Minute",
			placeholder: this.model.track.bpm,
			pattern: /^\d{2,3}$/,
			ok: (text) => {
				this.model.track.bpm = +text
				this.$el.find(".bpm").html(`<span>${text}<br>BPM</span>`)
			}
		})
	}

	changeSIG()
	{
		Utils.prompt({
			title: "Time Signature",
			placeholder: this.model.track.sig.join("/"),
			pattern: /^\d+\/\d+$/,
			ok: this.updateTimeline.bind(this)
		})
	}

	editPlugin()
	{
		Plugins.openConfig(this.model.track.plugin)
	}

	scroll(e, scroll)
	{
		this.$el.find(".keys").css("left", scroll.x)
		this.$el.find(".timeline,.cursor").css("top", scroll.y)

		this.model.track.view.scroll = scroll
	}

	scrollInit()
	{
		let scroll = this.model.track.view.scroll
		if (scroll.y == null) scroll.y = this.$el.find("[data-key=D5]").position().top

		this.$wrapper.find(".ss-content")[0].scrollLeft = scroll.x
		this.$wrapper.find(".ss-content")[0].scrollTop = scroll.y

		this.$wrapper.simplescroll()
	}

	/* ============ */
	/* === MODE === */
	/* ============ */

	toggleSlide(e)
	{
		let $el = $(e.currentTarget).toggleClass("active")
		this.model.note.slide = $el.hasClass("active")
	}

	toggleSnap(e)
	{
		let ppb  = this.model.timeline.pixelsPerBar/this.model.track.sig[0]
		let snap = $(e.currentTarget).toggleClass("active").hasClass("active")
		let grid = snap ? [ppb,0] : false

		this.$staff.find(".note").draggable("option", "grid", grid)
		this.model.note.snap = snap
	}

	toggleplay()
	{
		this.model.track.playback.paused = !this.model.track.playback.paused

		if (!this.model.track.playback.paused)
		{
			this.playOffset = this.model.track.playback.cursor
			this.playStart = +new Date
			this.playInterval = window.setInterval(this.play.bind(this), 1000/60)
		}
		else if (this.playInterval !== undefined)
		{
			window.clearInterval(this.playInterval)
			this.model.track.notes.forEach(n => n && (n.playing = false))
		}
	}

	play()
	{
		let ppb  = this.model.timeline.pixelsPerBar/this.model.track.sig[0]

		let d = (new Date - this.playStart) / 1000
		let o = (this.playOffset + d/60*this.model.track.bpm)

		let notes = this.model.track.notes.filter(n => n && !n.playing && o >= n.offset && o <= n.offset + n.duration)

		notes.forEach(function(n)
		{
			n.playing = true

			IO.addVoice({
				source: this.model.track.plugin.identifier,
				data: { note: n, bpm: this.model.track.bpm },
				isPlugin: true
			})
			
		}.bind(this))

		this.$cursor.css("left", o * ppb)
		this.model.track.playback.cursor = o
	}

	initShortcuts()
	{
		Input.on("shift", function(e, pressed)
		{
			if (document.activeElement != document.body || !this.$staff) return

			if (pressed)
			{
				this.$staff.selectable("instance") && this.$staff.selectable("destroy")
				this.$staff.selectable({ filter: ".note" })
			}
			else
			{
				this.$staff.selectable("instance") && this.$staff.selectable("option", "disabled", true)
			}
		}.bind(this))

		Input.on("space", function(e, pressed)
		{
			if (document.activeElement != document.body) return

			pressed && this.toggleplay()
		}.bind(this))
	}

	/* ============ */
	/* === NOTE === */
	/* ============ */

	hoverNote(e)
	{
		e.buttons == 2 && this.removeNote(e)
	}

	removeNote(e)
	{
		e.preventDefault()

		let $note = $(e.currentTarget)
		// remove element
		$note.fadeOut(()=>$note.remove())
		// remove note model
		this.model.track.notes[+$note.attr("data-index")] = undefined
	}

	addNote(e)
	{
		if (e.buttons != 1 || Input.state.SHIFT || $(e.target).closest(".note").length) { return }

		let $key   = $(e.currentTarget)
		let ppb    = this.model.timeline.pixelsPerBar/this.model.track.sig[0]
		let offset = e.pageX - this.$staff.offset().left

		// snap to grid?
		this.model.note.snap && (offset -= offset%ppb)

		// deselect all notes
		this.$staff.selectable("instance") && this.$staff.selectable("destroy")

		// add the element
		let $note = $(`<div class="${this.model.note.slide?"note slide":"note"}" style="left:${offset}px;width:${ppb}px"><span>${$key.attr("data-key")}</span></div>`)
		.draggable({ axis: "x", containment: "parent" })
		.resizable({ handles: "e, w", alsoResize: ".note.ui-selected", minWidth: ppb/4 }).appendTo($key)

		let note = {
			index: +$key.attr("data-index"),
			offset: offset/ppb,
			velocity: .75,
			duration: 1,
			slide: this.model.note.slide
		}

		$note.attr("data-index", this.model.track.notes.push(note)-1)

		IO.addVoice({
			source: this.model.track.plugin.identifier,
			data: { note: note, bpm: this.model.track.bpm },
			isPlugin: true
		})
	}

	grabNote(e, ui)
	{
		// store initial position in case multiple notes need to be dragged
		$(e.target).data("offset", ui.position)
	}

	dragNote(e, ui)
	{
		let _this  = this
		let $note  = $(e.target)
		let $notes = this.$staff.find(".ui-selected").add($note)
		let diff   = e.pageY - this.$staff.offset().top - $note.parent().position().top
		let ppb    = this.model.timeline.pixelsPerBar/this.model.track.sig[0]

		this.model.note.snap && (ui.position.left -= ui.position.left%(ppb/4))

		// deselect notes if an unselected note is being dragged
		!$note.hasClass("ui-selected") && this.$staff.selectable("instance") && this.$staff.selectable("destroy")

		// drag selected notes with current note
		$notes.not($note).css("transform",`translateX(${ui.position.left-$note.data("offset").left}px)`)

		// update model time offset
		$notes.each(function()
		{
			let $el = $(this)
			_this.model.track.notes[+$el.attr("data-index")].offset = $el.position().left/ppb
		})

		// move notes up/down?
		diff > $note[0].offsetHeight  && this.dragNoteY($notes, "next")
		diff < 0 /* much space wow */ && this.dragNoteY($notes, "prev")
	}

	dragNoteY($notes, dir)
	{
		let _this = this

		$notes.each(function(i)
		{
			let $note = $(this)
			let $parent = $note.parent()[dir]()

			if ($parent.hasClass("key"))
			{
				// move to new parent
				$note.detach().appendTo($parent).find("span").text($parent.attr("data-key"))
				// update model note index
				let note = _this.model.track.notes[$note.attr("data-index")]
				note.index = +$parent.attr("data-index")

				i == 0 && IO.addVoice({
					source: _this.model.track.plugin.identifier,
					data: { note: note, bpm: _this.model.track.bpm },
					isPlugin: true
				})
			}
		})
	}

	dropNote(e, ui)
	{
		// apply dragging transformations
		this.$staff.find(".ui-selected").each(function()
		{
			let $note = $(this)
			$note.css({ left: $note.position().left, transform: "none" })
		})
	}

	resizeNote(e, ui)
	{
		let _this = this
		let ppb = this.model.timeline.pixelsPerBar/this.model.track.sig[0]

		ui.element.add(this.$staff.find(".note.ui-selected")).each(function()
		{
			let $el = $(this)
			let width = $el.outerWidth()

			_this.model.note.snap && (width -= width%(ppb/4))

			$el.width(width)

			// update model duration
			_this.model.track.notes[+$el.attr("data-index")].duration = width/ppb
		})
	}

	afterRender()
	{
		if (!this.model.track) return

		this.$wrapper = this.$el.find(".wrapper")
		this.$staff = this.$el.find(".staff")
		this.$timeline = this.$el.find(".timeline")
		this.$cursor = this.$el.find(".cursor")

		// make the controls panel resizable
		this.$el.find(".controls").resizable({

			handles: "n",
			containment: "parent",

			resize: function(e, ui)
			{
				let $el = ui.element
				let hp = ui.element.parent().height()

				if (ui.size.height > hp/2) ui.size.height = hp/2

				let h = ui.size.height/hp * 100
				this.$wrapper.css("height", `calc(${(100-h)}% - 4em)`)
				$el.css("height", h + "%")

			}.bind(this),

			stop: function()
			{
				this.$wrapper.simplescroll("update")
			}.bind(this)
		})

		this.updateTimeline()
	}

	onDetach()
	{
		window.clearInterval(this.playInterval)
		this.model.track.playback.paused = true
	}
}


let model = new Model()
let view = new View(model)
let icon = "piano"

export default { model, view, icon }