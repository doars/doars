import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import { document } from "../test-setup.js";

describe("Attribute Directive", () => {
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

	test("attribute directive should set attributes", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <span d-attribute:style="{ display: 'none' }">
          Hidden?
        </span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const span = container.querySelector("span");
		expect(span.style.display).toBe("none");
	});

	test("attribute directive should set value attributes", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <input type="text" value="before" d-attribute:value="'after'">
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		const input = container.querySelector("input");
		expect(input.value).toBe("after");
	});

	test("attribute directive should handle promises", async () => {
		doars = new Doars({
			root: container,
		});

		// Set simple context for promise.
		doars.setSimpleContext("resolveInTime", (result) =>
			Promise.resolve(result),
		);

		container.innerHTML = `
      <div d-state="{}">
        <input type="text" value="before" d-attribute:value="resolveInTime('after')">
      </div>
    `;

		doars.enable();

		// Wait for promise.
		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert value set.
		const input = container.querySelector("input");
		expect(input.value).toBe("after");
	});

	test("attribute directive should set checked on radios", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <input type="radio" name="radio-name" d-attribute:checked="false">
        <input type="radio" name="radio-name" d-attribute:checked="true">
        <input type="radio" name="radio-name" d-attribute:checked="true">
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert checked.
		const radios = container.querySelectorAll('input[type="radio"]');
		expect(radios[0].checked).toBe(false);
		expect(radios[1].checked).toBe(false);
		expect(radios[2].checked).toBe(true);
	});

	test("attribute directive should remove style properties", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <span style="background-color: yellow;" d-attribute:style="{ 'background-color': undefined }">
          Red
        </span>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert style removed.
		const span = container.querySelector("span");
		expect(span.style.backgroundColor).toBe("");
	});

	test("attribute directive should set class attributes", async () => {
		container.innerHTML = `
       <div d-state="{}">
         <span d-attribute:class="'a b'"></span>
         <span class="a" d-attribute:class="[ 'a', 'b' ]"></span>
         <span class="c" d-attribute:class="{ a: true, b: true, c: false }"></span>
       </div>
     `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert classes.
		const spans = container.querySelectorAll("span");
		expect(spans[0].className).toBe("a b");
		expect(spans[1].className).toBe("a b");
		expect(spans[2].className).toBe("a b");
	});

	test("attribute directive should set checked on checkboxes", async () => {
		container.innerHTML = `
       <div d-state="{}">
         <input type="checkbox" name="checkbox-name" d-attribute:checked="false">
         <input type="checkbox" name="checkbox-name" d-attribute:checked="true">
         <input type="checkbox" name="checkbox-name" d-attribute:checked="true">
       </div>
     `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert checked.
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		expect(checkboxes[0].checked).toBe(false);
		expect(checkboxes[1].checked).toBe(true);
		expect(checkboxes[2].checked).toBe(true);
	});
});
