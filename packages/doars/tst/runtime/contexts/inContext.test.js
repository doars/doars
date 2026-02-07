import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

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
		let captured = null;

		container.innerHTML = `
      <div d-state="{ message: 'General Kenobi.', logged: '' }" d-initialized="$inContext(({ $state }) => { capture($state.message) })">
        <span d-text="$state.logged"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("capture", (message) => {
			captured = message;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured).toBe("General Kenobi.");
	});
});
