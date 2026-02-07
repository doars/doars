import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("Component Context", () => {
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

	test("component context should provide component instance", async () => {
		container.innerHTML = `
      <div d-state="{ hasComponent: false }" d-initialized="$state.hasComponent = !!$component">
        <span d-text="$state.hasComponent ? 'true' : 'false'"></span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const span = container.querySelector("span");
		expect(span.textContent).toBe("true");
	});
});
