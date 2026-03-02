import { LITERAL } from "../../src/types.js";
import test from "./utilities/test.js";

test("Compound", "", undefined, undefined, {}, {});

test("Compound", ";", undefined, undefined, {}, {});

test("Compound", ";;", undefined, undefined, {}, {});

test("Compound", ";;;", undefined, undefined, {}, {});

test("Compound", '"hello";', "hello", {
	type: LITERAL,
	value: "hello",
});

test(
	"Compound",
	'"hello";"there"',
	["hello", "there"],
	[
		{
			type: LITERAL,
			value: "hello",
		},
		{
			type: LITERAL,
			value: "there",
		},
	],
);

test(
	"Compound",
	'"hello";"there";',
	["hello", "there"],
	[
		{
			type: LITERAL,
			value: "hello",
		},
		{
			type: LITERAL,
			value: "there",
		},
	],
);
