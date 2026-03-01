const EVENT_NAME = "updated";
const INITIALIZED = Symbol("INITIALIZED");

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
	// Exit early if no listeners can be found.
	if (!attribute[INITIALIZED]) {
		return;
	}

	const library = component.getLibrary();
	const name = "updated";

	// Remove existing listener and delete directive data.
	library.removeEventListener(name, attribute[INITIALIZED].handler);
	delete attribute[INITIALIZED];
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
		if (attribute[INITIALIZED]) {
			// Exit early if listener has not changed.
			if (attribute[INITIALIZED].value === value) {
				return;
			}

			// Remove existing listener so we don' listen twice.
			library.removeEventListener(EVENT_NAME, attribute[INITIALIZED].handler);
			delete attribute[INITIALIZED];
		}

		const handler = () => {
			// Execute value using a copy of the attribute since this attribute does not need to update based on what it accesses.
			processExpression(
				component,
				attribute.clone(),
				value,
				{},
				{ return: false },
			);

			// Call destroy.
			destroy(component, attribute);
		};

		// Add listener to component.
		library.addEventListener(EVENT_NAME, handler, {
			once: true,
		});

		// Store listener data on the component.
		attribute[INITIALIZED] = {
			handler,
			value,
		};
	},

	destroy,
});
