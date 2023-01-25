(() => {
  // ../common/src/utilities/Attribute.js
  var copyAttributes = (existingNode, newNode) => {
    const existingAttributes = existingNode.attributes;
    const newAttributes = newNode.attributes;
    let attributeNamespaceURI = null;
    let attributeValue = null;
    let fromValue = null;
    let attributeName = null;
    let attribute = null;
    for (let i = newAttributes.length - 1; i >= 0; --i) {
      attribute = newAttributes[i];
      attributeName = attribute.name;
      attributeNamespaceURI = attribute.namespaceURI;
      attributeValue = attribute.value;
      if (attributeNamespaceURI) {
        attributeName = attribute.localName || attributeName;
        fromValue = existingNode.getAttributeNS(attributeNamespaceURI, attributeName);
        if (fromValue !== attributeValue) {
          existingNode.setAttributeNS(attributeNamespaceURI, attributeName, attributeValue);
        }
      } else {
        if (!existingNode.hasAttribute(attributeName)) {
          existingNode.setAttribute(attributeName, attributeValue);
        } else {
          fromValue = existingNode.getAttribute(attributeName);
          if (fromValue !== attributeValue) {
            if (attributeValue === "null" || attributeValue === "undefined") {
              existingNode.removeAttribute(attributeName);
            } else {
              existingNode.setAttribute(attributeName, attributeValue);
            }
          }
        }
      }
    }
    for (let j = existingAttributes.length - 1; j >= 0; --j) {
      attribute = existingAttributes[j];
      if (attribute.specified !== false) {
        attributeName = attribute.name;
        attributeNamespaceURI = attribute.namespaceURI;
        if (attributeNamespaceURI) {
          attributeName = attribute.localName || attributeName;
          if (!newNode.hasAttributeNS(attributeNamespaceURI, attributeName)) {
            existingNode.removeAttributeNS(attributeNamespaceURI, attributeName);
          }
        } else {
          if (!newNode.hasAttributeNS(null, attributeName)) {
            existingNode.removeAttribute(attributeName);
          }
        }
      }
    }
  };

  // ../common/src/utilities/Element.js
  var fromString = (string) => {
    const template = document.createElement("template");
    template.innerHTML = string;
    return template.content.childNodes[0];
  };
  var isSame = (a, b) => {
    if (a.isSameNode) {
      return a.isSameNode(b);
    }
    if (a.tagName !== b.tagName) {
      return false;
    }
    if (a.type === 3) {
      return a.nodeValue === b.nodeValue;
    }
    return false;
  };

  // ../common/src/utilities/Morph.js
  var morphNode = (existingNode, newNode) => {
    const nodeType = newNode.nodeType;
    const nodeName = newNode.nodeName;
    if (nodeType === 1) {
      copyAttributes(existingNode, newNode);
    }
    if (nodeType === 3 || nodeType === 8) {
      if (existingNode.nodeValue !== newNode.nodeValue) {
        existingNode.nodeValue = newNode.nodeValue;
      }
    }
    if (nodeName === "INPUT") {
      updateInput(existingNode, newNode);
    } else if (nodeName === "OPTION") {
      updateAttribute(existingNode, newNode, "selected");
    } else if (nodeName === "TEXTAREA") {
      updateTextarea(existingNode, newNode);
    }
  };
  var morphTree = (existingTree, newTree, options) => {
    if (typeof existingTree !== "object") {
      throw new Error("Existing tree should be an object.");
    }
    if (typeof newTree === "string") {
      newTree = fromString(newTree);
    } else if (typeof newTree !== "object") {
      throw new Error("New tree should be an object.");
    }
    if (options && options.childrenOnly || newTree.nodeType === 11) {
      updateChildren(existingTree, newTree);
      return existingTree;
    }
    return updateTree(existingTree, newTree);
  };
  var updateInput = (existingNode, newNode) => {
    const newValue = newNode.value;
    const existingValue = existingNode.value;
    updateAttribute(existingNode, newNode, "checked");
    updateAttribute(existingNode, newNode, "disabled");
    if (existingNode.indeterminate !== newNode.indeterminate) {
      existingNode.indeterminate = newNode.indeterminate;
    }
    if (existingNode.type === "file") {
      return;
    }
    if (existingValue !== newValue) {
      existingNode.setAttribute("value", newValue);
      existingNode.value = newValue;
    }
    if (newValue === "null") {
      existingNode.value = "";
      existingNode.removeAttribute("value");
    }
    if (!newNode.hasAttributeNS(null, "value")) {
      existingNode.removeAttribute("value");
    } else if (existingNode.type === "range") {
      existingNode.value = newValue;
    }
  };
  var updateTextarea = (existingNode, newNode) => {
    const newValue = newNode.value;
    if (existingNode.value !== newValue) {
      existingNode.value = newValue;
    }
    if (existingNode.firstChild && existingNode.firstChild.nodeValue !== newValue) {
      if (existingNode.firstChild.nodeValue === existingNode.placeholder && newValue === "") {
        return;
      }
      existingNode.firstChild.nodeValue = newValue;
    }
  };
  var updateAttribute = (existingNode, newNode, name) => {
    if (existingNode[name] !== newNode[name]) {
      existingNode[name] = newNode[name];
      if (newNode[name]) {
        existingNode.setAttribute(name, "");
      } else {
        existingNode.removeAttribute(name);
      }
    }
  };
  var updateTree = (existingTree, newTree) => {
    if (!existingTree) {
      return newTree;
    }
    if (!newTree) {
      return null;
    }
    if (existingTree.isSameNode && existingTree.isSameNode(newTree)) {
      return existingTree;
    }
    if (existingTree.tagName !== newTree.tagName) {
      return newTree;
    }
    morphNode(existingTree, newTree);
    updateChildren(existingTree, newTree);
    return existingTree;
  };
  var updateChildren = (existingNode, newNode) => {
    let existingChild, newChild, morphed, existingMatch;
    let offset = 0;
    for (let i = 0; ; i++) {
      existingChild = existingNode.childNodes[i];
      newChild = newNode.childNodes[i - offset];
      if (!existingChild && !newChild) {
        break;
      } else if (!newChild) {
        existingNode.removeChild(existingChild);
        i--;
      } else if (!existingChild) {
        existingNode.appendChild(newChild);
        offset++;
      } else if (isSame(existingChild, newChild)) {
        morphed = updateTree(existingChild, newChild);
        if (morphed !== existingChild) {
          existingNode.replaceChild(morphed, existingChild);
          offset++;
        }
      } else {
        existingMatch = null;
        for (let j = i; j < existingNode.childNodes.length; j++) {
          if (isSame(existingNode.childNodes[j], newChild)) {
            existingMatch = existingNode.childNodes[j];
            break;
          }
        }
        if (existingMatch) {
          morphed = updateTree(existingMatch, newChild);
          if (morphed !== existingMatch)
            offset++;
          existingNode.insertBefore(morphed, existingChild);
        } else if (!newChild.id && !existingChild.id) {
          morphed = updateTree(existingChild, newChild);
          if (morphed !== existingChild) {
            existingNode.replaceChild(morphed, existingChild);
            offset++;
          }
        } else {
          existingNode.insertBefore(newChild, existingChild);
          offset++;
        }
      }
    }
  };

  // src/contexts/morph.js
  var morph_default = {
    name: "$morph",
    create: () => {
      return {
        value: morphTree
      };
    }
  };

  // ../common/src/utilities/Html.js
  var DECODE_LOOKUP = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"'
  };
  var DECODE_REGEXP = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
  var decode = (string) => {
    if (typeof string !== "string") {
      return string;
    }
    return string.replaceAll(DECODE_REGEXP, (character) => {
      return DECODE_LOOKUP[character];
    });
  };

  // ../common/src/utilities/Promise.js
  var nativePromise = Function.prototype.toString.call(
    Function
    /* A native object */
  ).replace("Function", "Promise").replace(/\(.*\)/, "()");
  var isPromise = (value) => {
    return value && Object.prototype.toString.call(value) === "[object Promise]";
  };

  // src/directives/morph.js
  var morph_default2 = {
    name: "morph",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const modifiers = attribute.getModifiers();
      const set = (html) => {
        if (modifiers.decode && typeof html === "string") {
          html = decode(html);
        }
        if (element.children.length === 0) {
          element.appendChild(document.createElement("div"));
        } else if (element.children.length > 1) {
          for (let i = element.children.length - 1; i >= 1; i--) {
            element.children[i].remove();
          }
        }
        const root = morphTree(element.children[0], html);
        if (!element.children[0].isSameNode(root)) {
          element.children[0].remove();
          element.appendChild(root);
        }
      };
      const result = processExpression(component, attribute, attribute.getValue());
      attribute.setData(result);
      if (isPromise(result)) {
        Promise.resolve(result).then((resultResolved) => {
          if (attribute.getData() !== result) {
            return;
          }
          set(resultResolved);
        });
      } else {
        set(result);
      }
    }
  };

  // src/DoarsMorph.js
  function DoarsMorph_default(library) {
    let isEnabled = false;
    const onEnable = function() {
      library.addContexts(0, morph_default);
      library.addDirectives(-1, morph_default2);
    };
    const onDisable = function() {
      library.removeContexts(morph_default);
      library.removeDirectives(morph_default2);
    };
    this.disable = function() {
      if (!library.getEnabled() && isEnabled) {
        isEnabled = false;
        library.removeEventListener("enabling", onEnable);
        library.removeEventListener("disabling", onDisable);
      }
    };
    this.enable = function() {
      if (!isEnabled) {
        isEnabled = true;
        library.addEventListener("enabling", onEnable);
        library.addEventListener("disabling", onDisable);
      }
    };
    this.enable();
  }

  // src/DoarsMorph.iife.js
  window.DoarsMorph = DoarsMorph_default;
})();
//# sourceMappingURL=doars-morph.iife.js.map
