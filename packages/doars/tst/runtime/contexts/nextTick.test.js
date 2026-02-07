import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("NextTick Context", () => {
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

	test("nextTick context should defer execution", async () => {
		let captured = false;

		container.innerHTML = `
      <div d-state="{}" d-initialized="$nextTick(({ capture }) => capture())"></div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("capture", () => {
			captured = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured).toBe(true);
	});
});
