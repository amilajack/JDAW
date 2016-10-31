var fs = require("fs")
var Archiver = require("archiver")

var path = "src/_assets/plugins"
var fileEnding = ".jap"
var plugins =  fs.readdirSync(path).filter(v=>fs.statSync(path+"/"+v).isDirectory()).map(v=>[v,fs.readdirSync(path+"/"+v)])

!fs.existsSync("www") && fs.mkdirSync("www")
!fs.existsSync("www/Plugins") && fs.mkdirSync("www/Plugins")
fs.writeFile("www/plugins/index", plugins.map(v=>v[0]+fileEnding).join("\n"), function(err) { err && console.log(err)})

plugins.forEach(function(v)
{
	var name = v[0]
	var items = v[1]
	var zip = new Archiver("zip")

	var stream = fs.createWriteStream(__dirname + "/../www/plugins/" + name + fileEnding)

	zip.on("error", function(err) { throw err; });
	stream.on("close", function() { console.log(name + fileEnding + " (" + zip.pointer() + "b)"); });

	zip.pipe(stream);

	items.forEach(function(v)
	{
		var stats = fs.statSync(path + "/" + name + "/" + v)

		if (stats.isDirectory())
		{
			zip.directory(path + "/" + name + "/" + v, v)
		}
		else
		{
			var data = {}; data.name = v
			zip.file(path + "/" + name + "/" + v, data)
		}
	})

	zip.finalize();
})