import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../src/DoarsExecute.js";
import { document } from "./test-setup.js";

describe("Function State Simple Context", () => {
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

	test("simple context function can be called", async () => {
		const captured = {};

		container.innerHTML = `
      <div d-state="">
        <button d-on:click="hello()"></button>
      </div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("hello", () => {
			captured.called = true;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const button = container.querySelector("button");
		button.click();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured.called).toBe(true);
	});

	test("simple context function initializes state", async () => {
		const captured = {};

		container.innerHTML = `
      <div d-state="createState()" d-initialized="setMessage($state.message)"></div>
    `;

		doars = new Doars({
			root: container,
		});

		doars.setSimpleContext("createState", () => {
			return {
				message: "Hello there!",
			};
		});
		doars.setSimpleContext("setMessage", (message) => {
			captured.message = message;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		expect(captured.message).toBe("Hello there!");
	});
});
