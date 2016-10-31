var pkg = require("../package.json")
var exec = require('child_process').exec
var cmd = "nwbuild -p win32,win64,osx64,linux32,linux64 www -v 0.18.0 -o build/bin/" + pkg.version

exec(cmd, function(error, stdout, stderr)
{
	console.log('stdout: ' + stdout)
	console.log('stderr: ' + stderr)

	if (error !== null)
	{
		console.log('exec error: ' + error)
	}
});