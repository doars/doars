import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import "../test-setup.js";

describe("State Log Context", () => {
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

	test("state log context should execute function", async () => {
		let captured = null;

		container.innerHTML = `
      <div d-state="{ message: 'value' }" d-initialized="logState($state)"></div>
    `;

		doars = new Doars({
			root: container,
		});

		// Set simple context with closure.
		doars.setSimpleContext("logState", (state) => {
			captured = state.message;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert function was called and captured the specific value.
		expect(captured).toBe("value");
	});
});
