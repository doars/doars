import { CALL, IDENTIFIER, LITERAL, MEMBER } from "../../src/types.js";
import test from "./utilities/test.js";

// Simple regex literal
test("Regex literal", "/hello/", /hello/, {
	type: LITERAL,
	value: /hello/,
});

// Regex with flags
test("Regex with flags", "/hello/gi", /hello/gi, {
	type: LITERAL,
	value: /hello/gi,
});

// Regex with dot
test("Regex with dot", "/h.llo/", /h.llo/, {
	type: LITERAL,
	value: /h.llo/,
});

// Regex with special characters
test("Regex with special chars", "/^hello$/", /^hello$/, {
	type: LITERAL,
	value: /^hello$/,
});

// Regex with character class
test("Regex with character class", "/[a-z]+/", /[a-z]+/, {
	type: LITERAL,
	value: /[a-z]+/,
});

// Regex with escape
test("Regex with escape", "/\\d+/", /\d+/, {
	type: LITERAL,
	value: /\d+/,
});

// Regex with global flag
test("Regex global flag", "/test/g", /test/g, {
	type: LITERAL,
	value: /test/g,
});

// Regex with case insensitive flag
test("Regex case insensitive", "/test/i", /test/i, {
	type: LITERAL,
	value: /test/i,
});

// Regex with multiline flag
test("Regex multiline", "/test/m", /test/m, {
	type: LITERAL,
	value: /test/m,
});

// Regex with all flags
test("Regex all flags", "/test/gims", /test/gims, {
	type: LITERAL,
	value: /test/gims,
});

// Using regex in method call
test("Regex in method call", '"hello world".match(/world/)', ["world"], {
	type: CALL,
	callee: {
		type: MEMBER,
		computed: false,
		object: {
			type: LITERAL,
			value: "hello world",
		},
		property: {
			type: IDENTIFIER,
			name: "match",
		},
	},
	parameters: [
		{
			type: LITERAL,
			value: /world/,
		},
	],
});

// Using regex test method
test(
	"Regex test method",
	"/hello/.test(value)",
	true,
	{
		type: CALL,
		callee: {
			type: MEMBER,
			computed: false,
			object: {
				type: LITERAL,
				value: /hello/,
			},
			property: {
				type: IDENTIFIER,
				name: "test",
			},
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "value",
			},
		],
	},
	{
		value: "hello world",
	},
	{
		value: "hello world",
	},
);

// Complex regex pattern
test(
	"Complex regex",
	"/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
	/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	{
		type: LITERAL,
		value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	},
);
