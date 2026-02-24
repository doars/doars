import { Window } from "happy-dom";

// Create a shared window instance for all tests.
const window = new Window();
const document = window.document;

// Set globals once to avoid inconsistencies across tests.
global.document = document;
global.HTMLElement = window.HTMLElement;
global.MutationObserver = window.MutationObserver;
global.requestAnimationFrame = window.requestAnimationFrame;
global.window = window;

export { document, window };
