import "DAW/_lib/external/jquery/jquery"
import "DAW/_lib/external/jquery/jquery-ui"
import "DAW/_lib/external/jquery/jquery.knob"
import "DAW/_lib/external/jquery/jquery.observe"
import "DAW/_lib/external/jquery/jquery.simplescroll"

import "DAW/Chrome"
import "DAW/Project"

import Utils   from "DAW/_lib/Utils"
import Plugins from "DAW/Plugins"

let $loadingScreen = $("#loading-screen")
let $log = $loadingScreen.find(".log")

$log.append("<li>CHECKING COMPATIBILITY</li>")

Utils.tests.all(function(test, pass, passAll)
{
	$log.append(`<li>- ${test}: <span style="color:${["#f00","#0f0","#f90"][Number(pass)]}">${["missing","yes","no"][Number(pass)]}</span></li>`)
	$log.scrollTop($log[0].scrollHeight)

	if (passAll !== true) return

	$log.append("<li><br>GATHERING PLUGINS</li>")

	Plugins.gather(function(plugin, pass, finish)
	{
		let err = typeof pass == "object" ? pass[1] : 0
		pass = typeof pass == "object" ? pass[0] : pass

		$log.append(`<li>- ${plugin}: <span style="color:${["#f90","#0f0"][Number(pass)]}">${["ignored","ok"][Number(pass)] + (err ? ` (${err})` : "")}</span></li>`)
		$log.scrollTop($log[0].scrollHeight)

		finish && $loadingScreen.fadeOut(2000)
	})
})