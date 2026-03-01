import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

/**
 * The with keyword and function constructor used in DoarsExecute means that the revocable proxy can't revoke the initial set of properties it exposes. Therefore we test with the interpreter for more accurate results.
 */

describe("InContext Context", () => {
	let container, doars;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
	});

	afterEach(() => {
		doars.disable();
		doars = null;
		document.body.removeChild(container);
		container = null;
	});

	test("inContext should execute function in component context", async () => {
		let captured = "Hello there!";

		container.innerHTML = `
      <div d-state="{ message: 'General Kenobi.' }" d-initialized="$nextTick(() => $inContext(({ $state, capture }) => capture($state.message)))"></div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", (message) => {
			captured = message;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(captured).toBe("General Kenobi.");
	});
});
