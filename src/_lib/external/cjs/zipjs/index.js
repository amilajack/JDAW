import zip     from "./zip"
import zipExt  from "./zip-ext"

import zWorker from "./extra/z-worker" // imported as text via rollup-plugin-string
import deflate from "./extra/deflate"  // ""
import inflate from "./extra/inflate"  // ""

zipExt(zip)

let worker = URL.createObjectURL(new Blob([zWorker], { type: "application/javascript" }))

zip.workerScripts = {
	deflater: [worker, URL.createObjectURL(new Blob([deflate], { type: "application/javascript" }))],
	inflater: [worker, URL.createObjectURL(new Blob([inflate], { type: "application/javascript" }))]
}

export default zip