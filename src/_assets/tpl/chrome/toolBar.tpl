<div id="toolBar">
	<ul class="menu" tabIndex="0">
		{{
		
		function appendItems(item)
		{
			let args = (item.type || "action").split("|")
			let type = args.shift()
			let name = item.name

			_ += "<li class='" + ("items" in item ? "submenu" : "item") + "' data-id='" + item.id + "' data-type='" + type + "'>"

			// wrap name inside a link?
			if (type == "link") name = "<span onclick='window.open(\"" + args[0] + "\")'>" + name + "</span>"

			// append checkbox?
			if (type == "toggle") _ += "<span class='icon icon-check" + ["-empty",""][Number(args[0])] + "' style='padding-right:.5em'></span>"

			_ += "<span class='name'>" + name + "</span>"

			// append external link icon?
			if (type == "link") _ += "<span class='icon-link-ext' style='padding-left:.5em'></span>"

			// has shortcut?
			else if (item.shortcut)  _ += "<span class='shortcut'>" + item.shortcut + "</span>"

			if (item.items)
			{
				_ += "<ul>"
				item.items.forEach(appendItems)
				_ += "</ul>"
			}

			_ += "</li>"
		}

		menu.forEach(appendItems)

		}}

	</ul>

	<div class="waveform"></div>
</div>