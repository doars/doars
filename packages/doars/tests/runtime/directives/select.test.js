import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Doars from "../../../src/DoarsExecute.js";
import "../test-setup.js";

describe("Select Directive", () => {
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

	test("select directive should set multiple select values", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <select d-select="[ 'after', 'after2' ]" multiple>
          <option value="before" selected>Before</option>
          <option value="after">After</option>
          <option value="after2">After2</option>
        </select>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert multiple selected.
		const select = container.querySelector("select");
		const selected = Array.from(select.selectedOptions).map((o) => o.value);
		expect(selected).toEqual(["after", "after2"]);
	});

	test("select directive should set radio value", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <input type="radio" name="radio-name" d-select="'after'" value="initial" checked>
        <input type="radio" name="radio-name" d-select="'after'" value="before">
        <input type="radio" name="radio-name" d-select="'after'" value="after">
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert radio selected.
		const radios = container.querySelectorAll('input[type="radio"]');
		expect(radios[0].checked).toBe(false);
		expect(radios[1].checked).toBe(false);
		expect(radios[2].checked).toBe(true);
	});

	test("select directive should set select value", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <select d-select="'after'">
          <option value="before" selected>Before</option>
          <option value="after">After</option>
        </select>
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert value set.
		const select = container.querySelector("select");
		expect(select.value).toBe("after");
	});

	test("select directive should handle promises", async () => {
		doars = new Doars({
			root: container,
		});

		// Set simple context for promise.
		doars.setSimpleContext("resolveInTime", (result) =>
			Promise.resolve(result),
		);

		container.innerHTML = `
       <div d-state="{}">
         <select d-select="resolveInTime('after')">
           <option value="before" selected>Before</option>
           <option value="after">After</option>
         </select>
       </div>
     `;

		doars.enable();

		// Wait for promise.
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Assert value set.
		const select = container.querySelector("select");
		expect(select.value).toBe("after");
	});

	test("select directive should set checkbox values", async () => {
		container.innerHTML = `
      <div d-state="{}">
        <input type="checkbox" name="checkbox-name" d-select="'after'" value="initial" checked>
        <input type="checkbox" name="checkbox-name" d-select="'after'" value="before">
        <input type="checkbox" name="checkbox-name" d-select="'after'" value="after">
        <input type="checkbox" name="checkbox-name" d-select="'after'" value="after">
      </div>
    `;

		doars = new Doars({
			root: container,
		});
		doars.enable();

		await new Promise((resolve) => setTimeout(resolve, 1));

		// Assert checkboxes selected.
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		expect(checkboxes[0].checked).toBe(false);
		expect(checkboxes[1].checked).toBe(false);
		expect(checkboxes[2].checked).toBe(true);
		expect(checkboxes[3].checked).toBe(true);
	});
});
