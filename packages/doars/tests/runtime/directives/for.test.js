import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import DoarsInterpret from "../../../src/DoarsInterpret.js";
import { document } from "../test-setup.js";

describe("For Directive", () => {
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

	test("for directive should render list", async () => {
		container.innerHTML = `
      <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
        <template d-for="value of array">
          <li d-text="value"></li>
        </template>
      </ol>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("Value A");
		expect(lis[1].textContent).toBe("Value B");
		expect(lis[2].textContent).toBe("Value C");
		expect(lis[3].textContent).toBe("Value D");
	});

	test("for directive should iterate over string", async () => {
		container.innerHTML = `
      <ol d-state="{}">
        <template d-for="value of 'text'">
          <li d-text="value"></li>
        </template>
      </ol>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("t");
		expect(lis[1].textContent).toBe("e");
		expect(lis[2].textContent).toBe("x");
		expect(lis[3].textContent).toBe("t");
	});

	test("for directive should iterate over array with index", async () => {
		container.innerHTML = `
      <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
        <template d-for="(value, index) of array">
          <li d-text="index"></li>
        </template>
      </ol>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("0");
		expect(lis[1].textContent).toBe("1");
		expect(lis[2].textContent).toBe("2");
		expect(lis[3].textContent).toBe("3");
	});

	test("for directive should iterate over promise number", async () => {
		doars = new Doars({
			root: container,
		});

		// Set simple context for promise.
		doars.setSimpleContext("resolveInTime", (result) =>
			Promise.resolve(result),
		);

		container.innerHTML = `
       <ol d-state="{}">
         <template d-for="index of resolveInTime(4)">
           <li d-text="index"></li>
         </template>
       </ol>
     `;

		doars.enable();

		// Wait for promise.
		await new Promise((resolve) => setTimeout(resolve, 10));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("0");
		expect(lis[1].textContent).toBe("1");
		expect(lis[2].textContent).toBe("2");
		expect(lis[3].textContent).toBe("3");
	});

	test("for directive should iterate over direct number", async () => {
		container.innerHTML = `
       <ol d-state="{}">
         <template d-for="index of 4">
           <li d-text="index"></li>
         </template>
       </ol>
     `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("0");
		expect(lis[1].textContent).toBe("1");
		expect(lis[2].textContent).toBe("2");
		expect(lis[3].textContent).toBe("3");
	});

	test("for directive should iterate over object values", async () => {
		container.innerHTML = `
      <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
        <template d-for="(key, value) in object">
          <li d-text="value"></li>
        </template>
      </ul>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("Value A");
		expect(lis[1].textContent).toBe("Value B");
		expect(lis[2].textContent).toBe("Value C");
		expect(lis[3].textContent).toBe("Value D");
	});

	test("for directive should iterate over object keys", async () => {
		container.innerHTML = `
      <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
        <template d-for="key in object">
          <li d-text="key"></li>
        </template>
      </ul>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("a");
		expect(lis[1].textContent).toBe("b");
		expect(lis[2].textContent).toBe("c");
		expect(lis[3].textContent).toBe("d");
	});

	test("for directive should iterate over string with index", async () => {
		container.innerHTML = `
      <ol d-state="{}">
        <template d-for="(value, index) of 'text'">
          <li d-text="index"></li>
        </template>
      </ol>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("0");
		expect(lis[1].textContent).toBe("1");
		expect(lis[2].textContent).toBe("2");
		expect(lis[3].textContent).toBe("3");
	});

	test("for directive should iterate over object with index", async () => {
		container.innerHTML = `
      <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
        <template d-for="(key, value) in object">
          <li d-text="key"></li>
        </template>
      </ul>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const lis = container.querySelectorAll("li");
		expect(lis.length).toBe(4);
		expect(lis[0].textContent).toBe("a");
		expect(lis[1].textContent).toBe("b");
		expect(lis[2].textContent).toBe("c");
		expect(lis[3].textContent).toBe("d");
	});
});
