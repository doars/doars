import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

describe("Watch Context", () => {
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

	test("watch context should trigger", async () => {
		let captured = false;

		container.innerHTML = `
      <div d-state="{ count: 0 }" d-initialized="$watch('$state.count', ({ capture }) => capture()); $nextTick({ $state } => $state.count++);"></div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", () => {
			captured = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(captured).toBe(true);
	});

	test("watch context should trigger immediately", async () => {
		let captured = false;

		container.innerHTML = `
      <div d-state="{ count: 0 }" d-initialized="$watch('count', ({ capture }) => capture())()"></div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", () => {
			captured = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured).toBe(true);
	});
});
