import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../src/DoarsExecute.js";
import { document } from "./test-setup.js";

describe("Options", () => {
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

	test("root id option restricts scanning", async () => {
		const identifier = `id-${crypto.randomUUID()}`;

		container.innerHTML = `
      <div d-state="{ message: 'Broken' }">
        <div d-text="message">Works</div>
      </div>
      <div id="${identifier}" d-state="{ message: 'Works' }">
        <div d-text="message">Broken</div>
      </div>
    `;

		// Create Doars with root selector.
		doars = new Doars({
			root: `#${identifier}`,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert only the second div is processed.
		const divs = container.querySelectorAll("div[d-text]");
		expect(divs[0].textContent).toBe("Works"); // first div not processed
		expect(divs[1].textContent).toBe("Works"); // second div processed
	});

	test("root element option restricts scanning", async () => {
		container.innerHTML = `
      <div d-state="{ message: 'Broken' }">
        <div d-text="message">Works</div>
      </div>
      <div d-state="{ message: 'Works' }">
        <div d-text="message">Broken</div>
      </div>
    `;

		// Create Doars with root selector.
		doars = new Doars({
			root: container.querySelector("div:nth-child(2)"),
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert only the second div is processed.
		const divs = container.querySelectorAll("div[d-text]");
		expect(divs[0].textContent).toBe("Works"); // first div not processed
		expect(divs[1].textContent).toBe("Works"); // second div processed
	});

	test("root element option restricts scanning", async () => {
		container.innerHTML = `
      <div>
        <div d-state="{ message: 'Broken' }">
          <div d-text="message">Works</div>
        </div>
        <div x-state="{ message: 'Works' }">
          <div x-text="message">Broken</div>
        </div>
      </div>
    `;

		// Create Doars with root selector.
		doars = new Doars({
			root: container,
			prefix: "x",
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert only the second div is processed.
		const dDiv = container.querySelector("div[d-text]");
		expect(dDiv.textContent).toBe("Works");
		const xDiv = container.querySelector("div[x-text]");
		expect(xDiv.textContent).toBe("Works");
	});
});
