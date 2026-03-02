import bundle from "../helpers/bundle.js";

bundle([
	{
		entrypoints: "src/libraries/alpine.js",
		outfile: "dst/alpine.js",
	},
	{
		entrypoints: "src/libraries/alpine+htmx.js",
		outfile: "dst/alpine+htmx.js",
	},
	{
		entrypoints: "src/libraries/doars.js",
		outfile: "dst/doars.js",
	},
	{
		entrypoints: "src/libraries/doars-interpret.js",
		outfile: "dst/doars-interpret.js",
	},
	{
		entrypoints: "src/libraries/doars+fetch.js",
		outfile: "dst/doars+fetch.js",
	},
	{
		entrypoints: "src/libraries/htmx.js",
		outfile: "dst/htmx.js",
	},
]);
