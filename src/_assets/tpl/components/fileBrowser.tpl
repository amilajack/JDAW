<div class="file-browser">

	<div class="folder">
		<span class="title">Plugins</span>
		<ul class="entries">
			<li>
				<div class="folder">
					<span class="title">Instruments</span>
					<ul class="entries">
						{{
							Object.keys(Plugins.collection).filter(v=>Plugins.collection[v].meta.type == "instrument").forEach(v => _ += `<li>${Plugins.collection[v].meta.title}</li>`)
						}}
					</ul>
				</div>
			</li>
			<li>
				<div class="folder">
					<span class="title">Effects</span>
					<ul class="entries">
						{{
							Object.keys(Plugins.collection).filter(v=>Plugins.collection[v].meta.type == "effect").forEach(v => _ += `<li>${Plugins.collection[v].meta.title}</li>`)
						}}
					</ul>
				</div>
			</li>
		</ul>
	</div>

	<div class="button-browse">
		<label>add ${Utils.tests.cache.DirectoryBrowser == 1 ? "folder" : "files"}
			<input type="file" webkitdirectory multiple>
		</label>
	</div>

</div>