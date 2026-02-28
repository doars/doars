// Import testing framework.
import { describe, expect, it } from "bun:test";

// Import code to test.
import parse from "../../../src/parse.js";
import run from "../../../src/run.js";

export default (
	name,
	expression,

	resultExpected,
	nodesExpected,

	context = {},
	contextExpected = {},
) => {
	describe(`${name}: ${expression}`, () => {
		let nodes;
		try {
			nodes = parse(expression);
		} catch (error) {
			console.error(
				`Error when parsing test "${name}" with expression ${expression}`,
				error,
			);
		}
		if (nodesExpected !== undefined) {
			it("Parsing", () => {
				expect(nodes).toEqual(nodesExpected);
			});
		}

		let result;
		try {
			result = run(nodes, context);
		} catch (error) {
			console.error(
				`Error when running test "${name}" with expression ${expression}`,
				error,
			);
		}
		if (resultExpected !== undefined) {
			it("Reducing", () => {
				expect(result).toEqual(resultExpected);
			});
		}
		// Verify context mutation.
		if (contextExpected !== undefined) {
			it("Context", () => {
				expect(context).toEqual(contextExpected);
			});
		}
	});
};
