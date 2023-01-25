// ../packages/doars/src/symbols.js
var ATTRIBUTES = Symbol("ATTRIBUTES");
var COMPONENT = Symbol("COMPONENT");
var FOR = Symbol("FOR");
var INITIALIZED = Symbol("INITIALIZED");
var ON = Symbol("ON");
var REFERENCES = Symbol("REFERENCES");
var REFERENCES_CACHE = Symbol("REFERENCES_CACHE");
var SYNC = Symbol("SYNC");

// ../packages/common/src/events/EventDispatcher.js
var EventDispatcher = class {
  /**
   * Create instance.
   */
  constructor() {
    let events = {};
    this.addEventListener = (name, callback, options = null) => {
      if (!(name in events)) {
        events[name] = [];
      }
      events[name].push({
        callback,
        options
      });
    };
    this.removeEventListener = (name, callback) => {
      if (!Object.keys(events).includes(name)) {
        return;
      }
      const eventData = events[name];
      let index = -1;
      for (let i = 0; i < eventData.length; i++) {
        if (eventData[i].callback === callback) {
          index = i;
          break;
        }
      }
      if (index < 0) {
        return;
      }
      eventData.splice(index, 1);
      if (Object.keys(eventData).length === 0) {
        delete events[name];
      }
    };
    this.removeEventListeners = (name) => {
      if (!name) {
        return;
      }
      delete events[name];
    };
    this.removeAllEventListeners = () => {
      events = {};
    };
    this.dispatchEvent = (name, parameters, options = null) => {
      if (!events[name]) {
        return;
      }
      const eventData = events[name];
      for (let i = 0; i < eventData.length; i++) {
        const event = options && options.reverse ? eventData[eventData.length - (i + 1)] : eventData[i];
        if (event.options && event.options.once) {
          eventData.splice(i, 1);
        }
        event.callback(...parameters);
      }
    };
  }
};
var EventDispatcher_default = EventDispatcher;

// ../packages/common/src/utilities/String.js
var escapeHtml = (text) => {
  return text.replace(/\\/g, "\\\\").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\n/g, "\\n");
};
var kebabToCamel = (text) => {
  return text.replace(/-(\w)/g, (match, character) => character.toUpperCase());
};
var parseAttributeModifiers = (modifiers) => {
  const result = {};
  for (const modifier of modifiers) {
    const hyphenIndex = modifier.indexOf("-");
    if (hyphenIndex < 0) {
      result[modifier] = true;
      continue;
    }
    if (hyphenIndex === 0) {
      result[modifier.substring(1)] = false;
      continue;
    }
    const key = modifier.substring(0, hyphenIndex);
    let value = modifier.substring(hyphenIndex + 1);
    let tmpValue = value;
    let type;
    if (value.endsWith("ms")) {
      tmpValue = value.substring(-2);
    } else if (value.endsWith("s")) {
      type = "s";
      tmpValue = value.substring(-1);
    } else if (value.endsWith("m")) {
      type = "m";
      tmpValue = value.substring(-1);
    } else if (value.endsWith("h")) {
      type = "h";
      tmpValue = value.substring(-1);
    }
    tmpValue = Number.parseInt(tmpValue);
    if (!isNaN(tmpValue)) {
      value = tmpValue;
      switch (type) {
        case "h":
          value *= 60;
        case "m":
          value *= 60;
        case "s":
          value *= 1e3;
          break;
      }
    }
    result[key] = value;
  }
  return result;
};
var parseAttributeName = (prefix, name) => {
  name = name.match(new RegExp("^" + prefix + "-([a-z][0-9a-z-]{1,}):?([a-z][0-9a-z-]*)?(\\..*]*)?$", "i"));
  if (!name) {
    return;
  }
  let [full, directive, keyRaw, modifiers] = name;
  keyRaw = keyRaw !== "" ? keyRaw : null;
  const key = keyRaw ? kebabToCamel(keyRaw) : null;
  modifiers = modifiers ? modifiers.substring(1).split(".") : [];
  return [directive, keyRaw, key, modifiers];
};
var parseForExpression = (expression) => {
  const match = expression.match(/^([$_a-z0-9,(){}\s]{1,}?)\s+(?:in|of)\s+([\s\S]{1,})$/i);
  if (!match) {
    return;
  }
  let variables = match[1].replace(/^[\s({]*|[)}\s]*$/g, "");
  variables = variables.match(/^([$_a-z0-9]{1,})?(?:,\s+?)?([$_a-z0-9]{1,})?(?:,\s+)?([$_a-z0-9]{1,})?$/i);
  if (!variables) {
    return;
  }
  variables.shift();
  return {
    iterable: match[2].trim(),
    variables: [...variables]
    // Convert it to an array instead of a regular expression match.
  };
};
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

// ../packages/doars/src/Attribute.js
var Attribute = class extends EventDispatcher_default {
  /**
   * Create instance.
   * @param {Component} component Component instance.
   * @param {HTMLElement} element Element.
   * @param {String} name Attribute name (with library prefix removed).
   * @param {String} value Attribute value.
   * @param {Boolean} isClone Whether this will be a clone of an existing attribute.
   */
  constructor(component, element2, name, value, isClone = false) {
    super();
    const id = Symbol("ID_ATTRIBUTE");
    if (!isClone) {
      if (!element2[ATTRIBUTES]) {
        element2[ATTRIBUTES] = [];
      }
      element2[ATTRIBUTES].push(this);
    }
    let accessedItems = {}, data = null, directive, key, keyRaw, modifiersRaw, modifiers;
    if (name) {
      const [_directive, _keyRaw, _key, _modifiers] = parseAttributeName(component.getLibrary().getOptions().prefix, name);
      directive = _directive;
      key = _key;
      keyRaw = _keyRaw;
      modifiersRaw = _modifiers;
      if (_modifiers) {
        modifiers = parseAttributeModifiers(_modifiers);
      }
    }
    this.getComponent = () => {
      return component;
    };
    this.getElement = () => {
      return element2;
    };
    this.getId = () => {
      return id;
    };
    this.getDirective = () => {
      return directive;
    };
    this.getKey = () => {
      return key;
    };
    this.getKeyRaw = () => {
      return keyRaw;
    };
    this.getModifiers = () => {
      return Object.assign({}, modifiers);
    };
    this.getModifiersRaw = () => {
      return modifiersRaw;
    };
    this.getName = () => {
      return name;
    };
    this.getValue = () => {
      return value;
    };
    this.setValue = (_value) => {
      value = _value;
      this.dispatchEvent("changed", [this]);
    };
    this.clearData = () => {
      data = null;
    };
    this.hasData = () => {
      return data !== null;
    };
    this.getData = () => {
      return data;
    };
    this.setData = (_data) => {
      data = _data;
    };
    this.destroy = () => {
      this.setData(null);
      this.clearAccessed();
      const indexInElement = element2[ATTRIBUTES].indexOf(this);
      if (indexInElement >= 0) {
        element2[ATTRIBUTES].splice(indexInElement, 1);
      }
      this.dispatchEvent("destroyed", [this]);
      this.removeAllEventListeners();
    };
    this.accessed = (id2, path) => {
      if (!accessedItems[id2]) {
        accessedItems[id2] = [];
      } else if (accessedItems[id2].includes(path)) {
        return;
      }
      accessedItems[id2].push(path);
      this.dispatchEvent("accessed", [this, id2, path]);
    };
    this.clearAccessed = () => {
      accessedItems = {};
    };
    this.hasAccessed = (id2, paths) => {
      if (!(id2 in accessedItems)) {
        return false;
      }
      const accessedAtId = accessedItems[id2];
      for (const path of paths) {
        if (accessedAtId.includes(path)) {
          return true;
        }
      }
      return false;
    };
    this.clone = () => {
      return new Attribute(component, element2, name, value, true);
    };
  }
};

// ../packages/common/src/polyfills/RevocableProxy.js
var REFLECTION_METHODS = [
  "apply",
  "construct",
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "getPrototypeOf",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "set",
  "setPrototypeOf"
];
var RevocableProxy_default = (target, handler) => {
  let revoked = false;
  const revocableHandler = {};
  for (const key of REFLECTION_METHODS) {
    revocableHandler[key] = (...parameters) => {
      if (revoked) {
        console.error("illegal operation attempted on a revoked proxy");
        return;
      }
      if (key in handler) {
        return handler[key](...parameters);
      }
      return Reflect[key](...parameters);
    };
  }
  return {
    proxy: new Proxy(target, revocableHandler),
    revoke: () => {
      revoked = true;
    }
  };
};

// ../packages/common/src/events/ProxyDispatcher.js
var ProxyDispatcher = class extends EventDispatcher_default {
  constructor(options = {}) {
    super();
    options = Object.assign({
      delete: true,
      get: true,
      set: true
    }, options);
    const map = /* @__PURE__ */ new WeakMap();
    this.add = (target, path = []) => {
      if (map.has(target)) {
        return map.get(target);
      }
      for (const key in target) {
        if (target[key] && typeof target[key] === "object") {
          target[key] = this.add(target[key], [...path, key]);
        }
      }
      const handler = {};
      if (options.delete) {
        handler.deleteProperty = (target2, key) => {
          if (!Reflect.has(target2, key)) {
            return true;
          }
          this.remove(target2, key);
          const deleted = Reflect.deleteProperty(target2, key);
          if (deleted) {
            this.dispatchEvent("delete", [target2, Array.isArray(target2) ? [...path] : [...path, key]]);
          }
          return deleted;
        };
      }
      if (options.get) {
        handler.get = (target2, key, receiver) => {
          if (key !== Symbol.unscopables) {
            this.dispatchEvent("get", [target2, [...path, key], receiver]);
          }
          return Reflect.get(target2, key, receiver);
        };
      }
      if (options.set) {
        handler.set = (target2, key, value, receiver) => {
          if (target2[key] === value) {
            return true;
          }
          if (value && typeof value === "object") {
            value = this.add(value, [...path, key]);
          }
          target2[key] = value;
          this.dispatchEvent("set", [target2, Array.isArray(target2) ? [...path] : [...path, key], value, receiver]);
          return true;
        };
      }
      const revocable = RevocableProxy_default(target, handler);
      map.set(revocable, target);
      return revocable.proxy;
    };
    this.remove = (target) => {
      if (!map.has(target)) {
        return;
      }
      const revocable = map.get(target);
      map.delete(revocable);
      for (const property in revocable.proxy) {
        if (typeof revocable.proxy[property] === "object") {
          this.remove(revocable.proxy[property]);
        }
      }
      revocable.revoke();
    };
  }
};
var ProxyDispatcher_default = ProxyDispatcher;

// ../packages/doars/src/utilities/Component.js
var closestComponent = (element2) => {
  if (!element2.parentElement) {
    return;
  }
  element2 = element2.parentElement;
  if (element2[COMPONENT]) {
    return element2[COMPONENT];
  }
  return closestComponent(element2);
};

// ../packages/common/src/utilities/Attribute.js
var addAttributes = (element2, data) => {
  for (const name in data) {
    if (name === "class") {
      for (const className of data.class) {
        element2.classList.add(className);
      }
      continue;
    }
    element2.setAttribute(name, data[name]);
  }
};
var removeAttributes = (element2, data) => {
  for (const name in data) {
    if (name === "class") {
      for (const className of data.class) {
        element2.classList.remove(className);
      }
      continue;
    }
    if (data[name] && element2.attributes[name] !== data[name]) {
      continue;
    }
    element2.removeAttribute(name);
  }
};
var setAttribute = (element2, key, data) => {
  if (key === "value" && element2.tagName === "INPUT") {
    if (!data) {
      data = "";
    }
    if (element2.getAttribute(key) === data) {
      return;
    }
    element2.setAttribute(key, data);
    return;
  }
  if (key === "checked") {
    if (element2.type === "checkbox" || element2.type === "radio") {
      element2.checked = !!data;
      return;
    }
  }
  if (key === "class") {
    if (Array.isArray(data)) {
      data = data.join(" ");
    } else if (typeof data === "object") {
      data = Object.entries(data).filter(([key2, value]) => value).map(([key2]) => key2).join(" ");
    }
  }
  if (key === "style") {
    if (Array.isArray(data)) {
      data = data.join(" ");
    } else if (typeof data === "object") {
      data = Object.entries(data).map(([key2, value]) => key2 + ":" + value).join(";");
    }
  }
  if (data === false || data === null || data === void 0) {
    element2.removeAttribute(key);
  } else {
    element2.setAttribute(key, data);
  }
};
var setAttributes = (element2, data) => {
  for (const name in data) {
    setAttribute(element2, name, data[name]);
  }
};

// ../packages/common/src/utilities/Transition.js
var TRANSITION_NAME = "-transition:";
var transition = (type, component, element2, callback = null) => {
  if (element2.nodeType !== 1) {
    if (callback) {
      callback();
    }
    return;
  }
  const { prefix } = component.getLibrary().getOptions();
  const transitionName = prefix + TRANSITION_NAME + type;
  const dispatchEvent = (phase) => {
    element2.dispatchEvent(
      new CustomEvent("transition-" + phase)
    );
    element2.dispatchEvent(
      new CustomEvent("transition-" + type + "-" + phase)
    );
  };
  let name, value, timeout, requestFrame;
  let isDone = false;
  const selectors = {};
  name = transitionName;
  value = element2.getAttribute(name);
  if (value) {
    selectors.during = parseSelector(value);
    addAttributes(element2, selectors.during);
  }
  name = transitionName + ".from";
  value = element2.getAttribute(name);
  if (value) {
    selectors.from = parseSelector(value);
    addAttributes(element2, selectors.from);
  }
  dispatchEvent("start");
  requestFrame = requestAnimationFrame(() => {
    requestFrame = null;
    if (isDone) {
      return;
    }
    if (selectors.from) {
      removeAttributes(element2, selectors.from);
      selectors.from = void 0;
    }
    name = transitionName + ".to";
    value = element2.getAttribute(name);
    if (value) {
      selectors.to = parseSelector(value);
      addAttributes(element2, selectors.to);
    } else if (!selectors.during) {
      dispatchEvent("end");
      if (callback) {
        callback();
      }
      isDone = true;
      return;
    }
    const styles = getComputedStyle(element2);
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
        removeAttributes(element2, selectors.during);
        selectors.during = void 0;
      }
      if (selectors.to) {
        removeAttributes(element2, selectors.to);
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
      removeAttributes(element2, selectors.during);
      selectors.during = void 0;
    }
    if (selectors.from) {
      removeAttributes(element2, selectors.from);
      selectors.from = void 0;
    } else if (selectors.to) {
      removeAttributes(element2, selectors.to);
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
var transitionIn = (component, element2, callback) => {
  return transition("in", component, element2, callback);
};
var transitionOut = (component, element2, callback) => {
  return transition("out", component, element2, callback);
};

// ../packages/common/src/utilities/Element.js
var insertAfter = (reference, node) => {
  if (reference.nextSibling) {
    reference.parentNode.insertBefore(node, reference.nextSibling);
  } else {
    reference.parentNode.appendChild(node);
  }
};
var walk = (element2, filter) => {
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
      if (index >= element2.childElementCount) {
        return null;
      }
      child = element2.children[index];
    } while (!filter(child));
    if (child.childElementCount) {
      iterator = walk(child, filter);
    }
    return child;
  };
};

// ../packages/doars/src/Component.js
var Component = class {
  /**
   * Create instance.
   * @param {Doars} library Library instance.
   * @param {HTMLElement} element Element.
   */
  constructor(library, element2) {
    var _a, _b;
    const id = Symbol("ID_COMPONENT");
    const { prefix, processor } = library.getOptions();
    const processorType = typeof processor;
    let processExpression;
    if (processorType === "function") {
      processExpression = processor;
    } else if (processorType === "string" && library.constructor[processor + "Expression"]) {
      processExpression = library.constructor[processor + "Expression"];
    } else {
      console.warn("Doars: Expression processor not found. Using fallback instead.");
      processExpression = (_b = (_a = library.constructor.executeExpression) != null ? _a : library.constructor.interpretExpression) != null ? _b : library.constructor.callExpression;
    }
    if (!processExpression) {
      console.error("Doars: No expression processor available. Process option: ", process);
    }
    const directiveUtilities = Object.freeze({
      processExpression,
      transition,
      transitionIn,
      transitionOut
    });
    let attributes = [], hasUpdated = false, isInitialized = false, data, proxy, state;
    if (!element2.attributes[prefix + "-state"]) {
      console.error("Doars: element given to component does not contain a state attribute!");
      return;
    }
    element2[COMPONENT] = this;
    const children = [];
    let parent = closestComponent(element2);
    if (parent) {
      if (!parent.getChildren().includes(this)) {
        parent.getChildren().push(this);
        library.update([{
          id: parent.getId(),
          path: "children"
        }]);
      }
    }
    this.getAttributes = () => {
      return attributes;
    };
    this.getChildren = () => {
      return children;
    };
    this.getElement = () => {
      return element2;
    };
    this.getId = () => {
      return id;
    };
    this.getLibrary = () => {
      return library;
    };
    this.getParent = () => {
      return parent;
    };
    this.getProxy = () => {
      return proxy;
    };
    this.getState = () => {
      return state;
    };
    this.setParent = (_parent) => {
      parent = _parent;
    };
    this.initialize = () => {
      if (isInitialized) {
        return;
      }
      isInitialized = true;
      const componentName = prefix + "-state";
      const value = element2.attributes[componentName].value;
      data = value ? processExpression(this, new Attribute(this, element2, null, value), value) : {};
      if (data === null) {
        data = {};
      } else if (typeof data !== "object" || Array.isArray(data)) {
        console.error("Doars: component tag must return an object!");
        return;
      }
      proxy = new ProxyDispatcher_default();
      state = proxy.add(data);
      this.scanAttributes(element2);
    };
    this.destroy = () => {
      if (!isInitialized) {
        return;
      }
      if (attributes.length > 0) {
        const directives = library.getDirectivesObject();
        for (const key in directives) {
          if (!directives[key].destroy) {
            directives[key] = void 0;
          }
        }
        for (const attribute of attributes) {
          const directive = directives[attribute.getKey()];
          if (directive) {
            directive.destroy(this, attribute, directiveUtilities);
          }
          attribute.destroy();
        }
      }
      delete element2[COMPONENT];
      attributes = [];
      isInitialized = false;
      proxy.remove(data);
      state = null;
      proxy = null;
      data = null;
      const triggers = [];
      if (children.length > 0) {
        for (const child of children) {
          child.setParent(parent);
          triggers.push({
            id: child.getId(),
            path: "parent"
          });
        }
        triggers.push({
          id,
          path: "children"
        });
      }
      if (parent) {
        if (children.length > 0) {
          parent.getChildren().push(...children);
          triggers.push({
            id: parent.getId(),
            path: "children"
          });
        }
        triggers.push({
          id,
          path: "parent"
        });
      }
      if (triggers.length > 0) {
        library.update(triggers);
      }
      dispatchEvent("destroyed", {
        element: element2,
        id
      });
    };
    this.addAttribute = (element3, name, value) => {
      const directivesKeys = library.getDirectivesNames();
      const attribute = new Attribute(this, element3, name, value);
      let index = attribute.length;
      const directiveIndex = directivesKeys.indexOf(attribute.getDirective());
      for (let i = attributes.length - 1; i >= 0; i--) {
        if (directivesKeys.indexOf(attributes[i].getDirective()) <= directiveIndex) {
          index = i + 1;
          break;
        }
      }
      attributes.splice(index, 0, attribute);
      return attribute;
    };
    this.removeAttribute = (attribute) => {
      const indexInAttributes = attributes.indexOf(attribute);
      if (indexInAttributes < 0) {
        return;
      }
      const directives = library.getDirectivesObject;
      const directive = directives[attribute.getKey()];
      if (directive && directive.destroy) {
        directive.destroy(this, attribute, directiveUtilities);
      }
      attributes.splice(indexInAttributes, 1);
      attribute.destroy();
    };
    this.scanAttributes = (element3) => {
      const componentName = prefix + "-state";
      const ignoreName = prefix + "-ignore";
      const newAttributes = [];
      const iterator = walk(element3, (element4) => !element4.hasAttribute(componentName) && !element4.hasAttribute(ignoreName));
      do {
        for (const { name, value } of element3.attributes) {
          if (library.isDirectiveName(name)) {
            newAttributes.push(this.addAttribute(element3, name, value));
          }
        }
      } while (element3 = iterator());
      return newAttributes;
    };
    this.updateAttribute = (attribute) => {
      if (!attribute.getElement() || attribute.getValue() === null || attribute.getValue() === void 0) {
        this.removeAttribute(attribute);
        return;
      }
      const directives = library.getDirectivesObject();
      attribute.clearAccessed();
      const directive = directives[attribute.getDirective()];
      if (directive) {
        directive.update(this, attribute, directiveUtilities);
      }
    };
    this.updateAttributes = (attributes2) => {
      if (!isInitialized || attributes2.length <= 0) {
        if (!hasUpdated) {
          hasUpdated = true;
          dispatchEvent("updated", {
            attributes: attributes2,
            element: element2,
            id
          });
        }
        return;
      }
      for (const attribute of attributes2) {
        this.updateAttribute(attribute);
      }
      hasUpdated = true;
      dispatchEvent("updated", {
        attributes: attributes2,
        element: element2,
        id
      });
    };
    this.update = (triggers) => {
      if (!isInitialized) {
        return;
      }
      const triggerIds = Object.getOwnPropertySymbols(triggers);
      const updatedAttributes = [];
      for (const attribute of attributes) {
        for (const id2 of triggerIds) {
          if (attribute.hasAccessed(id2, triggers[id2])) {
            this.updateAttribute(attribute);
            updatedAttributes.push(attribute);
          }
        }
      }
      if (!hasUpdated || updatedAttributes.length > 0) {
        hasUpdated = true;
        dispatchEvent("updated", {
          attributes: updatedAttributes,
          element: element2,
          id
        });
      }
    };
    const dispatchEvent = (name, detail) => {
      element2.dispatchEvent(
        new CustomEvent(prefix + "-" + name, {
          detail,
          bubbles: true
        })
      );
    };
  }
};

// ../packages/doars/src/contexts/children.js
var children_default = {
  name: "$children",
  create: (component, attribute, update, { createContextsProxy: createContextsProxy2, RevocableProxy }) => {
    let children;
    const revocable = RevocableProxy(component.getChildren(), {
      get: (target, key, receiver) => {
        if (!children) {
          children = target.map((child2) => createContextsProxy2(child2, attribute, update));
          attribute.accessed(component.getId(), "children");
        }
        if (isNaN(key)) {
          return Reflect.get(children, key, receiver);
        }
        const child = Reflect.get(children, key, receiver);
        if (child) {
          return child.contexts;
        }
      }
    });
    return {
      value: revocable.proxy,
      destroy: () => {
        if (children) {
          children.forEach((child) => child.destroy());
        }
        revocable.revoke();
      }
    };
  }
};

// ../packages/doars/src/contexts/component.js
var component_default = {
  name: "$component",
  create: (component) => {
    return {
      value: component.getElement()
    };
  }
};

// ../packages/doars/src/contexts/element.js
var element_default = {
  name: "$element",
  create: (component, attribute) => {
    return {
      value: attribute.getElement()
    };
  }
};

// ../packages/doars/src/contexts/dispatch.js
var dispatch_default = {
  name: "$dispatch",
  create: (component) => {
    return {
      value: (name, detail = {}) => {
        component.getElement().dispatchEvent(
          new CustomEvent(name, {
            detail,
            bubbles: true
          })
        );
      }
    };
  }
};

// ../packages/doars/src/contexts/for.js
var for_default = {
  deconstruct: true,
  name: "$for",
  create: (component, attribute, update, { RevocableProxy }) => {
    if (component !== attribute.getComponent()) {
      return;
    }
    let element2 = attribute.getElement();
    const componentElement = component.getElement(), items = [], target = {};
    while (element2 && !element2.isSameNode(componentElement)) {
      const data = element2[FOR];
      if (data) {
        items.push(data);
        for (const key in data.variables) {
          target[key] = data.variables[key];
        }
      }
      element2 = element2.parentNode;
    }
    if (items.length === 0) {
      return;
    }
    const revocable = RevocableProxy(target, {
      get: (target2, key) => {
        for (const item of items) {
          if (key in item.variables) {
            attribute.accessed(item.id, "$for");
            return item.variables[key];
          }
        }
      }
    });
    return {
      value: revocable.proxy,
      destroy: () => {
        revocable.revoke();
      }
    };
  }
};

// ../packages/doars/src/contexts/inContext.js
var inContext_default = {
  name: "$inContext",
  create: (component, attribute, update, { createContexts: createContexts2 }) => {
    return {
      value: (callback) => {
        const triggers = [];
        const contextUpdate = (id, context) => {
          triggers.push({
            id,
            path: context
          });
        };
        const { contexts, destroy: destroy3 } = createContexts2(component, attribute, contextUpdate, {});
        const result = callback(contexts);
        destroy3();
        if (triggers.length > 0) {
          component.getLibrary().update(triggers);
        }
        return result;
      }
    };
  }
};

// ../packages/doars/src/contexts/nextTick.js
var nextTick_default = {
  name: "$nextTick",
  create: (component, attribute, update, { createContexts: createContexts2 }) => {
    let callbacks;
    let isSetup = false;
    const setup2 = () => {
      if (isSetup) {
        return;
      }
      isSetup = true;
      const library = component.getLibrary();
      callbacks = [];
      const handleUpdate = () => {
        stopListening();
        const { contexts, destroy: destroy3 } = createContexts2(component, attribute, update, {});
        for (const callback of callbacks) {
          callback(contexts);
        }
        destroy3();
      };
      const stopListening = () => {
        library.removeEventListener("updated", handleUpdate);
        attribute.removeEventListener("changed", stopListening);
        attribute.removeEventListener("destroyed", stopListening);
      };
      library.addEventListener("updated", handleUpdate);
      attribute.addEventListener("changed", stopListening);
      attribute.addEventListener("destroyed", stopListening);
    };
    return {
      value: (callback) => {
        setup2();
        callbacks.push(callback);
      }
    };
  }
};

// ../packages/doars/src/contexts/parent.js
var parent_default = {
  name: "$parent",
  create: (component, attribute, update, { createContextsProxy: createContextsProxy2 }) => {
    const parent = component.getParent();
    if (!parent) {
      return {
        key: "$parent",
        value: null
      };
    }
    const { contexts, destroy: destroy3 } = createContextsProxy2(parent, attribute, update);
    return {
      value: contexts,
      destroy: destroy3
    };
  }
};

// ../packages/doars/src/contexts/references.js
var references_default = {
  name: "$references",
  create: (component, attribute, update, { RevocableProxy }) => {
    if (!component[REFERENCES]) {
      return {
        key: "$references",
        value: []
      };
    }
    let cache = component[REFERENCES_CACHE];
    if (!cache) {
      const references = component[REFERENCES];
      const attributeIds = Object.getOwnPropertySymbols(references);
      cache = {};
      for (const id of attributeIds) {
        const { element: element2, name } = references[id];
        cache[name] = element2;
      }
      component[REFERENCES_CACHE] = cache;
    }
    const revocable = RevocableProxy(cache, {
      get: (target, propertyKey, receiver) => {
        attribute.accessed(component.getId(), "$references." + propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      }
    });
    return {
      value: revocable.proxy,
      destroy: () => {
        revocable.revoke();
      }
    };
  }
};

// ../packages/doars/src/contexts/state.js
var state_default = {
  deconstruct: true,
  name: "$state",
  create: (component, attribute, update, { RevocableProxy }) => {
    const proxy = component.getProxy();
    const state = component.getState();
    if (!proxy || !state) {
      return;
    }
    const onDelete = (target, path) => update(component.getId(), "$state." + path.join("."));
    const onGet = (target, path) => attribute.accessed(component.getId(), "$state." + path.join("."));
    const onSet = (target, path) => update(component.getId(), "$state." + path.join("."));
    proxy.addEventListener("delete", onDelete);
    proxy.addEventListener("get", onGet);
    proxy.addEventListener("set", onSet);
    const revocable = RevocableProxy(state, {});
    return {
      value: revocable.proxy,
      // Remove event listeners.
      destroy: () => {
        proxy.removeEventListener("delete", onDelete);
        proxy.removeEventListener("get", onGet);
        proxy.removeEventListener("set", onSet);
        revocable.revoke();
      }
    };
  }
};

// ../packages/common/src/utilities/Promise.js
var nativePromise = Function.prototype.toString.call(
  Function
  /* A native object */
).replace("Function", "Promise").replace(/\(.*\)/, "()");
var isPromise = (value) => {
  return value && Object.prototype.toString.call(value) === "[object Promise]";
};

// ../packages/doars/src/directives/attribute.js
var attribute_default = {
  name: "attribute",
  update: (component, attribute, { processExpression }) => {
    const element2 = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const set = (value) => {
      if (modifiers.selector) {
        if (typeof value !== "string") {
          console.error("Doars: Value returned to attribute directive must be a string if the selector modifier is set.");
          return;
        }
        value = parseSelector(value);
        setAttributes(element2, value);
        return;
      }
      const key = attribute.getKeyRaw();
      if (!key) {
        if (typeof value === "object" && !Array.isArray(value)) {
          setAttributes(element2, value);
        } else {
          console.error("Doars: Value returned to attribute directive of invalid type.");
        }
        return;
      }
      setAttribute(element2, key, value);
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

// ../packages/doars/src/directives/cloak.js
var cloak_default = {
  name: "cloak",
  update: function(component, attribute, { transitionIn: transitionIn2 }) {
    const element2 = attribute.getElement();
    element2.removeAttribute(
      component.getLibrary().getOptions().prefix + "-" + this.name
    );
    transitionIn2(component, element2);
  }
};

// ../packages/doars/src/directives/for.js
var createVariables = (names, ...values) => {
  const variables = {};
  for (let i = 0; i < values.length; i++) {
    if (i >= names.length) {
      break;
    }
    variables[names[i]] = values[i];
  }
  return variables;
};
var indexInSiblings = (elements, value, index = -1) => {
  index++;
  if (index >= elements.length) {
    return -1;
  }
  if (elements[index][FOR].value === value) {
    return index;
  }
  return indexInSiblings(elements, value, index);
};
var setAfter = (component, update, template, elements, index, value, variables) => {
  const existingIndex = indexInSiblings(elements, value, index);
  if (existingIndex >= 0) {
    if (existingIndex === index + 1) {
      return;
    }
    const element3 = elements[existingIndex];
    insertAfter(elements[index] ? elements[index] : template, element3);
    update(element3[FOR].id);
    return;
  }
  let element2 = document.importNode(template.content, true);
  const sibling = index === -1 ? template : elements[index];
  insertAfter(sibling, element2);
  element2 = sibling.nextElementSibling;
  transitionIn(component, element2);
  element2[FOR] = {
    id: Symbol("ID_FOR"),
    value,
    variables
  };
  elements.splice(index + 1, 0, element2);
};
var removeAfter = (component, elements, maxLength) => {
  if (elements.length < maxLength) {
    return;
  }
  for (let i = elements.length - 1; i >= maxLength; i--) {
    const element2 = elements[i];
    elements.splice(i, 1);
    transitionOut(component, element2, () => {
      element2.remove();
    });
  }
};
var for_default2 = {
  name: "for",
  update: (component, attribute, { processExpression }) => {
    const template = attribute.getElement();
    if (template.tagName !== "TEMPLATE") {
      console.warn("Doars: `for` directive must be placed on a `<template>` tag.");
      return;
    }
    const expression = parseForExpression(attribute.getValue());
    if (!expression) {
      console.error("Doars: Error in `for` expression: ", attribute.getValue());
      return;
    }
    const triggers = {};
    const update = (id) => {
      if (!triggers[id]) {
        triggers[id] = ["$for"];
      }
    };
    const set = (iterable) => {
      const data2 = attribute.getData();
      const elements = data2.elements ? data2.elements : [];
      const iterableType = typeof iterable;
      if (iterable !== null && iterable !== void 0) {
        if (iterableType === "number") {
          for (let index = 0; index < iterable; index++) {
            const variables = createVariables(expression.variables, index);
            setAfter(component, update, template, elements, index - 1, iterable, variables);
          }
          removeAfter(component, elements, iterable);
        } else if (iterableType === "string") {
          for (let index = 0; index < iterable.length; index++) {
            const value = iterable[index];
            const variables = createVariables(expression.variables, value, index);
            setAfter(component, update, template, elements, index - 1, value, variables);
          }
          removeAfter(component, elements, iterable.length);
        } else {
          let isArray, length;
          try {
            const values = [...iterable];
            isArray = true;
            length = values.length;
          } catch (e) {
          }
          if (isArray) {
            for (let index = 0; index < length; index++) {
              const value = iterable[index];
              const variables = createVariables(expression.variables, value, index);
              setAfter(component, update, template, elements, index - 1, value, variables);
            }
          } else {
            const keys = Object.keys(iterable);
            length = keys.length;
            for (let index = 0; index < length; index++) {
              const key = keys[index];
              const value = iterable[key];
              const variables = createVariables(expression.variables, key, value, index);
              setAfter(component, update, template, elements, index - 1, value, variables);
            }
          }
          removeAfter(component, elements, length);
        }
      }
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        component.update(triggers);
      }
      attribute.setData(
        Object.assign({}, data2, {
          elements
        })
      );
    };
    let result;
    if (!isNaN(expression.iterable)) {
      result = Number(expression.iterable);
    } else {
      result = processExpression(component, attribute, expression.iterable);
    }
    const data = attribute.getData();
    attribute.setData(
      Object.assign({}, data, {
        result
      })
    );
    if (isPromise(result)) {
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData().result !== result) {
          return;
        }
        set(resultResolved);
      });
    } else {
      set(result);
    }
  },
  destroy: (component, attribute) => {
    const data = attribute.getData();
    if (data.elements) {
      for (const element2 of data.elements) {
        transitionOut(component, element2, () => {
          element2.remove();
        });
      }
    }
  }
};

// ../packages/common/src/utilities/Html.js
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

// ../packages/doars/src/directives/html.js
var html_default = {
  name: "html",
  update: (component, attribute, { processExpression }) => {
    const element2 = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const set = (html) => {
      if (modifiers.decode && typeof html === "string") {
        html = decode(html);
      }
      if (html instanceof HTMLElement) {
        for (const child of element2.children) {
          child.remove();
        }
        element2.appendChild(html.cloneNode(true));
        return;
      }
      if (typeof html === "string") {
        if (element2.innerHTML !== html) {
          element2.innerHTML = html;
        }
        return;
      }
      console.error("Doars/directives/html: Unknown type returned to directive!");
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

// ../packages/doars/src/directives/if.js
var if_default = {
  name: "if",
  update: (component, attribute, { processExpression, transitionIn: transitionIn2, transitionOut: transitionOut2 }) => {
    const template = attribute.getElement();
    if (template.tagName !== "TEMPLATE") {
      console.warn("Doars: `if` directive must be placed on a `<template>` tag.");
      return;
    }
    if (template.childCount > 1) {
      console.warn("Doars: `if` directive must have a single child node.");
      return;
    }
    const set = (result2) => {
      const data2 = attribute.getData();
      let element2 = data2.element;
      let transition2 = data2.transition;
      if (!result2) {
        if (element2) {
          if (transition2) {
            transition2();
          }
          transition2 = transitionOut2(component, element2, () => {
            element2.remove();
          });
        }
      } else if (!element2) {
        if (transition2) {
          transition2();
        }
        element2 = document.importNode(template.content, true);
        insertAfter(template, element2);
        element2 = template.nextElementSibling;
        transition2 = transitionIn2(component, element2);
      }
      attribute.setData(
        Object.assign({}, data2, {
          element: element2,
          transition: transition2
        })
      );
    };
    const result = processExpression(component, attribute, attribute.getValue());
    const data = attribute.getData();
    attribute.setData(
      Object.assign({}, data, {
        result
      })
    );
    if (isPromise(result)) {
      Promise.resolve(result).then((result2) => {
        if (attribute.getData().result !== result2) {
          return;
        }
        set(result2);
      });
    } else {
      set(result);
    }
  },
  destroy: (component, attribute, { transitionOut: transitionOut2 }) => {
    const data = attribute.getData();
    if (data.element) {
      transitionOut2(component, data.element, () => {
        data.element.remove();
      });
    }
  }
};

// ../packages/doars/src/directives/initialized.js
var destroy = (component, attribute) => {
  if (!attribute[INITIALIZED]) {
    return;
  }
  const element2 = component.getElement();
  const name = component.getLibrary().getOptions().prefix + "-updated";
  element2.removeEventListener(name, attribute[INITIALIZED].handler);
  delete attribute[INITIALIZED];
};
var initialized_default = {
  name: "initialized",
  update: (component, attribute, { processExpression }) => {
    const element2 = component.getElement();
    const value = attribute.getValue();
    const name = component.getLibrary().getOptions().prefix + "-updated";
    if (attribute[INITIALIZED]) {
      if (attribute[INITIALIZED].value === value) {
        return;
      }
      element2.removeEventListener(name, attribute[INITIALIZED].handler);
      delete attribute[INITIALIZED];
    }
    const handler = ({ detail }) => {
      if (detail.element !== element2) {
        return;
      }
      processExpression(component, attribute.clone(), value, {}, {
        return: false
      });
      destroy(component, attribute);
    };
    element2.addEventListener(name, handler, {
      once: true
    });
    attribute[INITIALIZED] = {
      handler,
      value
    };
  },
  destroy
};

// ../packages/doars/src/directives/on.js
var CANCEL_EVENTS = {
  keydown: "keyup",
  mousedown: "mouseup",
  pointerdown: "pointerup"
};
var EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  HELD: 3,
  HOLD: 4,
  THROTTLE: 5
};
var KEYPRESS_MODIFIERS = [
  "alt",
  "ctrl",
  "meta",
  "shift"
];
var on_default = {
  name: "on",
  update: (component, attribute, { processExpression }) => {
    let name = attribute.getKeyRaw();
    if (!name) {
      console.warn("Doars: `on` directive must have a key.");
      return;
    }
    let key;
    if (name.startsWith("keydown-")) {
      key = name.substring(8).toLowerCase();
      name = "keydown";
    } else if (name.startsWith("keyup-")) {
      key = name.substring(6).toLowerCase();
      name = "keyup";
    }
    const element2 = attribute.getElement();
    const value = attribute.getValue();
    if (attribute[ON]) {
      if (attribute[ON].value === value) {
        return;
      }
      attribute[ON].target.removeEventListener(name, attribute[ON].handler);
      if (attribute[ON].timeout) {
        clearTimeout(attribute[ON].timeout);
      }
      delete attribute[ON];
    }
    const modifiers = attribute.getModifiers();
    const options = {};
    if (modifiers.capture) {
      options.capture = true;
    }
    if (modifiers.once) {
      options.once = true;
    }
    if (modifiers.passive) {
      options.passive = true;
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
    } else if (modifiers.held) {
      executionModifier = EXECUTION_MODIFIERS.HELD;
      if (modifiers.held === true) {
        modifiers.held = 500;
      }
    } else if (modifiers.hold) {
      executionModifier = EXECUTION_MODIFIERS.HOLD;
      if (modifiers.hold === true) {
        modifiers.hold = 500;
      }
    } else if (modifiers.throttle) {
      executionModifier = EXECUTION_MODIFIERS.THROTTLE;
      if (modifiers.throttle === true) {
        modifiers.throttle = 500;
      }
    }
    const keypressModifiers = [];
    if (key) {
      modifiers.meta = modifiers.meta ? true : modifiers.cmd || modifiers.super;
      for (const modifier of KEYPRESS_MODIFIERS) {
        if (modifiers[modifier]) {
          keypressModifiers.push(modifier);
        }
      }
    }
    let target = element2;
    if (modifiers.document || modifiers.outside) {
      target = document;
    } else if (modifiers.window) {
      target = window;
    }
    const handler = (event) => {
      if (attribute[ON].prevent) {
        return;
      }
      if (!modifiers.repeat && event.repeat) {
        return;
      }
      if (modifiers.self && event.target !== element2) {
        return;
      }
      if (modifiers.outside && element2.contains(event.target)) {
        return;
      }
      if ((name === "keydown" || name === "keyup") && key) {
        for (const keypressModifier of keypressModifiers) {
          if (!event[keypressModifier + "Key"]) {
            return;
          }
        }
        let eventKey = modifiers.code ? event.code : event.key;
        if (eventKey === " ") {
          eventKey = "space";
        }
        eventKey = eventKey.toLowerCase();
        if (eventKey !== key) {
          return;
        }
      }
      if (modifiers.prevent) {
        event.preventDefault();
      }
      if (modifiers.stop) {
        event.stopPropagation();
      }
      const execute2 = () => {
        processExpression(component, attribute.clone(), value, {
          $event: event,
          $events: attribute[ON].buffer
        }, { return: false });
        attribute[ON].buffer = [];
      };
      attribute[ON].buffer.push(event);
      switch (executionModifier) {
        case EXECUTION_MODIFIERS.BUFFER:
          if (attribute[ON].buffer.length < modifiers.buffer) {
            return;
          }
          execute2();
          return;
        case EXECUTION_MODIFIERS.DEBOUNCE:
          if (attribute[ON].timeout) {
            clearTimeout(attribute[ON].timeout);
            attribute[ON].timeout = null;
          }
          attribute[ON].timeout = setTimeout(execute2, modifiers.debounce);
          return;
        case EXECUTION_MODIFIERS.HELD:
          if (!(name in CANCEL_EVENTS)) {
            console.warn('Doars: `on` directive, event of name "' + name + '" is not cancelable and can not have "held" modifier.');
            return;
          }
          const cancelHeldName = CANCEL_EVENTS[name];
          const nowHeld = window.performance.now();
          attribute[ON].cancel = (cancelEvent) => {
            if (window.performance.now() - nowHeld < modifiers.held) {
              attribute[ON].prevent = false;
              return;
            }
            if (cancelHeldName === "keyup" && key) {
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[keypressModifier + "Key"]) {
                  attribute[ON].prevent = false;
                  return;
                }
              }
              let eventKey = modifiers.code ? cancelEvent.code : cancelEvent.key;
              if (eventKey === " ") {
                eventKey = "space";
              }
              eventKey = eventKey.toLowerCase();
              if (eventKey !== key) {
                attribute[ON].prevent = false;
                return;
              }
            }
            if (modifiers.self && cancelEvent.target !== element2) {
              attribute[ON].prevent = false;
              return;
            }
            if (modifiers.outside && element2.contains(cancelEvent.target)) {
              attribute[ON].prevent = false;
              return;
            }
            execute2();
          };
          attribute[ON].prevent = true;
          target.addEventListener(cancelHeldName, attribute[ON].cancel, { once: true });
          return;
        case EXECUTION_MODIFIERS.HOLD:
          if (!(name in CANCEL_EVENTS)) {
            console.warn('Doars: `on` directive, event of name "' + name + '" is not cancelable and can not have "hold" modifier.');
            return;
          }
          const cancelHoldName = CANCEL_EVENTS[name];
          attribute[ON].cancel = (cancelEvent) => {
            if (cancelHoldName === "keyup" && key) {
              let keyLetGo = false;
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[keypressModifier + "Key"]) {
                  keyLetGo = true;
                }
              }
              let eventKey = modifiers.code ? cancelEvent.code : cancelEvent.key;
              if (eventKey === " ") {
                eventKey = "space";
              }
              eventKey = eventKey.toLowerCase();
              if (eventKey === key) {
                keyLetGo = true;
              }
              if (!keyLetGo) {
                attribute[ON].prevent = false;
                return;
              }
            }
            if (modifiers.self && cancelEvent.target !== element2) {
              attribute[ON].prevent = false;
              return;
            }
            if (modifiers.outside && element2.contains(cancelEvent.target)) {
              attribute[ON].prevent = false;
              return;
            }
            clearTimeout(attribute[ON].timeout);
          };
          target.addEventListener(cancelHoldName, attribute[ON].cancel, { once: true });
          attribute[ON].prevent = true;
          attribute[ON].timeout = setTimeout(() => {
            target.removeEventListener(cancelHoldName, attribute[ON].cancel);
            attribute[ON].prevent = false;
            execute2();
          }, modifiers.hold);
          return;
        case EXECUTION_MODIFIERS.THROTTLE:
          const nowThrottle = window.performance.now();
          if (attribute[ON].lastExecution && nowThrottle - attribute[ON].lastExecution < modifiers.throttle) {
            return;
          }
          execute2();
          attribute[ON].lastExecution = nowThrottle;
          return;
      }
      execute2();
    };
    target.addEventListener(name, handler, options);
    attribute[ON] = {
      buffer: [],
      handler,
      target,
      timeout: attribute[ON] ? attribute[ON].timeout : void 0,
      value,
      prevent: false
    };
  },
  destroy: (component, attribute) => {
    if (!attribute[ON]) {
      return;
    }
    const key = attribute.getKeyRaw();
    attribute[ON].target.removeEventListener(key, attribute[ON].handler);
    if (attribute[ON].cancel) {
      attribute[ON].target.removeEventListener(
        CANCEL_EVENTS[key],
        attribute[ON].cancel
      );
    }
    if (attribute[ON].timeout) {
      clearTimeout(attribute[ON].timeout);
    }
    delete attribute[ON];
  }
};

// ../packages/doars/src/directives/reference.js
var destroy2 = (component, attribute) => {
  if (!component[REFERENCES]) {
    return;
  }
  const attributeId = attribute.getId();
  if (!component[REFERENCES][attributeId]) {
    return;
  }
  const library = component.getLibrary();
  const componentId = component.getId();
  const value = attribute.getValue().trim();
  delete component[REFERENCES][attributeId];
  delete component[REFERENCES_CACHE];
  if (Object.keys(component[REFERENCES]).length === 0) {
    delete component[REFERENCES];
  }
  library.update([{ id: componentId, path: "$references." + value }]);
};
var reference_default = {
  name: "reference",
  update: (component, attribute) => {
    const value = attribute.getValue().trim();
    if (!/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(value)) {
      destroy2(component, attribute);
      console.warn("Doars: `reference` directive's value not a valid variable name: \"" + value + '".');
      return;
    }
    const library = component.getLibrary();
    const componentId = component.getId();
    const element2 = attribute.getElement();
    const attributeId = attribute.getId();
    if (!component[REFERENCES]) {
      component[REFERENCES] = {};
    }
    component[REFERENCES][attributeId] = {
      element: element2,
      name: value
    };
    delete component[REFERENCES_CACHE];
    library.update([{ id: componentId, path: "$references." + value }]);
  },
  destroy: destroy2
};

// ../packages/doars/src/directives/select.js
var TAG_SELECT = "SELECT";
var CHECKED = "checked";
var SELECTED = "selected";
var TYPE_CHECKBOX = "checkbox";
var select_default = {
  name: "select",
  update: (component, attribute, { processExpression }) => {
    const element2 = attribute.getElement();
    const type = element2.getAttribute("type");
    if (element2.tagName !== TAG_SELECT && !(element2.tagName === "INPUT" && (type === TYPE_CHECKBOX || type === "radio"))) {
      console.warn("Doars: `select` directive must be placed on a `select` tag or `input` of type checkbox or radio.");
      return;
    }
    const set = (data) => {
      if (element2.tagName === TAG_SELECT) {
        for (const option of Array.from(element2.options)) {
          const select = Array.isArray(data) ? data.includes(option.value) : data === option.value;
          if (option.selected !== select) {
            option.selected = select;
            if (select) {
              option.setAttribute(SELECTED, "");
            } else {
              option.removeAttribute(SELECTED);
            }
          }
        }
      } else if (type === TYPE_CHECKBOX) {
        const checked = data.includes(element2.value);
        if (element2.checked !== checked) {
          if (checked) {
            element2.setAttribute(CHECKED, "");
          } else {
            element2.removeAttribute(CHECKED);
          }
        }
      } else {
        const checked = data === element2.value;
        if (element2.checked !== checked) {
          if (checked) {
            element2.setAttribute(CHECKED, "");
          } else {
            element2.removeAttribute(CHECKED);
          }
        }
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

// ../packages/doars/src/directives/show.js
var show_default = {
  name: "show",
  update: (component, attribute, { processExpression, transitionIn: transitionIn2, transitionOut: transitionOut2 }) => {
    const element2 = attribute.getElement();
    const set = () => {
      const data2 = attribute.getData();
      if (data2.transition) {
        data2.transition();
      }
      let transition2;
      if (data2.result) {
        element2.style.display = null;
        transition2 = transitionIn2(component, element2);
      } else {
        transition2 = transitionOut2(component, element2, () => {
          element2.style.display = "none";
        });
      }
      attribute.setData(
        Object.assign({}, data2, {
          transition: transition2
        })
      );
    };
    const result = processExpression(component, attribute, attribute.getValue());
    const data = attribute.getData();
    if (isPromise(result)) {
      attribute.setData(
        Object.assign({}, data, {
          result
        })
      );
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData().result !== result) {
          return;
        }
        set(resultResolved);
      });
    } else if (!data || data.result !== result) {
      attribute.setData(
        Object.assign({}, data, {
          result
        })
      );
      set();
    }
  }
};

// ../packages/doars/src/utilities/Context.js
var createContextUtilities = () => {
  return {
    createContexts,
    createContextsProxy,
    RevocableProxy: RevocableProxy_default
  };
};
var createContexts = (component, attribute, update, extra = null) => {
  const library = component.getLibrary();
  const contexts = library.getSimpleContexts();
  const deconstructed = [];
  let after = "", before = "";
  const creatableContexts = library.getContexts();
  const destroyFunctions = [];
  for (const creatableContext of creatableContexts) {
    if (!creatableContext || !creatableContext.name) {
      continue;
    }
    const result = creatableContext.create(component, attribute, update, createContextUtilities());
    if (!result || !result.value) {
      continue;
    }
    if (result.destroy && typeof result.destroy === "function") {
      destroyFunctions.push(result.destroy);
    }
    if (creatableContext.deconstruct && typeof result.value === "object") {
      deconstructed.push(creatableContext.name);
      before += "with(" + creatableContext.name + ") { ";
      after += " }";
    }
    contexts[creatableContext.name] = result.value;
  }
  if (typeof extra === "object") {
    for (const name in extra) {
      contexts[name] = extra[name];
    }
  }
  return {
    contexts,
    destroy: () => {
      for (const destroyFunction of destroyFunctions) {
        destroyFunction(createContextUtilities());
      }
    },
    after,
    before,
    deconstructed
  };
};
var createContextsProxy = (component, attribute, update, extra = null) => {
  let data = null;
  const revocable = RevocableProxy_default({}, {
    get: (target, property) => {
      if (!data) {
        data = createContexts(component, attribute, update, extra);
      }
      if (property in data.contexts) {
        attribute.accessed(component.getId(), property);
        return data.contexts[property];
      }
      if (data.contexts.$state) {
        if (property in data.contexts.$state) {
          attribute.accessed(component.getId(), "$state");
          return data.contexts.$state[property];
        }
      }
    }
  });
  return {
    contexts: revocable.proxy,
    destroy: () => {
      if (data && data.destroy) {
        data.destroy(component, attribute);
      }
      revocable.revoke();
    }
  };
};
var createAutoContexts = (component, attribute, extra = null) => {
  const triggers = [];
  const update = (id, context) => {
    triggers.push({
      id,
      path: context
    });
  };
  const { contexts, destroy: destroy3 } = createContexts(component, attribute, update, extra);
  return [contexts, () => {
    destroy3();
    if (triggers.length > 0) {
      component.getLibrary().update(triggers);
    }
  }];
};

// ../packages/common/src/utilities/Object.js
var getDeeply = (object, path) => {
  let objectTemp = object;
  let i = 0;
  for (; i < path.length - 1; i++) {
    objectTemp = objectTemp[path[i]];
  }
  return objectTemp[path[i]];
};
var setDeeply = (object, path, value) => {
  if (typeof object !== "object") {
    return;
  }
  let i = 0;
  for (; i < path.length - 1; i++) {
    object = object[path[i]];
    if (typeof object !== "object") {
      return;
    }
  }
  object[path[i]] = value;
};

// ../packages/doars/src/directives/sync.js
var sync_default = {
  name: "sync",
  update: (component, attribute, { processExpression }) => {
    const element2 = attribute.getElement();
    const isNew = !attribute[SYNC];
    if (isNew) {
      if (!(element2.tagName === "DIV" && element2.hasAttribute("contenteditable")) && element2.tagName !== "INPUT" && element2.tagName !== "SELECT" && element2.tagName !== "TEXTAREA") {
        console.warn("Doars: `sync` directive must be placed on an `<input>`, `<select>`, `<textarea>` tag, or a content editable `div`.");
        return;
      }
    }
    let value = attribute.getValue().trim();
    const key = attribute.getKey();
    if (key) {
      value = "$" + key + "." + value;
    }
    if (!/^[_$a-z]{1}[._$a-z0-9]{0,}$/i.test(value)) {
      console.warn("Doars: `sync` directive's value not a valid variable name: \"" + value + '".');
      return;
    }
    value = value.split(".");
    if (isNew) {
      let handler;
      switch (element2.tagName) {
        case "DIV":
          handler = () => {
            const [contexts, destroyContexts] = createAutoContexts(component, attribute.clone());
            setDeeply(contexts, value, escapeHtml(element2.innerText));
            destroyContexts();
          };
          break;
        case "INPUT":
          handler = () => {
            const attributeClone = attribute.clone();
            const elementValue = escapeHtml(element2.value);
            const [contexts, destroyContexts] = createAutoContexts(component, attributeClone);
            if (element2.type === "checkbox") {
              const dataValue2 = getDeeply(contexts, value);
              if (element2.checked) {
                if (!dataValue2) {
                  setDeeply(contexts, value, [elementValue]);
                }
                if (!dataValue2.includes(element2.value)) {
                  dataValue2.push(elementValue);
                }
              } else if (dataValue2) {
                const index = dataValue2.indexOf(element2.value);
                if (index >= 0) {
                  dataValue2.splice(index, 1);
                }
              }
            } else if (element2.type === "radio") {
              const dataValue2 = getDeeply(contexts, value);
              if (element2.checked) {
                if (dataValue2 !== element2.value) {
                  setDeeply(contexts, value, elementValue);
                }
              } else if (dataValue2 === element2.value) {
                setDeeply(contexts, value, null);
              }
            } else {
              setDeeply(contexts, value, elementValue);
            }
            destroyContexts();
          };
          break;
        case "TEXTAREA":
          handler = () => {
            const [contexts, destroyContexts] = createAutoContexts(component, attribute.clone());
            setDeeply(contexts, value, escapeHtml(element2.innerText));
            destroyContexts();
          };
          break;
        case "SELECT":
          handler = () => {
            const [contexts, destroyContexts] = createAutoContexts(component, attribute.clone());
            if (element2.multiple) {
              const elementValues = [];
              for (const option of element2.selectedOptions) {
                elementValues.push(
                  escapeHtml(option.value)
                );
              }
              setDeeply(contexts, value, [elementValues.join("','")]);
            } else {
              setDeeply(contexts, value, escapeHtml(element2.selectedOptions[0].value));
            }
            destroyContexts();
          };
          break;
      }
      element2.addEventListener("input", handler);
      attribute[SYNC] = handler;
    }
    const dataValue = processExpression(component, attribute, value);
    switch (element2.tagName) {
      case "DIV":
      case "TEXTAREA":
        if (dataValue !== element2.innerText) {
          element2.innerText = dataValue;
        }
        break;
      case "INPUT":
        if (element2.type === "checkbox") {
          const checked = dataValue.includes(element2.value);
          if (element2.checked !== checked) {
            element2.checked = checked;
            if (checked) {
              element2.setAttribute("checked", "");
            } else {
              element2.removeAttribute("checked");
            }
          }
        } else if (element2.type === "radio") {
          const checked = dataValue === element2.value;
          if (element2.checked !== checked) {
            element2.checked = checked;
            if (checked) {
              element2.setAttribute("checked", "");
            } else {
              element2.removeAttribute("checked");
            }
          }
        } else {
          if (dataValue !== element2.value) {
            element2.setAttribute("value", dataValue);
          }
        }
        break;
      case "SELECT":
        for (const option of Array.from(element2.options)) {
          const select = Array.isArray(dataValue) ? dataValue.includes(option.value) : dataValue === option.value;
          if (option.selected !== select) {
            option.selected = select;
            if (select) {
              option.setAttribute("selected", "");
            } else {
              option.removeAttribute("selected");
            }
          }
        }
        break;
    }
  },
  destroy: (component, attribute) => {
    if (!attribute[SYNC]) {
      return;
    }
    const element2 = attribute.getElement();
    element2.removeEventListener("input", attribute[SYNC]);
    delete attribute[SYNC];
  }
};

// ../packages/doars/src/directives/text.js
var text_default = {
  name: "text",
  update: (component, attribute, { processExpression }) => {
    const element2 = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const set = (text) => {
      if (modifiers.content) {
        if (element2.textContent !== text) {
          element2.textContent = text;
        }
      } else if (element2.innerText !== text) {
        element2.innerText = text;
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

// ../packages/doars/src/directives/watch.js
var watch_default = {
  name: "watch",
  update: (component, attribute, { processExpression }) => {
    const value = attribute.getValue();
    processExpression(component, attribute, value, {}, {
      return: false
    });
  }
};

// ../packages/doars/src/Doars.js
var Doars = class extends EventDispatcher_default {
  /**
   * Create instance.
   * @param {Object} options Options.
   */
  constructor(options) {
    super();
    let { prefix, root } = options = Object.assign({
      prefix: "d",
      processor: "execute",
      root: document.body
    }, options);
    if (typeof root === "string") {
      options.root = root = document.querySelector(root);
    }
    if (!prefix) {
      console.error("Doars: `prefix` option not set.");
      return;
    }
    if (typeof prefix !== "string") {
      console.error("Doars: `prefix` option must be of type string.");
      return;
    }
    if (!root) {
      console.error("Doars: `root` option not set.");
      return;
    }
    if (typeof root !== "object") {
      console.error("Doars: `root` option must be a string or HTMLElement.");
      return;
    }
    const id = Symbol("ID_DOARS");
    let isEnabled = false, isUpdating = false, mutations, observer, triggers;
    const components = [];
    const contextsBase = {}, contexts = [
      children_default,
      component_default,
      element_default,
      dispatch_default,
      inContext_default,
      nextTick_default,
      parent_default,
      references_default,
      // Order of `state` before `for` context is important for deconstruction.
      state_default,
      for_default
    ];
    const directives = [
      // Must happen first as other directives can rely on it.
      reference_default,
      // Then execute those that modify the document tree, since it could make other directives redundant and save on processing.
      attribute_default,
      for_default2,
      html_default,
      if_default,
      text_default,
      // Order does not matter any more.
      cloak_default,
      initialized_default,
      on_default,
      select_default,
      show_default,
      sync_default,
      watch_default
    ];
    let directivesNames, directivesObject, directivesRegexp;
    this.getId = () => {
      return id;
    };
    this.getOptions = () => {
      return Object.assign({}, options);
    };
    this.getEnabled = () => {
      return isEnabled;
    };
    this.enable = () => {
      if (isEnabled) {
        return this;
      }
      isUpdating = false;
      mutations = [];
      triggers = {};
      this.dispatchEvent("enabling", [this]);
      isEnabled = true;
      directivesNames = directives.map((directive) => directive.name);
      directivesObject = {};
      for (const directive of directives) {
        directivesObject[directive.name] = directive;
      }
      directivesRegexp = new RegExp("^" + prefix + "-(" + directivesNames.join("|") + ")(?:[$-_.a-z0-9]{0,})?$", "i");
      observer = new MutationObserver(handleMutation.bind(this));
      observer.observe(root, {
        attributes: true,
        childList: true,
        subtree: true
      });
      const componentName = prefix + "-state";
      const ignoreName = prefix + "-ignore";
      const componentElements = [...root.querySelectorAll("[" + componentName + "]")];
      for (let i = componentElements.length - 1; i >= 0; i--) {
        if (componentElements[i].closest("[" + ignoreName + "]")) {
          componentElements.splice(i, 1);
        }
      }
      addComponents(root.hasAttribute(componentName) && !root.hasAttribute(ignoreName) ? root : null, ...componentElements);
      this.dispatchEvent("enabled", [this]);
      this.dispatchEvent("updated", [this]);
      return this;
    };
    this.disable = () => {
      if (!isEnabled) {
        return this;
      }
      observer.disconnect();
      observer = null;
      isUpdating = mutations = triggers = null;
      this.dispatchEvent("disabling", [this], { reverse: true });
      removeComponents(...components);
      directivesNames = directivesObject = directivesRegexp = null;
      isEnabled = false;
      this.dispatchEvent("disabled", [this], { reverse: true });
      return this;
    };
    const addComponents = (...elements) => {
      const results = [];
      const resultElements = [];
      for (const element2 of elements) {
        if (!element2) {
          continue;
        }
        if (element2[COMPONENT]) {
          continue;
        }
        const component = new Component(this, element2);
        components.push(component);
        results.push(component);
        resultElements.push(element2);
      }
      if (resultElements.length > 0) {
        this.dispatchEvent("components-added", [this, resultElements]);
      }
      for (const component of results) {
        component.initialize();
      }
      for (const component of results) {
        component.updateAttributes(component.getAttributes());
      }
      return results;
    };
    const removeComponents = (..._components) => {
      const results = [];
      for (const component of _components) {
        const index = components.indexOf(component);
        if (index < 0) {
          continue;
        }
        results.push(component.getElement());
        component.destroy();
        components.splice(index, 1);
      }
      if (results.length > 0) {
        this.dispatchEvent("components-removed", [this, results]);
      }
      return results;
    };
    this.getSimpleContexts = () => Object.assign({}, contextsBase);
    this.setSimpleContext = (name, value = null) => {
      if (value === null) {
        delete contextsBase[name];
        this.dispatchEvent("simple-context-removed", [this, name]);
        return true;
      }
      if (!name.match("^([a-zA-Z_$][a-zA-Z\\d_$]*)$")) {
        console.warn('Doars: name of a bind can not start with a "$".');
        return false;
      }
      contextsBase[name] = value;
      this.dispatchEvent("simple-context-added", [this, name, value]);
      return true;
    };
    this.getContexts = () => [...contexts];
    this.addContexts = (index, ..._contexts) => {
      if (isEnabled) {
        console.warn("Doars: Unable to add contexts after being enabled!");
        return;
      }
      if (index < 0) {
        index = contexts.length + index % contexts.length;
      } else if (index > contexts.length) {
        index = contexts.length;
      }
      const results = [];
      for (let i = 0; i < _contexts.length; i++) {
        const context = _contexts[i];
        if (contexts.includes(context)) {
          continue;
        }
        contexts.splice(index + i, 0, context);
        results.push(context);
      }
      if (results.length > 0) {
        this.dispatchEvent("contexts-added", [this, results]);
      }
      return results;
    };
    this.removeContexts = (..._contexts) => {
      if (isEnabled) {
        console.warn("Doars: Unable to remove contexts after being enabled!");
        return;
      }
      const results = [];
      for (const context of _contexts) {
        const index = contexts.indexOf(context);
        if (index < 0) {
          continue;
        }
        contexts.slice(index, 1);
        results.push(context);
      }
      if (results.length > 0) {
        this.dispatchEvent("contexts-removed", [this, results]);
      }
      return results;
    };
    this.getDirectives = () => [...directives];
    this.getDirectivesNames = () => [...directivesNames];
    this.getDirectivesObject = () => Object.assign({}, directivesObject);
    this.isDirectiveName = (attributeName) => directivesRegexp.test(attributeName);
    this.addDirectives = (index, ..._directives) => {
      if (isEnabled) {
        console.warn("Doars: Unable to add directives after being enabled!");
        return;
      }
      if (index < 0) {
        index = directives.length + index % directives.length;
      } else if (index > directives.length) {
        index = directives.length;
      }
      const results = [];
      for (let i = 0; i < _directives.length; i++) {
        const directive = _directives[i];
        if (directives.includes(directive)) {
          continue;
        }
        directives.splice(index + i, 0, directive);
        results.push(directive);
      }
      if (results.length > 0) {
        directivesNames = directivesObject = directivesRegexp = null;
        this.dispatchEvent("directives-added", [this, results]);
      }
      return results;
    };
    this.removeDirectives = (..._directives) => {
      if (isEnabled) {
        console.warn("Doars: Unable to remove directives after being enabled!");
        return;
      }
      const results = [];
      for (const directive of _directives) {
        const index = directives.indexOf(directive);
        if (index < 0) {
          continue;
        }
        directives.slice(index, 1);
        results.push(directive);
      }
      if (results.length > 0) {
        directivesNames = directivesObject = directivesRegexp = null;
        this.dispatchEvent("directives-removed", [this, results]);
      }
      return results;
    };
    this.update = (_triggers) => {
      if (!isEnabled) {
        return;
      }
      if (_triggers) {
        for (const trigger of _triggers) {
          const { id: id2, path } = trigger;
          if (!(id2 in triggers)) {
            triggers[id2] = [
              path
            ];
            continue;
          }
          if (!triggers[id2].includes(path)) {
            triggers[id2].push(path);
          }
        }
      }
      if (isUpdating) {
        return;
      }
      if (Object.getOwnPropertySymbols(triggers).length === 0) {
        return;
      }
      this.dispatchEvent("updating", [this]);
      isUpdating = true;
      _triggers = triggers;
      triggers = {};
      for (const component of components) {
        component.update(_triggers);
      }
      isUpdating = false;
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        console.warn("Doars: during an update another update has been triggered. Normally this should not happen unless an expression in one of the directives is modifying a state which could cause a infinite loop!");
        window.requestAnimationFrame(() => this.update());
        return;
      }
      if (mutations.length > 0) {
        handleMutation();
        return;
      }
      this.dispatchEvent("updated", [this]);
    };
    const handleMutation = (newMutations) => {
      mutations.push(...newMutations);
      if (isUpdating) {
        return;
      }
      if (mutations.length === 0) {
        return;
      }
      isUpdating = true;
      newMutations = [...mutations];
      mutations = [];
      const componentName = prefix + "-state";
      const ignoreName = prefix + "-ignore";
      const componentsToAdd = [];
      const componentsToRemove = [];
      const remove = (element2) => {
        if (element2.nodeType !== 1) {
          return;
        }
        if (element2[COMPONENT]) {
          componentsToRemove.unshift(element2[COMPONENT]);
          const componentElements = element2.querySelectorAll(componentName);
          for (const componentElement of componentElements) {
            if (componentElement[COMPONENT]) {
              componentsToRemove.unshift(componentElement);
            }
          }
        } else {
          const iterator = walk(element2, (element3) => {
            if (element3[COMPONENT]) {
              componentsToRemove.unshift(element3[COMPONENT]);
              return false;
            }
            return true;
          });
          do {
            if (!element2[ATTRIBUTES]) {
              continue;
            }
            for (const attribute of element2[ATTRIBUTES]) {
              attribute.getComponent().removeAttribute(attribute);
            }
          } while (element2 = iterator());
        }
      };
      const add = (element2) => {
        if (element2.nodeType !== 1) {
          return;
        }
        const ignoreParent = element2.closest("[" + ignoreName + "]");
        if (ignoreParent) {
          return;
        }
        const componentElements = element2.querySelectorAll("[" + componentName + "]");
        for (const componentElement of componentElements) {
          const ignoreParent2 = componentElement.closest("[" + ignoreName + "]");
          if (ignoreParent2) {
            continue;
          }
          componentsToAdd.push(componentElement);
        }
        if (element2.hasAttribute(componentName)) {
          componentsToAdd.push(element2);
          return;
        }
        const component = closestComponent(element2);
        if (component) {
          const attributes = component.scanAttributes(element2);
          component.updateAttributes(attributes);
        }
      };
      for (const mutation of newMutations) {
        if (mutation.type === "childList") {
          for (const element2 of mutation.removedNodes) {
            remove(element2);
          }
          for (const element2 of mutation.addedNodes) {
            add(element2);
          }
        } else if (mutation.type === "attributes") {
          const element2 = mutation.target;
          if (mutation.attributeName === componentName) {
            if (element2[COMPONENT]) {
              continue;
            }
            const component2 = closestComponent(element2);
            if (component2) {
              let currentElement = element2;
              const iterator = walk(element2, (element3) => element3.hasAttribute(componentName));
              do {
                for (const attribute2 of currentElement[ATTRIBUTES]) {
                  component2.removeAttribute(attribute2);
                }
              } while (currentElement = iterator());
            }
            addComponents(element2);
            continue;
          } else if (mutation.attributeName === ignoreName) {
            if (element2.hasAttribute(ignoreName)) {
              remove(element2);
              continue;
            }
            add(element2);
            continue;
          }
          if (!directivesRegexp.test(mutation.attributeName)) {
            continue;
          }
          const component = closestComponent(element2);
          if (!component) {
            continue;
          }
          let attribute = null;
          for (const targetAttribute of element2[ATTRIBUTES]) {
            if (targetAttribute.getName() === mutation.attributeName) {
              attribute = targetAttribute;
              break;
            }
          }
          const value = element2.getAttribute(mutation.attributeName);
          if (!attribute) {
            if (value) {
              component.addAttribute(element2, mutation.attributeName, value);
            }
            continue;
          }
          attribute.setValue(value);
          component.updateAttribute(attribute);
        }
      }
      if (componentsToRemove.length > 0) {
        removeComponents(...componentsToRemove);
      }
      if (componentsToAdd.length > 0) {
        addComponents(...componentsToAdd);
      }
      isUpdating = false;
      if (mutations.length > 0) {
        handleMutation();
        return;
      }
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        this.update();
      }
    };
  }
};

// ../packages/doars/src/utilities/Execute.js
var execute = (component, attribute, expression, extra = null, options = null) => {
  options = Object.assign({
    return: true
  }, options);
  const triggers = [];
  const update = (id, context) => {
    triggers.push({
      id,
      path: context
    });
  };
  let { after, before, contexts, destroy: destroy3 } = createContexts(component, attribute, update, extra);
  if (options.return) {
    before += "return ";
  }
  let result;
  try {
    result = new Function(...Object.keys(contexts), before + expression + after)(...Object.values(contexts));
  } catch (error) {
    console.error("ExpressionError in:", expression, "\n" + error.name + ": " + error.message);
    result = null;
  }
  destroy3();
  if (triggers.length > 0) {
    component.getLibrary().update(triggers);
  }
  return result;
};

// ../packages/doars/src/DoarsExecute.js
Doars.executeExpression = execute;
var DoarsExecute_default = Doars;

// src/scripts/index.js
var setup = function() {
  new DoarsExecute_default().enable();
};
if (document.readyState === "complete" || document.readyState === "interactive") {
  setup();
} else {
  document.addEventListener("DOMContentLoaded", setup, { once: true, passive: true });
}
window.copyToClipboard = (text) => {
  const element2 = document.createElement("textarea");
  element2.value = text;
  document.body.append(element2);
  element2.select();
  element2.setSelectionRange(0, 999999);
  document.execCommand("copy");
  element2.remove();
};
var count = 0;
var element = document.getElementById("counter-text");
window.increment = () => {
  count++;
  element.setAttribute("d-text", count);
};
//# sourceMappingURL=index.js.map
