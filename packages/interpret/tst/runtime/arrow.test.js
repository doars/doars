import {
	ARROW,
	BINARY,
	CALL,
	IDENTIFIER,
	LITERAL,
	OBJECT,
	PROPERTY,
	RETURN,
	SEQUENCE,
} from "../../src/types.js";
import test from "./utilities/test.js";

// Arrow function with no parameters
test("Arrow function no params", "() => 1", 1, {
	type: ARROW,
	parameters: [],
	body: {
		type: LITERAL,
		value: 1,
	},
});

// Arrow function with single parameter (no parentheses)
test(
	"Arrow function single param",
	"x => x",
	5,
	{
		type: ARROW,
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
		body: {
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

// Arrow function with single parameter (with parentheses)
test(
	"Arrow function single param with parens",
	"(x) => x",
	5,
	{
		type: ARROW,
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
		body: {
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

// Arrow function with multiple parameters
test(
	"Arrow function multiple params",
	"(x, y) => x + y",
	8,
	{
		type: ARROW,
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
			{
				type: IDENTIFIER,
				name: "y",
			},
		],
		body: {
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

// Arrow function returning an object (wrapped in parentheses)
test(
	"Arrow function returns object",
	"x => ({ value: x })",
	{ value: 10 },
	{
		type: ARROW,
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
		body: {
			type: OBJECT,
			properties: [
				{
					type: PROPERTY,
					computed: false,
					key: {
						type: IDENTIFIER,
						name: "value",
					},
					shorthand: false,
					value: {
						type: IDENTIFIER,
						name: "x",
					},
				},
			],
		},
	},
	{
		x: 10,
	},
	{
		x: 10,
	},
);

// Arrow function with block body and explicit return
test(
	"Arrow function with block body",
	"(x) => { return x * 2; }",
	10,
	{
		type: ARROW,
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
		body: {
			type: RETURN,
			argument: {
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
		},
	},
	{
		x: 5,
	},
	{
		x: 5,
	},
);

// IIFE with arrow function
test("IIFE arrow function", "(() => 42)()", 42, {
	type: CALL,
	callee: {
		type: ARROW,
		parameters: [],
		body: {
			type: LITERAL,
			value: 42,
		},
	},
	parameters: [],
});

test(
	"IIFE arrow function with body and return",
	"(() => { return 42 })()",
	42,
	{
		callee: {
			body: {
				argument: {
					type: LITERAL,
					value: 42,
				},
				type: RETURN,
			},
			parameters: [],
			type: ARROW,
		},
		parameters: [],
		type: CALL,
	},
);

test(
	"IIFE arrow function with body and return",
	"(() => { return 42 })()",
	42,
	{
		callee: {
			body: {
				argument: {
					type: LITERAL,
					value: 42,
				},
				type: RETURN,
			},
			parameters: [],
			type: ARROW,
		},
		parameters: [],
		type: CALL,
	},
);

// Arrow function in variable then called
const arrowFunction = () => 100;
test(
	"Calling stored arrow function",
	"arrowFunction()",
	100,
	{
		type: CALL,
		callee: {
			type: IDENTIFIER,
			name: "arrowFunction",
		},
		parameters: [],
	},
	{
		arrowFunction,
	},
	{
		arrowFunction,
	},
);

// Nested arrow function - inner arrow function defined inside outer
test("Nested arrow function invoked", "((x) => ((y) => x + y))(2)(1)", 3, {
	callee: {
		callee: {
			body: {
				body: {
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
				parameters: [
					{
						type: IDENTIFIER,
						name: "y",
					},
				],
				type: ARROW,
			},
			parameters: [
				{
					type: IDENTIFIER,
					name: "x",
				},
			],
			type: ARROW,
		},
		parameters: [
			{
				type: LITERAL,
				value: 2,
			},
		],
		type: CALL,
	},
	parameters: [
		{
			type: LITERAL,
			value: 1,
		},
	],
	type: CALL,
});

// Arrow function with object parameter (destructuring)
test(
	"Arrow function with object destructuring",
	"(({ a, b }) => a * b)(c)",
	15,
	{
		callee: {
			body: {
				left: {
					name: "a",
					type: IDENTIFIER,
				},
				operator: "*",
				right: {
					name: "b",
					type: IDENTIFIER,
				},
				type: 7,
			},
			parameters: [
				{
					properties: [
						{
							computed: false,
							key: {
								name: "a",
								type: IDENTIFIER,
							},
							shorthand: true,
							type: PROPERTY,
							value: {
								name: "a",
								type: IDENTIFIER,
							},
						},
						{
							computed: false,
							key: {
								name: "b",
								type: IDENTIFIER,
							},
							shorthand: true,
							type: PROPERTY,
							value: {
								name: "b",
								type: IDENTIFIER,
							},
						},
					],
					type: OBJECT,
				},
			],
			type: ARROW,
		},
		parameters: [
			{
				name: "c",
				type: IDENTIFIER,
			},
		],
		type: CALL,
	},
	{
		c: {
			a: 3,
			b: 5,
		},
	},
	{
		c: {
			a: 3,
			b: 5,
		},
	},
);

test("Nested arrow function invoked", "(() => { 3; 5 })()", 5, {
	callee: {
		body: {
			type: LITERAL,
			value: 5,
		},
		parameters: [],
		type: ARROW,
	},
	parameters: [],
	type: CALL,
});
