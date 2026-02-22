/**
 * @file run.js
 * @description Expression interpreter that evaluates parsed AST nodes and executes them against a context.
 * This is the runtime execution engine that takes the AST produced by parse.js and evaluates it.
 */

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
	RETURN,
	SEQUENCE,
	SPREAD,
	TEMPLATE,
	UNARY,
	UPDATE,
} from "./types.js";

/**
 * Assigns a value to a context location based on the node type. Handles both simple identifier assignments (x = 5) and member assignments (obj.prop = 5).
 *
 * @param {Object} node - The AST node representing the assignment target.
 * @param {*} value - The value to assign.
 * @param {Object} [context={}] - The context object where values are stored.
 * @returns {*} The assigned value.
 * @throws {Error} If the assignment target is not supported.
 */
const setToContext = (node, value, context = {}) => {
	switch (node.type) {
		case IDENTIFIER:
			// Assign to
			context[node.name] = value;
			return value;

		case MEMBER: {
			const memberObject = run(node.object, context);
			const memberProperty =
				node.computed || node.property.type !== IDENTIFIER
					? run(node.property, context)
					: node.property.name;
			if (typeof value === "function") {
				return value.bind(memberObject);
			}
			memberObject[memberProperty] = value;
			return value;
		}
	}

	throw new Error("Unsupported assignment method.");
};

/**
 * Recursively evaluates an AST node or array of nodes against a context. This is the main execution function that handles all node types.
 *
 * @param {Object|Array} node - The AST node(s) to evaluate.
 * @param {Object} [context={}] - The context object containing variable values.
 * @returns {*} The result of evaluating the node.
 * @throws {Error} If an unexpected node type is encountered.
 */
const run = (node, context = {}) => {
	if (!node) {
		return;
	}

	if (Array.isArray(node)) {
		if (node.length === 1 && node[0].type === ARROW) {
			const arrowFn = run(node[0], context);
			const args = node[0].parameters.map((param) => {
				if (param.type === IDENTIFIER) {
					return context[param.name];
				}
				return undefined;
			});
			return [arrowFn(...args)];
		}
		const results = [];
		for (const nodeItem of node) {
			const result = run(nodeItem, context);
			// Iterate until a return type is encountered.
			if (nodeItem.type === RETURN) {
				results.push(result);
				break;
			}
			results.push(result);
		}
		return results;
	}

	switch (node.type) {
		// Array literal - evaluates each element and returns as array.
		case ARRAY: {
			const arrayResults = [];
			for (const arrayElement of node.elements) {
				if (arrayElement.type === SPREAD) {
					arrayResults.push(...run(arrayElement.arguments, context));
				} else {
					arrayResults.push(run(arrayElement, context));
				}
			}
			return arrayResults;
		}

		// Arrow function - returns a function that executes the body with the provided parameters.
		case ARROW: {
			return (...args) => {
				const localContext = { ...context };
				for (let i = 0; i < node.parameters.length; i++) {
					const param = node.parameters[i];
					if (param.type === IDENTIFIER) {
						localContext[param.name] = args[i];
					}
				}
				const result = run(node.body, localContext);
				if (result?.type === RETURN) {
					return result.value;
				}
				return result;
			};
		}

		// Assignment operation - handles both simple (=) and compound assignments (+=, *=, etc.).
		case ASSIGN: {
			let assignmentValue = run(node.right, context);
			// Modify value if not a direct assignment.
			if (node.operator !== "=") {
				const assignmentLeft = run(node.left, context);
				switch (node.operator) {
					case "-=":
						assignmentValue = assignmentLeft - assignmentValue;
						break;
					case "??=":
						if (assignmentLeft !== null && assignmentLeft !== undefined) {
							return assignmentLeft;
						}
						break;
					case "*=":
						assignmentValue = assignmentLeft * assignmentValue;
						break;
					case "**=":
						assignmentValue = assignmentLeft ** assignmentValue;
						break;
					case "/=":
						assignmentValue = assignmentLeft / assignmentValue;
						break;
					case "&=":
						assignmentValue = assignmentLeft & assignmentValue;
						break;
					case "&&=":
						if (!assignmentLeft) {
							return assignmentLeft;
						}
						break;
					case "%=":
						assignmentValue = assignmentLeft % assignmentValue;
						break;
					case "^=":
						assignmentValue = assignmentLeft ^ assignmentValue;
						break;
					case "+=":
						assignmentValue = assignmentLeft + assignmentValue;
						break;
					case "<<=":
						assignmentValue = assignmentLeft << assignmentValue;
						break;
					case ">>=":
						assignmentValue = assignmentLeft >> assignmentValue;
						break;
					case ">>>=":
						assignmentValue = assignmentLeft >>> assignmentValue;
						break;
					case "|=":
						assignmentValue = assignmentLeft | assignmentValue;
						break;
					case "||=":
						if (assignmentLeft) {
							return assignmentLeft;
						}
						break;
				}
			}
			return setToContext(node.left, assignmentValue, context);
		}

		// Binary operations - arithmetic, comparison, and logical operators.
		case BINARY: {
			const binaryLeft = run(node.left, context);
			const binaryRight = run(node.right, context);
			switch (node.operator) {
				case "-":
					return binaryLeft - binaryRight;
				case "!=":
					return binaryLeft !== binaryRight;
				case "!==":
					return binaryLeft !== binaryRight;
				case "??":
					return binaryLeft ?? binaryRight;
				case "*":
					return binaryLeft * binaryRight;
				case "**":
					return binaryLeft ** binaryRight;
				case "/":
					return binaryLeft / binaryRight;
				case "&":
					return binaryLeft & binaryRight;
				case "&&":
					return binaryLeft && binaryRight;
				case "%":
					return binaryLeft % binaryRight;
				case "^":
					return binaryLeft ^ binaryRight;
				case "+":
					return binaryLeft + binaryRight;
				case "<":
					return binaryLeft < binaryRight;
				case "<<":
					return binaryLeft << binaryRight;
				case "<=":
					return binaryLeft <= binaryRight;
				case "==":
					return binaryLeft === binaryRight;
				case "===":
					return binaryLeft === binaryRight;
				case ">":
					return binaryLeft > binaryRight;
				case ">=":
					return binaryLeft >= binaryRight;
				case ">>":
					return binaryLeft >> binaryRight;
				case ">>>":
					return binaryLeft >>> binaryRight;
				case "|":
					return binaryLeft | binaryRight;
				case "||":
					return binaryLeft || binaryRight;
			}
			throw new Error(`Unsupported operator: ${node.operator}`);
		}

		// Function call - evaluates callee and arguments, then invokes the function.
		case CALL: {
			const parameters = [];
			for (const parameter of node.parameters) {
				if (parameter.type === SPREAD) {
					parameters.push(...run(parameter.arguments, context));
				} else {
					parameters.push(run(parameter, context));
				}
			}
			return run(node.callee, context)(...parameters);
		}

		// Ternary conditional - evaluates condition and returns consequent or alternate.
		case CONDITION:
			return run(node.condition, context)
				? run(node.consequent, context)
				: run(node.alternate, context);

		// Variable lookup - retrieves value from context by identifier name.
		case IDENTIFIER:
			return context[node.name];

		// Literal values - returns the raw value directly.
		case LITERAL:
			return node.value;

		// Member access - evaluates object.property or object[property].
		case MEMBER: {
			const memberObject = run(node.object, context);
			const memberProperty =
				node.computed || node.property.type !== IDENTIFIER
					? run(node.property, context)
					: node.property.name;
			if (typeof memberObject[memberProperty] === "function") {
				return memberObject[memberProperty].bind(memberObject);
			}
			return memberObject[memberProperty];
		}

		// Object literal - evaluates each property and builds an object.
		case OBJECT: {
			const objectResult = {};
			for (const objectProperty of node.properties) {
				// Expects each property to be of type PROPERTY.
				objectResult[
					objectProperty.computed || objectProperty.key.type !== IDENTIFIER
						? run(objectProperty.key, context)
						: objectProperty.key.name
				] = run(objectProperty.value, context);
			}
			return objectResult;
		}

		// Return statement - returns the argument value and signals to stop execution.
		case RETURN:
			if (node.argument) {
				return run(node.argument, context);
			}
			return undefined;

		// Sequence expression - evaluates multiple expressions and returns results as array.
		case SEQUENCE:
			return node.expressions.map((node) => run(node, context));

		case SPREAD:
			return run(node.arguments, context);

		case TEMPLATE:
			return node.elements
				.map(
					(element, index) =>
						element +
						(index < node.expressions.length
							? run(node.expressions[index], context).toString()
							: ""),
				)
				.join("");

		// Unary operations - logical negation, numeric negation, and numeric conversion.
		case UNARY: {
			const unaryParameter = run(node.parameter, context);
			switch (node.operator) {
				case "-":
					return -unaryParameter;
				case "!":
					return !unaryParameter;
				case "+":
					return +unaryParameter;
				case "~":
					return ~unaryParameter;
			}
			throw new Error(`Unsupported operator: ${node.operator}`);
		}

		// Update operations - prefix/postfix increment and decrement (++, --).
		case UPDATE: {
			const updateResult = run(node.parameter, context);
			const updateValue = node.operator === "--" ? -1 : 1;
			setToContext(node.parameter, updateResult + updateValue, context);
			return node.prefix ? updateResult + updateValue : updateResult;
		}
	}

	throw new Error(`Unexpected node type "${node.type}".`);
};

export default run;
