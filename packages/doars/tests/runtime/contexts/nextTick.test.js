import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

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

	test("nextTick context should expire and throw error when accessed", async () => {
		let captured = "Hello there!";

		container.innerHTML = `
      <div d-state="{ message: 'General Kenobi.' }" d-initialized="$nextTick(() => { capture($state.message)})"></div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", (message) => {
			captured = message;
		});

		expect(async () => {
			doars.enable();

			await new Promise((resolve) => setTimeout(resolve, 100));
		}).toThrow("Can not access property");
		expect(captured).toBe("Hello there!");
	});

	test("nextTick context should defer execution", async () => {
		let captured = false;

		container.innerHTML = `
      <div d-state="{}" d-initialized="$nextTick(({ capture }) => capture())"></div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", () => {
			captured = true;
		});

		doars.enable();

		expect(captured).toBe(false);

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured).toBe(true);
	});
});
