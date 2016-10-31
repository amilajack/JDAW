<div class="component-sample-editor">

	{{ if (!track || !track.sample) { }}

	<div class="dropspace">
		<div class="button-browse center">
			<label>
				drop or select audio file
				<input type="file" name="sample">
			</label>
		</div>
	</div>

	{{ } else { }}

	<div class="wave" style="background-image:url(${track.sample.wave})"></div>

	{{ } }}

</div>