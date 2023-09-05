(() => {
  // src/symbols.js
  var ATTRIBUTES = Symbol("ATTRIBUTES");
  var COMPONENT = Symbol("COMPONENT");
  var FOR = Symbol("FOR");
  var INITIALIZED = Symbol("INITIALIZED");
  var ON = Symbol("ON");
  var REFERENCES = Symbol("REFERENCES");
  var REFERENCES_CACHE = Symbol("REFERENCES_CACHE");
  var SYNC = Symbol("SYNC");

  // ../common/src/events/EventDispatcher.js
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

  // ../common/src/utilities/String.js
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

  // src/Attribute.js
  var Attribute = class _Attribute extends EventDispatcher_default {
    /**
     * Create instance.
     * @param {Component} component Component instance.
     * @param {HTMLElement} element Element.
     * @param {String} name Attribute name (with library prefix removed).
     * @param {String} value Attribute value.
     * @param {Boolean} isClone Whether this will be a clone of an existing attribute.
     */
    constructor(component, element, name, value, isClone = false) {
      super();
      const id = Symbol("ID_ATTRIBUTE");
      if (!isClone) {
        if (!element[ATTRIBUTES]) {
          element[ATTRIBUTES] = [];
        }
        element[ATTRIBUTES].push(this);
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
        return element;
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
        const indexInElement = element[ATTRIBUTES].indexOf(this);
        if (indexInElement >= 0) {
          element[ATTRIBUTES].splice(indexInElement, 1);
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
        return new _Attribute(component, element, name, value, true);
      };
    }
  };

  // ../common/src/polyfills/RevocableProxy.js
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

  // ../common/src/events/ProxyDispatcher.js
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

  // src/utilities/Component.js
  var closestComponent = (element) => {
    if (element.parentElement) {
      element = element.parentElement;
      if (element[COMPONENT]) {
        return element[COMPONENT];
      }
      return closestComponent(element);
    }
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
  var setAttribute = (element, key, data) => {
    if (key === "value" && element.tagName === "INPUT") {
      if (!data) {
        data = "";
      }
      if (element.getAttribute(key) === data) {
        return;
      }
      element.setAttribute(key, data);
      return;
    }
    if (key === "checked") {
      if (element.type === "checkbox" || element.type === "radio") {
        element.checked = !!data;
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
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, data);
    }
  };
  var setAttributes = (element, data) => {
    for (const name in data) {
      setAttribute(element, name, data[name]);
    }
  };

  // ../common/src/utilities/Transition.js
  var TRANSITION_NAME = "-transition:";
  var transition = (type, component, element, callback = null) => {
    if (element.nodeType !== 1) {
      if (callback) {
        callback();
      }
      return;
    }
    const { prefix } = component.getLibrary().getOptions();
    const transitionName = prefix + TRANSITION_NAME + type;
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
    name = transitionName;
    value = element.getAttribute(name);
    if (value) {
      selectors.during = parseSelector(value);
      addAttributes(element, selectors.during);
    }
    name = transitionName + ".from";
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
      name = transitionName + ".to";
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
  var transitionIn = (component, element, callback) => {
    return transition("in", component, element, callback);
  };
  var transitionOut = (component, element, callback) => {
    return transition("out", component, element, callback);
  };

  // ../common/src/utilities/Element.js
  var insertAfter = (reference, node) => {
    if (reference.nextSibling) {
      reference.parentNode.insertBefore(node, reference.nextSibling);
    } else {
      reference.parentNode.appendChild(node);
    }
  };
  var walk = (element, filter) => {
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
        if (index >= element.childElementCount) {
          return null;
        }
        child = element.children[index];
      } while (!filter(child));
      if (child.childElementCount) {
        iterator = walk(child, filter);
      }
      return child;
    };
  };

  // src/Component.js
  var Component = class {
    /**
     * Create instance.
     * @param {Doars} library Library instance.
     * @param {HTMLElement} element Element.
     */
    constructor(library, element) {
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
      if (!element.attributes[prefix + "-state"]) {
        console.error("Doars: element given to component does not contain a state attribute!");
        return;
      }
      element[COMPONENT] = this;
      const children = [];
      let parent = closestComponent(element);
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
        return element;
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
        const value = element.attributes[componentName].value;
        data = value ? processExpression(this, new Attribute(this, element, null, value), value) : {};
        if (data === null) {
          data = {};
        } else if (typeof data !== "object" || Array.isArray(data)) {
          console.error("Doars: component tag must return an object!");
          return;
        }
        proxy = new ProxyDispatcher_default();
        state = proxy.add(data);
        this.scanAttributes(element);
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
        delete element[COMPONENT];
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
          element,
          id
        });
      };
      this.addAttribute = (element2, name, value) => {
        const directivesKeys = library.getDirectivesNames();
        const attribute = new Attribute(this, element2, name, value);
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
      this.scanAttributes = (element2) => {
        const componentName = prefix + "-state";
        const ignoreName = prefix + "-ignore";
        const newAttributes = [];
        const iterator = walk(element2, (element3) => !element3.hasAttribute(componentName) && !element3.hasAttribute(ignoreName));
        do {
          for (const { name, value } of element2.attributes) {
            if (library.isDirectiveName(name)) {
              newAttributes.push(this.addAttribute(element2, name, value));
            }
          }
        } while (element2 = iterator());
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
              element,
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
          element,
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
            element,
            id
          });
        }
      };
      const dispatchEvent = (name, detail) => {
        element.dispatchEvent(
          new CustomEvent(prefix + "-" + name, {
            detail,
            bubbles: true
          })
        );
      };
    }
  };

  // src/contexts/children.js
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

  // src/contexts/component.js
  var component_default = {
    name: "$component",
    create: (component) => {
      return {
        value: component.getElement()
      };
    }
  };

  // src/contexts/element.js
  var element_default = {
    name: "$element",
    create: (component, attribute) => {
      return {
        value: attribute.getElement()
      };
    }
  };

  // src/contexts/dispatch.js
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

  // src/contexts/for.js
  var for_default = {
    deconstruct: true,
    name: "$for",
    create: (component, attribute, update, { RevocableProxy }) => {
      if (component !== attribute.getComponent()) {
        return;
      }
      let element = attribute.getElement();
      const componentElement = component.getElement(), items = [], target = {};
      while (element && !element.isSameNode(componentElement)) {
        const data = element[FOR];
        if (data) {
          items.push(data);
          for (const key in data.variables) {
            target[key] = data.variables[key];
          }
        }
        element = element.parentNode;
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

  // src/contexts/inContext.js
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

  // src/contexts/nextTick.js
  var nextTick_default = {
    name: "$nextTick",
    create: (component, attribute, update, { createContexts: createContexts2 }) => {
      let callbacks;
      let isSetup = false;
      const setup = () => {
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
          setup();
          callbacks.push(callback);
        }
      };
    }
  };

  // src/contexts/parent.js
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

  // src/contexts/references.js
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
          const { element, name } = references[id];
          cache[name] = element;
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

  // src/contexts/state.js
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

  // ../common/src/utilities/Promise.js
  var nativePromise = Function.prototype.toString.call(
    Function
    /* A native object */
  ).replace("Function", "Promise").replace(/\(.*\)/, "()");
  var isPromise = (value) => {
    return value && Object.prototype.toString.call(value) === "[object Promise]";
  };

  // src/directives/attribute.js
  var attribute_default = {
    name: "attribute",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const modifiers = attribute.getModifiers();
      const set = (value) => {
        if (modifiers.selector) {
          if (typeof value !== "string") {
            console.error("Doars: Value returned to attribute directive must be a string if the selector modifier is set.");
            return;
          }
          value = parseSelector(value);
          setAttributes(element, value);
          return;
        }
        const key = attribute.getKeyRaw();
        if (!key) {
          if (typeof value === "object" && !Array.isArray(value)) {
            setAttributes(element, value);
          } else {
            console.error("Doars: Value returned to attribute directive of invalid type.");
          }
          return;
        }
        setAttribute(element, key, value);
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

  // src/directives/cloak.js
  var cloak_default = {
    name: "cloak",
    update: function(component, attribute, { transitionIn: transitionIn2 }) {
      const element = attribute.getElement();
      element.removeAttribute(
        component.getLibrary().getOptions().prefix + "-" + this.name
      );
      transitionIn2(component, element);
    }
  };

  // src/directives/for.js
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
      const element2 = elements[existingIndex];
      insertAfter(elements[index] ? elements[index] : template, element2);
      update(element2[FOR].id);
      return;
    }
    let element = document.importNode(template.content, true);
    const sibling = index === -1 ? template : elements[index];
    insertAfter(sibling, element);
    element = sibling.nextElementSibling;
    transitionIn(component, element);
    element[FOR] = {
      id: Symbol("ID_FOR"),
      value,
      variables
    };
    elements.splice(index + 1, 0, element);
  };
  var removeAfter = (component, elements, maxLength) => {
    if (elements.length < maxLength) {
      return;
    }
    for (let i = elements.length - 1; i >= maxLength; i--) {
      const element = elements[i];
      elements.splice(i, 1);
      transitionOut(component, element, () => {
        element.remove();
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
        for (const element of data.elements) {
          transitionOut(component, element, () => {
            element.remove();
          });
        }
      }
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

  // src/directives/html.js
  var html_default = {
    name: "html",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const modifiers = attribute.getModifiers();
      const set = (html) => {
        if (modifiers.decode && typeof html === "string") {
          html = decode(html);
        }
        if (html instanceof HTMLElement) {
          for (const child of element.children) {
            child.remove();
          }
          element.appendChild(html.cloneNode(true));
          return;
        }
        if (typeof html === "string") {
          if (element.innerHTML !== html) {
            element.innerHTML = html;
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

  // src/directives/if.js
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
        let element = data2.element;
        let transition2 = data2.transition;
        if (!result2) {
          if (element) {
            if (transition2) {
              transition2();
            }
            transition2 = transitionOut2(component, element, () => {
              element.remove();
            });
          }
        } else if (!element) {
          if (transition2) {
            transition2();
          }
          element = document.importNode(template.content, true);
          insertAfter(template, element);
          element = template.nextElementSibling;
          transition2 = transitionIn2(component, element);
        }
        attribute.setData(
          Object.assign({}, data2, {
            element,
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

  // src/directives/initialized.js
  var destroy = (component, attribute) => {
    if (!attribute[INITIALIZED]) {
      return;
    }
    const element = component.getElement();
    const name = component.getLibrary().getOptions().prefix + "-updated";
    element.removeEventListener(name, attribute[INITIALIZED].handler);
    delete attribute[INITIALIZED];
  };
  var initialized_default = {
    name: "initialized",
    update: (component, attribute, { processExpression }) => {
      const element = component.getElement();
      const value = attribute.getValue();
      const name = component.getLibrary().getOptions().prefix + "-updated";
      if (attribute[INITIALIZED]) {
        if (attribute[INITIALIZED].value === value) {
          return;
        }
        element.removeEventListener(name, attribute[INITIALIZED].handler);
        delete attribute[INITIALIZED];
      }
      const handler = ({ detail }) => {
        if (detail.element !== element) {
          return;
        }
        processExpression(component, attribute.clone(), value, {}, {
          return: false
        });
        destroy(component, attribute);
      };
      element.addEventListener(name, handler, {
        once: true
      });
      attribute[INITIALIZED] = {
        handler,
        value
      };
    },
    destroy
  };

  // src/directives/on.js
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
      const element = attribute.getElement();
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
      let target = element;
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
        if (modifiers.self && event.target !== element) {
          return;
        }
        if (modifiers.outside && element.contains(event.target)) {
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
        const execute = () => {
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
            execute();
            return;
          case EXECUTION_MODIFIERS.DEBOUNCE:
            if (attribute[ON].timeout) {
              clearTimeout(attribute[ON].timeout);
              attribute[ON].timeout = null;
            }
            attribute[ON].timeout = setTimeout(execute, modifiers.debounce);
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
              if (modifiers.self && cancelEvent.target !== element) {
                attribute[ON].prevent = false;
                return;
              }
              if (modifiers.outside && element.contains(cancelEvent.target)) {
                attribute[ON].prevent = false;
                return;
              }
              execute();
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
              if (modifiers.self && cancelEvent.target !== element) {
                attribute[ON].prevent = false;
                return;
              }
              if (modifiers.outside && element.contains(cancelEvent.target)) {
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
              execute();
            }, modifiers.hold);
            return;
          case EXECUTION_MODIFIERS.THROTTLE:
            const nowThrottle = window.performance.now();
            if (attribute[ON].lastExecution && nowThrottle - attribute[ON].lastExecution < modifiers.throttle) {
              return;
            }
            execute();
            attribute[ON].lastExecution = nowThrottle;
            return;
        }
        execute();
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

  // src/directives/reference.js
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
      const element = attribute.getElement();
      const attributeId = attribute.getId();
      if (!component[REFERENCES]) {
        component[REFERENCES] = {};
      }
      component[REFERENCES][attributeId] = {
        element,
        name: value
      };
      delete component[REFERENCES_CACHE];
      library.update([{ id: componentId, path: "$references." + value }]);
    },
    destroy: destroy2
  };

  // src/directives/select.js
  var TAG_SELECT = "SELECT";
  var CHECKED = "checked";
  var SELECTED = "selected";
  var TYPE_CHECKBOX = "checkbox";
  var select_default = {
    name: "select",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const type = element.getAttribute("type");
      if (element.tagName !== TAG_SELECT && !(element.tagName === "INPUT" && (type === TYPE_CHECKBOX || type === "radio"))) {
        console.warn("Doars: `select` directive must be placed on a `select` tag or `input` of type checkbox or radio.");
        return;
      }
      const set = (data) => {
        if (element.tagName === TAG_SELECT) {
          for (const option of Array.from(element.options)) {
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
          const checked = data.includes(element.value);
          if (element.checked !== checked) {
            if (checked) {
              element.setAttribute(CHECKED, "");
            } else {
              element.removeAttribute(CHECKED);
            }
          }
        } else {
          const checked = data === element.value;
          if (element.checked !== checked) {
            if (checked) {
              element.setAttribute(CHECKED, "");
            } else {
              element.removeAttribute(CHECKED);
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

  // src/directives/show.js
  var show_default = {
    name: "show",
    update: (component, attribute, { processExpression, transitionIn: transitionIn2, transitionOut: transitionOut2 }) => {
      const element = attribute.getElement();
      const set = () => {
        const data2 = attribute.getData();
        if (data2.transition) {
          data2.transition();
        }
        let transition2;
        if (data2.result) {
          element.style.display = null;
          transition2 = transitionIn2(component, element);
        } else {
          transition2 = transitionOut2(component, element, () => {
            element.style.display = "none";
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

  // src/utilities/Context.js
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

  // ../common/src/utilities/Object.js
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

  // src/directives/sync.js
  var sync_default = {
    name: "sync",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const isNew = !attribute[SYNC];
      if (isNew) {
        if (!(element.tagName === "DIV" && element.hasAttribute("contenteditable")) && element.tagName !== "INPUT" && element.tagName !== "SELECT" && element.tagName !== "TEXTAREA") {
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
        switch (element.tagName) {
          case "DIV":
            handler = () => {
              const [contexts, destroyContexts] = createAutoContexts(component, attribute.clone());
              setDeeply(contexts, value, escapeHtml(element.innerText));
              destroyContexts();
            };
            break;
          case "INPUT":
            handler = () => {
              const attributeClone = attribute.clone();
              const elementValue = escapeHtml(element.value);
              const [contexts, destroyContexts] = createAutoContexts(component, attributeClone);
              if (element.type === "checkbox") {
                const dataValue2 = getDeeply(contexts, value);
                if (element.checked) {
                  if (!dataValue2) {
                    setDeeply(contexts, value, [elementValue]);
                  }
                  if (!dataValue2.includes(element.value)) {
                    dataValue2.push(elementValue);
                  }
                } else if (dataValue2) {
                  const index = dataValue2.indexOf(element.value);
                  if (index >= 0) {
                    dataValue2.splice(index, 1);
                  }
                }
              } else if (element.type === "radio") {
                const dataValue2 = getDeeply(contexts, value);
                if (element.checked) {
                  if (dataValue2 !== element.value) {
                    setDeeply(contexts, value, elementValue);
                  }
                } else if (dataValue2 === element.value) {
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
              setDeeply(contexts, value, escapeHtml(element.innerText));
              destroyContexts();
            };
            break;
          case "SELECT":
            handler = () => {
              const [contexts, destroyContexts] = createAutoContexts(component, attribute.clone());
              if (element.multiple) {
                const elementValues = [];
                for (const option of element.selectedOptions) {
                  elementValues.push(
                    escapeHtml(option.value)
                  );
                }
                setDeeply(contexts, value, [elementValues.join("','")]);
              } else {
                setDeeply(contexts, value, escapeHtml(element.selectedOptions[0].value));
              }
              destroyContexts();
            };
            break;
        }
        element.addEventListener("input", handler);
        attribute[SYNC] = handler;
      }
      const dataValue = processExpression(component, attribute, value);
      switch (element.tagName) {
        case "DIV":
        case "TEXTAREA":
          if (dataValue !== element.innerText) {
            element.innerText = dataValue;
          }
          break;
        case "INPUT":
          if (element.type === "checkbox") {
            const checked = dataValue.includes(element.value);
            if (element.checked !== checked) {
              element.checked = checked;
              if (checked) {
                element.setAttribute("checked", "");
              } else {
                element.removeAttribute("checked");
              }
            }
          } else if (element.type === "radio") {
            const checked = dataValue === element.value;
            if (element.checked !== checked) {
              element.checked = checked;
              if (checked) {
                element.setAttribute("checked", "");
              } else {
                element.removeAttribute("checked");
              }
            }
          } else {
            if (dataValue !== element.value) {
              element.setAttribute("value", dataValue);
            }
          }
          break;
        case "SELECT":
          for (const option of Array.from(element.options)) {
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
      const element = attribute.getElement();
      element.removeEventListener("input", attribute[SYNC]);
      delete attribute[SYNC];
    }
  };

  // src/directives/text.js
  var text_default = {
    name: "text",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      const modifiers = attribute.getModifiers();
      const set = (text) => {
        if (modifiers.content) {
          if (element.textContent !== text) {
            element.textContent = text;
          }
        } else if (element.innerText !== text) {
          element.innerText = text;
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

  // src/directives/watch.js
  var watch_default = {
    name: "watch",
    update: (component, attribute, { processExpression }) => {
      const value = attribute.getValue();
      processExpression(component, attribute, value, {}, {
        return: false
      });
    }
  };

  // src/Doars.js
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
        for (const element of elements) {
          if (!element) {
            continue;
          }
          if (element[COMPONENT]) {
            continue;
          }
          const component = new Component(this, element);
          components.push(component);
          results.push(component);
          resultElements.push(element);
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
      this.setSimpleContexts = (contexts2) => {
        const result = {};
        for (const name in contexts2) {
          if (Object.hasOwnProperty.call(contexts2, name)) {
            result[name] = this.setSimpleContext(name, contexts2[name]);
          }
        }
        return result;
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
        const remove = (element) => {
          if (element.nodeType !== 1) {
            return;
          }
          if (element[COMPONENT]) {
            componentsToRemove.unshift(element[COMPONENT]);
            const componentElements = element.querySelectorAll(componentName);
            for (const componentElement of componentElements) {
              if (componentElement[COMPONENT]) {
                componentsToRemove.unshift(componentElement);
              }
            }
          } else {
            const iterator = walk(element, (element2) => {
              if (element2[COMPONENT]) {
                componentsToRemove.unshift(element2[COMPONENT]);
                return false;
              }
              return true;
            });
            do {
              if (!element[ATTRIBUTES]) {
                continue;
              }
              for (const attribute of element[ATTRIBUTES]) {
                attribute.getComponent().removeAttribute(attribute);
              }
            } while (element = iterator());
          }
        };
        const add = (element) => {
          if (element.nodeType !== 1) {
            return;
          }
          const ignoreParent = element.closest("[" + ignoreName + "]");
          if (ignoreParent) {
            return;
          }
          const componentElements = element.querySelectorAll("[" + componentName + "]");
          for (const componentElement of componentElements) {
            const ignoreParent2 = componentElement.closest("[" + ignoreName + "]");
            if (ignoreParent2) {
              continue;
            }
            componentsToAdd.push(componentElement);
          }
          if (element.hasAttribute(componentName)) {
            componentsToAdd.push(element);
            return;
          }
          const component = closestComponent(element);
          if (component) {
            const attributes = component.scanAttributes(element);
            component.updateAttributes(attributes);
          }
        };
        for (const mutation of newMutations) {
          if (mutation.type === "childList") {
            for (const element of mutation.removedNodes) {
              remove(element);
            }
            for (const element of mutation.addedNodes) {
              add(element);
            }
          } else if (mutation.type === "attributes") {
            const element = mutation.target;
            if (mutation.attributeName === componentName) {
              if (element[COMPONENT]) {
                continue;
              }
              const component2 = closestComponent(element);
              if (component2) {
                let currentElement = element;
                const iterator = walk(element, (element2) => element2.hasAttribute(componentName));
                do {
                  for (const attribute2 of currentElement[ATTRIBUTES]) {
                    component2.removeAttribute(attribute2);
                  }
                } while (currentElement = iterator());
              }
              addComponents(element);
              continue;
            } else if (mutation.attributeName === ignoreName) {
              if (element.hasAttribute(ignoreName)) {
                remove(element);
                continue;
              }
              add(element);
              continue;
            }
            if (!directivesRegexp.test(mutation.attributeName)) {
              continue;
            }
            const component = closestComponent(element);
            if (!component) {
              continue;
            }
            let attribute = null;
            for (const targetAttribute of element[ATTRIBUTES]) {
              if (targetAttribute.getName() === mutation.attributeName) {
                attribute = targetAttribute;
                break;
              }
            }
            const value = element.getAttribute(mutation.attributeName);
            if (!attribute) {
              if (value) {
                component.addAttribute(element, mutation.attributeName, value);
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

  // src/utilities/Call.js
  var PATH_VALIDATOR = new RegExp("^[a-z$_]+[0-9a-z$_]*(?:\\.[a-z$_]+[0-9a-z$_]*)*$", "is");
  var call = (component, attribute, expression, extra = null, options = null) => {
    const [contexts, destroyContexts] = createAutoContexts(component, attribute, extra);
    expression = expression.trim();
    let result;
    if (!PATH_VALIDATOR.test(expression)) {
      console.error("Error encountered when executing an expression. Expression is not a valid dot separated path: ", expression);
      result = null;
    } else {
      result = getDeeply(contexts, expression.split("."));
      if (typeof result === "function") {
        try {
          result = result(contexts);
        } catch (error) {
          console.error("ExpressionError in:", expression, "\n" + error.name + ": " + error.message);
          result = null;
        }
      }
    }
    destroyContexts();
    return result;
  };

  // src/DoarsCall.js
  Doars.callExpression = call;
  var DoarsCall_default = Doars;

  // src/DoarsCall.iife.js
  window.Doars = DoarsCall_default;
})();
//# sourceMappingURL=doars-call.iife.js.map
