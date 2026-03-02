import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

describe("Element Context", () => {
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

	test("element context should provide element reference", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <ol d-text="$element.tagName"></ol>
        <p d-text="$element.tagName"></p>
        <span d-text="$element.tagName"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const ol = container.querySelector("ol");
		expect(ol.textContent).toBe("OL");
		const p = container.querySelector("p");
		expect(p.textContent).toBe("P");
		const span = container.querySelector("span");
		expect(span.textContent).toBe("SPAN");
	});
});
