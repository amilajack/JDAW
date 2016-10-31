import Utils from "DAW/_lib/Utils"

export default class Form
{
	$form = $("<form>")
	valid = true

	constructor(items)
	{
		this.items = items
		let $table = $("<table>").appendTo(this.$form)

		items.forEach(function(v,i)
		{
			let name = Utils.camelCase(v.name)

			switch(v.type)
			{
				case "text": case "number":
					$table.append(`
						<tr>
							<td>${v.tooltip ? `<span class="help" title="${v.tooltip.replace(/\n/g,"&#13;")}">${v.name}</span>` : v.name}</td>
							<td><input type="text" name="${name}" value="${v.value||""}" placeholder="${v.placeholder||""}"></td>
						</tr>
					`); break;
				case "textarea":
					$table.append(`
						<tr>
							<td>${v.tooltip ? `<span class="help" title="${v.tooltip.replace(/\n/g,"&#13;")}">${v.name}</span>` : v.name}</td>
							<td><textarea name="${name}" placeholder="${v.placeholder}">${v.value}</textarea></td>
						</tr>
					`); break;
				case "select":
					$table.append(`
						<tr>
							<td>${v.tooltip ? `<span class="help" title="${v.tooltip.replace(/\n/g,"&#13;")}">${v.name}</span>` : v.name}</td>
							<td><div class='select-wrapper'>
								<select name="${name}">
									${v.options.map((o,i)=>`<option ${v.values?"value='"+v.values[i]+"'":""} ${i==v.default?"selected":""}>${o}</option>`).join("")}
								</select>
							</div></td>
						</tr>
					`); break;
				case "button": $table.append(`<tr><td colspan="2"><input type="button" name="${name}" value="${v.name}"></td></tr>`); break;
			}
		}.bind(this))

		this.$form.append($table)

		$table.find("input[type=text],input[type=number],textarea").on("keyup", this.validate.bind(this))
		$table.find("input[type=radio],input[type=checkbox],select").on("change", this.validate.bind(this))
	}

	// TODO make this more dynamic
	 validate(e)
	{
		let item;
		let $target = $(e.target)
		let type = $target.attr("type")
		let targetName = $target.attr("name")
		let tagName = e.target.tagName.toLowerCase()

		// find the item model
		this.items.forEach(function findItem(v)
		{
			let name = Utils.camelCase(v.name)
			if (item) return false
			if (name === targetName) { item = v; return false }
			(v.items || []).forEach(findItem)
		})

		if (!item)
		{
			$target.attr("class", "invalid").attr("title", "The name attribute has been altered")
			return false
		}

		if (item.replace)
		{
			let r = item.replace[0].substr(1).split(/(\/)/)
			let m = r.pop(); r.pop()

			$target.val($target.val().replace(new RegExp(r.join(""),m),item.replace[1]))
		}

		if (item.fix && item.pattern)
		{
			let r = item.pattern.replace(/^\/\^?/,"").replace(/\$(\/.*)$/,"$1").split(/(\/)/)
			let m = r.pop(); r.pop()

			let match = $target.val().match(new RegExp(r.join(""),m))
			if (match) $target.val(match[0])
		}

		if (tagName == "select")
		{
			let $options = $target.find("option")

			if(!item.options.every((v,i)=>v.toString()==$options[i].innerHTML))
			{
				$target.attr("class", "invalid").attr("title", "The options have been altered")
				return false
			}
		}

		else if (tagName == "input" && item.type == "text")
		{
			let v = $target.val()

			if (item.pattern)
			{
				let r = item.pattern.substr(1).split(/(\/)/)
				let m = r.pop(); r.pop()

				if (!new RegExp(r.join(""),m).test(v))
				{
					$target.attr("class", "invalid").attr("title", "The value does not match the following pattern: " + item.pattern)
					return false
				}
			}

			if (item.minLength && v.length < item.minLength)
			{
				$target.attr("class", "invalid").attr("title", "The string must contain at least " + item.minLength + " characters")
				return false
			}

			if (item.maxLength && v.length > item.maxLength)
			{
				$target.attr("class", "invalid").attr("title", "The string must not contain more than " + item.maxLength + " characters")
				return false
			}
		}

		else if (tagName == "input" && item.type == "number")
		{
			if (item.fix)
			{
				let match = $target.val().match(/\d+\.?(\d+)/)
				if (match) $target.val(match[0])
			}

			let v = $target.val()

			if (!/^\d+\.?(\d+)?$/.test(v))
			{

				$target.attr("class", "invalid").attr("title", "The value does not represent a valid number: " + item.pattern)
				return false
			}

			if (item.pattern)
			{
				let r = item.pattern.substr(1).split(/(\/)/)
				let m = r.pop(); r.pop()

				if (!new RegExp(r.join(""),m).test(v))
				{
					$target.attr("class", "invalid").attr("title", "The value does not match the following pattern: " + item.pattern)
					return false
				}
			}

			if (item.min && +v < item.min || item.max && +v > item.max)
			{
				$target.attr("class", "invalid").attr("title", "The number must be equal to or between: " + (item.min !== undefined ? item.max : -Infinity) + " and " + (item.max !== undefined ? item.max : Infinity))
				return false
			}
		}

		$target.attr("class","").attr("title","")
		return true
	}

	 validateAll()
	{
		let _this = this
		this.$form.find("input,textarea,select").each(i=>_this.validate({ target: this }))
	}
}