import bundle from "../../helpers/bundle.js";

bundle([
	{
		entrypoints: "src/DoarsIPC.js",
		outfile: "dst/doars-ipc.esm.js",
	},
	{
		format: "iife",
		entrypoints: "src/DoarsIPC.iife.js",
		outfile: "dst/doars-ipc.iife.js",
	},
]);
