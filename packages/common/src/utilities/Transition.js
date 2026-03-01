// Import utilities.

import { addAttributes, removeAttributes } from "./Attribute.js";
import { parseSelector } from "./String.js";

// Transition name.
const TRANSITION_NAME = "-transition:";

/**
 * @callback TransitionEnd
 */

/**
 * Transition an element.
 * @param {string} type Type of transition, for example 'in' and 'out'.
 * @param {object} libraryOptions Library options.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 * @returns {TransitionEnd | undefined} Function to immediately end the transition.
 */
export const transition = (type, libraryOptions, element, callback = null) => {
	// Only transition element nodes.
	if (element.nodeType !== 1) {
		if (callback) {
			callback();
		}
		return;
	}

	// Transition attribute name.
	const transitionDirectiveName =
		libraryOptions.prefix + TRANSITION_NAME + type;

	const selectors = {};

	// Process transition during attribute.
	const value = element.getAttribute(transitionDirectiveName);
	if (value) {
		selectors.during = parseSelector(value);
		addAttributes(element, selectors.during);
	}

	// Process transition from attribute.
	const valueFrom = element.getAttribute(`${transitionDirectiveName}.from`);
	if (valueFrom) {
		selectors.from = parseSelector(valueFrom);
		addAttributes(element, selectors.from);
	}

	// Process transition to attribute.
	const valueTo = element.getAttribute(`${transitionDirectiveName}.to`);
	if (valueTo) {
		selectors.to = parseSelector(valueTo);
	}

	if (!value && !valueFrom && !valueTo) {
		if (callback) {
			callback();
		}
		return;
	}

	// Declare variables for later.
	let isDone = false,
		timeout;

	let requestFrame = requestAnimationFrame(() => {
		requestFrame = null;

		// If cancelled then stop immediately.
		if (isDone) {
			return;
		}

		// Remove from selector.
		if (selectors.from) {
			removeAttributes(element, selectors.from);
			selectors.from = undefined;
		}

		if (valueTo) {
			addAttributes(element, selectors.to);
		} else if (!selectors.during) {
			// Exit early if no active selectors set.

			// Invoke callback.
			if (callback) {
				callback();
			}
			// Mark as done.
			isDone = true;
			return;
		}

		// Get computes style.
		const styles = getComputedStyle(element);

		const delay =
			Number(styles.transitionDelay.replace(/,.*/, "").replace("s", "")) * 1000;
		let duration =
			Number(styles.transitionDuration.replace(/,.*/, "").replace("s", "")) *
			1000;
		if (duration === 0) {
			duration = Number(styles.animationDuration.replace("s", "")) * 1000;
		}

		timeout = setTimeout(() => {
			timeout = null;

			// If cancelled then stop immediately.
			if (isDone) {
				return;
			}

			// Remove during selector.
			if (selectors.during) {
				removeAttributes(element, selectors.during);
				selectors.during = undefined;
			}

			// Remove to selector.
			if (selectors.to) {
				removeAttributes(element, selectors.to);
				selectors.to = undefined;
			}

			// Invoke callback.
			if (callback) {
				callback();
			}
			// Mark as done.
			isDone = true;
		}, delay + duration);
	});

	return () => {
		if (!isDone) {
			return;
		}
		isDone = true;

		// Remove applied selector.
		if (selectors.during) {
			removeAttributes(element, selectors.during);
			selectors.during = undefined;
		}
		if (selectors.from) {
			removeAttributes(element, selectors.from);
			selectors.from = undefined;
		} else if (selectors.to) {
			removeAttributes(element, selectors.to);
			selectors.to = undefined;
		}

		// Clear request animation frame and timeout.
		if (requestFrame) {
			cancelAnimationFrame(requestFrame);
			requestFrame = null;
		} else if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		// Invoke callback.
		if (callback) {
			callback();
		}
	};
};

/**
 * Transition an element in.
 * @param {object} libraryOptions Library options.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 * @returns {TransitionEnd | undefined} Function to immediately end the transition.
 */
export const transitionIn = (libraryOptions, element, callback) => {
	return transition("in", libraryOptions, element, callback);
};

/**
 * Transition an element out.
 * @param {object} libraryOptions Library options.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 * @returns {TransitionEnd | undefined} Function to immediately end the transition.
 */
export const transitionOut = (libraryOptions, element, callback) => {
	return transition("out", libraryOptions, element, callback);
};

export default {
	transition,
	transitionIn,
	transitionOut,
};
