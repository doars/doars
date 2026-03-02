import { CALL, IDENTIFIER, LITERAL, MEMBER } from "../../src/types.js";
import test from "./utilities/test.js";

test(
	"Member",
	"hello.there",
	"general kenobi",
	{
		computed: false,
		object: {
			name: "hello",
			type: IDENTIFIER,
		},
		property: {
			name: "there",
			type: IDENTIFIER,
		},
		type: MEMBER,
	},
	{
		hello: {
			there: "general kenobi",
		},
	},
	{
		hello: {
			there: "general kenobi",
		},
	},
);

test(
	"Member",
	"hello.there.general",
	"kenobi",
	{
		computed: false,
		object: {
			computed: false,
			object: {
				name: "hello",
				type: IDENTIFIER,
			},
			property: {
				name: "there",
				type: IDENTIFIER,
			},
			type: MEMBER,
		},
		property: {
			name: "general",
			type: IDENTIFIER,
		},
		type: MEMBER,
	},
	{
		hello: {
			there: {
				general: "kenobi",
			},
		},
	},
	{
		hello: {
			there: {
				general: "kenobi",
			},
		},
	},
);

test(
	"Member computed",
	'hello["there"]',
	"general kenobi",
	{
		computed: true,
		object: {
			name: "hello",
			type: IDENTIFIER,
		},
		property: {
			type: LITERAL,
			value: "there",
		},
		type: MEMBER,
	},
	{
		hello: {
			there: "general kenobi",
		},
	},
	{
		hello: {
			there: "general kenobi",
		},
	},
);

test(
	"Member computed",
	"hello[there]",
	"kenobi",
	{
		computed: true,
		object: {
			name: "hello",
			type: IDENTIFIER,
		},
		property: {
			name: "there",
			type: IDENTIFIER,
		},
		type: MEMBER,
	},
	{
		hello: {
			general: "kenobi",
		},
		there: "general",
	},
	{
		hello: {
			general: "kenobi",
		},
		there: "general",
	},
);

test(
	"Optional chaining member",
	"hello?.there",
	"kenobi",
	{
		computed: false,
		object: {
			name: "hello",
			type: IDENTIFIER,
		},
		optional: true,
		property: {
			name: "there",
			type: IDENTIFIER,
		},
		type: MEMBER,
	},
	{
		hello: {
			there: "kenobi",
		},
	},
	{
		hello: {
			there: "kenobi",
		},
	},
);

test(
	"Optional chaining member on null",
	"hello?.there",
	undefined,
	{
		computed: false,
		object: {
			name: "hello",
			type: IDENTIFIER,
		},
		optional: true,
		property: {
			name: "there",
			type: IDENTIFIER,
		},
		type: MEMBER,
	},
	{
		hello: null,
	},
	{
		hello: null,
	},
);

const chainingCall = () => "result";
test(
	"Optional chaining call",
	"hello?.there()",
	"result",
	{
		type: CALL,
		parameters: [],
		callee: {
			type: MEMBER,
			computed: false,
			object: {
				name: "hello",
				type: IDENTIFIER,
			},
			optional: true,
			property: {
				name: "there",
				type: IDENTIFIER,
			},
		},
	},
	{
		hello: {
			there: chainingCall,
		},
	},
	{
		hello: {
			there: chainingCall,
		},
	},
);

test(
	"Optional chaining call on null",
	"hello?.there()",
	undefined,
	{
		type: CALL,
		parameters: [],
		callee: {
			type: MEMBER,
			computed: false,
			object: {
				name: "hello",
				type: IDENTIFIER,
			},
			optional: true,
			property: {
				name: "there",
				type: IDENTIFIER,
			},
		},
	},
	{
		hello: null,
	},
	{
		hello: null,
	},
);
