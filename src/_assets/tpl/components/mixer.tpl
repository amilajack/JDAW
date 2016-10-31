<div class="mixer">
	{{ channels.forEach(function(c,i) { }}
	<ul>
		<li class="identifier">${i == 0 ? "Master" : "CH" + (i<10?"0"+i:i)}</li>
		<li><div class="panning gui-knob" data-type="pan" data-tooltip="false" data-value="${c.pan}"></div></li>
		<li><div class="volume gui-slider" data-orientation="vertical" data-steps="100" data-value="${c.vol}"></div></li>
	</ul>
	{{ }) }}
</div>