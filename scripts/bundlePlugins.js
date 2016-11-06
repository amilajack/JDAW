var fs       = require("fs")
var Archiver = require("archiver")

var path    = "src/_assets/plugins"
var ext     = ".jap"
var plugins =  fs.readdirSync(path).filter(v=>fs.statSync(path+"/"+v).isDirectory()).map(v=>[v,fs.readdirSync(path+"/"+v)])

!fs.existsSync("www") && fs.mkdirSync("www")
!fs.existsSync("www/plugins") && fs.mkdirSync("www/plugins")
fs.writeFile("www/plugins/index", plugins.map(v=>v[0]+ext).join("\n"), function(err) { err && console.log(err)})

plugins.forEach(function(v)
{
	var name   = v[0]
	var items  = v[1]
	var zip    = new Archiver("zip")
	var stream = fs.createWriteStream("www/plugins/" + name + ext)

	stream.on("close", function() { console.log(name + ext + " (" + zip.pointer() + "b)"); });

	zip.on("error", function(err) { throw err; });
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