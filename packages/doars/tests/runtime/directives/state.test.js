import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("State Directive", () => {
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

	test("state directive should initialize and assign values", async () => {
		container.innerHTML = `
      <div d-state="{ message: 'Hello there!' }" d-initialized="$state.message = 'General Kenobi.'">
        <span d-text="message"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert assigned.
		const span = container.querySelector("span");
		expect(span.textContent).toBe("General Kenobi.");
	});

	test("state directive should handle empty state", async () => {
		container.innerHTML = `
      <div d-state="" d-initialized="$state.test = true">
        <span d-text="$state.test ? 'true' : 'false'"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert empty state works.
		const span = container.querySelector("span");
		expect(span.textContent).toBe("true");
	});

	test("state directive should handle Object.assign", async () => {
		container.innerHTML = `
      <div d-state="{ message: 'Hello there!' }" d-initialized="Object.assign($state, { message: 'General Kenobi.' })">
        <span d-text="message"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert assigned.
		const span = container.querySelector("span");
		expect(span.textContent).toBe("General Kenobi.");
	});
});
