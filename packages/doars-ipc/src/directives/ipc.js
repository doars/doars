/**
 * @typedef {import('@doars/doars').default} Doars
 * @typedef {import('@doars/doars/src/Attribute.js').default} Attribute
 * @typedef {import('@doars/doars/src/Component.js').default} Component
 * @typedef {import('@doars/doars/src/Directive.js').Directive} Directive
 * @typedef {import('@doars/doars/src/Directive.js').DirectiveUtilities} DirectiveUtilities
 * @typedef {import('@doars/common/src/polyfills/IntersectionDispatcher.js').default} IntersectionDispatcher
 */

// Import utilities.
import {
	fromString as elementFromString,
	select as selectFromElement,
} from "@doars/common/src/utilities/Element.js";
import { decode } from "@doars/common/src/utilities/Html.js";
import {
	hideIndicator,
	showIndicator,
} from "@doars/common/src/utilities/Indicator.js";
import { morphTree } from "@doars/common/src/utilities/Morph.js";
import { isPromise } from "@doars/common/src/utilities/Promise.js";
import { readdScripts } from "@doars/common/src/utilities/Script.js";

const IPC = Symbol("IPC");

const EXECUTION_MODIFIERS = {
	NONE: 0,
	BUFFER: 1,
	DEBOUNCE: 2,
	THROTTLE: 5,
	DELAY: 6,
};

/**
 * @typedef DirectiveOptions
 * @type {object}
 * @property {string} ipcDirectiveName - The name of the IPC directive.
 * @property {string|false} intersectionEvent - The name of the intersect special event listener.
 * @property {string|false} loadedEvent - The name of the load special event listener.
 */

/**
 * @param {DirectiveOptions} options Options used for creating the directive.
 * @param {IntersectionDispatcher} intersectionDispatcher An intersection event dispatcher that directives can listen to.
 * @returns {Directive} Created ipc directive.
 */
export default (
	{
		ipcDirectiveName,

		intersectionEvent,

		loadedEvent,
	},
	ipcInstance,
	intersectionDispatcher,
) => ({
	name: ipcDirectiveName,

	update: (component, attribute, processExpression) => {
		// Destruct component.
		const library = component.getLibrary();
		const libraryOptions = library.getOptions();

		// Deconstruct attribute.
		const element = attribute.getElement();
		const directive = attribute.getDirective();
		const modifiers = Object.assign({}, attribute.getModifiers());
		const value = attribute.getValue();

		// Handle forms differently since the form values need to be used.
		const isForm = element.tagName === "FORM";
		const isButton = element.tagName === "BUTTON";
		const isInput = element.tagName === "INPUT" || element.tagName === "SELECT";

		// Check if existing listener exists.
		if (attribute[IPC]) {
			// Exit early if value has not changed.
			if (attribute[IPC].value === value) {
				return;
			}

			// Remove existing listener so we don't listen twice.
			attribute[IPC].target.removeEventListener(
				attribute[IPC].eventName,
				attribute[IPC].handler,
			);

			// Clear any ongoing timeouts.
			if (attribute[IPC].timeout) {
				clearTimeout(attribute[IPC].timeout);
			}

			// Delete directive data.
			delete attribute[IPC];
		}

		// Process modifiers.

		const position = modifiers.position
			? modifiers.position.toLowerCase()
			: null;

		// Set listener options.
		const listenerOptions = {};
		if (modifiers.capture) {
			listenerOptions.capture = true;
		}
		if (modifiers.once) {
			listenerOptions.once = true;
		}
		if (modifiers.passive && !modifiers.prevent) {
			listenerOptions.passive = true;
		}

		// Process execution modifiers.
		let executionModifier = EXECUTION_MODIFIERS.NONE;
		if (modifiers.buffer) {
			executionModifier = EXECUTION_MODIFIERS.BUFFER;
			if (modifiers.buffer === true) {
				modifiers.buffer = 5;
			}
		} else if (modifiers.debounce) {
			executionModifier = EXECUTION_MODIFIERS.DEBOUNCE;
			if (modifiers.debounce === true) {
				modifiers.debounce = 500;
			}
		} else if (modifiers.throttle) {
			executionModifier = EXECUTION_MODIFIERS.THROTTLE;
			if (modifiers.throttle === true) {
				modifiers.throttle = 500;
			}
		} else if (modifiers.delay) {
			executionModifier = EXECUTION_MODIFIERS.DELAY;
			if (modifiers.delay === true) {
				modifiers.delay = 500;
			}
		}

		if (modifiers.poll === true) {
			modifiers.poll = 60000; // One minute.
		}

		let eventName = "click";
		if (modifiers.on) {
			eventName = modifiers.on;
		} else if (isForm) {
			eventName = "submit";
		} else if (isInput) {
			eventName = "change";
		} else if (modifiers.poll) {
			eventName = loadedEvent;
		}

		const dispatchEvent = (suffix = "", data = {}) => {
			element.dispatchEvent(
				new CustomEvent(`${libraryOptions.prefix}-${directive}${suffix}`, {
					detail: Object.assign(
						{
							attribute,
							component,
						},
						data,
					),
				}),
			);
		};

		/**
		 * Perform a request.
		 * @param {string} functionName The name of the function to call.
		 * @returns {void}
		 */
		const requestHandler = (functionName) => {
			let body = null;
			if (isForm) {
				const formData = new FormData(element);
				body = Object.fromEntries(formData);
			}

			dispatchEvent("-started", {
				url: functionName,
			});

			return ipcInstance
				.call(functionName, body)
				.then((html) => {
					isLoading = false;

					// Decode string.
					if (modifiers.decode) {
						html = decode(html);
					}

					/** @type {HTMLElement | null} */
					let target = null;
					if (modifiers.document) {
						target = document.documentElement;
					} else {
						const attributeName =
							libraryOptions.prefix +
							"-" +
							directive +
							"-" +
							libraryOptions.targetDirectiveName;
						if (element.getAttribute(attributeName)) {
							if (libraryOptions.targetDirectiveEvaluate) {
								target = processExpression(
									component,
									attribute,
									element.getAttribute(attributeName),
								);
							} else {
								target = element.getAttribute(attributeName);
							}
							if (target && typeof target === "string") {
								target = element.querySelector(target);
							}
						}
						if (!target) {
							target = element;
						}
					}

					// Update target.
					if (position === "append") {
						const child = selectFromElement(
							elementFromString(html),
							component,
							attribute,
							processExpression,
						);
						target.append(child);
						if (libraryOptions.allowInlineScript || modifiers.script) {
							readdScripts(child);
						}
					} else if (position === "prepend") {
						const child = selectFromElement(
							elementFromString(html),
							component,
							attribute,
							processExpression,
						);
						target.prepend(child);
						if (libraryOptions.allowInlineScript || modifiers.script) {
							readdScripts(child);
						}
					} else if (position === "after") {
						const child = selectFromElement(
							elementFromString(html),
							component,
							attribute,
							processExpression,
						);
						target.insertAdjacentElement("afterend", child);
						if (libraryOptions.allowInlineScript || modifiers.script) {
							readdScripts(child);
						}
					} else if (position === "before") {
						const child = selectFromElement(
							elementFromString(html),
							component,
							attribute,
							processExpression,
						);
						target.insertAdjacentElement("beforebegin", child);
						if (libraryOptions.allowInlineScript || modifiers.script) {
							readdScripts(child);
						}
					} else if (position === "outer") {
						if (modifiers.morph) {
							morphTree(
								target,
								selectFromElement(
									elementFromString(html),
									component,
									attribute,
									processExpression,
								),
							);
						} else if (target.outerHTML !== html) {
							target.outerHTML = selectFromElement(
								html,
								component,
								attribute,
								processExpression,
							);
							if (libraryOptions.allowInlineScript || modifiers.script) {
								readdScripts(target);
							}
						}
					} else if (modifiers.morph) {
						// Ensure element only has one child.
						if (target.children.length === 0) {
							target.append(document.createElement("div"));
						} else if (target.children.length > 1) {
							for (let i = target.children.length - 1; i >= 1; i--) {
								target.children[i].remove();
							}
						}

						// Morph first child to given target tree.
						const root = morphTree(
							target.children[0],
							selectFromElement(
								elementFromString(html),
								component,
								attribute,
								processExpression,
							),
						);
						if (!target.children[0].isSameNode(root)) {
							target.children[0].remove();
							target.append(root);
						}
					} else if (target.innerHTML !== html) {
						target.innerHTML = selectFromElement(
							html,
							component,
							attribute,
							processExpression,
						);
						if (libraryOptions.allowInlineScript || modifiers.script) {
							readdScripts(...target.children);
						}
					}

					hideIndicator(component, attribute);

					dispatchEvent("-succeeded", {
						url: functionName,
					});
				})
				.catch(() => {
					hideIndicator(component, attribute);

					dispatchEvent("-failed", {
						url: functionName,
					});
				});
		};

		let isLoading = false;
		/**
		 * Handles the interaction with a element containing the directive.
		 * @param {Event} event Document event to handle.
		 * @returns {void}
		 */
		let handler = (event) =>
			new Promise((resolve) => {
				// Only fire when self is provided if the target is the element itself.
				if (modifiers.self && event && event.target !== element) {
					resolve();
					return;
				}

				if (isForm && !element.reportValidity()) {
					dispatchEvent("-invalid");
					resolve();
					return;
				}

				// Prevent the default event action.
				if (
					((isForm && eventName === "submit") ||
						(isButton &&
							element.getAttribute("type", "button") &&
							eventName === "click") ||
						modifiers.prevent) &&
					event
				) {
					event.preventDefault();
				}
				// Stop propagation if the stop modifier is present.
				if (modifiers.stop && event) {
					event.stopPropagation();
				}

				const execute = () => {
					let functionName = null;
					if (value) {
						functionName = value;
					} else if (isForm && element.hasAttribute("action")) {
						functionName = element.getAttribute("action");
					} else {
						functionName = window.location.href;
					}

					// Reset the buffer.
					attribute[IPC].buffer = [];

					if (!functionName) {
						resolve();
						return;
					}
					isLoading = true;

					showIndicator(component, attribute, processExpression);

					(isPromise(functionName)
						? functionName.then((url) => requestHandler(url))
						: requestHandler(functionName)
					).finally(() => resolve());
				};

				if (isLoading) {
					resolve();
					return;
				}

				// Store event in buffer.
				attribute[IPC].buffer.push(event);

				// Check if we need to apply an execution modifier.
				switch (executionModifier) {
					case EXECUTION_MODIFIERS.BUFFER:
						// Exit early if buffer is not full.
						if (attribute[IPC].buffer.length < modifiers.buffer) {
							resolve();
							return;
						}

						execute();
						return;

					case EXECUTION_MODIFIERS.DEBOUNCE:
						// Clear existing timeout.
						if (attribute[IPC].timeout) {
							clearTimeout(attribute[IPC].timeout);
							attribute[IPC].timeout = null;
						}

						// Setup timeout and execute expression when it finishes.
						attribute[IPC].timeout = setTimeout(execute, modifiers.debounce);
						return;

					case EXECUTION_MODIFIERS.THROTTLE: {
						// Get current time in milliseconds.
						const nowThrottle = window.performance.now();

						// Exit early if throttle time has not passed.
						if (
							attribute[IPC].lastExecution &&
							nowThrottle - attribute[IPC].lastExecution < modifiers.throttle
						) {
							resolve();
							return;
						}

						execute();

						// Store new latest execution time.
						attribute[IPC].lastExecution = nowThrottle;
						return;
					}

					case EXECUTION_MODIFIERS.DELAY:
						// Setup timeout and execute expression when it finishes.
						attribute[IPC].timeout = setTimeout(execute, modifiers.delay);
						return;
				}

				// Otherwise execute expression immediately.
				execute();
			});

		if (modifiers.poll) {
			const _handler = handler;
			handler = () => {
				attribute[IPC].timeout = setTimeout(() => {
					_handler(null).finally(() => {
						// If the directive is still active poll again.
						if (attribute[IPC]) {
							handler();
						}
					});
				}, modifiers.poll);
			};
		}
		if (intersectionEvent && eventName === intersectionEvent) {
			const _handler = handler;
			handler = () => {
				// Remove after first call.
				if (listenerOptions.once) {
					intersectionDispatcher.remove(element, handler);
				}

				_handler();
			};
			intersectionDispatcher.add(element, intersectionDispatcher);
		} else if (eventName === loadedEvent) {
			handler();
		} else {
			element.addEventListener(eventName, handler, listenerOptions);
		}

		attribute[IPC] = {
			buffer: [],
			eventName,
			handler,
			target: element,
			timeout: attribute[IPC] ? attribute[IPC].timeout : undefined,
			value,
		};
	},

	destroy: (component, attribute) => {
		// Exit early if no listeners can be found.
		if (!attribute[IPC]) {
			return;
		}

		// Remove existing listener.
		attribute[IPC].target.removeEventListener(
			attribute[IPC].eventName,
			attribute[IPC].handler,
		);
		if (intersectionEvent && intersectionDispatcher) {
			intersectionDispatcher.remove(
				attribute[IPC].target,
				attribute[IPC].handler,
			);
		}
		// Clear any ongoing timeouts.
		if (attribute[IPC].timeout) {
			clearTimeout(attribute[IPC].timeout);
		}

		hideIndicator(component, attribute);

		// Delete directive data.
		delete attribute[IPC];
	},
});
