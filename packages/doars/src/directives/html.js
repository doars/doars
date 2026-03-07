// Import utilities.
import { decode } from "@doars/common/src/utilities/Html.js";
import { morphTree } from "@doars/common/src/utilities/Morph.js";
import { isPromise } from "@doars/common/src/utilities/Promise.js";
import { readdScripts } from "@doars/common/src/utilities/Script.js";

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the html directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({ allowInlineScript, htmlDirectiveName }) => ({
	name: htmlDirectiveName,

	update: (component, attribute, processExpression) => {
		// Deconstruct attribute.
		const element = attribute.getElement();
		const modifiers = attribute.getModifiers();

		const setHtml = (html) => {
			// Clone and set html as child(ren) for type element(s).
			if (html instanceof Node) {
				if (modifiers.clone) {
					html = html.cloneNode(true);
				}
				if (modifiers.outer) {
					element.insertAdjacentElement("beforebegin", html);
					element.remove();
				} else {
					for (const staleChild of element.children) {
						staleChild.remove();
					}

					element.append(html);
				}
				return;
			}
			if (html instanceof NodeList) {
				if (modifiers.outer) {
					for (let newChild of html) {
						if (modifiers.clone) {
							newChild = newChild.cloneNode(true);
						}
						element.insertAdjacentElement("beforebegin", newChild);
					}
					element.remove();
				} else {
					for (const staleChild of element.children) {
						staleChild.remove();
					}

					for (let newChild of html) {
						if (modifiers.clone) {
							newChild = newChild.cloneNode(true);
						}
						element.append(newChild);
					}
				}
				return;
			}

			if (typeof html === "string") {
				if (modifiers.decode) {
					html = decode(html);
				}

				if (modifiers.morph) {
					if (modifiers.outer) {
						// Morph the element as well.
						morphTree(element, html);
					} else {
						// Ensure element only has one child.
						if (element.children.length === 0) {
							element.append(document.createElement("div"));
						} else if (element.children.length > 1) {
							for (let i = element.children.length - 1; i >= 1; i--) {
								element.children[i].remove();
							}
						}

						// Morph first child to given element tree.
						const root = morphTree(element.children[0], html);
						if (!element.children[0].isSameNode(root)) {
							element.children[0].remove();
							element.append(root);
						}
					}
				} else if (modifiers.outer) {
					if (element.outerHTML !== html) {
						element.outerHTML = html;
						if (allowInlineScript || modifiers.script) {
							readdScripts(element);
						}
					}
				} else if (element.innerHTML !== html) {
					element.innerHTML = html;
					if (allowInlineScript || modifiers.script) {
						readdScripts(...element.children);
					}
				}
				return;
			}

			console.error(
				`Doars: Unknown type returned to "${attribute.getDirective()}" directive.`,
			);
		};

		// Execute value and retrieve result.
		const result = processExpression(
			component,
			attribute,
			attribute.getValue(),
		);

		// Store results.
		attribute.setData(result);

		// Handle promises.
		if (isPromise(result)) {
			Promise.resolve(result).then((resultResolved) => {
				// If stored data has changed then this promise should be ignored.
				if (attribute.getData() !== result) {
					return;
				}

				setHtml(resultResolved);
			});
		} else {
			setHtml(result);
		}
	},
});
