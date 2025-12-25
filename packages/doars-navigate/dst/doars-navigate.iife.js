(() => {
  // ../common/src/utilities/Fetch.js
  var parseResponse = (response, type) => {
    let promise;
    switch (String.prototype.toLowerCase.call(type)) {
      default:
        console.warn('Unknown response type "' + type + '" used.');
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
      case "element":
      case "html-partial":
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
        case "element":
        case "html-partial":
          const template = document.createElement("template");
          template.innerHTML = response2;
          response2 = template.content.childNodes[0];
          break;
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
      case "text/html-partial":
        return "html-partial";
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
  var fetchAndParse = (url, options, returnType) => new Promise((resolve, reject) => {
    fetch(url, options).then((response) => {
      if (response.status < 200 || response.status >= 500) {
        reject(response);
        return;
      }
      if (!returnType || returnType === "auto") {
        returnType = responseType(response, options);
      }
      const responseParse = parseResponse(response, returnType);
      if (!responseParse) {
        throw new Error("No valid response returned.");
      }
      responseParse.then((responseValue) => {
        response.value = responseValue;
        resolve(response);
      });
    }).catch((error) => {
      reject(error);
    });
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
      selector = processExpression(component, attribute, element.getAttribute(attributeName));
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
      element.dispatchEvent(new CustomEvent("transition-" + phase));
      element.dispatchEvent(new CustomEvent("transition-" + type + "-" + phase));
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
        selectors.from = undefined;
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
      indicatorTransitionIn: transitionIn(libraryOptions, indicatorElement)
    };
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

  // src/directives/navigate.js
  var NAVIGATE = Symbol("NAVIGATE");
  var navigate_default = ({
    fetchOptions,
    intersectionMargin,
    intersectionThreshold,
    navigateDirectiveName
  }) => {
    return {
      name: navigateDirectiveName,
      update: (component, attribute, processExpression) => {
        const element = attribute.getElement();
        if (element[NAVIGATE]) {
          return;
        }
        const library = component.getLibrary();
        const libraryOptions = library.getOptions();
        const directive = attribute.getDirective();
        const modifiers = attribute.getModifiers();
        const listenerOptions = {};
        if (modifiers.capture) {
          listenerOptions.capture = true;
        }
        const fetchHeaders = {
          [libraryOptions.prefix + "-" + libraryOptions.requestHeaderName]: directive,
          Vary: libraryOptions.prefix + "-" + libraryOptions.requestHeaderName
        };
        const dispatchEvent = (suffix = "", data = {}) => {
          element.dispatchEvent(new CustomEvent(libraryOptions.prefix + "-" + directive + suffix, {
            detail: Object.assign({
              attribute,
              component
            }, data)
          }));
        };
        const loadFromUrl = (url) => {
          attribute[NAVIGATE].url = url;
          const identifier = new Date().toISOString();
          attribute[NAVIGATE].identifier = identifier;
          showIndicator(component, attribute, processExpression);
          dispatchEvent("-started", {
            url
          });
          fetchAndParse(url, Object.assign({}, fetchOptions, {
            headers: Object.assign({}, fetchOptions.headers, fetchHeaders)
          }), "text").then((response) => {
            if (!attribute[NAVIGATE].identifier || attribute[NAVIGATE].identifier !== identifier) {
              return;
            }
            if (!response) {
              hideIndicator(component, attribute);
              delete attribute[NAVIGATE].url;
              delete attribute[NAVIGATE].identifier;
              return;
            }
            let html = response.value;
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
            if (modifiers.morph) {
              if (modifiers.outer) {
                morphTree(target, select(fromString(html), component, attribute, processExpression));
              } else {
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
              }
            } else if (modifiers.outer) {
              if (target.outerHTML !== html) {
                target.outerHTML = select(html, component, attribute, processExpression);
                if (libraryOptions.allowInlineScript || modifiers.script) {
                  readdScripts(target);
                }
              }
            } else if (target.innerHTML !== html) {
              target.innerHTML = select(html, component, attribute, processExpression);
              if (libraryOptions.allowInlineScript || modifiers.script) {
                readdScripts(...target.children);
              }
            }
            if (libraryOptions.redirectHeaderName && response.headers.has(libraryOptions.prefix + "-" + libraryOptions.redirectHeaderName)) {
              window.location.href = response.headers.get(libraryOptions.prefix + "-" + libraryOptions.redirectHeaderName);
              return;
            }
            let documentTitle = "";
            if (libraryOptions.titleHeaderName && response.headers.has(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName)) {
              documentTitle = response.headers.get(libraryOptions.prefix + "-" + libraryOptions.titleHeaderName);
            }
            if (modifiers.history) {
              history.pushState({}, documentTitle, url);
            }
            if (documentTitle && document.title !== documentTitle) {
              document.title = documentTitle;
            }
            hideIndicator(component, attribute);
            delete attribute[NAVIGATE].url;
            delete attribute[NAVIGATE].identifier;
            dispatchEvent("-succeeded", {
              url
            });
          }).catch(() => dispatchEvent("-failed", {
            url
          }));
        };
        const interactionHandler = (event) => {
          const anchor = event.target.closest("a");
          if (!anchor || !anchor.hasAttribute("href")) {
            return;
          }
          const href = anchor.getAttribute("href");
          const url = new URL(href, window.location);
          if (window.location.hostname !== url.hostname) {
            return;
          }
          if (attribute[NAVIGATE].url && attribute[NAVIGATE].url.href === url.href) {
            return;
          }
          event.preventDefault();
          if (modifiers.stop) {
            event.stopPropagation();
          }
          loadFromUrl(url);
        };
        element.addEventListener("click", interactionHandler, listenerOptions);
        let historyHandler;
        if (modifiers.document && modifiers.history) {
          historyHandler = (event) => {
            const url = new URL(event.target.location);
            if (attribute[NAVIGATE].url && attribute[NAVIGATE].url.href === url.href) {
              return;
            }
            loadFromUrl(url);
          };
          window.addEventListener("popstate", historyHandler, { passive: true });
        }
        let destroyPreloader;
        if (modifiers.preload === "interact") {
          const preloadHandler = (event) => {
            const anchor = event.target.closest("a");
            if (!anchor || !anchor.hasAttribute("href")) {
              return;
            }
            const url = new URL(anchor.getAttribute("href"), window.location);
            dispatchEvent("-started", {
              url
            });
            fetchAndParse(url, Object.assign({}, fetchOptions, {
              headers: Object.assign({}, fetchOptions.headers, fetchHeaders)
            }), "text");
          };
          element.addEventListener("focusin", preloadHandler, Object.assign({ passive: true }, listenerOptions));
          element.addEventListener("pointerenter", preloadHandler, Object.assign({ passive: true }, listenerOptions));
          destroyPreloader = () => {
            element.removeEventListener("focusin", attribute[NAVIGATE].preloadHandler);
            element.removeEventListener("pointerenter", attribute[NAVIGATE].preloadHandler);
          };
        } else if (modifiers.preload === "intersect") {
          const intersectionObserver = new IntersectionObserver((anchors2) => {
            for (const anchor of anchors2) {
              if (anchor.isIntersecting) {
                const url = new URL(anchor.target.getAttribute("href"), window.location);
                dispatchEvent("-started", {
                  url
                });
                fetchAndParse(url, Object.assign({}, fetchOptions, {
                  headers: Object.assign({}, fetchOptions.headers, fetchHeaders)
                }), "text");
              }
            }
          }, {
            root: null,
            rootMargin: intersectionMargin,
            threshold: intersectionThreshold
          });
          const mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === "attributes") {
                if (mutation.attributeName === "href" && mutation.target instanceof HTMLElement && mutation.target.tagName === "A") {
                  if (mutation.target.hasAttribute("href")) {
                    intersectionObserver.observe(mutation.target);
                  } else {
                    intersectionObserver.unobserve(mutation.target);
                  }
                }
              } else if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                  if (node instanceof HTMLElement && node.tagName === "A" && node.hasAttribute("href")) {
                    intersectionObserver.observe(node);
                  }
                }
                for (const node of mutation.removedNodes) {
                  if (node instanceof HTMLElement && node.tagName === "A" && node.hasAttribute("href")) {
                    intersectionObserver.unobserve(node);
                  }
                }
              }
            }
          });
          destroyPreloader = () => {
            mutationObserver.disconnect();
            intersectionObserver.disconnect();
          };
          const anchors = element.querySelectorAll("a[href]");
          for (const anchor of anchors) {
            intersectionObserver.observe(anchor);
          }
          mutationObserver.observe(element, {
            attributes: true,
            childList: true,
            subtree: true
          });
        }
        attribute[NAVIGATE] = {
          element,
          historyHandler,
          loadHandler: interactionHandler,
          destroyPreloader
        };
      },
      destroy: (component, attribute) => {
        if (!attribute[NAVIGATE]) {
          return;
        }
        attribute[NAVIGATE].element.removeEventListener("click", attribute[NAVIGATE].loadHandler);
        if (attribute[NAVIGATE].historyHandler) {
          window.removeEventListener("popstate", attribute[NAVIGATE].historyHandler);
        }
        if (attribute[NAVIGATE].destroyPreloader) {
          attribute[NAVIGATE].destroyPreloader();
        }
        hideIndicator(component, attribute);
        delete attribute[NAVIGATE];
      }
    };
  };

  // src/DoarsNavigate.js
  var DoarsNavigate = function(library, options = null) {
    options = Object.assign({
      fetchOptions: {},
      intersectionMargin: "0px",
      intersectionThreshold: 0,
      navigateDirectiveName: "navigate"
    }, options);
    let isEnabled = false;
    const navigateDirective = navigate_default(options);
    const onEnable = () => {
      library.addDirectives(-1, navigateDirective);
    };
    const onDisable = () => {
      library.removeDirective(navigateDirective);
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
  };
  var DoarsNavigate_default = DoarsNavigate;

  // src/DoarsNavigate.iife.js
  window.DoarsNavigate = DoarsNavigate_default;
})();

//# debugId=F63BFA46024AE64664756E2164756E21
