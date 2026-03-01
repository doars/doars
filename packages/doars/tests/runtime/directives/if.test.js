import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsInterpret.js";
import "../test-setup.js";

describe("If Directive", () => {
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

	test("if directive should conditionally render", async () => {
		container.innerHTML = `
      <div d-state="{ a: true, b: false }">
        <template d-if="a">
          <span>
            Should be visible
          </span>
        </template>

        <template d-if="b">
          <span>
            Should NOT be visible
          </span>
        </template>
      </div>
    `;

		doars = new Doars({
			root: container,
			processor: "interpret",
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const visibleSpan = container.querySelector("span");
		expect(visibleSpan.textContent.trim()).toBe("Should be visible");

		const notVisibleSpans = container.querySelectorAll("span");
		expect(notVisibleSpans.length).toBe(1);
	});
});
