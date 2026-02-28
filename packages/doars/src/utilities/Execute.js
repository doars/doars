// Import context.
import { createAutoContexts } from "./Context.js";

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
 * @param {object|null} options Optional options object.
 * @returns {any} Result of expression.
 */
export const execute = (
	component,
	attribute,
	expression,
	extra = null,
	options = null,
) => {
	// Create function context.
	const { contexts, destroy } = createAutoContexts(component, attribute, extra);

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

	// Invoke destroy.
	destroy();

	if (!options || options?.return) {
		return result;
	}
};

export default {
	execute,
};
