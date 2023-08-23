(() => {
  var __pow = Math.pow;

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
  var UNARY = 13;
  var UPDATE = 14;

  // src/parse.js
  var SPACE_CODES = [
    9,
    // Tab
    10,
    // LF
    13,
    // CR
    32
    // Space
  ];
  var OPENING_PARENTHESIS_CODE = 40;
  var CLOSING_PARENTHESIS_CODE = 41;
  var COMMA_CODE = 44;
  var PERIOD_CODE = 46;
  var COLON_CODE = 58;
  var QUESTION_MARK_CODE = 63;
  var OPENING_BRACKET_CODE = 91;
  var CLOSING_BRACKET_CODE = 93;
  var CLOSING_BRACES_CODE = 125;
  var ASSIGNMENT_OPERATORS = [
    "=",
    "||=",
    "&&=",
    "??=",
    "*=",
    "**=",
    "/=",
    "%=",
    "+=",
    "-="
    // '<<=',
    // '>>=',
    // '>>>=',
    // '&=',
    // '^=',
    // '|=',
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
    // '<<=': 1,
    // '>>=': 1,
    // '>>>=': 1,
    // '&=': 1,
    // '^=': 1,
    // '|=': 1,
    "||": 2,
    "&&": 3,
    "??": 4,
    // '|': 5,
    // '^': 6,
    // '&': 7,
    "==": 8,
    "!=": 8,
    "===": 8,
    "!==": 8,
    "<": 9,
    ">": 9,
    "<=": 9,
    ">=": 9,
    // '<<': 10,
    // '>>': 10,
    // '>>>': 10,
    "*": 11,
    "/": 11,
    "%": 11,
    "+": 11,
    "-": 11
  };
  var UNARY_OPERATORS = [
    "-",
    "!",
    // '~',
    "+"
  ];
  var UPDATE_OPERATOR_DECREMENT = "--";
  var UPDATE_OPERATOR_INCREMENT = "++";
  var LITERALS = {
    true: true,
    false: false,
    null: null,
    undefined: void 0
  };
  var isDecimalDigit = (character) => character >= 48 && character <= 57;
  var isIdentifierPart = (character) => isIdentifierStart(character) || isDecimalDigit(character);
  var isIdentifierStart = (character) => character === 36 || // Dollar ($)
  character >= 48 && character <= 57 || // Between 0 and 9
  character === 95 || // Underscore
  character >= 65 && character <= 90 || // Between A and Z
  character >= 97 && character <= 122;
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
            throw new Error("Unexpected token " + String.fromCharCode(termination));
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
        throw new Error("Expected " + String.fromCharCode(termination));
      }
      return parameters;
    };
    const gobbleBinaryExpression = () => {
      let left = gobbleToken();
      if (!left) {
        return left;
      }
      let operator = gobbleBinaryOperation();
      if (!operator) {
        return left;
      }
      let binaryOperationInfo = {
        value: operator,
        precedence: BINARY_OPERATORS[operator] || 0
      };
      let right = gobbleToken();
      if (!right) {
        throw new Error("Expected expression after " + operator);
      }
      const stack = [
        left,
        binaryOperationInfo,
        right
      ];
      let node;
      while (operator = gobbleBinaryOperation()) {
        const precedence = BINARY_OPERATORS[operator] || 0;
        if (precedence === 0) {
          index -= operator.length;
          break;
        }
        binaryOperationInfo = {
          value: operator,
          precedence
        };
        const currentBinaryOperation = operator;
        while (stack.length > 2 && stack[stack.length - 2] > precedence) {
          right = stack.pop();
          operator = stack.pop().value;
          left = stack.pop();
          node = {
            type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0 ? ASSIGN : BINARY,
            operator,
            left,
            right
          };
          stack.push(node);
        }
        node = gobbleToken();
        if (!node) {
          throw new Error("Expected expression after " + currentBinaryOperation);
        }
        stack.push(binaryOperationInfo, node);
      }
      let i = stack.length - 1;
      node = stack[i];
      while (i > 1) {
        operator = stack[i - 1].value;
        node = {
          type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0 ? ASSIGN : BINARY,
          operator,
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
        if (Object.prototype.hasOwnProperty.call(BINARY_OPERATORS, toCheck) && (!isIdentifierStart(expression.charCodeAt(index)) || index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))) {
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
        if (characterIndex === 59 || // Semicolon (;)
        characterIndex === COMMA_CODE) {
          index++;
        } else {
          const node = gobbleExpression();
          if (node) {
            nodes2.push(node);
          } else if (index < expression.length) {
            if (characterIndex === untilCharacterCode) {
              break;
            }
            throw new Error('Unexpected "' + expression.charAt(index) + '"');
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
        throw new Error("Unexpected " + expression.charAt(index));
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
          throw new Error("Expected exponent (" + number + expression.charAt(index) + ")");
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
        // raw: number,
      };
    };
    const gobbleObjectExpression = () => {
      if (expression.charCodeAt(index) !== 123) {
        return;
      }
      index++;
      const properties = [];
      while (!isNaN(expression.charCodeAt(index))) {
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
      let string = "";
      const quote = expression.charAt(index++);
      let closed = false;
      while (index < expression.length) {
        let character = expression.charAt(index++);
        if (character === quote) {
          closed = true;
          break;
        }
        if (character === "\\") {
          character = expression.charAt(index++);
          switch (character) {
            case "n":
              string += "\n";
              break;
            case "r":
              string += "\r";
              break;
            case "t":
              string += "	";
              break;
            case "b":
              string += "\b";
              break;
            case "f":
              string += "\f";
              break;
            case "v":
              string += "\v";
              break;
            default:
              string += character;
          }
        } else {
          string += character;
        }
      }
      if (!closed) {
        throw new Error('Unclosed quote after "' + string + '"');
      }
      return {
        type: LITERAL,
        value: string
        // raw: expression.substring(startIndex, index),
      };
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
      if (isDecimalDigit(character) || character === PERIOD_CODE) {
        return gobbleNumericLiteral();
      }
      if (character === 34 || character === 39) {
        node = gobbleStringLiteral();
      } else if (character === OPENING_BRACKET_CODE) {
        node = gobbleArray();
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
          toCheck = toCheck.substr(0, --toCheckLength);
        }
        if (isIdentifierStart(character)) {
          node = gobbleIdentifier();
          if (Object.prototype.hasOwnProperty.call(LITERALS, node.name)) {
            node = {
              type: LITERAL,
              value: LITERALS[node.name]
              // raw: node.name,
            };
          }
        } else if (character === OPENING_PARENTHESIS_CODE) {
          node = gobbleSequence();
        }
      }
      return gobbleUpdateSuffixExpression(
        gobbleTokenProperty(node)
      );
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
      if (index + 1 >= expression.length) {
        return;
      }
      const characters = expression.substring(index, index + 2);
      let operator = null;
      if (characters === UPDATE_OPERATOR_DECREMENT) {
        operator = UPDATE_OPERATOR_DECREMENT;
      } else if (characters === UPDATE_OPERATOR_INCREMENT) {
        operator = UPDATE_OPERATOR_INCREMENT;
      } else {
        return;
      }
      index += 2;
      const node = {
        type: UPDATE,
        operator,
        parameter: gobbleTokenProperty(gobbleIdentifier()),
        prefix: true
      };
      if (!node.parameter || node.parameter.type !== IDENTIFIER && node.parameter.type !== MEMBER) {
        throw new Error("Unexpected " + node.operator);
      }
      return node;
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
    return nodes.length === 0 ? void 0 : nodes;
  };

  // src/run.js
  var setToContext = (node, value, context = {}) => {
    switch (node.type) {
      case IDENTIFIER:
        context[node.name] = value;
        return value;
      case MEMBER:
        const memberObject = run(node.object, context);
        const memberProperty = node.computed || node.property.type !== IDENTIFIER ? run(node.property, context) : node.property.name;
        if (typeof value === "function") {
          return value.bind(memberObject);
        }
        memberObject[memberProperty] = value;
        return value;
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
      case ARRAY:
        const arrayResults = [];
        for (const arrayElement of node.elements) {
          arrayResults.push(run(arrayElement, context));
        }
        return arrayResults;
      case ASSIGN:
        let assignmentValue = run(node.right, context);
        if (node.operator !== "=") {
          const assignmentLeft = run(node.left, context);
          switch (node.operator) {
            case "||=":
              if (assignmentLeft) {
                return assignmentLeft;
              }
              break;
            case "&&=":
              if (!assignmentLeft) {
                return assignmentLeft;
              }
              break;
            case "??=":
              if (assignmentLeft !== null && assignmentLeft !== void 0) {
                return assignmentLeft;
              }
              break;
            case "*=":
              assignmentValue = assignmentLeft * assignmentValue;
              break;
            case "**=":
              assignmentValue = __pow(assignmentLeft, assignmentValue);
              break;
            case "/=":
              assignmentValue = assignmentLeft / assignmentValue;
              break;
            case "%=":
              assignmentValue = assignmentLeft % assignmentValue;
              break;
            case "+=":
              assignmentValue = assignmentLeft + assignmentValue;
              break;
            case "-=":
              assignmentValue = assignmentLeft - assignmentValue;
              break;
          }
        }
        return setToContext(node.left, assignmentValue, context);
      case BINARY:
        const binaryLeft = run(node.left, context);
        const binaryRight = run(node.right, context);
        switch (node.operator) {
          case "||":
            return binaryLeft || binaryRight;
          case "&&":
            return binaryLeft && binaryRight;
          case "??":
            return binaryLeft != null ? binaryLeft : binaryRight;
          case "==":
            return binaryLeft == binaryRight;
          case "!=":
            return binaryLeft != binaryRight;
          case "===":
            return binaryLeft === binaryRight;
          case "!==":
            return binaryLeft !== binaryRight;
          case "<":
            return binaryLeft < binaryRight;
          case ">":
            return binaryLeft > binaryRight;
          case "<=":
            return binaryLeft <= binaryRight;
          case ">=":
            return binaryLeft >= binaryRight;
          case "-":
            return binaryLeft - binaryRight;
          case "+":
            return binaryLeft + binaryRight;
          case "*":
            return binaryLeft * binaryRight;
          case "/":
            return binaryLeft / binaryRight;
          case "%":
            return binaryLeft % binaryRight;
        }
        throw new Error("Unsupported operator: " + node.operator);
      case CALL:
        const parameters = [];
        for (const parameter of node.parameters) {
          parameters.push(run(parameter, context));
        }
        return run(node.callee, context)(...parameters);
      case CONDITION:
        return run(node.condition, context) ? run(node.consequent, context) : run(node.alternate, context);
      case MEMBER:
        const memberObject = run(node.object, context);
        const memberProperty = node.computed || node.property.type !== IDENTIFIER ? run(node.property, context) : node.property.name;
        if (typeof memberObject[memberProperty] === "function") {
          return memberObject[memberProperty].bind(memberObject);
        }
        return memberObject[memberProperty];
      case OBJECT:
        const objectResult = {};
        for (const objectProperty of node.properties) {
          objectResult[objectProperty.computed || objectProperty.key.type !== IDENTIFIER ? run(objectProperty.key, context) : objectProperty.key.name] = run(objectProperty.value, context);
        }
        return objectResult;
      case SEQUENCE:
        return node.expressions.map((node2) => run(node2, context));
      case UNARY:
        const unaryParameter = run(node.parameter, context);
        switch (node.operator) {
          case "!":
            return !unaryParameter;
          case "-":
            return -unaryParameter;
          case "+":
            return +unaryParameter;
        }
        throw new Error("Unsupported operator: " + node.operator);
      case UPDATE:
        const updateResult = run(node.parameter, context);
        const updateValue = node.operator === "--" ? -1 : 1;
        setToContext(node.parameter, updateResult + updateValue, context);
        return node.prefix ? updateResult + updateValue : updateResult;
    }
    throw new Error('Unexpected node type "' + node.type + '".');
  };
  var run_default = run;

  // src/index.js
  var interpret = (expression, context) => run_default(parse_default(expression), context);
  var parse = parse_default;
  var run2 = run_default;

  // src/iife.js
  window.interpret = {
    interpret,
    parse,
    run: run2
  };
})();
//# sourceMappingURL=interpret.iife.js.map
