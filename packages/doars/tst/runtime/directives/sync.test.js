import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("Sync Directive", () => {
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

	test("sync directive should synchronize state and input", async () => {
		container.innerHTML = `
      <div d-state="{ message: 'Before' }">
        <input type="text" d-sync:state="message" value="Initial">
        <div d-text="message">Initial</div>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initial sync.
		const input = container.querySelector("input");
		const div = container.querySelector("div[d-text]");
		expect(input.value).toBe("Before");
		expect(div.textContent).toBe("Before");

		// Simulate user input.
		input.value = "After";
		input.dispatchEvent(new Event("input"));

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert the div has updated.
		expect(div.textContent).toBe("After");
	});

	test("sync store directive should synchronize store and input", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <input type="text" d-sync:store="message" value="Initial">
        <div d-text="$store.message">Initial</div>
      </div>
    `;

		// Create and enable Doars with initial store.
		doars = new Doars({
			root: container,
			storeContextInitial: {
				message: "Before",
			},
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initial sync.
		const input = container.querySelector("input");
		const div = container.querySelector("div[d-text]");
		expect(input.value).toBe("Before");
		expect(div.textContent).toBe("Before");

		// Simulate user input.
		input.value = "After";
		input.dispatchEvent(new Event("input"));

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert the div has updated.
		expect(div.textContent).toBe("After");
	});

	test("sync state directive should synchronize state and textarea", async () => {
		container.innerHTML = `
      <div d-state="{ message: 'Before' }">
        <textarea d-sync:state="message">Initial</textarea>
        <div d-text="message">Initial</div>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initial sync.
		const textarea = container.querySelector("textarea");
		const div = container.querySelector("div[d-text]");
		expect(textarea.value).toBe("Before");
		expect(div.textContent).toBe("Before");

		// Simulate user input.
		textarea.innerText = "After";
		textarea.dispatchEvent(new Event("input"));

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert the div has updated.
		expect(div.textContent).toBe("After");
	});

	test("sync state directive should synchronize state and checkboxes", async () => {
		container.innerHTML = `
      <div d-state="{ selected: ['after'] }">
        <input type="checkbox" d-sync:state="selected" value="before" checked>
        <input type="checkbox" d-sync:state="selected" value="after">
        <div d-text="selected.join(', ')">Initial</div>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert initial sync.
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		const div = container.querySelector("div[d-text]");
		expect(checkboxes[0].checked).toBe(false);
		expect(checkboxes[1].checked).toBe(true);
		expect(div.textContent).toBe("after");
	});
});
