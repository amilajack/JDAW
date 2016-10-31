<ul id="contextMenu">

	{{
	function appendItems(item)
	{
		let args = (item.type || "action").split("|")
		let type = args.shift()
		let name = item.name

		_ += `<li class="${"items" in item ? "submenu" : "item"}" data-id="${item.id}" data-type="${type}">`

		// append checkbox?
		if (type == "toggle") _ += `<span class="icon icon-check${["-empty",""][Number(args[0])]}" style="padding-right:.5em"></span>`

		_ += `<span class='name'>${name}</span>`

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