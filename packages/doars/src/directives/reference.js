/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the reference directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({ referencesContextName, referenceDirectiveName }) => ({
	name: referenceDirectiveName,

	update: (component, attribute, processExpression) => {
		// Deconstruct component.
		const library = component.getLibrary();
		const componentId = component.getId();

		// Deconstruct attribute.
		const directive = attribute.getDirective();
		const element = attribute.getElement();
		const attributeId = attribute.getId();

		const { referenceDirectiveEvaluate } = library.getOptions();

		// Process attribute name.
		let name = attribute.getValue();
		name = referenceDirectiveEvaluate
			? processExpression(component, attribute, name)
			: name.trim();

		// Check if value is a valid variable name.
		if (
			!name ||
			typeof name !== "string" ||
			!/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(name)
		) {
			destroy(component, attribute);
			console.warn(
				'Doars: "' +
					directive +
					'" directive\'s value not a valid variable name: "' +
					name.toString() +
					'".',
			);
			return;
		}

		// Add refernce to data.
		const data = component.getData(referenceDirectiveName) ?? {};
		data[attributeId] = {
			element,
			name,
		};
		component.setData(referenceDirectiveName, data);

		// Remove context cache.
		component.setData(referencesContextName, null);

		// Trigger references update.
		library.update(`${componentId}:${referencesContextName}.${name}`);
	},

	/**
	 * Destroys the directive.
	 * @param {Component} component The component the directive is part of.
	 * @param {Attribute} attribute The attribute the directive is part of.
	 * @returns {void}
	 */
	destroy: (component, attribute) => {
		// Exit early if not set.
		const referencesData = component.getData(referenceDirectiveName);
		if (!referencesData) {
			return;
		}

		// Deconstruct attribute.
		const attributeId = attribute.getId();

		// Exit early if not the same attribute.
		const referenceData = referencesData[attributeId];
		if (!referenceData) {
			return;
		}

		// Deconstruct component.
		const library = component.getLibrary();
		const componentId = component.getId();

		// Remove reference from object.
		delete referencesData[attributeId];

		// Remove context cache.
		component.setData(referencesContextName, null);

		// Remove object if it is empty now.
		if (Object.keys(referencesData).length === 0) {
			component.setData(referenceDirectiveName, null);
		}
		// Otherwise we don't need to write the data back since we got an object reference.

		// Trigger references update.
		library.update(
			`${componentId}:${referencesContextName}.${referenceData.name}`,
		);
	},
});
