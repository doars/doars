import {
	ARRAY,
	ARROW,
	ASSIGN,
	BINARY,
	CALL,
	CONDITION,
	IDENTIFIER,
	LITERAL,
	MEMBER,
	OBJECT,
	PROPERTY,
	RETURN,
	SEQUENCE,
	SPREAD,
	TEMPLATE,
	UNARY,
	UPDATE,
} from "../../src/types.js";
import test from "./utilities/test.js";

test("Sequence with single literal", "(1)", 1, {
	type: LITERAL,
	value: 1,
});

test(
	"Sequence with single identifier",
	"(a)",
	5,
	{
		type: IDENTIFIER,
		name: "a",
	},
	{
		a: 5,
	},
	{
		a: 5,
	},
);

test("Sequence with two literals", "(1, 2)", 2, {
	type: SEQUENCE,
	expressions: [
		{
			type: LITERAL,
			value: 1,
		},
		{
			type: LITERAL,
			value: 2,
		},
	],
});

test("Sequence with three literals", "(1, 2, 3)", 3, {
	type: SEQUENCE,
	expressions: [
		{
			type: LITERAL,
			value: 1,
		},
		{
			type: LITERAL,
			value: 2,
		},
		{
			type: LITERAL,
			value: 3,
		},
	],
});

test(
	"Sequence with two identifiers",
	"(a, b)",
	10,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: IDENTIFIER,
				name: "a",
			},
			{
				type: IDENTIFIER,
				name: "b",
			},
		],
	},
	{
		a: 5,
		b: 10,
	},
	{
		a: 5,
		b: 10,
	},
);

test(
	"Sequence with three identifiers",
	"(a, b, c)",
	3,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: IDENTIFIER,
				name: "a",
			},
			{
				type: IDENTIFIER,
				name: "b",
			},
			{
				type: IDENTIFIER,
				name: "c",
			},
		],
	},
	{
		a: 1,
		b: 2,
		c: 3,
	},
	{
		a: 1,
		b: 2,
		c: 3,
	},
);

test(
	"Sequence with mixed literals and identifiers",
	"(1, a, 2)",
	2,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: LITERAL,
				value: 1,
			},
			{
				type: IDENTIFIER,
				name: "a",
			},
			{
				type: LITERAL,
				value: 2,
			},
		],
	},
	{
		a: 5,
	},
	{
		a: 5,
	},
);

test("Sequence with binary operations", "(1 + 2, 3 * 4)", 12, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "+",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: BINARY,
			operator: "*",
			left: {
				type: LITERAL,
				value: 3,
			},
			right: {
				type: LITERAL,
				value: 4,
			},
		},
	],
});

test(
	"Sequence with member access",
	"(obj.prop, obj['key'])",
	"value",
	{
		type: SEQUENCE,
		expressions: [
			{
				type: MEMBER,
				computed: false,
				object: {
					type: IDENTIFIER,
					name: "obj",
				},
				property: {
					type: IDENTIFIER,
					name: "prop",
				},
			},
			{
				type: MEMBER,
				computed: true,
				object: {
					type: IDENTIFIER,
					name: "obj",
				},
				property: {
					type: LITERAL,
					value: "key",
				},
			},
		],
	},
	{
		obj: {
			prop: 42,
			key: "value",
		},
	},
	{
		obj: {
			prop: 42,
			key: "value",
		},
	},
);

const callFunction = () => "called";
const sumTwo = (a, b) => a + b;
test(
	"Sequence with function call",
	"(callFunction(), sumTwo(1, 2))",
	3,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: CALL,
				callee: {
					type: IDENTIFIER,
					name: "callFunction",
				},
				parameters: [],
			},
			{
				type: CALL,
				callee: {
					type: IDENTIFIER,
					name: "sumTwo",
				},
				parameters: [
					{
						type: LITERAL,
						value: 1,
					},
					{
						type: LITERAL,
						value: 2,
					},
				],
			},
		],
	},
	{
		callFunction,
		sumTwo,
	},
	{
		callFunction,
		sumTwo,
	},
);

test(
	"Sequence with assignment",
	"(a = 5, b = 10)",
	10,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				operator: "=",
				right: {
					type: LITERAL,
					value: 5,
				},
			},
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "b",
				},
				operator: "=",
				right: {
					type: LITERAL,
					value: 10,
				},
			},
		],
	},
	{},
	{
		a: 5,
		b: 10,
	},
);

test(
	"Sequence with compound assignment",
	"(a += 5, b *= 2)",
	20,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				operator: "+=",
				right: {
					type: LITERAL,
					value: 5,
				},
			},
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "b",
				},
				operator: "*=",
				right: {
					type: LITERAL,
					value: 2,
				},
			},
		],
	},
	{
		a: 10,
		b: 10,
	},
	{
		a: 15,
		b: 20,
	},
);

test("Sequence with arrow function", "(x => x * 2)(5)", 10, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: BINARY,
			left: {
				type: IDENTIFIER,
				name: "x",
			},
			operator: "*",
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
	},
	parameters: [
		{
			type: LITERAL,
			value: 5,
		},
	],
});

test("Sequence as IIFE", "(() => (1, 2, 3))()", 3, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: SEQUENCE,
			expressions: [
				{
					type: LITERAL,
					value: 1,
				},
				{
					type: LITERAL,
					value: 2,
				},
				{
					type: LITERAL,
					value: 3,
				},
			],
		},
		parameters: [],
	},
	parameters: [],
});

test("Sequence with nested parentheses", "((1, 2), 3)", 3, {
	type: SEQUENCE,
	expressions: [
		{
			type: SEQUENCE,
			expressions: [
				{
					type: LITERAL,
					value: 1,
				},
				{
					type: LITERAL,
					value: 2,
				},
			],
		},
		{
			type: LITERAL,
			value: 3,
		},
	],
});

test("Sequence with string literals", "('a', 'b', 'c')", "c", {
	type: SEQUENCE,
	expressions: [
		{
			type: LITERAL,
			value: "a",
		},
		{
			type: LITERAL,
			value: "b",
		},
		{
			type: LITERAL,
			value: "c",
		},
	],
});

test("Sequence with null and undefined", "(null, undefined)", undefined, {
	type: SEQUENCE,
	expressions: [
		{
			type: LITERAL,
			value: null,
		},
		{
			type: LITERAL,
			value: undefined,
		},
	],
});

test("Sequence with boolean literals", "(true, false, true)", true, {
	type: SEQUENCE,
	expressions: [
		{
			type: LITERAL,
			value: true,
		},
		{
			type: LITERAL,
			value: false,
		},
		{
			type: LITERAL,
			value: true,
		},
	],
});

test(
	"Sequence with object literal",
	"({ a: 1 })",
	{ a: 1 },
	{
		type: OBJECT,
		properties: [
			{
				type: PROPERTY,
				computed: false,
				key: {
					type: IDENTIFIER,
					name: "a",
				},
				shorthand: false,
				value: {
					type: LITERAL,
					value: 1,
				},
			},
		],
	},
);

test("Sequence with array literal", "([1, 2, 3])", [1, 2, 3], {
	type: ARRAY,
	elements: [
		{
			type: LITERAL,
			value: 1,
		},
		{
			type: LITERAL,
			value: 2,
		},
		{
			type: LITERAL,
			value: 3,
		},
	],
});

test("Sequence with ternary", "(true ? 1 : 2, false ? 3 : 4)", 4, {
	type: SEQUENCE,
	expressions: [
		{
			type: CONDITION,
			condition: {
				type: LITERAL,
				value: true,
			},
			consequent: {
				type: LITERAL,
				value: 1,
			},
			alternate: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: CONDITION,
			condition: {
				type: LITERAL,
				value: false,
			},
			consequent: {
				type: LITERAL,
				value: 3,
			},
			alternate: {
				type: LITERAL,
				value: 4,
			},
		},
	],
});

test("Sequence with unary operator", "(!true, -5, +3)", 3, {
	type: SEQUENCE,
	expressions: [
		{
			type: UNARY,
			operator: "!",
			parameter: {
				type: LITERAL,
				value: true,
			},
		},
		{
			type: UNARY,
			operator: "-",
			parameter: {
				type: LITERAL,
				value: 5,
			},
		},
		{
			type: UNARY,
			operator: "+",
			parameter: {
				type: LITERAL,
				value: 3,
			},
		},
	],
});

test(
	"Sequence with logical operators",
	"(a && b, a || b)",
	"hello",
	{
		type: SEQUENCE,
		expressions: [
			{
				type: BINARY,
				operator: "&&",
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				right: {
					type: IDENTIFIER,
					name: "b",
				},
			},
			{
				type: BINARY,
				operator: "||",
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				right: {
					type: IDENTIFIER,
					name: "b",
				},
			},
		],
	},
	{
		a: false,
		b: "hello",
	},
	{
		a: false,
		b: "hello",
	},
);

test(
	"Sequence assigned to variable",
	"x = (1, 2, 3)",
	3,
	{
		type: ASSIGN,
		left: {
			type: IDENTIFIER,
			name: "x",
		},
		operator: "=",
		right: {
			type: SEQUENCE,
			expressions: [
				{
					type: LITERAL,
					value: 1,
				},
				{
					type: LITERAL,
					value: 2,
				},
				{
					type: LITERAL,
					value: 3,
				},
			],
		},
	},
	{},
	{
		x: 3,
	},
);

test(
	"Sequence with comma operator result",
	"(a = 1, b = 2, a + b)",
	3,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				operator: "=",
				right: {
					type: LITERAL,
					value: 1,
				},
			},
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "b",
				},
				operator: "=",
				right: {
					type: LITERAL,
					value: 2,
				},
			},
			{
				type: BINARY,
				operator: "+",
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				right: {
					type: IDENTIFIER,
					name: "b",
				},
			},
		],
	},
	{},
	{
		a: 1,
		b: 2,
	},
);

test(
	"Sequence with side effects",
	"(a++, 'b', a)",
	3,
	{
		type: SEQUENCE,
		expressions: [
			{
				operator: "++",
				parameter: {
					name: "a",
					type: IDENTIFIER,
				},
				prefix: false,
				type: UPDATE,
			},
			{
				type: LITERAL,
				value: "b",
			},
			{
				name: "a",
				type: IDENTIFIER,
			},
		],
	},
	{
		a: 2,
	},
	{
		a: 3,
	},
);

test("Sequence called immediately", "(x => x * 10)(5)", 50, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: BINARY,
			left: {
				type: IDENTIFIER,
				name: "x",
			},
			operator: "*",
			right: {
				type: LITERAL,
				value: 10,
			},
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
	},
	parameters: [
		{
			type: LITERAL,
			value: 5,
		},
	],
});

test("Nested sequence in arrow", "(x => (x, x * 2))(5)", 10, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: SEQUENCE,
			expressions: [
				{
					type: IDENTIFIER,
					name: "x",
				},
				{
					type: BINARY,
					left: {
						type: IDENTIFIER,
						name: "x",
					},
					operator: "*",
					right: {
						type: LITERAL,
						value: 2,
					},
				},
			],
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
	},
	parameters: [
		{
			type: LITERAL,
			value: 5,
		},
	],
});

test(
	"Sequence with spread",
	"([1, 2, ...arr])",
	[1, 2, 3, 4],
	{
		type: ARRAY,
		elements: [
			{
				type: LITERAL,
				value: 1,
			},
			{
				type: LITERAL,
				value: 2,
			},
			{
				type: SPREAD,
				arguments: {
					type: IDENTIFIER,
					name: "arr",
				},
			},
		],
	},
	{
		arr: [3, 4],
	},
	{
		arr: [3, 4],
	},
);

test(
	"Sequence with template literal",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"(`a${x}`, `b${y}`)",
	"b10",
	{
		type: SEQUENCE,
		expressions: [
			{
				type: TEMPLATE,
				elements: ["a", ""],
				expressions: [
					{
						type: IDENTIFIER,
						name: "x",
					},
				],
			},
			{
				type: TEMPLATE,
				elements: ["b", ""],
				expressions: [
					{
						type: IDENTIFIER,
						name: "y",
					},
				],
			},
		],
	},
	{
		x: 5,
		y: 10,
	},
	{
		x: 5,
		y: 10,
	},
);

test("Sequence with bitwise operators", "(5 | 3, 5 & 3, 5 ^ 3)", 6, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "|",
			left: {
				type: LITERAL,
				value: 5,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
		{
			type: BINARY,
			operator: "&",
			left: {
				type: LITERAL,
				value: 5,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
		{
			type: BINARY,
			operator: "^",
			left: {
				type: LITERAL,
				value: 5,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
	],
});

test("Sequence with shift operators", "(2 << 3, 16 >> 2)", 4, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "<<",
			left: {
				type: LITERAL,
				value: 2,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
		{
			type: BINARY,
			operator: ">>",
			left: {
				type: LITERAL,
				value: 16,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
	],
});

const returnA = () => () => "a";
const returnB = () => () => "b";
test(
	"Sequence chaining calls",
	"(returnA()(), returnB()())",
	"b",
	{
		type: SEQUENCE,
		expressions: [
			{
				type: CALL,
				callee: {
					type: CALL,
					callee: {
						type: IDENTIFIER,
						name: "returnA",
					},
					parameters: [],
				},
				parameters: [],
			},
			{
				type: CALL,
				callee: {
					type: CALL,
					callee: {
						type: IDENTIFIER,
						name: "returnB",
					},
					parameters: [],
				},
				parameters: [],
			},
		],
	},
	{
		returnA,
		returnB,
	},
	{
		returnA,
		returnB,
	},
);

test("Sequence with exponent", "(2 ** 3, 2 ** 10)", 1024, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "**",
			left: {
				type: LITERAL,
				value: 2,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
		{
			type: BINARY,
			operator: "**",
			left: {
				type: LITERAL,
				value: 2,
			},
			right: {
				type: LITERAL,
				value: 10,
			},
		},
	],
});

test("Sequence with modulo", "(10 % 3, 10 % 7)", 3, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "%",
			left: {
				type: LITERAL,
				value: 10,
			},
			right: {
				type: LITERAL,
				value: 3,
			},
		},
		{
			type: BINARY,
			operator: "%",
			left: {
				type: LITERAL,
				value: 10,
			},
			right: {
				type: LITERAL,
				value: 7,
			},
		},
	],
});

test("Sequence with division", "(10 / 2, 10 / 4)", 2.5, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "/",
			left: {
				type: LITERAL,
				value: 10,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: BINARY,
			operator: "/",
			left: {
				type: LITERAL,
				value: 10,
			},
			right: {
				type: LITERAL,
				value: 4,
			},
		},
	],
});

test("Sequence with comparisons", "(1 < 2, 1 > 2, 1 <= 1, 2 >= 2)", true, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "<",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: BINARY,
			operator: ">",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: BINARY,
			operator: "<=",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 1,
			},
		},
		{
			type: BINARY,
			operator: ">=",
			left: {
				type: LITERAL,
				value: 2,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
	],
});

test("Sequence with equality", "(1 == 1, 1 === 1, 1 != 2, 1 !== 2)", true, {
	type: SEQUENCE,
	expressions: [
		{
			type: BINARY,
			operator: "==",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 1,
			},
		},
		{
			type: BINARY,
			operator: "===",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 1,
			},
		},
		{
			type: BINARY,
			operator: "!=",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
		{
			type: BINARY,
			operator: "!==",
			left: {
				type: LITERAL,
				value: 1,
			},
			right: {
				type: LITERAL,
				value: 2,
			},
		},
	],
});

const returnValue = (a) => a;
test(
	"Sequence in function argument",
	"returnValue((1, 2, 3))",
	3,
	{
		type: CALL,
		callee: {
			type: IDENTIFIER,
			name: "returnValue",
		},
		parameters: [
			{
				type: SEQUENCE,
				expressions: [
					{
						type: LITERAL,
						value: 1,
					},
					{
						type: LITERAL,
						value: 2,
					},
					{
						type: LITERAL,
						value: 3,
					},
				],
			},
		],
	},
	{
		returnValue,
	},
	{
		returnValue,
	},
);

test(
	"Sequence as return value from function",
	"(() => { return (1, 2, 3); })()",
	3,
	{
		type: CALL,
		callee: {
			type: ARROW,
			body: {
				type: RETURN,
				argument: {
					type: SEQUENCE,
					expressions: [
						{
							type: LITERAL,
							value: 1,
						},
						{
							type: LITERAL,
							value: 2,
						},
						{
							type: LITERAL,
							value: 3,
						},
					],
				},
			},
			parameters: [],
		},
		parameters: [],
	},
);

test(
	"Sequence multiple assignments chained",
	"(a = 1, b = a + 1, c = b + 1)",
	3,
	{
		type: SEQUENCE,
		expressions: [
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "a",
				},
				operator: "=",
				right: {
					type: LITERAL,
					value: 1,
				},
			},
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "b",
				},
				operator: "=",
				right: {
					type: BINARY,
					operator: "+",
					left: {
						type: IDENTIFIER,
						name: "a",
					},
					right: {
						type: LITERAL,
						value: 1,
					},
				},
			},
			{
				type: ASSIGN,
				left: {
					type: IDENTIFIER,
					name: "c",
				},
				operator: "=",
				right: {
					type: BINARY,
					operator: "+",
					left: {
						type: IDENTIFIER,
						name: "b",
					},
					right: {
						type: LITERAL,
						value: 1,
					},
				},
			},
		],
	},
	{},
	{
		a: 1,
		b: 2,
		c: 3,
	},
);

test("Sequence in return statement", "((x) => { return (x, x * 2); })(5)", 10, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: RETURN,
			argument: {
				type: SEQUENCE,
				expressions: [
					{
						type: IDENTIFIER,
						name: "x",
					},
					{
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
				],
			},
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "x",
			},
		],
	},
	parameters: [
		{
			type: LITERAL,
			value: 5,
		},
	],
});

test("Sequence nested in arrow", "(a => (b => (a, b))(10))(5)", 10, {
	type: CALL,
	callee: {
		type: ARROW,
		body: {
			type: CALL,
			callee: {
				type: ARROW,
				body: {
					type: SEQUENCE,
					expressions: [
						{
							type: IDENTIFIER,
							name: "a",
						},
						{
							type: IDENTIFIER,
							name: "b",
						},
					],
				},
				parameters: [
					{
						type: IDENTIFIER,
						name: "b",
					},
				],
			},
			parameters: [
				{
					type: LITERAL,
					value: 10,
				},
			],
		},
		parameters: [
			{
				type: IDENTIFIER,
				name: "a",
			},
		],
	},
	parameters: [
		{
			type: LITERAL,
			value: 5,
		},
	],
});
