/**
 * @file parse.js
 * @description Expression parser that converts JavaScript expressions into an Abstract Syntax Tree (AST).
 * Supports: identifiers, literals, arrays, objects, binary/unary operations, member access, function calls, conditionals (ternary), assignments, templates, regular expressions, spread operators, arrow functions, and update expressions. Based on jsep v1.3.6 (https://github.com/EricSmekens/jsep).
 */

import {
	ARRAY,
	ARROW,
	ASSIGN,
	BINARY,
	CALL,
	CONDITION,
	IDENTIFIER,
	LITERAL,
	MEMBER,
	OBJECT,
	PROPERTY,
	RETURN,
	SEQUENCE,
	SPREAD,
	TEMPLATE,
	UNARY,
	UPDATE,
} from "./types.js";

/**
 * Character code constants for parsing. These represent ASCII/Unicode character codes used to identify syntax elements.
 */
const SPACE_CODES = [
	9, // Tab
	10, // LF
	13, // CR
	32, // Space
];
const DOUBLE_QUOTE_CODE = 34; // "
const DOLLAR_CODE = 36; // $
const SINGLE_QUOTE_CODE = 39; // '
const OPENING_PARENTHESIS_CODE = 40; // (
const CLOSING_PARENTHESIS_CODE = 41; // )
const COMMA_CODE = 44; // ,
const PERIOD_CODE = 46; // .
const FORWARD_SLASH_CODE = 47; // /
const ZERO_CODE = 48; // 0
const NINE_CODE = 57; // 9
const COLON_CODE = 58; // :
const SEMICOLON_CODE = 59; // ;
const EQUAL_CODE = 61; // =
const ANGLE_RIGHT_CODE = 62; // >
const QUESTION_MARK_CODE = 63; // ?
const LOWER_A_CODE = 65; // a
const LOWER_Z_CODE = 90; // z
const OPENING_BRACKET_CODE = 91; // [
const BACK_SLASH_CODE = 92; // \
const CLOSING_BRACKET_CODE = 93; // ]
const UNDERSCORE_CODE = 95; // _
const BACKTICK_CODE = 96; // `
const UPPER_A_CODE = 97; // A
const UPPER_Z_CODE = 122; // Z
const OPENING_BRACES_CODE = 123; // {
const CLOSING_BRACES_CODE = 125; // }

/**
 * Operator definitions for expression parsing. Assignment operators modify the left-hand side with the right-hand side value.
 */
const ASSIGNMENT_OPERATORS = [
	"-=",
	"??=",
	"**=",
	"*=",
	"/=",
	"&&=",
	"&=",
	"%=",
	"^=",
	"+=",
	"<<=",
	"=",
	">>=",
	">>>=",
	"|=",
	"||=",
];
/**
 * Binary operators with precedence levels (higher number = higher precedence). Operators with the same precedence are evaluated left-to-right.
 */
const BINARY_OPERATORS = {
	"=": 1,
	"||=": 1,
	"&&=": 1,
	"??=": 1,
	"*=": 1,
	"**=": 1,
	"/=": 1,
	"%=": 1,
	"+=": 1,
	"-=": 1,
	"<<=": 1,
	">>=": 1,
	">>>=": 1,
	"&=": 1,
	"^=": 1,
	"|=": 1,
	"||": 2,
	"&&": 3,
	"??": 4,
	"|": 5,
	"^": 6,
	"&": 7,
	"==": 8,
	"!=": 8,
	"===": 8,
	"!==": 8,
	"<": 9,
	">": 9,
	"<=": 9,
	">=": 9,
	"<<": 10,
	">>": 10,
	">>>": 10,
	"*": 11,
	"**": 11,
	"/": 11,
	"%": 11,
	"+": 11,
	"-": 11,
};
/**
 * Unary operators that take a single operand and return a result.
 */
const UNARY_OPERATORS = ["-", "!", "~", "+"];
const UPDATE_OPERATOR_DECREMENT = "--";
const UPDATE_OPERATOR_INCREMENT = "++";

/**
 * Built-in literal values that are recognized as keywords. These map identifier names to their actual values.
 */
const LITERALS = {
	true: true,
	false: false,
	null: null,
	undefined,
};

/**
 * Checks if a character code represents a decimal digit (0-9).
 * @param {number} character - The character code to check.
 * @returns {boolean} True if the character is a digit.
 */
const isDecimalDigit = (character) =>
	character >= ZERO_CODE && character <= NINE_CODE;

/**
 * Checks if a character code is valid as part of an identifier (after the first character).
 * @param {number} character - The character code to check.
 * @returns {boolean} True if the character can be part of an identifier.
 */
const isIdentifierPart = (character) =>
	isIdentifierStart(character) || isDecimalDigit(character);

/**
 * Checks if a character code is valid as the first character of an identifier. Valid start characters are letters, underscore, and dollar sign.
 * @param {number} character - The character code to check.
 * @returns {boolean} True if the character can start an identifier.
 */
const isIdentifierStart = (character) =>
	(character >= ZERO_CODE && character <= NINE_CODE) ||
	(character >= LOWER_A_CODE && character <= LOWER_Z_CODE) ||
	(character >= UPPER_A_CODE && character <= UPPER_Z_CODE) ||
	character === DOLLAR_CODE ||
	character === UNDERSCORE_CODE;

/**
 * Parses a JavaScript expression string into an Abstract Syntax Tree (AST).
 * @param {string} expression - The expression string to parse.
 * @returns {Array|undefined} An array of AST nodes, or undefined if empty.
 */
export default (expression) => {
	let index = 0;

	/**
	 * Parses an array literal expression like [1, 2, 3]. Consumes elements between square brackets.
	 * @returns {Object} AST node with type ARRAY and elements array.
	 */
	const gobbleArray = () => {
		index++;

		return {
			type: ARRAY,
			elements: gobbleParameters(CLOSING_BRACKET_CODE),
		};
	};

	/**
	 * Parses a comma-separated list of expressions until a termination character. Used for parsing function arguments and array elements.
	 * @param {number} termination - Character code that ends the parameter list (e.g., ')' or ']').
	 * @returns {Array} Array of parsed expression nodes.
	 * @throws {Error} If the list is not properly terminated or has syntax errors.
	 */
	const gobbleParameters = (termination) => {
		const parameters = [];
		let closed = false;

		let separatorCount = 0;
		while (index < expression.length) {
			gobbleSpaces();
			const characterIndex = expression.charCodeAt(index);

			if (characterIndex === termination) {
				closed = true;
				index++;

				if (
					termination === CLOSING_PARENTHESIS_CODE &&
					separatorCount &&
					separatorCount >= parameters.length
				) {
					throw new Error(
						`Unexpected token ${String.fromCharCode(termination)}`,
					);
				}
				break;
			} else if (characterIndex === COMMA_CODE) {
				index++;
				separatorCount++;

				if (separatorCount !== parameters.length) {
					if (termination === CLOSING_PARENTHESIS_CODE) {
						throw new Error("Unexpected token ,");
					} else if (termination === CLOSING_BRACKET_CODE) {
						for (let i = parameters.length; i < separatorCount; i++) {
							parameters.push(null);
						}
					}
				}
			} else if (parameters.length !== separatorCount && separatorCount !== 0) {
				throw new Error("Expected comma");
			} else {
				const node = gobbleExpression();

				if (!node) {
					throw new Error("Expected comma");
				}

				parameters.push(node);
			}
		}

		if (!closed) {
			throw new Error(`Expected ${String.fromCharCode(termination)}`);
		}

		return parameters;
	};

	/**
	 * Parses a binary expression with operator precedence handling. Uses the shunting-yard algorithm to build the AST with correct precedence.
	 * @returns {Object} AST node representing the binary expression.
	 */
	const gobbleBinaryExpression = () => {
		let left = gobbleToken();
		if (!left) {
			return left;
		}

		let value = gobbleBinaryOperation();
		if (!value) {
			return gobbleArrowFunction(left);
		}

		let binaryOperationInfo = {
			value,
			precedence: BINARY_OPERATORS[value] || 0,
		};

		let right = gobbleToken();
		if (!right) {
			throw new Error(`Expected expression after ${value}`);
		}

		const stack = [left, binaryOperationInfo, right];

		let node;
		// biome-ignore lint/suspicious/noAssignInExpressions: Common parser pattern
		while ((value = gobbleBinaryOperation())) {
			const precedence = BINARY_OPERATORS[value] || 0;

			if (precedence === 0) {
				index -= value.length;
				break;
			}

			binaryOperationInfo = {
				value,
				precedence,
			};

			const currentBinaryOperation = value;
			while (stack.length > 2 && stack[stack.length - 2] > precedence) {
				right = stack.pop();
				value = stack.pop().value;
				left = stack.pop();
				node = {
					type: ASSIGNMENT_OPERATORS.indexOf(value) >= 0 ? ASSIGN : BINARY,
					operator: value,
					left,
					right,
				};
				stack.push(node);
			}

			node = gobbleToken();

			if (!node) {
				throw new Error(`Expected expression after ${currentBinaryOperation}`);
			}

			stack.push(binaryOperationInfo, node);
		}

		let i = stack.length - 1;
		node = stack[i];

		while (i > 1) {
			value = stack[i - 1].value;
			node = {
				type: ASSIGNMENT_OPERATORS.indexOf(value) >= 0 ? ASSIGN : BINARY,
				operator: value,
				left: stack[i - 2],
				right: node,
			};
			i -= 2;
		}

		return node;
	};

	/**
	 * Parses a binary operator from the current position. Checks for operators like +, -, *, /, ===, etc. based on the BINARY_OPERATORS list.
	 * @returns {string|false} The operator string if found, false otherwise.
	 */
	const gobbleBinaryOperation = () => {
		gobbleSpaces();
		let toCheck = expression.substring(index, index + 4); // 4 = Maximum binary operator length.
		let toCheckLength = toCheck.length;

		while (toCheckLength > 0) {
			if (
				Object.hasOwn(BINARY_OPERATORS, toCheck) &&
				(!isIdentifierStart(expression.charCodeAt(index)) ||
					(index + toCheck.length < expression.length &&
						!isIdentifierPart(
							expression.charCodeAt(index + toCheck.length),
						))) &&
				// Don't match "=" when it's part of "=>"
				!(toCheck === "=" && expression.charCodeAt(index + 1) === 62) // 62 is ">"
			) {
				index += toCheckLength;
				return toCheck;
			}
			toCheck = toCheck.substring(0, --toCheckLength);
		}
		return false;
	};

	/**
	 * Parses a complete expression including binary operators and ternary conditionals. This is the main entry point for parsing individual expressions.
	 * @returns {Object} AST node representing the complete expression.
	 */
	const gobbleExpression = () => {
		let node = gobbleBinaryExpression();
		gobbleSpaces();
		node = gobbleTernary(node);
		node = gobbleArrowFunction(node);
		return node;
	};

	/**
	 * Parses an arrow function if the => operator is present.
	 * @param {Object} node - The node that could be parameters (identifier or array of parameters in parentheses).
	 * @returns {Object} The ARROW node if arrow function detected, otherwise the original node.
	 */
	const gobbleArrowFunction = (node) => {
		gobbleSpaces();
		if (
			node &&
			(node.type === IDENTIFIER || node.type === ARRAY || node.type === ARROW)
		) {
			if (
				expression.charCodeAt(index) === EQUAL_CODE &&
				expression.charCodeAt(index + 1) === ANGLE_RIGHT_CODE
			) {
				index += 2;
				gobbleSpaces();
				let body;
				if (expression.charCodeAt(index) === OPENING_BRACES_CODE) {
					body = gobbleBlockBody();
				} else {
					body = gobbleExpression();
				}
				let parameters;
				if (node.type === IDENTIFIER) {
					parameters = [node];
				} else if (node.type === ARRAY) {
					parameters = node.elements;
				} else {
					parameters = [];
				}
				return {
					type: ARROW,
					parameters,
					body,
				};
			} else if (expression.charCodeAt(index) === OPENING_BRACES_CODE) {
				const body = gobbleBlockBody();
				return {
					type: ARROW,
					parameters: node.type === ARRAY ? node.elements : [node],
					body,
				};
			}
		}
		return node;
	};

	/**
	 * Parses a block body for arrow functions (expressions inside {} with optional return).
	 * @returns {Object} RETURN node if there's a return statement, otherwise the last expression.
	 */
	const gobbleBlockBody = () => {
		const startIndex = index;
		index++;
		gobbleSpaces();

		// Check if this looks like an object literal or block body
		// Object: { key: value } or { key } or { [computed]: value }
		// Block: { return x; } or { x; } or { x }
		// If we see an identifier followed by : or , or }, it's likely an object
		// Otherwise, it's a block body
		let isObjectLiteral = false;
		let checkIndex = index;
		while (checkIndex < expression.length) {
			const ch = expression.charCodeAt(checkIndex);
			if (ch === CLOSING_BRACES_CODE) {
				break;
			}
			if (ch === COLON_CODE) {
				isObjectLiteral = true;
				break;
			}
			if (ch === COMMA_CODE) {
				isObjectLiteral = true;
				break;
			}
			if (ch === OPENING_BRACKET_CODE) {
				isObjectLiteral = true;
				break;
			}
			checkIndex++;
		}

		// Restore index to start of block
		index = startIndex;

		if (isObjectLiteral) {
			// It's an object literal, parse as expression
			return gobbleExpression();
		}

		// It's a block body - parse statements
		index++; // skip opening {
		gobbleSpaces();
		const nodes = gobbleExpressions(CLOSING_BRACES_CODE);
		gobbleSpaces(); // skip trailing spaces
		if (expression.charCodeAt(index) === CLOSING_BRACES_CODE) {
			index++;
		}
		if (nodes.length === 0) {
			return undefined;
		}
		if (nodes.length === 1 && nodes[0].type !== RETURN) {
			return nodes[0];
		}
		return {
			type: RETURN,
			argument: nodes.length === 1 ? nodes[0].argument : undefined,
		};
	};

	/**
	 * Parses multiple expressions separated by commas or semicolons. Used for parsing sequences like (a, b, c) or function arguments.
	 * @param {number} [untilCharacterCode] - Optional character code that terminates the expression list.
	 * @returns {Array} Array of parsed expression nodes.
	 */
	const gobbleExpressions = (untilCharacterCode) => {
		const nodes = [];
		while (index < expression.length) {
			const characterIndex = expression.charCodeAt(index);
			if (characterIndex === SEMICOLON_CODE || characterIndex === COMMA_CODE) {
				index++;
			} else {
				const node = gobbleExpression();
				if (node) {
					nodes.push(node);
					if (node.type === RETURN) {
						if (expression.charCodeAt(index) === SEMICOLON_CODE) {
							index++;
						}
						break;
					}
				} else if (index < expression.length) {
					if (characterIndex === untilCharacterCode) {
						break;
					}
					throw new Error(`Unexpected "${expression.charAt(index)}"`);
				}
			}
		}
		return nodes;
	};

	/**
	 * Parses an identifier (variable name, function name, etc.). Identifiers must start with a letter, underscore, or dollar sign.
	 * @returns {Object} AST node with type IDENTIFIER and name property.
	 * @throws {Error} If the current character cannot start an identifier.
	 */
	const gobbleIdentifier = () => {
		let character = expression.charCodeAt(index);
		const start = index;

		if (isIdentifierStart(character)) {
			index++;
		} else {
			throw new Error(`Unexpected ${expression.charAt(index)}`);
		}

		while (index < expression.length) {
			character = expression.charCodeAt(index);

			if (isIdentifierPart(character)) {
				index++;
			} else {
				break;
			}
		}
		return {
			type: IDENTIFIER,
			name: expression.slice(start, index),
		};
	};

	/**
	 * Parses a numeric literal (integer, decimal, or scientific notation). Supports formats like: 42, 3.14, 1e10, 1.5e-3
	 * @returns {Object} AST node with type LITERAL and numeric value.
	 * @throws {Error} If the number format is invalid.
	 */
	const gobbleNumericLiteral = () => {
		let number = "";
		while (isDecimalDigit(expression.charCodeAt(index))) {
			number += expression.charAt(index++);
		}
		if (expression.charCodeAt(index) === PERIOD_CODE) {
			number += expression.charAt(index++);
			while (isDecimalDigit(expression.charCodeAt(index))) {
				number += expression.charAt(index++);
			}
		}

		let character = expression.charAt(index);
		if (character === "e" || character === "E") {
			number += expression.charAt(index++);
			character = expression.charAt(index);

			if (character === "+" || character === "-") {
				number += expression.charAt(index++);
			}

			while (isDecimalDigit(expression.charCodeAt(index))) {
				number += expression.charAt(index++);
			}

			if (!isDecimalDigit(expression.charCodeAt(index - 1))) {
				throw new Error(
					`Expected exponent (${number}${expression.charAt(index)})`,
				);
			}
		}

		const characterCode = expression.charCodeAt(index);
		if (isIdentifierStart(characterCode)) {
			throw new Error(
				"Variable names cannot start with a number (" +
					number +
					expression.charAt(index) +
					")",
			);
		} else if (
			characterCode === PERIOD_CODE ||
			(number.length === 1 && number.charCodeAt(0) === PERIOD_CODE)
		) {
			throw new Error("Unexpected period");
		}

		return {
			type: LITERAL,
			value: parseFloat(number),
			// raw: number,
		};
	};

	/**
	 * Parses an object literal expression like {a: 1, b: 2}. Supports shorthand properties {a}, computed properties {[key]: value}, and regular key-value pairs.
	 * @returns {Object|undefined} AST node with type OBJECT and properties array, or undefined if not an object.
	 */
	const gobbleObjectExpression = () => {
		if (expression.charCodeAt(index) === OPENING_BRACES_CODE) {
			index++;

			const properties = [];
			while (!Number.isNaN(expression.charCodeAt(index))) {
				gobbleSpaces();
				if (expression.charCodeAt(index) === CLOSING_BRACES_CODE) {
					index++;
					return gobbleTokenProperty({
						type: OBJECT,
						properties,
					});
				}

				const key = gobbleToken();
				if (!key) {
					throw new Error("Missing }");
				}
				gobbleSpaces();

				if (
					key.type === IDENTIFIER &&
					(expression.charCodeAt(index) === COMMA_CODE ||
						expression.charCodeAt(index) === CLOSING_BRACES_CODE)
				) {
					properties.push({
						type: PROPERTY,
						computed: false,
						key,
						value: key,
						shorthand: true,
					});
				} else if (expression.charCodeAt(index) === COLON_CODE) {
					index++;
					gobbleSpaces();
					const value = gobbleExpression();
					if (!value) {
						throw new Error("Unexpected object property");
					}

					const computed = key.type === ARRAY;
					properties.push({
						computed,
						key: computed ? key.elements[0] : key,
						shorthand: false,
						type: PROPERTY,
						value,
					});
					gobbleSpaces();
				} else if (key) {
					properties.push(key);
				}

				if (expression.charCodeAt(index) === COMMA_CODE) {
					index++;
				}
			}
			throw new Error("Missing }");
		}
	};

	const gobbleRegularExpression = () => {
		if (expression.charCodeAt(index) === FORWARD_SLASH_CODE) {
			const startIndex = ++index;

			let inCharSet = false;
			while (index < expression.length) {
				if (expression.charCodeAt(index) === FORWARD_SLASH_CODE && !inCharSet) {
					const pattern = expression.slice(startIndex, index);

					let flags = "";
					while (++index < expression.length) {
						const code = expression.charCodeAt(index);
						if (
							(code >= LOWER_A_CODE && code <= LOWER_Z_CODE) ||
							(code >= UPPER_A_CODE && code <= UPPER_Z_CODE) ||
							(code >= ZERO_CODE && code <= NINE_CODE)
						) {
							flags += expression.charAt(index);
						} else {
							break;
						}
					}

					let value;
					try {
						value = new RegExp(pattern, flags);
					} catch (error) {
						this.throwError(error.message);
					}

					// Allow for function calls after regular expression `/regex/.test(a)`.
					return gobbleTokenProperty({
						type: LITERAL,
						value,
						// raw: expression.slice(startIndex - 1, index),
					});
				}
				if (expression.charCodeAt(index) === OPENING_BRACKET_CODE) {
					inCharSet = true;
				} else if (
					inCharSet &&
					expression.charCodeAt(index) === CLOSING_BRACKET_CODE
				) {
					inCharSet = false;
				}
				index += expression.charCodeAt(index) === BACK_SLASH_CODE ? 2 : 1;
			}
			this.throwError("Unclosed Regular expression");
		}
	};

	/**
	 * Parses a parenthesized expression or sequence like (a, b, c). Single expressions in parentheses are returned directly; multiple become a SEQUENCE node.
	 * @returns {Object|false} The inner expression node, a SEQUENCE node, or false if empty.
	 * @throws {Error} If the parentheses are not closed.
	 */
	const gobbleSequence = () => {
		index++;

		const nodes = gobbleExpressions(CLOSING_PARENTHESIS_CODE);
		if (expression.charCodeAt(index) === CLOSING_PARENTHESIS_CODE) {
			index++;

			gobbleSpaces();

			if (
				expression.charCodeAt(index) === EQUAL_CODE &&
				expression.charCodeAt(index + 1) === ANGLE_RIGHT_CODE
			) {
				index += 2;
				gobbleSpaces();
				let body;
				if (expression.charCodeAt(index) === OPENING_BRACES_CODE) {
					body = gobbleBlockBody();
				} else {
					body = gobbleExpression();
				}
				return {
					type: ARROW,
					parameters: nodes,
					body,
				};
			}

			if (nodes.length === 1) {
				return nodes[0];
			}
			if (!nodes.length) {
				return false;
			}

			return {
				type: SEQUENCE,
				expressions: nodes,
			};
		}

		throw new Error("Unclosed (");
	};

	/**
	 * Skips whitespace characters (space, tab, newline, carriage return). Advances the index past any consecutive whitespace.
	 */
	const gobbleSpaces = () => {
		while (SPACE_CODES.indexOf(expression.charCodeAt(index)) >= 0) {
			index++;
		}
	};

	/**
	 * Parses a string literal enclosed in single or double quotes. Supports escape sequences like \n, \t, \r, etc.
	 * @returns {Object} AST node with type LITERAL and string value.
	 * @throws {Error} If the string is not properly closed.
	 */
	const gobbleStringLiteral = () => {
		let value = "";
		// const startIndex = index
		const quote = expression.charCodeAt(index++);

		while (index < expression.length) {
			const characterCode = expression.charCodeAt(index++);
			if (characterCode === quote) {
				return {
					type: LITERAL,
					value,
					// raw: expression.substring(startIndex, index),
				};
			}
			if (characterCode === BACK_SLASH_CODE) {
				const character = expression.charAt(index++);

				switch (character) {
					case "n":
						value += "\n";
						break;
					case "r":
						value += "\r";
						break;
					case "t":
						value += "\t";
						break;
					case "b":
						value += "\b";
						break;
					case "f":
						value += "\f";
						break;
					case "v":
						value += "\x0B";
						break;
					default:
						value += character;
				}
			} else {
				value += expression.charAt(index - 1);
			}
		}
		throw new Error(`Unclosed quote after "${value}"`);
	};

	const gobbleTemplateLiteral = () => {
		index++;
		let value = "";
		// const startIndex = index

		const elements = [];
		const expressions = [];

		while (index < expression.length) {
			const characterCode = expression.charCodeAt(index++);
			if (characterCode === BACKTICK_CODE) {
				elements.push(value);
				value = "";

				return {
					type: TEMPLATE,
					expressions,
					elements,
					// raw: expression.substring(startIndex, index),
				};
			}
			if (
				characterCode === DOLLAR_CODE &&
				expression.charCodeAt(index) === OPENING_BRACES_CODE
			) {
				index++;

				elements.push(value);
				value = "";

				expressions.push(...gobbleExpressions(CLOSING_BRACES_CODE));
				if (expression.charCodeAt(index) !== CLOSING_BRACES_CODE) {
					throw new Error(`Unclosed \${ in template "${value}"`);
				}
				index++;
			} else if (characterCode === BACK_SLASH_CODE) {
				const character = expression.charAt(index++);

				switch (character) {
					case "n":
						value += "\n";
						break;
					case "r":
						value += "\r";
						break;
					case "t":
						value += "\t";
						break;
					case "b":
						value += "\b";
						break;
					case "f":
						value += "\f";
						break;
					case "v":
						value += "\x0B";
						break;
					default:
						value += character;
				}
			} else {
				value += expression.charAt(index - 1);
			}
		}
		throw new Error(`Unclosed template after "${value}"`);
	};

	/**
	 * Parses a ternary conditional expression (condition ? consequent : alternate). Takes the already-parsed condition node and adds the branches.
	 * @param {Object} node - The condition expression node.
	 * @returns {Object} A CONDITION node with condition, consequent, and alternate properties.
	 * @throws {Error} If the ternary syntax is invalid (missing : or expressions).
	 */
	const gobbleTernary = (node) => {
		if (!node || expression.charCodeAt(index) !== QUESTION_MARK_CODE) {
			return node;
		}
		index++;

		const consequent = gobbleExpression();
		if (!consequent) {
			throw new Error("Expected expression");
		}

		gobbleSpaces();

		if (!expression.charCodeAt(index) === COLON_CODE) {
			throw new Error("Expected :");
		}
		index++;

		const alternate = gobbleExpression();
		if (!alternate) {
			throw new Error("Expected expression");
		}

		let conditional = {
			type: CONDITION,
			condition: node,
			consequent,
			alternate,
		};

		if (node.operator && BINARY_OPERATORS[node.operator] <= 1) {
			let newCondition = node;
			while (
				newCondition.right.operator &&
				BINARY_OPERATORS[newCondition.right.operator] <= 1
			) {
				newCondition = newCondition.right;
			}
			conditional.condition = newCondition.right;
			newCondition.right = conditional;
			conditional = node;
		}

		return conditional;
	};

	/**
	 * Parses a single token (identifier, literal, or complex expression). This is the lowest-level parsing function that handles all token types.
	 * @returns {Object|undefined} AST node for the token, or undefined if no token found.
	 */
	const gobbleToken = () => {
		let node = gobbleObjectExpression() || gobbleUpdatePrefixExpression();
		if (node) {
			return gobbleUpdateSuffixExpression(node);
		}
		gobbleSpaces();

		const character = expression.charCodeAt(index);

		if (
			character === PERIOD_CODE &&
			expression.charCodeAt(index + 1) === PERIOD_CODE &&
			expression.charCodeAt(index + 2) === PERIOD_CODE
		) {
			index += 3;
			node = {
				type: SPREAD,
				arguments: gobbleExpression(),
			};
		} else if (character === PERIOD_CODE || isDecimalDigit(character)) {
			return gobbleNumericLiteral();
		} else if (
			character === DOUBLE_QUOTE_CODE ||
			character === SINGLE_QUOTE_CODE
		) {
			node = gobbleStringLiteral();
		} else if (character === BACKTICK_CODE) {
			node = gobbleTemplateLiteral();
		} else if (character === OPENING_BRACKET_CODE) {
			node = gobbleArray();
		} else if (character === FORWARD_SLASH_CODE) {
			node = gobbleRegularExpression();
		} else {
			let toCheck = expression.substring(index, index + 1); // 1 = Maximum unary operator length.
			let toCheckLength = toCheck.length;

			while (toCheckLength > 0) {
				if (
					UNARY_OPERATORS.indexOf(toCheck) >= 0 &&
					(!isIdentifierStart(expression.charCodeAt(index)) ||
						(index + toCheck.length < expression.length &&
							!isIdentifierPart(expression.charCodeAt(index + toCheck.length))))
				) {
					index += toCheckLength;
					const parameter = gobbleToken();
					if (!parameter) {
						throw new Error("Missing unary operation parameter");
					}
					return gobbleUpdateSuffixExpression({
						type: UNARY,
						operator: toCheck,
						parameter,
					});
				}

				toCheck = toCheck.substring(0, --toCheckLength);
			}
		}

		if (isIdentifierStart(character)) {
			node = gobbleIdentifier();
			if (Object.hasOwn(LITERALS, node.name)) {
				node = {
					type: LITERAL,
					value: LITERALS[node.name],
					// raw: node.name,
				};
			} else if (node.name === "return") {
				const argument = gobbleExpression();
				node = {
					type: RETURN,
					argument,
				};
			}
		} else if (character === OPENING_PARENTHESIS_CODE) {
			node = gobbleSequence();
		}

		return gobbleUpdateSuffixExpression(gobbleTokenProperty(node));
	};

	/**
	 * Parses property access, method calls, and computed member access on a token. Handles dot notation (obj.prop), bracket notation (obj[prop]), and function calls (fn()). Also supports optional chaining (obj?.prop).
	 * @param {Object} node - The base expression node.
	 * @returns {Object} The node with any chained property accesses or calls attached.
	 */
	const gobbleTokenProperty = (node) => {
		gobbleSpaces();

		let character = expression.charCodeAt(index);
		while (
			character === PERIOD_CODE ||
			character === OPENING_BRACKET_CODE ||
			character === OPENING_PARENTHESIS_CODE ||
			character === QUESTION_MARK_CODE
		) {
			let optional;
			if (character === QUESTION_MARK_CODE) {
				if (expression.charCodeAt(index + 1) !== PERIOD_CODE) {
					break;
				}
				optional = true;
				index += 2;
				gobbleSpaces();
				character = expression.charCodeAt(index);
			}
			index++;

			if (character === OPENING_BRACKET_CODE) {
				node = {
					type: MEMBER,
					computed: true,
					object: node,
					property: gobbleExpression(),
				};
				gobbleSpaces();
				character = expression.charCodeAt(index);
				if (character !== CLOSING_BRACKET_CODE) {
					throw new Error("Unclosed [");
				}
				index++;
			} else if (character === OPENING_PARENTHESIS_CODE) {
				node = {
					type: CALL,
					parameters: gobbleParameters(CLOSING_PARENTHESIS_CODE),
					callee: node,
				};
			} else if (character === PERIOD_CODE || optional) {
				if (optional) {
					index--;
				}
				gobbleSpaces();
				node = {
					type: MEMBER,
					computed: false,
					object: node,
					property: gobbleIdentifier(),
				};
			}

			if (optional) {
				node.optional = true;
			}

			gobbleSpaces();
			character = expression.charCodeAt(index);
		}

		return node;
	};

	/**
	 * Parses prefix increment/decrement operators (++x, --x). The operator appears before the operand and the value is modified before returning.
	 * @returns {Object|undefined} UPDATE node with prefix: true, or undefined if not an update expression.
	 * @throws {Error} If the operator is not followed by a valid identifier or member expression.
	 */
	const gobbleUpdatePrefixExpression = () => {
		if (index + 1 < expression.length) {
			const characters = expression.substring(index, index + 2); // 2 = Maximum update expression length
			if (
				characters === UPDATE_OPERATOR_DECREMENT ||
				characters === UPDATE_OPERATOR_INCREMENT
			) {
				index += 2;
				const node = {
					type: UPDATE,
					operator: characters,
					parameter: gobbleTokenProperty(gobbleIdentifier()),
					prefix: true,
				};
				if (
					!node.parameter ||
					(node.parameter.type !== IDENTIFIER && node.parameter.type !== MEMBER)
				) {
					throw new Error(`Unexpected ${node.operator}`);
				}
				return node;
			}
		}
	};

	/**
	 * Parses suffix/postfix increment/decrement operators (x++, x--). The operator appears after the operand and the original value is returned before modification.
	 * @param {Object} node - The expression node that might have a suffix update operator.
	 * @returns {Object} The original node, or an UPDATE node with prefix: false if suffix operator found.
	 */
	const gobbleUpdateSuffixExpression = (node) => {
		if (!node || index + 1 >= expression.length) {
			return node;
		}

		const characters = expression.substring(index, index + 2);
		let operator = null;
		if (characters === UPDATE_OPERATOR_DECREMENT) {
			operator = UPDATE_OPERATOR_DECREMENT;
		} else if (characters === UPDATE_OPERATOR_INCREMENT) {
			operator = UPDATE_OPERATOR_INCREMENT;
		} else {
			return node;
		}

		index += 2;
		node = {
			type: UPDATE,
			operator,
			parameter: node,
			prefix: false,
		};
		return node;
	};

	const nodes = gobbleExpressions();

	/**
	 * Parse complete and return the AST. Returns undefined if no expressions were parsed (empty input). Returns an array of nodes if multiple expressions were parsed.
	 */
	return nodes.length === 0 ? undefined : nodes;
};
