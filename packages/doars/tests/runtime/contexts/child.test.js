import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import "../test-setup.js";

describe("Child Context", () => {
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

	test("children context should list child components", async () => {
		let count = 0;

		container.innerHTML = `
      <div d-state="{}" d-initialized="setCount($children.length)">
        <div d-state="{}"></div>
        <div d-state="{}"></div>
      </div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("setCount", (_count) => {
			count = _count;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(count).toBe(2);
	});

	test("child context should access specific child component", async () => {
		const captured = {};

		container.innerHTML = `
      <div d-state="{}" d-initialized="setMessage($children[0].$state.message)">
        <div d-state="{ message: 'General Kenobi' }"></div>
      </div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("setMessage", (message) => {
			captured.message = message;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured.message).toBe("General Kenobi");
	});
});
