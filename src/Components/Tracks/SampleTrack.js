import MVC     from "DAW/_lib/MVC"
import types   from "./types"

class Model extends MVC.Model
{
	pan = 0
	vol = 1

	sample = null
	type = types.SAMPLE
	title = "Sample Track"
}

export default Model