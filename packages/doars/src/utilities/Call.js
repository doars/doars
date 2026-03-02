import { getDeeply } from "@doars/common/src/utilities/Object.js";
import { createContexts } from "./Context.js";

const PATH_VALIDATOR = /^[a-z$_]+[0-9a-z$_]*(?:\.[a-z$_]+[0-9a-z$_]*)*$/is;

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
export const call = (
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

	// Get result from the expression.
	expression = expression.trim();
	let result;
	if (!PATH_VALIDATOR.test(expression)) {
		console.error(
			"Error encountered when executing an expression. Expression is not a valid dot separated path: ",
			expression,
		);
		result = null;
	} else {
		result = getDeeply(contexts, expression.split("."));
		if (typeof result === "function") {
			try {
				result = result(contexts);
			} catch (error) {
				console.error(
					"ExpressionError in:",
					expression,
					`\n${error.name}: ${error.message}`,
				);
				result = null;
			}
		}
	}

	destroy();

	if (!options || options?.return) {
		return result;
	}
};

export default {
	call,
};
