import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

describe("Sibling Context", () => {
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

	test("nextSibling context should access next component", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <div d-state="{}"></div>
        <div d-state="{}"></div>
        <div d-state="{ nextMessage: '' }" d-initialized="$state.nextMessage = $nextSibling.$state.message">
          <span d-text="$state.nextMessage"></span>
        </div>
        <div d-state="{ message: 'success' }"></div>
        <div d-state="{}"></div>
      </div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const span = container.querySelector("span");
		expect(span.textContent).toBe("success");
	});

	test("previousSibling context should access previous component", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <div d-state="{}"></div>
        <div d-state="{ message: 'success' }"></div>
        <div d-state="{ prevMessage: '' }" d-initialized="$state.prevMessage = $previousSibling.$state.message">
          <span d-text="$state.prevMessage"></span>
        </div>
        <div d-state="{}"></div>
        <div d-state="{}"></div>
      </div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const span = container.querySelector("span");
		expect(span.textContent).toBe("success");
	});

	test("siblings context should provide sibling components", async () => {
		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		const captured = {};

		// Set simple context with closure.
		doars.setSimpleContext("collectSiblings", (siblings) => {
			captured.messages = siblings.map((s) => s.$state.message).filter(Boolean);
		});

		container.innerHTML = `
      <div d-state="{}">
        <div d-state="{ message: 'first' }"></div>
        <div d-state="{ message: 'previous' }"></div>
        <div d-state="{}" d-initialized="collectSiblings($siblings)"></div>
        <div d-state="{ message: 'next' }"></div>
        <div d-state="{ message: 'last' }"></div>
      </div>
    `;

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert siblings captured.
		expect(captured.messages).toEqual(["first", "previous", "next", "last"]);
	});
});
