<div class="piano-roll">

	{{
		let keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
		let ppb = track ? timeline.pixelsPerBar/track.sig[0] : null
	}}

	<div class="toolbar">
		{{ if (track) { }}
		<div class="tools">
			<div class="active edit"><span class="icon-pencil"></span></div>
			<div class="delete"><span class="icon-i-cursor"></span></div>
			<div class="select"><span class="icon-block"></span></div>
			<div class="preview"><span class="icon-volume-up"></span></div>
			<div class="met"><span class="icon-metronome"></span></div>
		</div>

		<div class="settings">
			<div class="plg"><span class="icon-plug">${track.plugin.meta.title}</span></div>
			<div class="sig"><span>${track.sig.join("/")}<br>SIG</span></div>
			<div class="bpm"><span>${track.bpm}<br>BPM</span></div>
		</div>
		{{ } }}
	</div>

	<div class="mode">
		<span class="snap icon-magnet ${note.snap ? "active" : ""}"></span>
		<span class="slide icon-slide"></span>
	</div>

	<div class="wrapper" data-simplescroll>

		<div class="keys">

			{{ for(var i = 127; i > 1; i--) {
				let key = keys[i%12]
				let className = "key"
				let sharp = ~key.indexOf("#")

				className += sharp ? " black" : " white"

				_ += `<div data-index="${i}" class="${ className }">${ sharp ? "&nbsp;" : "<span>"+key+(i/12|0)+"</span>" }</div>`
			} }}

		</div>

		<div class="staff">

			<div class="cursor" style="left:${track ? track.playback.cursor*ppb : 0}px"></div>

			<div class="timeline">
				<div class="start"></div>
				<div class="end"></div>
			</div>

			{{
				for(var i = 127; i > 1; i--)
				{
					let key = keys[i%12]

					_ += `<div data-key="${ key+(i/12|0) }" data-index="${i}" class="key ${ ~key.indexOf("#") ? "black" : "white" }">`

					// insert all notes with their corresponding index
					track && track.notes.reduce((p,c,j) => c.index == i ? p.push([c,j]) && p : p, []).forEach(v => _ += `
						<div data-index="${v[1]}" class="${ v[0].slide ? "note slide" : "note" }" style="left: ${ v[0].offset * ppb }px; width: ${ v[0].duration * ppb }px">
							<span>${key+(i/12|0)}</span>
						</div>
					`)

					_ += `</div>`
				}
			}}

		</div>
	</div>

	<div class="controls">
		<div class="properties">
			<ul>
				<li class="active">VOL</li>
				<li>PAN</li>
				<li>PIT</li>
			</ul>
		</div>
		<div class="editor"></div>
	</div>

</div>