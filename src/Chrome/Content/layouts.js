import types from "DAW/Components/types"

let layouts = {}

layouts.default = {
	split: 1,
	size: 80,

	containers: [
		{ components: [types.Editor, types.Mixer, types.Playlist] },
		{
			split: 0,
			size: 50,

			containers: [
				{ components: [types.Tracks] },
				{ components: [types.FileBrowser] }
			]
		}
	]
}

layouts["persistant playlist"] = {
	split: 1,
	size: 80,

	containers: [
		{
			split: 0,
			size: 70,

			containers: [
				{ components: [types.Editor, types.Mixer]},
				{ components: [types.Playlist]},
			]
		},
		{
			split: 0,
			size: 50,

			containers: [
				{ components: [types.Tracks] },
				{ components: [types.FileBrowser] }
			]
		}
	]
}


export default layouts