import {
	BINARY,
	CALL,
	IDENTIFIER,
	LITERAL,
	MEMBER,
	TEMPLATE,
} from "../../src/types.js";
import test from "./utilities/test.js";

// Simple template literal with no expressions (behaves like a string)
test("Template literal no expressions", "`hello world`", "hello world", {
	type: TEMPLATE,
	elements: ["hello world"],
	expressions: [],
});

// Template literal with single expression
test(
	"Template literal single expression",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`Hello, ${name}!`",
	"Hello, Alice!",
	{
		type: TEMPLATE,
		elements: ["Hello, ", "!"],
		expressions: [
			{
				type: IDENTIFIER,
				name: "name",
			},
		],
	},
	{
		name: "Alice",
	},
	{
		name: "Alice",
	},
);

// Template literal with multiple expressions
test(
	"Template literal multiple expressions",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`${greeting}, ${name}!`",
	"Hello, Bob!",
	{
		type: TEMPLATE,
		elements: ["", ", ", "!"],
		expressions: [
			{
				type: IDENTIFIER,
				name: "greeting",
			},
			{
				type: IDENTIFIER,
				name: "name",
			},
		],
	},
	{
		greeting: "Hello",
		name: "Bob",
	},
	{
		greeting: "Hello",
		name: "Bob",
	},
);

// Template literal with literal expression
test(
	"Template literal with literal",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`Count: ${5}`",
	"Count: 5",
	{
		type: TEMPLATE,
		elements: ["Count: ", ""],
		expressions: [
			{
				type: LITERAL,
				value: 5,
			},
		],
	},
);

// Template literal with binary expression
test(
	"Template literal with binary expression",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`Sum: ${x + y}`",
	"Sum: 15",
	{
		type: TEMPLATE,
		elements: ["Sum: ", ""],
		expressions: [
			{
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
		],
	},
	{
		x: 10,
		y: 5,
	},
	{
		x: 10,
		y: 5,
	},
);

// Template literal with member expression
test(
	"Template literal with member expression",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`Name: ${user.name}`",
	"Name: John",
	{
		type: TEMPLATE,
		elements: ["Name: ", ""],
		expressions: [
			{
				type: MEMBER,
				computed: false,
				object: {
					type: IDENTIFIER,
					name: "user",
				},
				property: {
					type: IDENTIFIER,
					name: "name",
				},
			},
		],
	},
	{
		user: {
			name: "John",
		},
	},
	{
		user: {
			name: "John",
		},
	},
);

// Template literal with nested template (expression inside expression)
const resolve42 = () => 42;
test(
	"Template literal with function call",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`Result: ${getValue()}`",
	"Result: 42",
	{
		type: TEMPLATE,
		elements: ["Result: ", ""],
		expressions: [
			{
				type: CALL,
				callee: {
					type: IDENTIFIER,
					name: "getValue",
				},
				parameters: [],
			},
		],
	},
	{
		getValue: resolve42,
	},
	{
		getValue: resolve42,
	},
);

// Template literal with multiple lines
test("Template literal multiline", "`Line 1\nLine 2`", "Line 1\nLine 2", {
	type: TEMPLATE,
	elements: ["Line 1\nLine 2"],
	expressions: [],
});

// Template literal with escaped backticks
test(
	"Template literal with escaped backtick",
	"`Use \\`code\\``",
	"Use `code`",
	{
		type: TEMPLATE,
		elements: ["Use `code`"],
		expressions: [],
	},
);

// Template literal with escaped dollar
test(
	"Template literal with escaped dollar",
	"`Price: $${price}`",
	"Price: $50",
	{
		type: TEMPLATE,
		elements: ["Price: $", ""],
		expressions: [
			{
				type: IDENTIFIER,
				name: "price",
			},
		],
	},
	{
		price: 50,
	},
	{
		price: 50,
	},
);

// Complex template with multiple complex expressions
test(
	"Template literal complex",
	// biome-ignore lint/suspicious/noTemplateCurlyInString: Purposeful testing of templates in strings
	"`${user.name} has ${user.items.length} items worth $${total}`",
	"Alice has 5 items worth $100",
	{
		type: TEMPLATE,
		elements: ["", " has ", " items worth $", ""],
		expressions: [
			{
				type: MEMBER,
				computed: false,
				object: {
					type: IDENTIFIER,
					name: "user",
				},
				property: {
					type: IDENTIFIER,
					name: "name",
				},
			},
			{
				type: MEMBER,
				computed: false,
				object: {
					type: MEMBER,
					computed: false,
					object: {
						type: IDENTIFIER,
						name: "user",
					},
					property: {
						type: IDENTIFIER,
						name: "items",
					},
				},
				property: {
					type: IDENTIFIER,
					name: "length",
				},
			},
			{
				type: IDENTIFIER,
				name: "total",
			},
		],
	},
	{
		user: {
			name: "Alice",
			items: [1, 2, 3, 4, 5],
		},
		total: 100,
	},
	{
		user: {
			name: "Alice",
			items: [1, 2, 3, 4, 5],
		},
		total: 100,
	},
);

// Template literal with escaped backticks
test("Template literal with call", "`Hello world`.length", 11, {
	computed: false,
	object: {
		elements: ["Hello world"],
		expressions: [],
		type: TEMPLATE,
	},
	property: {
		name: "length",
		type: IDENTIFIER,
	},
	type: MEMBER,
});
