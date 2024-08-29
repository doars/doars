// ../common/src/utilities/Fetch.js
var parseResponse = (response, type) => {
  let promise;
  switch (String.prototype.toLowerCase.call(type)) {
    default:
      console.warn('Unknown response type "' + type + '" used when using the $fetch context.');
      break;
    case "arraybuffer":
      promise = response.arrayBuffer();
      break;
    case "blob":
      promise = response.blob();
      break;
    case "formdata":
      promise = response.formData();
      break;
    case "json":
      promise = response.json();
      break;
    // HTML and xml need to be converted to text before being able to be parsed.
    case "element":
    case "html":
    case "svg":
    case "text":
    case "xml":
      promise = response.text();
      break;
  }
  if (!promise) {
    return null;
  }
  return promise.then((response2) => {
    switch (type) {
      // Convert from html to HTMLElement inside a document fragment.
      case "element":
        const template = document.createElement("template");
        template.innerHTML = response2;
        response2 = template.content.childNodes[0];
        break;
      // Parse some values via the DOM parser.
      case "html":
        response2 = new DOMParser().parseFromString(response2, "text/html");
        break;
      case "svg":
        response2 = new DOMParser().parseFromString(response2, "image/svg+xml");
        break;
      case "xml":
        response2 = new DOMParser().parseFromString(response2, "application/xml");
        break;
    }
    return response2;
  });
};
var responseType = (response, request = null) => {
  let contentType = response.headers.get("Content-Type");
  if (contentType) {
    contentType = String.prototype.toLowerCase.call(contentType).split(";")[0];
    const result = simplifyType(contentType.trim());
    if (result) {
      return result;
    }
  }
  let extension = response.url.split(".");
  if (extension) {
    extension = extension[extension.length - 1];
    switch (extension) {
      case "htm":
      case "html":
        return "html";
      case "json":
        return "json";
      case "svg":
        return "svg";
      case "txt":
        return "text";
      case "xml":
        return "xml";
    }
  }
  if (request) {
    let acceptTypes = request.headers.Accept;
    if (acceptTypes) {
      acceptTypes = String.prototype.toLowerCase.call(acceptTypes).split(",");
      for (let acceptType of acceptTypes) {
        acceptType = acceptType.split(";")[0].trim();
        const result = simplifyType(acceptType);
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
};
var simplifyType = (mimeType) => {
  switch (mimeType) {
    case "text/html":
      return "html";
    case "text/json":
    case "application/json":
    case "application/ld+json":
    case "application/vnd.api+json":
      return "json";
    case "image/svg+xml":
      return "svg";
    case "text/plain":
      return "text";
    case "application/xml":
    case "text/xml":
      return "xml";
  }
};
var cacheListeners = {};
var fetchAndParse = (url, options, returnType = "auto") => new Promise((resolve, reject) => {
  fetch(url, options).then((response) => {
    if (response.status < 200 || response.status >= 500) {
      const listeners = cacheListeners[url.location];
      delete cacheListeners[url.location];
      reject(response);
      for (const listener of listeners) {
        listener.reject(response);
      }
      return;
    }
    const headers = response.headers;
    if (returnType === "auto") {
      returnType = responseType(response, options);
    }
    if (returnType) {
      response = parseResponse(response, returnType);
    }
    response.then((value) => {
      const listeners = cacheListeners[url.location];
      delete cacheListeners[url.location];
      const result = {
        headers,
        value
      };
      resolve(result);
      if (listeners) {
        for (const listener of listeners) {
          listener.resolve(result);
        }
      }
    }).catch((error) => {
      const listeners = cacheListeners[url.location];
      delete cacheListeners[url.location];
      reject(error);
      if (listeners) {
        for (const listener of listeners) {
          listener.reject(error);
        }
      }
    });
  }).catch((error) => {
    const listeners = cacheListeners[url.location];
    delete cacheListeners[url.location];
    reject(error);
    if (listeners) {
      for (const listener of listeners) {
        listener.reject(error);
      }
    }
  });
});

// ../common/src/utilities/Object.js
var deepAssign = (target, ...sources) => {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {}
          });
        }
        deepAssign(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        target[key] = source[key].map((value) => {
          if (isObject(value)) {
            return deepAssign({}, value);
          }
          return value;
        });
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }
  return deepAssign(target, ...sources);
};
var isObject = (value) => {
  return value && typeof value === "object" && !Array.isArray(value);
};

// src/contexts/fetch.js
var fetch_default = ({
  fetchContextName,
  fetchOptions
}) => ({
  name: fetchContextName,
  create: () => {
    return {
      value: (url, options = null) => {
        if (fetchOptions) {
          options = deepAssign({}, fetchOptions, options);
        }
        const returnType = options.returnType ? options.returnType : null;
        delete options.returnType;
        return fetchAndParse(
          url,
          options,
          returnType
        ).then((result) => {
          if (result && result.value) {
            return result.value;
          }
        });
      }
    };
  }
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
  if (a.isSameNode && a.isSameNode(b)) {
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
    selector = processExpression(
      component,
      attribute,
      element.getAttribute(attributeName)
    );
    if (typeof selector !== "string") {
      console.warn("Doars: `" + attributeName + "` must return a string.");
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
      case "[":
        const [full, key, value] = selectorSegment.match(/^(?:\[)?([-$_.a-z0-9]{1,})(?:[$*^])?(?:=)?([\s\S]{0,})(?:\])$/i);
        attributes[key] = value;
        break;
    }
  }
  return attributes;
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
  const dispatchEvent = (phase) => {
    element.dispatchEvent(
      new CustomEvent("transition-" + phase)
    );
    element.dispatchEvent(
      new CustomEvent("transition-" + type + "-" + phase)
    );
  };
  let name, value, timeout, requestFrame;
  let isDone = false;
  const selectors = {};
  name = transitionDirectiveName;
  value = element.getAttribute(name);
  if (value) {
    selectors.during = parseSelector(value);
    addAttributes(element, selectors.during);
  }
  name = transitionDirectiveName + ".from";
  value = element.getAttribute(name);
  if (value) {
    selectors.from = parseSelector(value);
    addAttributes(element, selectors.from);
  }
  dispatchEvent("start");
  requestFrame = requestAnimationFrame(() => {
    requestFrame = null;
    if (isDone) {
      return;
    }
    if (selectors.from) {
      removeAttributes(element, selectors.from);
      selectors.from = void 0;
    }
    name = transitionDirectiveName + ".to";
    value = element.getAttribute(name);
    if (value) {
      selectors.to = parseSelector(value);
      addAttributes(element, selectors.to);
    } else if (!selectors.during) {
      dispatchEvent("end");
      if (callback) {
        callback();
      }
      isDone = true;
      return;
    }
    const styles = getComputedStyle(element);
    let duration = Number(styles.transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
    if (duration === 0) {
      duration = Number(styles.animationDuration.replace("s", "")) * 1e3;
    }
    timeout = setTimeout(() => {
      timeout = null;
      if (isDone) {
        return;
      }
      if (selectors.during) {
        removeAttributes(element, selectors.during);
        selectors.during = void 0;
      }
      if (selectors.to) {
        removeAttributes(element, selectors.to);
        selectors.to = void 0;
      }
      dispatchEvent("end");
      if (callback) {
        callback();
      }
      isDone = true;
    }, duration);
  });
  return () => {
    if (!isDone) {
      return;
    }
    isDone = true;
    if (selectors.during) {
      removeAttributes(element, selectors.during);
      selectors.during = void 0;
    }
    if (selectors.from) {
      removeAttributes(element, selectors.from);
      selectors.from = void 0;
    } else if (selectors.to) {
      removeAttributes(element, selectors.to);
      selectors.to = void 0;
    }
    if (requestFrame) {
      cancelAnimationFrame(requestFrame);
      requestFrame = null;
    } else if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    dispatchEvent("end");
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
    indicatorTemplate = processExpression(
      component,
      attribute,
      element.getAttribute(attributeName)
    );
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
    console.warn("Doars: `" + attributeName + "` must be placed on a `<template>`.");
    return;
  }
  if (indicatorTemplate.childCount > 1) {
    console.warn("Doars: `" + attributeName + "` must have one child.");
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
  indicatorTemplate.insertAdjacentElement("afterend", indicatorElement);
  attribute.indicator = {
    indicatorElement,
    // Transition element in.
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
  if (options && options.childrenOnly || newTree.nodeType === 11) {
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
  if (existingTree.isSameNode && existingTree.isSameNode(newTree)) {
    return existingTree;
  }
  if (existingTree.tagName !== newTree.tagName) {
    return newTree;
  }
  morphNode(existingTree, newTree);
  _updateChildren(existingTree, newTree);
  return existingTree;
};
var _updateChildren = (existingNode, newNode) => {
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
      for (let j = i; j < existingNode.childNodes.length; j++) {
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
        existingNode.insertBefore(morphed, existingChild);
      } else if (!newChild.id && !existingChild.id) {
        morphed = _updateTree(existingChild, newChild);
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

// ../common/src/utilities/Promise.js
var nativePromise = Function.prototype.toString.call(
  Function
  /* A native object */
).replace("Function", "Promise").replace(/\(.*\)/, "()");
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
  element.parentNode.insertBefore(
    newScript,
    element
  );
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

// src/utilities/Xml.js
var serializeFormData = (formData) => {
  const xml = document.createElement("xml");
  xml.append(...formData.map((value, key) => {
    const element = document.createElement(key);
    element.textContent = value;
    return element;
  }));
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xml);
};

// src/directives/fetch.js
var FETCH = Symbol("FETCH");
var EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 5,
  DELAY: 6
};
var fetch_default2 = ({
  fetchOptions,
  fetchDirectiveEvaluate,
  fetchDirectiveName,
  intersectionEvent,
  loadedEvent
}, intersectionDispatcher) => ({
  name: fetchDirectiveName,
  update: (component, attribute, processExpression) => {
    const library = component.getLibrary();
    const libraryOptions = library.getOptions();
    const element = attribute.getElement();
    const directive = attribute.getDirective();
    const modifiers = attribute.getModifiers();
    const value = attribute.getValue();
    const isForm = element.tagName === "FORM";
    const isButton = element.tagName === "BUTTON";
    const isInput = element.tagName === "INPUT" || element.tagName === "SELECT";
    if (attribute[FETCH]) {
      if (attribute[FETCH].value === value) {
        return;
      }
      attribute[FETCH].target.removeEventListener(
        attribute[FETCH].eventName,
        attribute[FETCH].handler
      );
      if (attribute[FETCH].timeout) {
        clearTimeout(attribute[FETCH].timeout);
      }
      delete attribute[FETCH];
    }
    const encoding = modifiers.encoding ? modifiers.encoding.toLowerCase() : null;
    const method = modifiers.method ? modifiers.method.toUpperCase() : null;
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
      modifiers.poll = 6e4;
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
    const fetchHeaders = {
      [libraryOptions.prefix + "-" + libraryOptions.requestHeaderName]: directive,
      Vary: libraryOptions.prefix + "-" + libraryOptions.requestHeaderName
    };
    const dispatchEvent = (suffix = "", data = {}) => {
      element.dispatchEvent(
        new CustomEvent(
          libraryOptions.prefix + "-" + directive + suffix,
          {
            detail: Object.assign({
              attribute,
              component
            }, data)
          }
        )
      );
    };
    const requestHandler = (url) => {
      const _fetchOptions = {
        headers: {}
      };
      if (method) {
        _fetchOptions.method = method;
      } else if (isForm && element.hasAttribute("method")) {
        _fetchOptions.method = element.getAttribute("method").toUpperCase();
      } else {
        _fetchOptions.method = "GET";
      }
      if (isForm) {
        const formData = new FormData(element);
        let _encoding = encoding;
        if (!_encoding && element.hasAttribute("enctype")) {
          _encoding = element.getAttribute("enctype").toLowerCase();
        } else {
          _encoding = "urlencoded";
        }
        if (_fetchOptions.method === "HEAD" || _fetchOptions.method === "GET") {
          _encoding = "parameters";
        }
        switch (_encoding) {
          case "json":
            _fetchOptions.headers["Content-Type"] = "application/json; charset=UTF-8";
            _fetchOptions.body = JSON.stringify(Object.fromEntries(formData));
            break;
          case "multipart":
          case "multipart/form-data":
            _fetchOptions.headers["Content-Type"] = "multipart/form-data";
            _fetchOptions.body = formData;
            break;
          case "parameters":
            url = new URL(url, window.location.href);
            const parameters = new URLSearchParams(formData);
            for (const [parameterName, parameterValue] of parameters) {
              url.searchParams.set(parameterName, parameterValue);
            }
            url = url.toString();
            break;
          case "urlencoded":
          case "application/x-www-form-urlencoded":
            _fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
            _fetchOptions.body = new URLSearchParams(formData).toString();
            break;
          case "xml":
            _fetchOptions.headers["Content-Type"] = "application/xml; charset=UTF-8";
            _fetchOptions.body = serializeFormData(formData);
            break;
          default:
            console.warn('DoarsFetch: "' + directive + '" directive\'s invalid encoding type "' + _encoding + '".');
            break;
        }
      }
      dispatchEvent("-started", {
        url
      });
      return fetchAndParse(
        url,
        Object.assign({}, fetchOptions, _fetchOptions, {
          headers: Object.assign({}, _fetchOptions.headers, fetchHeaders)
        })
      ).then((result) => {
        isLoading = false;
        let html = result.value;
        if (modifiers.decode) {
          html = decode(result.value);
        }
        let target = null;
        if (modifiers.document) {
          target = document.documentElement;
        } else {
          const attributeName = libraryOptions.prefix + "-" + directive + "-" + libraryOptions.targetDirectiveName;
          if (element.getAttribute(attributeName)) {
            if (libraryOptions.targetDirectiveEvaluate) {
              target = processExpression(
                component,
                attribute,
                element.getAttribute(attributeName)
              );
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
          const child = select(
            fromString(html),
            component,
            attribute,
            processExpression
          );
          target.append(child);
          if (libraryOptions.allowInlineScript || modifiers.script) {
            readdScripts(child);
          }
        } else if (position === "prepend") {
          const child = select(
            fromString(html),
            component,
            attribute,
            processExpression
          );
          target.prepend(child);
          if (libraryOptions.allowInlineScript || modifiers.script) {
            readdScripts(child);
          }
        } else if (position === "after") {
          const child = select(
            fromString(html),
            component,
            attribute,
            processExpression
          );
          target.insertAdjacentElement("afterend", child);
          if (libraryOptions.allowInlineScript || modifiers.script) {
            readdScripts(child);
          }
        } else if (position === "before") {
          const child = select(
            fromString(html),
            component,
            attribute,
            processExpression
          );
          target.insertAdjacentElement("beforebegin", child);
          if (libraryOptions.allowInlineScript || modifiers.script) {
            readdScripts(child);
          }
        } else if (position === "outer") {
          if (modifiers.morph) {
            morphTree(
              target,
              select(
                fromString(html),
                component,
                attribute,
                processExpression
              )
            );
          } else if (target.outerHTML !== html) {
            target.outerHTML = select(
              html,
              component,
              attribute,
              processExpression
            );
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(target);
            }
          }
        } else if (modifiers.morph) {
          if (target.children.length === 0) {
            target.append(document.createElement("div"));
          } else if (target.children.length > 1) {
            for (let i = target.children.length - 1; i >= 1; i--) {
              target.children[i].remove();
            }
          }
          const root = morphTree(
            target.children[0],
            select(
              fromString(html),
              component,
              attribute,
              processExpression
            )
          );
          if (!target.children[0].isSameNode(root)) {
            target.children[0].remove();
            target.append(root);
          }
        } else if (target.innerHTML !== html) {
          target.innerHTML = select(
            html,
            component,
            attribute,
            processExpression
          );
          if (libraryOptions.allowInlineScript || modifiers.script) {
            readdScripts(...target.children);
          }
        }
        if (libraryOptions.redirectHeaderName && result.headers.has(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName)) {
          window.location.href = result.headers.get(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName);
          return;
        }
        let documentTitle = "";
        if (libraryOptions.titleHeaderName && result.headers.has(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName)) {
          documentTitle = result.headers.get(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName);
        }
        if (modifiers.document && modifiers.history) {
          history.pushState({}, documentTitle, url);
        }
        if (documentTitle && document.title !== documentTitle) {
          document.title = documentTitle;
        }
        hideIndicator(
          component,
          attribute
        );
        dispatchEvent("-succeeded", {
          url
        });
      }).catch(() => {
        hideIndicator(
          component,
          attribute
        );
        dispatchEvent("-failed", {
          url
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
        let url = null;
        if (value && fetchDirectiveEvaluate) {
          url = processExpression(
            component,
            attribute,
            value,
            {
              $event: event,
              $events: attribute[FETCH].buffer
            }
          );
        } else if (isForm && element.hasAttribute("action")) {
          url = element.getAttribute("action");
        }
        attribute[FETCH].buffer = [];
        if (!url) {
          resolve();
          return;
        }
        isLoading = true;
        showIndicator(
          component,
          attribute,
          processExpression
        );
        (isPromise(url) ? url.then((url2) => requestHandler(url2)) : requestHandler(url)).finally(() => resolve());
      };
      if (isLoading) {
        resolve();
        return;
      }
      attribute[FETCH].buffer.push(event);
      switch (executionModifier) {
        case EXECUTION_MODIFIERS.BUFFER:
          if (attribute[FETCH].buffer.length < modifiers.buffer) {
            resolve();
            return;
          }
          execute();
          return;
        case EXECUTION_MODIFIERS.DEBOUNCE:
          if (attribute[FETCH].timeout) {
            clearTimeout(attribute[FETCH].timeout);
            attribute[FETCH].timeout = null;
          }
          attribute[FETCH].timeout = setTimeout(execute, modifiers.debounce);
          return;
        case EXECUTION_MODIFIERS.THROTTLE:
          const nowThrottle = window.performance.now();
          if (attribute[FETCH].lastExecution && nowThrottle - attribute[FETCH].lastExecution < modifiers.throttle) {
            resolve();
            return;
          }
          execute();
          attribute[FETCH].lastExecution = nowThrottle;
          return;
        case EXECUTION_MODIFIERS.DELAY:
          attribute[FETCH].timeout = setTimeout(execute, modifiers.delay);
          return;
      }
      execute();
    });
    if (modifiers.poll) {
      const _handler = handler;
      handler = () => {
        attribute[FETCH].timeout = setTimeout(() => {
          _handler(null).finally(() => {
            if (attribute[FETCH]) {
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
          intersectionDispatcher.remove(
            element,
            handler
          );
        }
        _handler();
      };
      intersectionDispatcher.add(
        element,
        intersectionDispatcher
      );
    } else if (eventName === loadedEvent) {
      handler();
    } else {
      element.addEventListener(
        eventName,
        handler,
        listenerOptions
      );
    }
    attribute[FETCH] = {
      buffer: [],
      eventName,
      handler,
      target: element,
      timeout: attribute[FETCH] ? attribute[FETCH].timeout : void 0,
      value
    };
  },
  destroy: (component, attribute) => {
    if (!attribute[FETCH]) {
      return;
    }
    attribute[FETCH].target.removeEventListener(
      attribute[FETCH].eventName,
      attribute[FETCH].handler
    );
    if (intersectionEvent && intersectionDispatcher) {
      intersectionDispatcher.remove(
        attribute[FETCH].target,
        attribute[FETCH].handler
      );
    }
    if (attribute[FETCH].timeout) {
      clearTimeout(attribute[FETCH].timeout);
    }
    hideIndicator(
      component,
      attribute
    );
    delete attribute[FETCH];
  }
});

// ../common/src/polyfills/IntersectionDispatcher.js
var IntersectionDispatcher = class {
  /**
   * Create observer instance.
   * @param {object} options Intersection observer options.
   */
  constructor(options = null) {
    const items = /* @__PURE__ */ new WeakMap();
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
};

// src/DoarsFetch.js
function DoarsFetch_default(library, options = null) {
  options = Object.assign({
    fetchContextName: "$fetch",
    fetchDirectiveEvaluate: true,
    fetchDirectiveName: "fetch",
    fetchOptions: {},
    intersectionEvent: "intersect",
    intersectionRoot: null,
    intersectionMargin: "0px",
    intersectionThreshold: 0,
    loadedEvent: "load"
  }, options);
  if (options.defaultInit) {
    Object.assign(options.fetchOptions, options.defaultInit);
  }
  let isEnabled = false;
  const intersectionDispatcher = options.intersectionEvent ? new IntersectionDispatcher({
    root: options.intersectionRoot ? options.intersectionRoot : library.getOptions().root,
    rootMargin: options.intersectionMargin,
    threshold: options.intersectionThreshold
  }) : null;
  const fetchContext = fetch_default(options), fetchDirective = fetch_default2(options, intersectionDispatcher);
  const onEnable = () => {
    library.addContexts(0, fetchContext);
    library.addDirectives(-1, fetchDirective);
  };
  const onDisable = () => {
    library.removeContexts(fetchContext);
    library.removeDirective(fetchDirective);
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
export {
  DoarsFetch_default as default
};
//# sourceMappingURL=doars-fetch.esm.js.map
