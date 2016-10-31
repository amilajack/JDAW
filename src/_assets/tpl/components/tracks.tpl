<div class="component-tracks">
	<ul class="toolbar">
		<li title="MIDI Track" data-action="add-track" data-type="${types.MIDI}"><span class="icon-piano"></span></li>
		<li title="Beat Track" data-action="add-track" data-type="${types.BEAT}"><span class="icon-drums"></span></li>
		<li title="Sample Track" data-action="add-track" data-type="${types.SAMPLE}"><span class="icon-soundwave"></span></li>
		<li data-action="del-track"><span class="icon-trash"></span></li>
	</ul>

	<ul class="tracks">
		{{ collection.forEach(function(t) { }}

		<li ${t == focus ? "class='focus'" : ""}>

			<span class="icon icon-${["piano","drums","soundwave"][t.type]}"></span>
			<span class="title" spellcheck="false">${t.title}</span>

			<div class="select-wrapper channel" title="mixer channel">
				<select>
					{{ Mixer.channels.forEach(function(v,i) { }}

					<option ${t.channel == i ? "selected" : ""}>${ i == 0 ? "--" : "CH"+(i < 10 ? "0"+i : i) }</option>

					{{ }) }}
				</select>
			</div>

		</li>

		{{ }) }}
	</ul>
</div>