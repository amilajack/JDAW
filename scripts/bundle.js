var cpy = require("copy-dir")
var pkg = require("../package.json")

try
{
	cpy.sync("www/", "build/www/" + pkg.version, function(stat, filepath, filename)
	{
		return filename != "package.json"
	})
}
catch(e)
{
	console.log(e)
}