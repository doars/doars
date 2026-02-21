// src/types.js
var ARRAY = 5;
var ASSIGN = 6;
var BINARY = 7;
var CALL = 8;
var CONDITION = 9;
var IDENTIFIER = 2;
var LITERAL = 3;
var MEMBER = 10;
var OBJECT = 11;
var PROPERTY = 4;
var SEQUENCE = 12;
var SPREAD = 17;
var TEMPLATE = 18;
var UNARY = 13;
var UPDATE = 14;

// src/parse.js
var SPACE_CODES = [
  9,
  10,
  13,
  32
];
var DOUBLE_QUOTE_CODE = 34;
var DOLLAR_CODE = 36;
var SINGLE_QUOTE_CODE = 39;
var OPENING_PARENTHESIS_CODE = 40;
var CLOSING_PARENTHESIS_CODE = 41;
var COMMA_CODE = 44;
var PERIOD_CODE = 46;
var FORWARD_SLASH_CODE = 47;
var ZERO_CODE = 48;
var NINE_CODE = 57;
var COLON_CODE = 58;
var SEMICOLON_CODE = 59;
var QUESTION_MARK_CODE = 63;
var LOWER_A_CODE = 65;
var LOWER_Z_CODE = 90;
var OPENING_BRACKET_CODE = 91;
var BACK_SLASH_CODE = 92;
var CLOSING_BRACKET_CODE = 93;
var UNDERSCORE_CODE = 95;
var BACKTICK_CODE = 96;
var UPPER_A_CODE = 97;
var UPPER_Z_CODE = 122;
var OPENING_BRACES_CODE = 123;
var CLOSING_BRACES_CODE = 125;
var ASSIGNMENT_OPERATORS = [
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
  "||="
];
var BINARY_OPERATORS = {
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
  "-": 11
};
var UNARY_OPERATORS = ["-", "!", "~", "+"];
var UPDATE_OPERATOR_DECREMENT = "--";
var UPDATE_OPERATOR_INCREMENT = "++";
var LITERALS = {
  true: true,
  false: false,
  null: null,
  undefined: undefined
};
var isDecimalDigit = (character) => character >= ZERO_CODE && character <= NINE_CODE;
var isIdentifierPart = (character) => isIdentifierStart(character) || isDecimalDigit(character);
var isIdentifierStart = (character) => character >= ZERO_CODE && character <= NINE_CODE || character >= LOWER_A_CODE && character <= LOWER_Z_CODE || character >= UPPER_A_CODE && character <= UPPER_Z_CODE || character === DOLLAR_CODE || character === UNDERSCORE_CODE;
var parse_default = (expression) => {
  let index = 0;
  const gobbleArray = () => {
    index++;
    return {
      type: ARRAY,
      elements: gobbleParameters(CLOSING_BRACKET_CODE)
    };
  };
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
        if (termination === CLOSING_PARENTHESIS_CODE && separatorCount && separatorCount >= parameters.length) {
          throw new Error(`Unexpected token ${String.fromCharCode(termination)}`);
        }
        break;
      } else if (characterIndex === COMMA_CODE) {
        index++;
        separatorCount++;
        if (separatorCount !== parameters.length) {
          if (termination === CLOSING_PARENTHESIS_CODE) {
            throw new Error("Unexpected token ,");
          } else if (termination === CLOSING_BRACKET_CODE) {
            for (let i = parameters.length;i < separatorCount; i++) {
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
  const gobbleBinaryExpression = () => {
    let left = gobbleToken();
    if (!left) {
      return left;
    }
    let value = gobbleBinaryOperation();
    if (!value) {
      return left;
    }
    let binaryOperationInfo = {
      value,
      precedence: BINARY_OPERATORS[value] || 0
    };
    let right = gobbleToken();
    if (!right) {
      throw new Error(`Expected expression after ${value}`);
    }
    const stack = [left, binaryOperationInfo, right];
    let node;
    while (value = gobbleBinaryOperation()) {
      const precedence = BINARY_OPERATORS[value] || 0;
      if (precedence === 0) {
        index -= value.length;
        break;
      }
      binaryOperationInfo = {
        value,
        precedence
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
          right
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
        right: node
      };
      i -= 2;
    }
    return node;
  };
  const gobbleBinaryOperation = () => {
    gobbleSpaces();
    let toCheck = expression.substring(index, index + 3);
    let toCheckLength = toCheck.length;
    while (toCheckLength > 0) {
      if (Object.hasOwn(BINARY_OPERATORS, toCheck) && (!isIdentifierStart(expression.charCodeAt(index)) || index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))) {
        index += toCheckLength;
        return toCheck;
      }
      toCheck = toCheck.substring(0, --toCheckLength);
    }
    return false;
  };
  const gobbleExpression = () => {
    let node = gobbleBinaryExpression();
    gobbleSpaces();
    node = gobbleTernary(node);
    return node;
  };
  const gobbleExpressions = (untilCharacterCode) => {
    const nodes2 = [];
    while (index < expression.length) {
      const characterIndex = expression.charCodeAt(index);
      if (characterIndex === SEMICOLON_CODE || characterIndex === COMMA_CODE) {
        index++;
      } else {
        const node = gobbleExpression();
        if (node) {
          nodes2.push(node);
        } else if (index < expression.length) {
          if (characterIndex === untilCharacterCode) {
            break;
          }
          throw new Error(`Unexpected "${expression.charAt(index)}"`);
        }
      }
    }
    return nodes2;
  };
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
      name: expression.slice(start, index)
    };
  };
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
        throw new Error(`Expected exponent (${number}${expression.charAt(index)})`);
      }
    }
    const characterCode = expression.charCodeAt(index);
    if (isIdentifierStart(characterCode)) {
      throw new Error("Variable names cannot start with a number (" + number + expression.charAt(index) + ")");
    } else if (characterCode === PERIOD_CODE || number.length === 1 && number.charCodeAt(0) === PERIOD_CODE) {
      throw new Error("Unexpected period");
    }
    return {
      type: LITERAL,
      value: parseFloat(number)
    };
  };
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
            properties
          });
        }
        const key = gobbleToken();
        if (!key) {
          throw new Error("Missing }");
        }
        gobbleSpaces();
        if (key.type === IDENTIFIER && (expression.charCodeAt(index) === COMMA_CODE || expression.charCodeAt(index) === CLOSING_BRACES_CODE)) {
          properties.push({
            type: PROPERTY,
            computed: false,
            key,
            value: key,
            shorthand: true
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
            value
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
            if (code >= LOWER_A_CODE && code <= LOWER_Z_CODE || code >= UPPER_A_CODE && code <= UPPER_Z_CODE || code >= ZERO_CODE && code <= NINE_CODE) {
              flags += expression.charAt(index);
            } else {
              break;
            }
          }
          let value;
          try {
            value = new RegExp(pattern, flags);
          } catch (error) {
            null.throwError(error.message);
          }
          return gobbleTokenProperty({
            type: LITERAL,
            value
          });
        }
        if (expression.charCodeAt(index) === OPENING_BRACKET_CODE) {
          inCharSet = true;
        } else if (inCharSet && expression.charCodeAt(index) === CLOSING_BRACKET_CODE) {
          inCharSet = false;
        }
        index += expression.charCodeAt(index) === BACK_SLASH_CODE ? 2 : 1;
      }
      null.throwError("Unclosed Regular expression");
    }
  };
  const gobbleSequence = () => {
    index++;
    const nodes2 = gobbleExpressions(CLOSING_PARENTHESIS_CODE);
    if (expression.charCodeAt(index) === CLOSING_PARENTHESIS_CODE) {
      index++;
      if (nodes2.length === 1) {
        return nodes2[0];
      }
      if (!nodes2.length) {
        return false;
      }
      return {
        type: SEQUENCE,
        expressions: nodes2
      };
    }
    throw new Error("Unclosed (");
  };
  const gobbleSpaces = () => {
    while (SPACE_CODES.indexOf(expression.charCodeAt(index)) >= 0) {
      index++;
    }
  };
  const gobbleStringLiteral = () => {
    let value = "";
    const quote = expression.charCodeAt(index++);
    while (index < expression.length) {
      const characterCode = expression.charCodeAt(index++);
      if (characterCode === quote) {
        return {
          type: LITERAL,
          value
        };
      }
      if (characterCode === BACK_SLASH_CODE) {
        const character = expression.charAt(index++);
        switch (character) {
          case "n":
            value += `
`;
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
            value += "\v";
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
          elements
        };
      }
      if (characterCode === DOLLAR_CODE && expression.charCodeAt(index) === OPENING_BRACES_CODE) {
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
            value += `
`;
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
            value += "\v";
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
      alternate
    };
    if (node.operator && BINARY_OPERATORS[node.operator] <= 1) {
      let newCondition = node;
      while (newCondition.right.operator && BINARY_OPERATORS[newCondition.right.operator] <= 1) {
        newCondition = newCondition.right;
      }
      conditional.condition = newCondition.right;
      newCondition.right = conditional;
      conditional = node;
    }
    return conditional;
  };
  const gobbleToken = () => {
    let node = gobbleObjectExpression() || gobbleUpdatePrefixExpression();
    if (node) {
      return gobbleUpdateSuffixExpression(node);
    }
    gobbleSpaces();
    const character = expression.charCodeAt(index);
    if (character === PERIOD_CODE && expression.charCodeAt(index + 1) === PERIOD_CODE && expression.charCodeAt(index + 2) === PERIOD_CODE) {
      index += 3;
      node = {
        type: SPREAD,
        arguments: gobbleExpression()
      };
    } else if (character === PERIOD_CODE || isDecimalDigit(character)) {
      return gobbleNumericLiteral();
    } else if (character === DOUBLE_QUOTE_CODE || character === SINGLE_QUOTE_CODE) {
      node = gobbleStringLiteral();
    } else if (character === BACKTICK_CODE) {
      node = gobbleTemplateLiteral();
    } else if (character === OPENING_BRACKET_CODE) {
      node = gobbleArray();
    } else if (character === FORWARD_SLASH_CODE) {
      node = gobbleRegularExpression();
    } else {
      let toCheck = expression.substring(index, index + 1);
      let toCheckLength = toCheck.length;
      while (toCheckLength > 0) {
        if (UNARY_OPERATORS.indexOf(toCheck) >= 0 && (!isIdentifierStart(expression.charCodeAt(index)) || index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))) {
          index += toCheckLength;
          const parameter = gobbleToken();
          if (!parameter) {
            throw new Error("Missing unary operation parameter");
          }
          return gobbleUpdateSuffixExpression({
            type: UNARY,
            operator: toCheck,
            parameter
          });
        }
        toCheck = toCheck.substring(0, --toCheckLength);
      }
      if (isIdentifierStart(character)) {
        node = gobbleIdentifier();
        if (Object.hasOwn(LITERALS, node.name)) {
          node = {
            type: LITERAL,
            value: LITERALS[node.name]
          };
        }
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = gobbleSequence();
      }
    }
    return gobbleUpdateSuffixExpression(gobbleTokenProperty(node));
  };
  const gobbleTokenProperty = (node) => {
    gobbleSpaces();
    let character = expression.charCodeAt(index);
    while (character === PERIOD_CODE || character === OPENING_BRACKET_CODE || character === OPENING_PARENTHESIS_CODE || character === QUESTION_MARK_CODE) {
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
          property: gobbleExpression()
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
          callee: node
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
          property: gobbleIdentifier()
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
  const gobbleUpdatePrefixExpression = () => {
    if (index + 1 < expression.length) {
      const characters = expression.substring(index, index + 2);
      if (characters === UPDATE_OPERATOR_DECREMENT || characters === UPDATE_OPERATOR_INCREMENT) {
        index += 2;
        const node = {
          type: UPDATE,
          operator: characters,
          parameter: gobbleTokenProperty(gobbleIdentifier()),
          prefix: true
        };
        if (!node.parameter || node.parameter.type !== IDENTIFIER && node.parameter.type !== MEMBER) {
          throw new Error(`Unexpected ${node.operator}`);
        }
        return node;
      }
    }
  };
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
      prefix: false
    };
    return node;
  };
  const nodes = gobbleExpressions();
  return nodes.length === 0 ? undefined : nodes;
};

// src/run.js
var setToContext = (node, value, context = {}) => {
  switch (node.type) {
    case IDENTIFIER:
      context[node.name] = value;
      return value;
    case MEMBER: {
      const memberObject = run(node.object, context);
      const memberProperty = node.computed || node.property.type !== IDENTIFIER ? run(node.property, context) : node.property.name;
      if (typeof value === "function") {
        return value.bind(memberObject);
      }
      memberObject[memberProperty] = value;
      return value;
    }
  }
  throw new Error("Unsupported assignment method.");
};
var run = (node, context = {}) => {
  if (!node) {
    return;
  }
  if (Array.isArray(node)) {
    return node.map((node2) => run(node2, context));
  }
  switch (node.type) {
    case IDENTIFIER:
      return context[node.name];
    case LITERAL:
      return node.value;
    case ARRAY: {
      const arrayResults = [];
      for (const arrayElement of node.elements) {
        if (arrayElement.type === SPREAD) {
          arrayResults.push(...run(arrayElement.arguments, context));
        } else {
          arrayResults.push(run(arrayElement, context));
        }
      }
      return arrayResults;
    }
    case ASSIGN: {
      let assignmentValue = run(node.right, context);
      if (node.operator !== "=") {
        const assignmentLeft = run(node.left, context);
        switch (node.operator) {
          case "-=":
            assignmentValue = assignmentLeft - assignmentValue;
            break;
          case "??=":
            if (assignmentLeft !== null && assignmentLeft !== undefined) {
              return assignmentLeft;
            }
            break;
          case "*=":
            assignmentValue = assignmentLeft * assignmentValue;
            break;
          case "**=":
            assignmentValue = assignmentLeft ** assignmentValue;
            break;
          case "/=":
            assignmentValue = assignmentLeft / assignmentValue;
            break;
          case "&=":
            assignmentValue = assignmentLeft & assignmentValue;
            break;
          case "&&=":
            if (!assignmentLeft) {
              return assignmentLeft;
            }
            break;
          case "%=":
            assignmentValue = assignmentLeft % assignmentValue;
            break;
          case "^=":
            assignmentValue = assignmentLeft ^ assignmentValue;
            break;
          case "+=":
            assignmentValue = assignmentLeft + assignmentValue;
            break;
          case "<<=":
            assignmentValue = assignmentLeft << assignmentValue;
            break;
          case ">>=":
            assignmentValue = assignmentLeft >> assignmentValue;
            break;
          case ">>>=":
            assignmentValue = assignmentLeft >>> assignmentValue;
            break;
          case "|=":
            assignmentValue = assignmentLeft | assignmentValue;
            break;
          case "||=":
            if (assignmentLeft) {
              return assignmentLeft;
            }
            break;
        }
      }
      return setToContext(node.left, assignmentValue, context);
    }
    case BINARY: {
      const binaryLeft = run(node.left, context);
      const binaryRight = run(node.right, context);
      switch (node.operator) {
        case "-":
          return binaryLeft - binaryRight;
        case "!=":
          return binaryLeft !== binaryRight;
        case "!==":
          return binaryLeft !== binaryRight;
        case "??":
          return binaryLeft ?? binaryRight;
        case "*":
          return binaryLeft * binaryRight;
        case "**":
          return binaryLeft ** binaryRight;
        case "/":
          return binaryLeft / binaryRight;
        case "&":
          return binaryLeft & binaryRight;
        case "&&":
          return binaryLeft && binaryRight;
        case "%":
          return binaryLeft % binaryRight;
        case "^":
          return binaryLeft ^ binaryRight;
        case "+":
          return binaryLeft + binaryRight;
        case "<":
          return binaryLeft < binaryRight;
        case "<<":
          return binaryLeft << binaryRight;
        case "<=":
          return binaryLeft <= binaryRight;
        case "==":
          return binaryLeft === binaryRight;
        case "===":
          return binaryLeft === binaryRight;
        case ">":
          return binaryLeft > binaryRight;
        case ">=":
          return binaryLeft >= binaryRight;
        case ">>":
          return binaryLeft >> binaryRight;
        case ">>>":
          return binaryLeft >>> binaryRight;
        case "|":
          return binaryLeft | binaryRight;
        case "||":
          return binaryLeft || binaryRight;
      }
      throw new Error(`Unsupported operator: ${node.operator}`);
    }
    case CALL: {
      const parameters = [];
      for (const parameter of node.parameters) {
        if (parameter.type === SPREAD) {
          parameters.push(...run(parameter.arguments, context));
        } else {
          parameters.push(run(parameter, context));
        }
      }
      return run(node.callee, context)(...parameters);
    }
    case CONDITION:
      return run(node.condition, context) ? run(node.consequent, context) : run(node.alternate, context);
    case MEMBER: {
      const memberObject = run(node.object, context);
      const memberProperty = node.computed || node.property.type !== IDENTIFIER ? run(node.property, context) : node.property.name;
      if (typeof memberObject[memberProperty] === "function") {
        return memberObject[memberProperty].bind(memberObject);
      }
      return memberObject[memberProperty];
    }
    case OBJECT: {
      const objectResult = {};
      for (const objectProperty of node.properties) {
        objectResult[objectProperty.computed || objectProperty.key.type !== IDENTIFIER ? run(objectProperty.key, context) : objectProperty.key.name] = run(objectProperty.value, context);
      }
      return objectResult;
    }
    case SEQUENCE:
      return node.expressions.map((node2) => run(node2, context));
    case SPREAD:
      return run(node.arguments, context);
    case TEMPLATE:
      return node.elements.map((element, index) => element + (index < node.expressions.length ? run(node.expressions[index], context).toString() : "")).join("");
    case UNARY: {
      const unaryParameter = run(node.parameter, context);
      switch (node.operator) {
        case "-":
          return -unaryParameter;
        case "!":
          return !unaryParameter;
        case "+":
          return +unaryParameter;
        case "~":
          return ~unaryParameter;
      }
      throw new Error(`Unsupported operator: ${node.operator}`);
    }
    case UPDATE: {
      const updateResult = run(node.parameter, context);
      const updateValue = node.operator === "--" ? -1 : 1;
      setToContext(node.parameter, updateResult + updateValue, context);
      return node.prefix ? updateResult + updateValue : updateResult;
    }
  }
  throw new Error(`Unexpected node type "${node.type}".`);
};
var run_default = run;

// src/index.js
var interpret = (expression, context) => run_default(parse_default(expression), context);
var parse = parse_default;
var run2 = run_default;
var ARRAY2 = ARRAY;
var ASSIGN2 = ASSIGN;
var BINARY2 = BINARY;
var CALL2 = CALL;
var CONDITION2 = CONDITION;
var IDENTIFIER2 = IDENTIFIER;
var LITERAL2 = LITERAL;
var MEMBER2 = MEMBER;
var OBJECT2 = OBJECT;
var PROPERTY2 = PROPERTY;
var SEQUENCE2 = SEQUENCE;
var UNARY2 = UNARY;
var UPDATE2 = UPDATE;
var src_default = {
  interpret,
  parse: parse_default,
  run: run_default,
  ARRAY,
  ASSIGN,
  BINARY,
  CALL,
  CONDITION,
  IDENTIFIER,
  LITERAL,
  MEMBER,
  OBJECT,
  PROPERTY,
  SEQUENCE,
  UNARY,
  UPDATE
};
export {
  run2 as run,
  parse,
  interpret,
  src_default as default,
  UPDATE2 as UPDATE,
  UNARY2 as UNARY,
  SEQUENCE2 as SEQUENCE,
  PROPERTY2 as PROPERTY,
  OBJECT2 as OBJECT,
  MEMBER2 as MEMBER,
  LITERAL2 as LITERAL,
  IDENTIFIER2 as IDENTIFIER,
  CONDITION2 as CONDITION,
  CALL2 as CALL,
  BINARY2 as BINARY,
  ASSIGN2 as ASSIGN,
  ARRAY2 as ARRAY
};

//# debugId=3A0DC7401C97B3E864756E2164756E21
