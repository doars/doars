(() => {
  // ../common/src/polyfills/IntersectionDispatcher.js
  class IntersectionDispatcher {
    constructor(options = null) {
      const items = new WeakMap;
      const intersect = (entries) => {
        for (const entry of entries) {
          for (const callback of items.get(entry.target)) {
            callback(entry);
          }
        }
      };
      const observer = new window.IntersectionObserver(intersect, options);
      this.add = (element, callback) => {
        if (!items.has(element)) {
          items.set(element, []);
        }
        items.get(element).push(callback);
        observer.observe(element);
      };
      this.remove = (element, callback) => {
        if (!items.has(element)) {
          return;
        }
        const list = items.get(element);
        const index = list.indexOf(callback);
        if (index >= 0) {
          list.splice(index, 1);
        }
        if (list.length === 0) {
          items.delete(element);
          observer.unobserve(element);
        }
      };
    }
  }

  // src/utilities/nested.js
  var deleteNestedProperty = (obj, path) => {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0;i < parts.length - 1; i++) {
      const part = parts[i];
      if (!Object.hasOwn(current, part)) {
        return;
      }
      current = current[part];
    }
    delete current[parts[parts.length - 1]];
  };
  var getNestedProperty = (obj, path) => {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined || !Object.hasOwn(current, part)) {
        return;
      }
      current = current[part];
    }
    return current;
  };
  var setNestedProperty = (obj, path, value) => {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0;i < parts.length - 1; i++) {
      const part = parts[i];
      if (!Object.hasOwn(current, part) || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  };

  // src/contexts/ipc.js
  var ipc_default = ({ ipcContextName, ipcPath }, ipcInstance) => ({
    name: ipcContextName,
    create: () => ({
      value: new Proxy(ipcInstance, {
        get: (target, key) => {
          if (Object.hasOwn(target, key)) {
            return target[key];
          }
          return (...parameters) => {
            const handler = getNestedProperty(window, ipcPath);
            if (!handler) {
              throw new Error(`IPC handler not found at window.${ipcPath}`);
            }
            return handler.call(key, ...parameters);
          };
        }
      })
    })
  });

  // ../common/src/utilities/Element.js
  var fromString = (string) => {
    const stringStart = string.substring(0, 15).toLowerCase();
    if (stringStart.startsWith("<!doctype html>") || stringStart.startsWith("<html>")) {
      const html = document.createElement("html");
      html.innerHTML = string;
      return html;
    }
    const template = document.createElement("template");
    template.innerHTML = string;
    return template.content.childNodes[0];
  };
  var isSame = (a, b) => {
    if (a.isSameNode?.(b)) {
      return true;
    }
    if (a.type === 3) {
      return a.nodeValue === b.nodeValue;
    }
    if (a.tagName === b.tagName) {
      return true;
    }
    return false;
  };
  var select = (node, component, attribute, processExpression) => {
    const libraryOptions = component.getLibrary().getOptions();
    const element = attribute.getElement();
    const directive = attribute.getDirective();
    const attributeName = libraryOptions.prefix + "-" + directive + "-" + libraryOptions.selectFromElementDirectiveName;
    if (!element.hasAttribute(attributeName)) {
      return node;
    }
    let selector = null;
    if (libraryOptions.selectFromElementDirectiveEvaluate) {
      selector = processExpression(component, attribute, element.getAttribute(attributeName));
      if (typeof selector !== "string") {
        console.warn(`Doars: \`${attributeName}\` must return a string.`);
        return null;
      }
    } else {
      selector = element.getAttribute(attributeName);
    }
    if (selector) {
      const asString = typeof node === "string";
      if (asString) {
        node = fromString(node);
      }
      node = node.querySelector(selector);
      if (asString && node) {
        return node.outerHTML;
      }
    }
    return node;
  };
  var walk = (node, filter) => {
    let index = -1;
    let iterator = null;
    return () => {
      if (index >= 0 && iterator) {
        const child2 = iterator();
        if (child2) {
          return child2;
        }
      }
      let child = null;
      do {
        index++;
        if (index >= node.childElementCount) {
          return null;
        }
        child = node.children[index];
      } while (!filter(child));
      if (child.childElementCount) {
        iterator = walk(child, filter);
      }
      return child;
    };
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

  // ../common/src/utilities/Attribute.js
  var addAttributes = (element, data) => {
    for (const name in data) {
      if (name === "class") {
        for (const className of data.class) {
          element.classList.add(className);
        }
        continue;
      }
      element.setAttribute(name, data[name]);
    }
  };
  var copyAttributes = (existingNode, newNode) => {
    const existingAttributes = existingNode.attributes;
    const newAttributes = newNode.attributes;
    let attributeNamespaceURI = null;
    let attributeValue = null;
    let fromValue = null;
    let attributeName = null;
    let attribute = null;
    for (let i = newAttributes.length - 1;i >= 0; --i) {
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
    for (let j = existingAttributes.length - 1;j >= 0; --j) {
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
  var removeAttributes = (element, data) => {
    for (const name in data) {
      if (name === "class") {
        for (const className of data.class) {
          element.classList.remove(className);
        }
        continue;
      }
      if (data[name] && element.attributes[name] !== data[name]) {
        continue;
      }
      element.removeAttribute(name);
    }
  };

  // ../common/src/utilities/String.js
  var parseSelector = (selector) => {
    if (typeof selector === "string") {
      selector = selector.split(/(?=\.)|(?=#)|(?=\[)/);
    }
    if (!Array.isArray(selector)) {
      console.error("Doars: parseSelector expects Array of string or a single string.");
      return;
    }
    const attributes = {};
    for (let selectorSegment of selector) {
      selectorSegment = selectorSegment.trim();
      switch (selectorSegment[0]) {
        case "#":
          attributes.id = selectorSegment.substring(1);
          break;
        case ".":
          selectorSegment = selectorSegment.substring(1);
          if (!attributes.class) {
            attributes.class = [];
          }
          if (!attributes.class.includes(selectorSegment)) {
            attributes.class.push(selectorSegment);
          }
          break;
        case "[": {
          const [_full, key, value] = selectorSegment.match(/^(?:\[)?([-$_.a-z0-9]{1,})(?:[$*^])?(?:=)?([\s\S]{0,})(?:\])$/i);
          attributes[key] = value;
          break;
        }
      }
    }
    return attributes;
  };

  // ../common/src/utilities/Transition.js
  var TRANSITION_NAME = "-transition:";
  var transition = (type, libraryOptions, element, callback = null) => {
    if (element.nodeType !== 1) {
      if (callback) {
        callback();
      }
      return;
    }
    const transitionDirectiveName = libraryOptions.prefix + TRANSITION_NAME + type;
    const selectors = {};
    const value = element.getAttribute(transitionDirectiveName);
    if (value) {
      selectors.during = parseSelector(value);
      addAttributes(element, selectors.during);
    }
    const valueFrom = element.getAttribute(`${transitionDirectiveName}.from`);
    if (valueFrom) {
      selectors.from = parseSelector(valueFrom);
      addAttributes(element, selectors.from);
    }
    const valueTo = element.getAttribute(`${transitionDirectiveName}.to`);
    if (valueTo) {
      selectors.to = parseSelector(valueTo);
    }
    if (!value && !valueFrom && !valueTo) {
      if (callback) {
        callback();
      }
      return;
    }
    let isDone = false, timeout;
    let requestFrame = requestAnimationFrame(() => {
      requestFrame = null;
      if (isDone) {
        return;
      }
      if (selectors.from) {
        removeAttributes(element, selectors.from);
        selectors.from = undefined;
      }
      if (valueTo) {
        addAttributes(element, selectors.to);
      } else if (!selectors.during) {
        if (callback) {
          callback();
        }
        isDone = true;
        return;
      }
      const styles = getComputedStyle(element);
      const delay = Number(styles.transitionDelay.replace(/,.*/, "").replace("s", "")) * 1000;
      let duration = Number(styles.transitionDuration.replace(/,.*/, "").replace("s", "")) * 1000;
      if (duration === 0) {
        duration = Number(styles.animationDuration.replace("s", "")) * 1000;
      }
      timeout = setTimeout(() => {
        timeout = null;
        if (isDone) {
          return;
        }
        if (selectors.during) {
          removeAttributes(element, selectors.during);
          selectors.during = undefined;
        }
        if (selectors.to) {
          removeAttributes(element, selectors.to);
          selectors.to = undefined;
        }
        if (callback) {
          callback();
        }
        isDone = true;
      }, delay + duration);
    });
    return () => {
      if (!isDone) {
        return;
      }
      isDone = true;
      if (selectors.during) {
        removeAttributes(element, selectors.during);
        selectors.during = undefined;
      }
      if (selectors.from) {
        removeAttributes(element, selectors.from);
        selectors.from = undefined;
      } else if (selectors.to) {
        removeAttributes(element, selectors.to);
        selectors.to = undefined;
      }
      if (requestFrame) {
        cancelAnimationFrame(requestFrame);
        requestFrame = null;
      } else if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (callback) {
        callback();
      }
    };
  };
  var transitionIn = (libraryOptions, element, callback) => {
    return transition("in", libraryOptions, element, callback);
  };
  var transitionOut = (libraryOptions, element, callback) => {
    return transition("out", libraryOptions, element, callback);
  };

  // ../common/src/utilities/Indicator.js
  var hideIndicator = (component, attribute) => {
    if (!attribute.indicator) {
      return;
    }
    if (attribute.indicator.indicatorTransitionOut) {
      return;
    }
    if (!attribute.indicator.indicatorElement) {
      return;
    }
    const libraryOptions = component.getLibrary().getOptions();
    const indicatorElement = attribute.indicator.indicatorElement;
    attribute.indicator.indicatorTransitionIn = transitionOut(libraryOptions, indicatorElement, () => {
      if (indicatorElement) {
        indicatorElement.remove();
      }
    });
  };
  var showIndicator = (component, attribute, processExpression) => {
    const libraryOptions = component.getLibrary().getOptions();
    const element = attribute.getElement();
    const directive = attribute.getDirective();
    const attributeName = libraryOptions.prefix + "-" + directive + "-" + libraryOptions.indicatorDirectiveName;
    if (!element.hasAttribute(attributeName)) {
      return;
    }
    let indicatorTemplate = null;
    if (libraryOptions.indicatorDirectiveEvaluate) {
      indicatorTemplate = processExpression(component, attribute, element.getAttribute(attributeName));
    } else {
      indicatorTemplate = element.getAttribute(attributeName);
    }
    if (!indicatorTemplate) {
      return;
    }
    if (typeof indicatorTemplate === "string") {
      indicatorTemplate = element.querySelector(indicatorTemplate);
      if (!indicatorTemplate) {
        return;
      }
    }
    if (indicatorTemplate.tagName !== "TEMPLATE") {
      console.warn(`Doars: \`${attributeName}\` must be placed on a \`<template>\`.`);
      return;
    }
    if (indicatorTemplate.childCount > 1) {
      console.warn(`Doars: \`${attributeName}\` must have one child.`);
      return;
    }
    if (attribute.indicator) {
      if (attribute.indicator.indicatorTransitionOut) {
        attribute.indicator.indicatorTransitionOut();
        attribute.indicator.indicatorTransitionOut = null;
      } else if (attribute.indicator.indicatorElement) {
        return;
      }
    }
    const indicatorElement = document.importNode(indicatorTemplate.content, true).firstElementChild;
    if (!indicatorElement) {
      console.warn("Unable to get element from indicator template");
      return;
    }
    indicatorTemplate.insertAdjacentElement("afterend", indicatorElement);
    attribute.indicator = {
      indicatorElement,
      indicatorTransitionIn: transitionIn(libraryOptions, indicatorElement)
    };
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
      _updateInput(existingNode, newNode);
    } else if (nodeName === "OPTION") {
      _updateAttribute(existingNode, newNode, "selected");
    } else if (nodeName === "TEXTAREA") {
      _updateTextarea(existingNode, newNode);
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
    if (options?.childrenOnly || newTree.nodeType === 11) {
      _updateChildren(existingTree, newTree);
      return existingTree;
    }
    return _updateTree(existingTree, newTree);
  };
  var _updateInput = (existingNode, newNode) => {
    const newValue = newNode.value;
    const existingValue = existingNode.value;
    _updateAttribute(existingNode, newNode, "checked");
    _updateAttribute(existingNode, newNode, "disabled");
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
  var _updateTextarea = (existingNode, newNode) => {
    const newValue = newNode.value;
    if (existingNode.value !== newValue) {
      existingNode.value = newValue;
    }
    if (existingNode.firstChild && existingNode.firstChild.nodeValue !== newValue) {
      existingNode.firstChild.nodeValue = newValue;
    }
  };
  var _updateAttribute = (existingNode, newNode, name) => {
    if (existingNode[name] !== newNode[name]) {
      existingNode[name] = newNode[name];
      if (newNode[name]) {
        existingNode.setAttribute(name, "");
      } else {
        existingNode.removeAttribute(name);
      }
    }
  };
  var _updateTree = (existingTree, newTree) => {
    if (!existingTree) {
      return newTree;
    }
    if (!newTree) {
      return null;
    }
    if (existingTree.isSameNode?.(newTree)) {
      return existingTree;
    }
    if (existingTree.tagName !== newTree.tagName) {
      return newTree;
    }
    morphNode(existingTree, newTree);
    _updateChildren(existingTree, newTree);
    return existingTree;
  };
  var setBefore = typeof window !== "undefined" && window.Element?.prototype?.moveBefore ? "moveBefore" : "insertBefore";
  var _updateChildren = (existingNode, newNode) => {
    let existingChild, newChild, morphed, existingMatch;
    let offset = 0;
    for (let i = 0;; i++) {
      existingChild = existingNode.childNodes[i];
      newChild = newNode.childNodes[i - offset];
      if (!existingChild && !newChild) {
        break;
      } else if (!newChild) {
        existingNode.removeChild(existingChild);
        i--;
      } else if (!existingChild) {
        existingNode.append(newChild);
        offset++;
      } else if (isSame(existingChild, newChild)) {
        morphed = _updateTree(existingChild, newChild);
        if (morphed !== existingChild) {
          existingNode.replaceChild(morphed, existingChild);
          offset++;
        }
      } else {
        existingMatch = null;
        for (let j = i;j < existingNode.childNodes.length; j++) {
          if (isSame(existingNode.childNodes[j], newChild)) {
            existingMatch = existingNode.childNodes[j];
            break;
          }
        }
        if (existingMatch) {
          morphed = _updateTree(existingMatch, newChild);
          if (morphed !== existingMatch) {
            offset++;
          }
          existingNode[setBefore](morphed, existingChild);
        } else if (!newChild.id && !existingChild.id) {
          morphed = _updateTree(existingChild, newChild);
          if (morphed !== existingChild) {
            existingNode.replaceChild(morphed, existingChild);
            offset++;
          }
        } else {
          existingNode[setBefore](newChild, existingChild);
          offset++;
        }
      }
    }
  };

  // ../common/src/utilities/Promise.js
  var nativePromise = Function.prototype.toString.call(Function).replace("Function", "Promise").replace(/\(.*\)/, "()");
  var isPromise = (value) => {
    return value && Object.prototype.toString.call(value) === "[object Promise]";
  };

  // ../common/src/utilities/Script.js
  var _readdScript = (element) => {
    if (element.tagName !== "SCRIPT" || element.hasAttribute("src")) {
      return false;
    }
    const newScript = document.createElement("script");
    newScript.innerText = element.innerText;
    element.parentNode.insertBefore(newScript, element);
    element.remove();
    return true;
  };
  var readdScripts = (...elements) => {
    for (const element of elements) {
      if (!_readdScript(element)) {
        const iterate = walk(element);
        let maybeScript = null;
        while (maybeScript = iterate()) {
          _readdScript(maybeScript);
        }
      }
    }
  };

  // src/directives/ipc.js
  var IPC = Symbol("IPC");
  var EXECUTION_MODIFIERS = {
    NONE: 0,
    BUFFER: 1,
    DEBOUNCE: 2,
    THROTTLE: 5,
    DELAY: 6
  };
  var ipc_default2 = ({
    ipcDirectiveName,
    intersectionEvent,
    loadedEvent
  }, ipcInstance, intersectionDispatcher) => ({
    name: ipcDirectiveName,
    update: (component, attribute, processExpression) => {
      const library = component.getLibrary();
      const libraryOptions = library.getOptions();
      const element = attribute.getElement();
      const directive = attribute.getDirective();
      const modifiers = Object.assign({}, attribute.getModifiers());
      const value = attribute.getValue();
      const isForm = element.tagName === "FORM";
      const isButton = element.tagName === "BUTTON";
      const isInput = element.tagName === "INPUT" || element.tagName === "SELECT";
      if (attribute[IPC]) {
        if (attribute[IPC].value === value) {
          return;
        }
        attribute[IPC].target.removeEventListener(attribute[IPC].eventName, attribute[IPC].handler);
        if (attribute[IPC].timeout) {
          clearTimeout(attribute[IPC].timeout);
        }
        delete attribute[IPC];
      }
      const position = modifiers.position ? modifiers.position.toLowerCase() : null;
      const listenerOptions = {};
      if (modifiers.capture) {
        listenerOptions.capture = true;
      }
      if (modifiers.once) {
        listenerOptions.once = true;
      }
      if (modifiers.passive && !modifiers.prevent) {
        listenerOptions.passive = true;
      }
      let executionModifier = EXECUTION_MODIFIERS.NONE;
      if (modifiers.buffer) {
        executionModifier = EXECUTION_MODIFIERS.BUFFER;
        if (modifiers.buffer === true) {
          modifiers.buffer = 5;
        }
      } else if (modifiers.debounce) {
        executionModifier = EXECUTION_MODIFIERS.DEBOUNCE;
        if (modifiers.debounce === true) {
          modifiers.debounce = 500;
        }
      } else if (modifiers.throttle) {
        executionModifier = EXECUTION_MODIFIERS.THROTTLE;
        if (modifiers.throttle === true) {
          modifiers.throttle = 500;
        }
      } else if (modifiers.delay) {
        executionModifier = EXECUTION_MODIFIERS.DELAY;
        if (modifiers.delay === true) {
          modifiers.delay = 500;
        }
      }
      if (modifiers.poll === true) {
        modifiers.poll = 60000;
      }
      let eventName = "click";
      if (modifiers.on) {
        eventName = modifiers.on;
      } else if (isForm) {
        eventName = "submit";
      } else if (isInput) {
        eventName = "change";
      } else if (modifiers.poll) {
        eventName = loadedEvent;
      }
      const dispatchEvent = (suffix = "", data = {}) => {
        element.dispatchEvent(new CustomEvent(`${libraryOptions.prefix}-${directive}${suffix}`, {
          detail: Object.assign({
            attribute,
            component
          }, data)
        }));
      };
      const requestHandler = (functionName) => {
        let body = null;
        if (isForm) {
          const formData = new FormData(element);
          body = Object.fromEntries(formData);
        }
        dispatchEvent("-started", {
          url: functionName
        });
        return ipcInstance.call(functionName, body).then((html) => {
          isLoading = false;
          if (modifiers.decode) {
            html = decode(html);
          }
          let target = null;
          if (modifiers.document) {
            target = document.documentElement;
          } else {
            const attributeName = libraryOptions.prefix + "-" + directive + "-" + libraryOptions.targetDirectiveName;
            if (element.getAttribute(attributeName)) {
              if (libraryOptions.targetDirectiveEvaluate) {
                target = processExpression(component, attribute, element.getAttribute(attributeName));
              } else {
                target = element.getAttribute(attributeName);
              }
              if (target && typeof target === "string") {
                target = element.querySelector(target);
              }
            }
            if (!target) {
              target = element;
            }
          }
          if (position === "append") {
            const child = select(fromString(html), component, attribute, processExpression);
            target.append(child);
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child);
            }
          } else if (position === "prepend") {
            const child = select(fromString(html), component, attribute, processExpression);
            target.prepend(child);
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child);
            }
          } else if (position === "after") {
            const child = select(fromString(html), component, attribute, processExpression);
            target.insertAdjacentElement("afterend", child);
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child);
            }
          } else if (position === "before") {
            const child = select(fromString(html), component, attribute, processExpression);
            target.insertAdjacentElement("beforebegin", child);
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child);
            }
          } else if (position === "outer") {
            if (modifiers.morph) {
              morphTree(target, select(fromString(html), component, attribute, processExpression));
            } else if (target.outerHTML !== html) {
              target.outerHTML = select(html, component, attribute, processExpression);
              if (libraryOptions.allowInlineScript || modifiers.script) {
                readdScripts(target);
              }
            }
          } else if (modifiers.morph) {
            if (target.children.length === 0) {
              target.append(document.createElement("div"));
            } else if (target.children.length > 1) {
              for (let i = target.children.length - 1;i >= 1; i--) {
                target.children[i].remove();
              }
            }
            const root = morphTree(target.children[0], select(fromString(html), component, attribute, processExpression));
            if (!target.children[0].isSameNode(root)) {
              target.children[0].remove();
              target.append(root);
            }
          } else if (target.innerHTML !== html) {
            target.innerHTML = select(html, component, attribute, processExpression);
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(...target.children);
            }
          }
          hideIndicator(component, attribute);
          dispatchEvent("-succeeded", {
            url: functionName
          });
        }).catch(() => {
          hideIndicator(component, attribute);
          dispatchEvent("-failed", {
            url: functionName
          });
        });
      };
      let isLoading = false;
      let handler = (event) => new Promise((resolve) => {
        if (modifiers.self && event && event.target !== element) {
          resolve();
          return;
        }
        if (isForm && !element.reportValidity()) {
          dispatchEvent("-invalid");
          resolve();
          return;
        }
        if ((isForm && eventName === "submit" || isButton && element.getAttribute("type", "button") && eventName === "click" || modifiers.prevent) && event) {
          event.preventDefault();
        }
        if (modifiers.stop && event) {
          event.stopPropagation();
        }
        const execute = () => {
          let functionName = null;
          if (value) {
            functionName = value;
          } else if (isForm && element.hasAttribute("action")) {
            functionName = element.getAttribute("action");
          } else {
            functionName = window.location.href;
          }
          attribute[IPC].buffer = [];
          if (!functionName) {
            resolve();
            return;
          }
          isLoading = true;
          showIndicator(component, attribute, processExpression);
          (isPromise(functionName) ? functionName.then((url) => requestHandler(url)) : requestHandler(functionName)).finally(() => resolve());
        };
        if (isLoading) {
          resolve();
          return;
        }
        attribute[IPC].buffer.push(event);
        switch (executionModifier) {
          case EXECUTION_MODIFIERS.BUFFER:
            if (attribute[IPC].buffer.length < modifiers.buffer) {
              resolve();
              return;
            }
            execute();
            return;
          case EXECUTION_MODIFIERS.DEBOUNCE:
            if (attribute[IPC].timeout) {
              clearTimeout(attribute[IPC].timeout);
              attribute[IPC].timeout = null;
            }
            attribute[IPC].timeout = setTimeout(execute, modifiers.debounce);
            return;
          case EXECUTION_MODIFIERS.THROTTLE: {
            const nowThrottle = window.performance.now();
            if (attribute[IPC].lastExecution && nowThrottle - attribute[IPC].lastExecution < modifiers.throttle) {
              resolve();
              return;
            }
            execute();
            attribute[IPC].lastExecution = nowThrottle;
            return;
          }
          case EXECUTION_MODIFIERS.DELAY:
            attribute[IPC].timeout = setTimeout(execute, modifiers.delay);
            return;
        }
        execute();
      });
      if (modifiers.poll) {
        const _handler = handler;
        handler = () => {
          attribute[IPC].timeout = setTimeout(() => {
            _handler(null).finally(() => {
              if (attribute[IPC]) {
                handler();
              }
            });
          }, modifiers.poll);
        };
      }
      if (intersectionEvent && eventName === intersectionEvent) {
        const _handler = handler;
        handler = () => {
          if (listenerOptions.once) {
            intersectionDispatcher.remove(element, handler);
          }
          _handler();
        };
        intersectionDispatcher.add(element, intersectionDispatcher);
      } else if (eventName === loadedEvent) {
        handler();
      } else {
        element.addEventListener(eventName, handler, listenerOptions);
      }
      attribute[IPC] = {
        buffer: [],
        eventName,
        handler,
        target: element,
        timeout: attribute[IPC] ? attribute[IPC].timeout : undefined,
        value
      };
    },
    destroy: (component, attribute) => {
      if (!attribute[IPC]) {
        return;
      }
      attribute[IPC].target.removeEventListener(attribute[IPC].eventName, attribute[IPC].handler);
      if (intersectionEvent && intersectionDispatcher) {
        intersectionDispatcher.remove(attribute[IPC].target, attribute[IPC].handler);
      }
      if (attribute[IPC].timeout) {
        clearTimeout(attribute[IPC].timeout);
      }
      hideIndicator(component, attribute);
      delete attribute[IPC];
    }
  });

  // src/utilities/client.js
  var client_default = () => {
    let identifier = Number.MIN_SAFE_INTEGER;
    const openResolvers = new Map;
    return {
      call: (name, data) => {
        identifier++;
        const currentId = identifier;
        return new Promise((resolve, reject) => {
          openResolvers.set(currentId, { resolve, reject });
          window.ipc.postMessage(JSON.stringify({
            id: currentId,
            name,
            data
          }));
        });
      },
      resolve: (identifier2, data) => {
        const resolver = openResolvers.get(identifier2);
        if (resolver) {
          openResolvers.delete(identifier2);
          resolver.resolve(data);
        }
      },
      reject: (identifier2, error) => {
        const resolver = openResolvers.get(identifier2);
        if (resolver) {
          openResolvers.delete(identifier2);
          resolver.reject(new Error(error));
        }
      }
    };
  };

  // src/DoarsIPC.js
  function DoarsIPC_default(library, options = null) {
    options = Object.assign({
      ipcContextName: "$ipc",
      ipcDirectiveName: "ipc",
      ipcPath: "__doarsIPC",
      intersectionEvent: "intersect",
      intersectionRoot: null,
      intersectionMargin: "0px",
      intersectionThreshold: 0,
      loadedEvent: "load"
    }, options);
    if (options.defaultInit) {
      Object.assign(options.ipcOptions, options.defaultInit);
    }
    let isEnabled = false;
    const ipcInstance = client_default();
    const intersectionDispatcher = options.intersectionEvent ? new IntersectionDispatcher({
      root: options.intersectionRoot,
      rootMargin: options.intersectionMargin,
      threshold: options.intersectionThreshold
    }) : null;
    const ipcContext = ipc_default(options, ipcInstance), ipcDirective = ipc_default2(options, ipcInstance, intersectionDispatcher);
    const onEnable = () => {
      setNestedProperty(window, options.ipcPath, ipcInstance);
      library.addContexts(0, ipcContext);
      library.addDirectives(-1, ipcDirective);
    };
    const onDisable = () => {
      library.removeContexts(ipcContext);
      library.removeDirective(ipcDirective);
      deleteNestedProperty(window, options.ipcPath);
    };
    this.disable = () => {
      if (!library.getEnabled() && isEnabled) {
        isEnabled = false;
        library.removeEventListener("enabling", onEnable);
        library.removeEventListener("disabling", onDisable);
      }
    };
    this.enable = () => {
      if (!isEnabled) {
        isEnabled = true;
        library.addEventListener("enabling", onEnable);
        library.addEventListener("disabling", onDisable);
      }
    };
    this.enable();
  }

  // src/DoarsIPC.iife.js
  window.DoarsIPC = DoarsIPC_default;
})();

//# debugId=37C0600968284E3164756E2164756E21
