// Import context.
import { createContexts } from "./Context.js";

/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 */

/**
 * Executes value in the correct context.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {string} expression Expression to execute.
 * @param {object|null} extra Optional extra context items.
 * @param {object|null} options Optional options for the expression, for example whether a value needs to be returned, or whether access needs to be logged to the attribute.
 * @returns {any} Result of expression.
 */
export const execute = (
	component,
	attribute,
	expression,
	extra = null,
	options = null,
) => {
	const { contexts, destroy } = createContexts(
		component,
		attribute,
		extra,
		options,
	);

	// Try to execute code.
	let result;
	try {
		result = new Function(
			...Object.keys(contexts),
			(!options || options?.return ? "return " : "") + expression,
		)(...Object.values(contexts));
	} catch (error) {
		console.error(
			"ExpressionError in:",
			expression,
			`\n${error.name}: ${error.message}`,
		);
		result = null;
	}

	destroy();

	if (!options || options?.return) {
		return result;
	}
};

export default {
	execute,
};
