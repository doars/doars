import {
	ASSIGN,
	BINARY,
	IDENTIFIER,
	LITERAL,
	RETURN,
	UNARY,
} from "../../src/types.js";
import test from "./utilities/test.js";

// Simple return statement
test("Return statement", "return 42", 42, {
	type: RETURN,
	argument: {
		type: LITERAL,
		value: 42,
	},
});

// Return with identifier
test(
	"Return identifier",
	"return x",
	5,
	{
		type: RETURN,
		argument: {
			type: IDENTIFIER,
			name: "x",
		},
	},
	{
		x: 5,
	},
	{
		x: 5,
	},
);

// Return with binary expression
test(
	"Return binary expression",
	"return x + y",
	8,
	{
		type: RETURN,
		argument: {
			type: BINARY,
			operator: "+",
			left: {
				type: IDENTIFIER,
				name: "x",
			},
			right: {
				type: IDENTIFIER,
				name: "y",
			},
		},
	},
	{
		x: 5,
		y: 3,
	},
	{
		x: 5,
		y: 3,
	},
);

// Return with unary expression
test(
	"Return unary expression",
	"return -x",
	-5,
	{
		type: RETURN,
		argument: {
			type: UNARY,
			operator: "-",
			parameter: {
				type: IDENTIFIER,
				name: "x",
			},
		},
	},
	{
		x: 5,
	},
	{
		x: 5,
	},
);

// Return with literal string
test("Return string literal", 'return "hello"', "hello", {
	type: RETURN,
	argument: {
		type: LITERAL,
		value: "hello",
	},
});

// Return with literal boolean
test("Return boolean literal", "return true", true, {
	type: RETURN,
	argument: {
		type: LITERAL,
		value: true,
	},
});

// Return with literal null
test("Return null literal", "return null", null, {
	type: RETURN,
	argument: {
		type: LITERAL,
		value: null,
	},
});

// Return with literal undefined
test("Return undefined literal", "return undefined", undefined, {
	type: RETURN,
	argument: {
		type: LITERAL,
		value: undefined,
	},
});

// Return with complex expression
test(
	"Return complex expression",
	"return (x * 2) + (y / 2)",
	14,
	{
		type: RETURN,
		argument: {
			type: BINARY,
			operator: "+",
			left: {
				type: BINARY,
				operator: "*",
				left: {
					type: IDENTIFIER,
					name: "x",
				},
				right: {
					type: LITERAL,
					value: 2,
				},
			},
			right: {
				type: BINARY,
				operator: "/",
				left: {
					type: IDENTIFIER,
					name: "y",
				},
				right: {
					type: LITERAL,
					value: 2,
				},
			},
		},
	},
	{
		x: 5,
		y: 8,
	},
	{
		x: 5,
		y: 8,
	},
);

// Return stops execution - code after return should not execute
test(
	"Return stops execution",
	"b = 1; return b; c = 0",
	[1, 1],
	[
		{
			type: ASSIGN,
			operator: "=",
			left: {
				type: IDENTIFIER,
				name: "b",
			},
			right: {
				type: LITERAL,
				value: 1,
			},
		},
		{
			type: RETURN,
			argument: {
				type: IDENTIFIER,
				name: "b",
			},
		},
	],
	{
		b: undefined,
		c: undefined,
	},
	{
		b: 1,
		c: undefined,
	},
	{
		expectCompound: true,
	},
);
