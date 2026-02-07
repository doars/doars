import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("Initialized Directive", () => {
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

	test("initialized directive should run on component init", async () => {
		container.innerHTML = `
      <div d-state="{ init: false }" d-initialized="$state.init = true">
        <span d-text="$state.init ? 'true' : 'false'"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initialized.
		const span = container.querySelector("span");
		expect(span.textContent).toBe("true");
	});

	test("initialized directive should run on element init", async () => {
		const captured = {};

		container.innerHTML = `
      <div d-state="{}">
        <div d-initialized="captured.initialized = true"></div>
      </div>
    `;

		// Make captured available in the expression.
		global.captured = captured;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initialized.
		expect(captured.initialized).toBe(true);
	});
});
