import { ARRAY, CALL, IDENTIFIER, LITERAL, SPREAD } from "../../src/types.js";
import test from "./utilities/test.js";

// Spread in array literal
test(
	"Spread array",
	"[...value]",
	[1, 2, 3],
	{
		type: ARRAY,
		elements: [
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "value",
				},
			},
		],
	},
	{
		value: [1, 2, 3],
	},
	{
		value: [1, 2, 3],
	},
);

// Spread with additional elements
test(
	"Spread array with elements",
	"[0, ...value, 4]",
	[0, 1, 2, 3, 4],
	{
		type: ARRAY,
		elements: [
			{
				type: LITERAL,
				value: 0,
			},
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "value",
				},
			},
			{
				type: LITERAL,
				value: 4,
			},
		],
	},
	{
		value: [1, 2, 3],
	},
	{
		value: [1, 2, 3],
	},
);

// Spread multiple arrays
test(
	"Spread multiple arrays",
	"[...a, ...b]",
	[1, 2, 3, 4],
	{
		type: ARRAY,
		elements: [
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "a",
				},
			},
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "b",
				},
			},
		],
	},
	{
		a: [1, 2],
		b: [3, 4],
	},
	{
		a: [1, 2],
		b: [3, 4],
	},
);

// Spread in function call
const sumThree = (a, b, c) => a + b + c;
test(
	"Spread in function call",
	"fn(...value)",
	6,
	{
		type: CALL,
		callee: {
			type: IDENTIFIER,
			name: "fn",
		},
		parameters: [
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "value",
				},
			},
		],
	},
	{
		fn: sumThree,
		value: [1, 2, 3],
	},
	{
		fn: sumThree,
		value: [1, 2, 3],
	},
);

// Spread with regular arguments in call
const sumFive = (a, b, c, d, e) => a + b + c + d + e;
test(
	"Spread with regular value in call",
	"fn(1, ...value, 5)",
	15,
	{
		type: CALL,
		callee: {
			type: IDENTIFIER,
			name: "fn",
		},
		parameters: [
			{
				type: LITERAL,
				value: 1,
			},
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "value",
				},
			},
			{
				type: LITERAL,
				value: 5,
			},
		],
	},
	{
		fn: sumFive,
		value: [2, 3, 4],
	},
	{
		fn: sumFive,
		value: [2, 3, 4],
	},
);

// Spread string into array
test(
	"Spread string",
	"[...value]",
	["h", "e", "l", "l", "o"],
	{
		type: ARRAY,
		elements: [
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "value",
				},
			},
		],
	},
	{
		value: "hello",
	},
	{
		value: "hello",
	},
);
