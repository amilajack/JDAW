import MVC     from "DAW/_lib/MVC"
import Plugins from "DAW/Plugins"
import types   from "./types"

class Model extends MVC.Model
{
	pan = 0
	vol = 1

	type = types.BEAT
	title = "Beat Track"
}

export default Model