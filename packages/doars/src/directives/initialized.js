const EVENT_NAME = "updated";

/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Destroys the directive.
 * @param {Component} component The component the directive is part of.
 * @param {Attribute} attribute The attribute the directive is part of.
 * @returns {undefined}
 */
const destroy = (component, attribute) => {
	const data = attribute.getData();
	if (data) {
		const library = component.getLibrary();

		// Remove existing listener and delete directive data.
		library.removeEventListener(EVENT_NAME, data.handler);
		attribute.setData();
	}
};

/**
 * Create the initialized directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({ initializedDirectiveName }) => ({
	name: initializedDirectiveName,

	update: (component, attribute, processExpression) => {
		const library = component.getLibrary();
		const value = attribute.getValue();

		// Check if existing listener exists.
		const data = attribute.getData();
		if (data) {
			// Exit early if listener has not changed.
			if (data.value !== value) {
				// Remove existing listener so we don' listen twice.
				library.removeEventListener(EVENT_NAME, data.handler);
				attribute.setData(null);
			}
		}

		const handler = () => {
			// Execute value using a copy of the attribute since this attribute does not need to update based on what it accesses.
			processExpression(component, attribute, value, null, {
				access: false,
				return: false,
			});

			// Call destroy.
			destroy(component, attribute);
		};

		library.addEventListener(EVENT_NAME, handler, {
			once: true,
		});

		// Store listener data on the component.
		attribute.setData({
			handler,
			value,
		});
	},

	destroy,
});
