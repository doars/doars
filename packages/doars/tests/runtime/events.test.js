import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../src/DoarsExecute.js";
import "./test-setup.js";

describe("Events", () => {
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

	test("component updated event is dispatched", async () => {
		container.innerHTML = `
      <div d-state="{}"></div>
    `;

		doars = new Doars({
			root: container,
		});

		let eventFired = false;
		const div = container.querySelector("[d-state]");
		div.addEventListener("d-updated", () => {
			eventFired = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(eventFired).toBe(true);
	});

	test("component destroyed event is dispatched", async () => {
		container.innerHTML = `
      <div d-state="{}"></div>
    `;

		doars = new Doars({
			root: container,
		});

		let eventFired = false;
		const div = container.querySelector("[d-state]");
		div.addEventListener("d-destroyed", () => {
			eventFired = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Disable Doars.
		doars.disable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(eventFired).toBe(true);
	});

	test("library enabled event is dispatched", async () => {
		container.innerHTML = `
      <div d-state="{}"></div>
    `;

		doars = new Doars({
			root: container,
		});

		let eventFired = false;
		doars.addEventListener("enabled", () => {
			eventFired = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(eventFired).toBe(true);
	});
});
