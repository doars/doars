import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

describe("References Context", () => {
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

	// TODO: resolve timing issue. References is not yet initialized when initialized is called. I think.
	test("references context should provide referenced elements", async () => {
		let captured;

		container.innerHTML = `
      <div d-state="{}" d-initialized="$nextTick({ capture } => capture($references.myInput))">
        <input d-reference="'myInput'">
      </div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});

		doars.setSimpleContext("capture", (element) => {
			captured = element;
		});

		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 100));

		const element = container.querySelector("input");
		expect(element).toBe(captured);
	});
});
