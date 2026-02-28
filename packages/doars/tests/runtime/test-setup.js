import { Browser } from "happy-dom";

// Create a shared window instance for all tests.
const browser = new Browser({
	enableJavaScriptEvaluation: true,
});
const page = browser.newPage();
const window = page.mainFrame.window;

const windowKeys = Object.getOwnPropertyNames(window);
for (const key of windowKeys) {
	// avoid readonly collisions
	if (key in globalThis) {
		continue;
	}

	Object.defineProperty(
		globalThis,
		key,
		Object.getOwnPropertyDescriptor(window, key),
	);
}

// Add this error, otherwise an happy-dom internal error occurs.
window.SyntaxError = SyntaxError;

export { window };
