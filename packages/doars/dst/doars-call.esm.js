// ../common/src/events/EventDispatcher.js
class EventDispatcher {
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
      let index2 = -1;
      for (let i = 0;i < eventData.length; i++) {
        if (eventData[i].callback === callback) {
          index2 = i;
          break;
        }
      }
      if (index2 < 0) {
        return;
      }
      eventData.splice(index2, 1);
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
      for (let i = 0;i < eventData.length; i++) {
        const event = options?.reverse ? eventData[eventData.length - (i + 1)] : eventData[i];
        if (event.options?.once) {
          eventData.splice(i, 1);
        }
        event.callback(...parameters);
      }
    };
  }
}

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
var walk = (node, filter) => {
  let index2 = -1;
  let iterator = null;
  return () => {
    if (index2 >= 0 && iterator) {
      const child2 = iterator();
      if (child2) {
        return child2;
      }
    }
    let child = null;
    do {
      index2++;
      if (index2 >= node.childElementCount) {
        return null;
      }
      child = node.children[index2];
    } while (!filter(child));
    if (child.childElementCount) {
      iterator = walk(child, filter);
    }
    return child;
  };
};

// ../common/src/utilities/Identifier.js
var CHARACTER_SET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
var createIdFactory = (characterSet = CHARACTER_SET) => {
  const characterDepth = characterSet.length;
  let index2 = 0;
  return () => {
    let identifierIndex = index2;
    index2++;
    let identifier = "";
    do {
      identifier = characterSet[identifierIndex % characterDepth] + identifier;
      identifierIndex = Math.floor(identifierIndex / characterDepth);
    } while (identifierIndex > 0);
    return identifier;
  };
};

// ../common/src/polyfills/RevocableProxy.js
var PROXY_TRAPS = [
  "apply",
  "construct",
  "defineProperty",
  "deleteProperty",
  "get",
  "getOwnPropertyDescriptor",
  "getPrototypeOf",
  "has",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "set",
  "setPrototypeOf"
];
var RevocableProxy_default = (target, handler, options = {}) => {
  options = Object.assign({
    irrevocable: []
  }, options);
  let revoked = false;
  const revocableHandler = {};
  for (const key of PROXY_TRAPS) {
    revocableHandler[key] = (...parameters) => {
      const [localTarget, ...localParameters] = parameters;
      if (revoked) {
        for (const key2 of Object.keys(localTarget)) {
          if (!options.irrevocable || !options.irrevocable.includes(key2)) {
            localTarget[key2] = undefined;
          }
        }
      }
      if (key in handler) {
        const trap = handler[key];
        if (typeof trap === "function") {
          return trap(localTarget, ...localParameters);
        }
      }
      return Reflect[key](localTarget, ...localParameters);
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
class ProxyDispatcher extends EventDispatcher {
  constructor(options = {}) {
    super();
    options = Object.assign({
      delete: true,
      get: true,
      set: true
    }, options);
    const map = new WeakMap;
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
            this.dispatchEvent("delete", [
              target2,
              Array.isArray(target2) ? [...path] : [...path, key]
            ]);
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
          this.dispatchEvent("set", [
            target2,
            Array.isArray(target2) ? [...path] : [...path, key],
            value,
            receiver
          ]);
          return true;
        };
      }
      const revocable = RevocableProxy_default(target, handler);
      map.set(target, revocable);
      return revocable.proxy;
    };
    this.remove = (target) => {
      if (!map.has(target)) {
        return;
      }
      const revocable = map.get(target);
      map.delete(target);
      for (const property in revocable.proxy) {
        if (typeof revocable.proxy[property] === "object") {
          this.remove(revocable.proxy[property]);
        }
      }
      revocable.revoke();
    };
  }
}

// ../common/src/utilities/String.js
var escapeHtml = (text) => {
  return text.replace(/\\/g, "\\\\").replace(/\\'/g, "\\'").replace(/\\"/g, "\\\"").replace(/\n/g, "\\n");
};
var kebabToCamel = (text) => {
  return text.replace(/-(\w)/g, (_match, character) => character.toUpperCase());
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
    tmpValue = Number.parseInt(tmpValue, 10);
    if (!Number.isNaN(tmpValue)) {
      value = tmpValue;
      switch (type) {
        case "h":
          value *= 60;
        case "m":
          value *= 60;
        case "s":
          value *= 1000;
          break;
      }
    }
    result[key] = value;
  }
  return result;
};
var parseAttributeName = (prefix, name) => {
  name = name.match(new RegExp(`^${prefix}-([a-z][0-9a-z-]{1,}):?([a-z][0-9a-z-]*)?(\\..*]*)?$`, "i"));
  if (!name) {
    return;
  }
  let [_full, directive, keyRaw, modifiers] = name;
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
      case "[": {
        const [_full, key, value] = selectorSegment.match(/^(?:\[)?([-$_.a-z0-9]{1,})(?:[$*^])?(?:=)?([\s\S]{0,})(?:\])$/i);
        attributes[key] = value;
        break;
      }
    }
  }
  return attributes;
};

// src/symbols.js
var ATTRIBUTES = Symbol("ATTRIBUTES");

// src/Attribute.js
class Attribute extends EventDispatcher {
  constructor(library, component, element, name, value) {
    super();
    const id = library.generateId();
    if (!element[ATTRIBUTES]) {
      element[ATTRIBUTES] = [];
    }
    element[ATTRIBUTES].push(this);
    let data, directive, directiveName, key, keyRaw, modifiers, processExpression = library.getProcessor();
    if (name) {
      const [_directive, _keyRaw, _key, _modifiers] = parseAttributeName(component.getLibrary().getOptions().prefix, name);
      directiveName = _directive;
      key = _key;
      keyRaw = _keyRaw;
      directive = library.getDirectiveByName(directiveName);
      if (_modifiers) {
        modifiers = Object.freeze(parseAttributeModifiers(_modifiers));
      }
    }
    this.getComponent = () => {
      return component;
    };
    this.getData = () => {
      return data;
    };
    this.setData = (_data) => {
      data = _data;
    };
    this.getDirective = () => {
      return directiveName;
    };
    this.getElement = () => {
      return element;
    };
    this.getId = () => {
      return id;
    };
    this.getKey = () => {
      return key;
    };
    this.getKeyRaw = () => {
      return keyRaw;
    };
    this.getLibrary = () => {
      return library;
    };
    this.getModifiers = () => {
      return modifiers;
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
    this.destroy = () => {
      if (directive?.destroy) {
        directive.destroy(component, this, processExpression);
      }
      this.setData(null);
      const indexInElement = element[ATTRIBUTES].indexOf(this);
      if (indexInElement >= 0) {
        element[ATTRIBUTES].splice(indexInElement, 1);
      }
      this.dispatchEvent("destroyed", [this]);
      this.removeAllEventListeners();
    };
    this.update = () => {
      if (!this.getElement() || this.getValue() === null || this.getValue() === undefined) {
        component.removeAttribute(this);
      } else if (directive) {
        directive.update(component, this, processExpression);
      }
    };
  }
}

// src/Component.js
var Component_default = (library, element) => {
  const id = library.generateId();
  const {
    prefix,
    childrenContextName,
    ignoreDirectiveName,
    parentContextName,
    stateDirectiveName
  } = library.getOptions();
  const processExpression = library.getProcessor();
  const attributes = [], data = {}, componentName = `${prefix}-${stateDirectiveName}`, ignoreName = `${prefix}-${ignoreDirectiveName}`;
  let isInitialized = false, initialState, proxy, state;
  if (!element.attributes[`${prefix}-${stateDirectiveName}`]) {
    console.error("Doars: element given to component does not contain a state attribute!");
    return;
  }
  const component = {
    getAttributes: () => {
      return attributes;
    },
    getChildren: () => {
      return children;
    },
    getData: (key) => {
      return data[key];
    },
    setData: (key, _data) => {
      data[key] = _data;
    },
    getElement: () => {
      return element;
    },
    getId: () => {
      return id;
    },
    getLibrary: () => {
      return library;
    },
    getParent: () => {
      return parent;
    },
    getProxy: () => {
      return proxy;
    },
    getState: () => {
      return state;
    },
    setParent: (_parent) => {
      parent = _parent;
    },
    initialize: () => {
      if (isInitialized) {
        return;
      }
      isInitialized = true;
      const value = element.attributes[componentName].value;
      initialState = value ? processExpression(component, new Attribute(library, component, element, null, value), value, {
        accessed: false
      }) : {};
      if (initialState === null || initialState === undefined) {
        initialState = {};
      } else if (typeof initialState !== "object" || Array.isArray(initialState)) {
        console.error("Doars: component tag must return an object!", initialState);
        return;
      }
      proxy = new ProxyDispatcher;
      state = proxy.add(initialState);
      component.scanAttributes(element);
    },
    destroy: () => {
      if (!isInitialized) {
        return;
      }
      if (attributes.length > 0) {
        const directives = Object.assign({}, library.getDirectivesObject());
        for (const key in directives) {
          if (!directives[key].destroy) {
            directives[key] = undefined;
          }
        }
        for (const attribute of attributes) {
          const directive = directives[attribute.getKey()];
          if (directive) {
            directive.destroy(component, attribute, processExpression);
          }
          attribute.destroy();
        }
      }
      attributes.splice(0, attributes.length);
      if (children.length > 0) {
        for (const child of children) {
          child.setParent(parent);
          library.update(`${child.getId()}:${parentContextName}`);
        }
        library.update(`${id}:${childrenContextName}}`);
      }
      if (parent) {
        if (children.length > 0) {
          parent.getChildren().push(...children);
          library.update(`${parent.getId()}:${childrenContextName}`);
        }
        library.update(`${id}:${parentContextName}`);
      }
      isInitialized = false;
      proxy.remove(initialState);
      state = null;
      proxy = null;
      initialState = null;
    },
    addAttribute: (element2, name, value) => {
      const attribute = new Attribute(library, component, element2, name, value);
      attributes.push(attribute);
      return attribute;
    },
    removeAttribute: (attribute) => {
      const indexInAttributes = attributes.indexOf(attribute);
      if (indexInAttributes < 0) {
        return;
      }
      attributes.splice(indexInAttributes, 1);
      attribute.destroy();
    },
    scanAttributes: (element2) => {
      const attributesLength = attributes.length;
      const iterator = walk(element2, (element3) => !element3.hasAttribute(componentName) && !element3.hasAttribute(ignoreName));
      do {
        for (const { name, value } of element2.attributes) {
          if (library.isDirectiveName(name)) {
            component.addAttribute(element2, name, value);
          }
        }
      } while (element2 = iterator());
      return attributes.slice(attributesLength);
    },
    updateAttributes: (attributes2) => {
      if (!isInitialized) {
        return;
      }
      if (attributes2.length > 0) {
        for (const attribute of attributes2) {
          attribute.update();
        }
      }
    },
    updateAllAttributes: () => {
      if (!isInitialized) {
        return;
      }
      for (const attribute of attributes) {
        attribute.update();
      }
    }
  };
  const children = [];
  let parent = library.closestComponent(element);
  if (parent) {
    if (!parent.getChildren().includes(component)) {
      parent.getChildren().push(component);
      library.update(`${parent.getId()}:${childrenContextName}}`);
    }
  }
  return component;
};

// src/utilities/Context.js
var PROXY_TRAPS2 = ["get", "getOwnPropertyDescriptor", "getPrototypeOf"];
var createContexts = (component, attribute, extra = null, options = null) => {
  const addGlobal = !options || !options.global;
  const logAccess = !options || options.accessed;
  const library = component.getLibrary();
  const creatableContexts = library.getContextsByName();
  const hasExtra = extra && typeof extra === "object";
  const irrevocable = [];
  const createableContextNames = [];
  const contextsKeysCache = [];
  for (const contextName in creatableContexts) {
    const creatableContext = creatableContexts[contextName];
    if (!addGlobal && creatableContext.global) {
      continue;
    }
    createableContextNames.push(contextName);
    contextsKeysCache.push(contextName);
    if (creatableContext.revocable === false) {
      irrevocable.push(contextName);
    }
  }
  const contexts = library.getSimpleContexts();
  for (const key of Object.keys(contexts)) {
    if (!contextsKeysCache.includes(key)) {
      contextsKeysCache.push(key);
    }
  }
  if (hasExtra) {
    for (const key of Object.keys(extra)) {
      if (!contextsKeysCache.includes(key)) {
        contextsKeysCache.push(key);
      }
    }
  }
  const destroyCallbacks = [];
  const addContext = (target, creatableContext) => {
    if (!addGlobal && creatableContext.global) {
      return;
    }
    const result = creatableContext.create(component, attribute, options);
    if (result) {
      if (result.destroy && typeof result.destroy === "function") {
        destroyCallbacks.push(result.destroy);
      }
      if (result.value) {
        target[creatableContext.name] = result.value;
        return result.value;
      }
    }
  };
  let addedDeconstructed = false;
  const addDeconstruted = (target) => {
    addedDeconstructed = true;
    for (const contextName in creatableContexts) {
      const creatableContext = creatableContexts[contextName];
      if (creatableContext.deconstruct) {
        const resultValue = addContext(target, creatableContext);
        if (resultValue) {
          for (const key in resultValue) {
            if (!contextsKeysCache.includes(key)) {
              contextsKeysCache.push(key);
            }
            target[key] = resultValue[key];
          }
        }
      }
    }
  };
  const reflect = (functionName, ...parameters) => {
    const [target, key, ...otherParameters] = parameters;
    if (Object.hasOwn(contexts, key)) {
      if (logAccess) {
        library.accessed(attribute, `${component.getId()}:${key}`);
      }
      return Reflect[functionName](target, key, ...otherParameters);
    }
    if (hasExtra && Object.hasOwn(extra, key)) {
      if (logAccess) {
        library.accessed(attribute, `${component.getId()}:${key}`);
      }
      return Reflect[functionName](extra, key, ...otherParameters);
    }
    if (!addedDeconstructed) {
      addDeconstruted(target);
      if (Object.hasOwn(contexts, key)) {
        if (logAccess) {
          library.accessed(attribute, `${component.getId()}:${key}`);
        }
        return Reflect[functionName](target, key, ...otherParameters);
      }
    }
    if (createableContextNames.includes(key)) {
      addContext(target, creatableContexts[key]);
      if (Object.hasOwn(contexts, key)) {
        if (logAccess) {
          library.accessed(attribute, `${component.getId()}:${key}`);
        }
        return Reflect[functionName](target, key, ...otherParameters);
      }
    }
  };
  const handler = {
    has: (target, key) => {
      if (!addedDeconstructed) {
        addDeconstruted(target);
      }
      return contextsKeysCache.includes(key);
    },
    ownKeys: (target) => {
      if (!addedDeconstructed) {
        addDeconstruted(target);
      }
      return contextsKeysCache;
    }
  };
  for (const trap of PROXY_TRAPS2) {
    handler[trap] = (...parameters) => {
      return reflect(trap, ...parameters);
    };
  }
  const revocable = RevocableProxy_default(contexts, handler, {
    irrevocable
  });
  return {
    contexts: revocable.proxy,
    destroy: () => {
      for (let index2 = destroyCallbacks.length - 1;index2 >= 0; index2--) {
        destroyCallbacks[index2]();
      }
      revocable.revoke();
    }
  };
};

// src/contexts/children.js
var children_default = ({ childrenContextName }) => ({
  name: childrenContextName,
  create: (component, attribute, options) => {
    options = {
      ...options,
      global: false
    };
    const childContexts = [];
    const childDestroys = [];
    for (const child of component.getChildren()) {
      const { contexts, destroy: destroy2 } = createContexts(child, attribute, null, options);
      childContexts.push(contexts);
      childDestroys.push(destroy2);
    }
    return {
      value: childContexts,
      destroy: () => {
        for (const childDestroy of childDestroys) {
          childDestroy();
        }
      }
    };
  }
});

// src/contexts/component.js
var component_default = ({ componentContextName }) => ({
  name: componentContextName,
  create: (component) => ({
    value: component.getElement()
  })
});

// src/contexts/dispatch.js
var dispatch_default = ({ dispatchContextName }) => ({
  name: dispatchContextName,
  create: (component) => {
    return {
      value: (name, detail = {}) => {
        component.getElement().dispatchEvent(new CustomEvent(name, {
          detail,
          bubbles: true
        }));
      }
    };
  }
});

// src/contexts/element.js
var element_default = ({ elementContextName }) => ({
  name: elementContextName,
  create: (_component, attribute) => ({
    value: attribute.getElement()
  })
});

// src/contexts/for.js
var for_default = ({ forContextDeconstruct, forContextName }) => ({
  deconstruct: forContextDeconstruct,
  name: forContextName,
  create: (component, attribute, options) => {
    if (component !== attribute.getComponent()) {
      return;
    }
    const library = component.getLibrary();
    let element = attribute.getElement();
    const componentElement = component.getElement(), items = [], target = {};
    while (element && !element.isSameNode(componentElement)) {
      const dataByElement = component.getData(forContextName);
      if (dataByElement?.has(element)) {
        const data = dataByElement.get(element);
        if (data) {
          items.push(data);
          for (const key in data.variables) {
            target[key] = data.variables[key];
          }
        }
      }
      element = element.parentNode;
    }
    if (items.length === 0) {
      return;
    }
    const revocable = RevocableProxy_default(target, {
      get: (_target, key) => {
        for (const item of items) {
          if (Object.hasOwn(item.variables, key)) {
            if (!options || options.accessed) {
              library.accessed(attribute, `${item.id}:${forContextName}`);
            }
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
});

// src/contexts/inContext.js
var inContext_default = ({ inContextContextName }) => ({
  revocable: false,
  name: inContextContextName,
  create: (component, attribute, options) => ({
    value: (callback) => {
      const { contexts, destroy: destroy2 } = createContexts(component, attribute, null, options);
      const result = callback(contexts);
      destroy2();
      return result;
    }
  })
});

// src/contexts/nextSibling.js
var nextSibling_default = ({ nextSiblingContextName }) => ({
  name: nextSiblingContextName,
  create: (component, attribute, options) => {
    const parent = component.getParent();
    if (!parent) {
      return {
        value: null
      };
    }
    const siblings = parent.getChildren();
    const index2 = siblings.indexOf(component);
    if (index2 + 1 >= siblings.length) {
      return {
        value: null
      };
    }
    const { contexts, destroy: destroy2 } = createContexts(siblings[index2 + 1], attribute, null, {
      ...options,
      global: false
    });
    return {
      value: contexts,
      destroy: destroy2
    };
  }
});

// src/contexts/nextTick.js
var nextTick_default = ({ nextTickContextName }) => ({
  global: true,
  name: nextTickContextName,
  create: (component, attribute, options) => {
    let callbacks;
    let isInitialized = false;
    const initialize = () => {
      if (isInitialized) {
        return;
      }
      isInitialized = true;
      const library = component.getLibrary();
      callbacks = [];
      const handleUpdate = () => {
        stopListening();
        const { contexts, destroy: destroy2 } = createContexts(component, attribute, null, options);
        for (const callback of callbacks) {
          callback(contexts);
        }
        destroy2();
      };
      const stopListening = () => {
        library.removeEventListener("updated", handleUpdate);
        cancelAnimationFrame(handleUpdate);
        attribute.removeEventListener("changed", stopListening);
        attribute.removeEventListener("destroyed", stopListening);
      };
      library.addEventListener("updated", handleUpdate);
      requestAnimationFrame(handleUpdate);
      attribute.addEventListener("changed", stopListening);
      attribute.addEventListener("destroyed", stopListening);
    };
    return {
      value: (callback) => {
        initialize();
        callbacks.push(callback);
      }
    };
  }
});

// src/contexts/parent.js
var parent_default = ({ parentContextName }) => ({
  name: parentContextName,
  create: (component, attribute, options) => {
    const parent = component.getParent();
    if (!parent) {
      return {
        value: null
      };
    }
    const { contexts, destroy: destroy2 } = createContexts(parent, attribute, null, {
      ...options,
      global: false
    });
    return {
      value: contexts,
      destroy: destroy2
    };
  }
});

// src/contexts/previousSibling.js
var previousSibling_default = ({ previousSiblingContextName }) => ({
  name: previousSiblingContextName,
  create: (component, attribute, options) => {
    const parent = component.getParent();
    if (!parent) {
      return {
        value: null
      };
    }
    const siblings = parent.getChildren();
    const index2 = siblings.indexOf(component);
    if (index2 <= 0) {
      return {
        value: null
      };
    }
    const { contexts, destroy: destroy2 } = createContexts(siblings[index2 - 1], attribute, null, {
      ...options,
      global: false
    });
    return {
      value: contexts,
      destroy: destroy2
    };
  }
});

// src/contexts/references.js
var references_default = ({ referencesContextName, referenceDirectiveName }) => ({
  name: referencesContextName,
  create: (component, attribute, options) => {
    if (!component.getData(referenceDirectiveName)) {
      return {
        value: []
      };
    }
    const library = component.getLibrary();
    let cache = component.getData(referencesContextName);
    if (!cache) {
      const references = component.getData(referenceDirectiveName);
      const attributeIds = Object.keys(references);
      cache = {};
      for (const id of attributeIds) {
        const { element, name } = references[id];
        cache[name] = element;
      }
      component.setData(referencesContextName, cache);
    }
    const revocable = RevocableProxy_default(cache, {
      get: (target, propertyKey, receiver) => {
        if (!options || options.accessed) {
          library.accessed(attribute, `${component.getId()}:${referencesContextName}.${propertyKey}`);
        }
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
});

// src/contexts/siblings.js
var siblings_default = ({ siblingsContextName }) => ({
  name: siblingsContextName,
  create: (component, attribute, options) => {
    const parent = component.getParent();
    if (!parent) {
      return {
        value: []
      };
    }
    options = {
      ...options,
      global: false
    };
    const siblingContexts = [];
    const siblingDestroys = [];
    for (const sibling of parent.getChildren()) {
      if (sibling !== component) {
        const { contexts, destroy: destroy2 } = createContexts(sibling, attribute, null, options);
        siblingContexts.push(contexts);
        siblingDestroys.push(destroy2);
      }
    }
    return {
      value: siblingContexts,
      destroy: () => {
        for (const siblingDestroy of siblingDestroys) {
          siblingDestroy();
        }
      }
    };
  }
});

// ../common/src/factories/createState.js
var createState_default = (name, id, state, proxy) => {
  return (component, attribute, options) => {
    const library = component.getLibrary();
    const onDelete = (_target, path) => library.update(`${id}:${name}.${path.join(".")}`);
    const onGet = (_target, path) => {
      if (!options || options.accessed) {
        library.accessed(attribute, `${id}:${name}.${path.join(".")}`);
      }
    };
    const onSet = (_target, path) => library.update(`${id}:${name}.${path.join(".")}`);
    proxy.addEventListener("delete", onDelete);
    proxy.addEventListener("get", onGet);
    proxy.addEventListener("set", onSet);
    return {
      value: state,
      destroy: () => {
        proxy.removeEventListener("delete", onDelete);
        proxy.removeEventListener("get", onGet);
        proxy.removeEventListener("set", onSet);
      }
    };
  };
};

// src/contexts/state.js
var state_default = ({ stateContextDeconstruct, stateContextName }) => ({
  deconstruct: stateContextDeconstruct,
  name: stateContextName,
  create: (component, attribute, options) => {
    const proxy = component.getProxy();
    const state = component.getState();
    if (!proxy || !state) {
      return;
    }
    return createState_default(stateContextName, component.getId(), state, proxy)(component, attribute, options);
  }
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
var getDeeply = (object, path) => {
  let objectTemp = object;
  let i = 0;
  for (;i < path.length - 1; i++) {
    objectTemp = objectTemp[path[i]];
  }
  return objectTemp[path[i]];
};
var isObject = (value) => {
  return value && typeof value === "object" && !Array.isArray(value);
};
var setDeeply = (object, path, value) => {
  if (typeof object !== "object") {
    return;
  }
  let i = 0;
  for (;i < path.length - 1; i++) {
    object = object[path[i]];
    if (typeof object !== "object") {
      return;
    }
  }
  object[path[i]] = value;
};

// src/contexts/store.js
var store_default = ({ storeContextDeconstruct, storeContextInitial, storeContextName }, id) => {
  const data = deepAssign({}, storeContextInitial);
  const proxy = new ProxyDispatcher;
  const state = proxy.add(data);
  return {
    deconstruct: !!storeContextDeconstruct,
    global: true,
    name: storeContextName,
    create: createState_default(storeContextName, id, state, proxy)
  };
};

// src/contexts/watch.js
var watch_default = ({ watchContextName }) => ({
  name: watchContextName,
  create: (component, attribute) => {
    let callbacks = null, contextIsDestroyed = false, directiveIsDestroyed = false, isInitialized = false;
    const componentId = component.getId();
    const initialize = () => {
      if (!isInitialized) {
        isInitialized = true;
        callbacks = [];
        const library = component.getLibrary();
        const onUpdate = (triggers) => {
          for (const callbackData of callbacks) {
            if (triggers.includes(callbackData.path)) {
              const { contexts, destroy: destroy2 } = createContexts(component, attribute);
              callbackData.callback(contexts);
              destroy2();
            }
          }
        };
        const stopHandling = () => {
          if (!directiveIsDestroyed) {
            directiveIsDestroyed = true;
            attribute.removeEventListener("changed", stopHandling);
            attribute.removeEventListener("destroyed", stopHandling);
            library.removeEventListener("updating", onUpdate);
          }
        };
        attribute.addEventListener("changed", stopHandling);
        attribute.addEventListener("destroyed", stopHandling);
        library.addEventListener("updating", onUpdate);
      }
    };
    return {
      value: (path, callback) => {
        if (contextIsDestroyed || directiveIsDestroyed) {
          return;
        }
        initialize();
        callbacks.push({
          path: `${componentId}:${path}`,
          callback
        });
        return async () => {
          const { contexts, destroy: destroy2 } = createContexts(component, attribute, null, {
            access: false
          });
          callback(contexts);
          destroy2();
        };
      },
      destroy: () => {
        contextIsDestroyed = true;
      }
    };
  }
});

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
var setAttribute = (element, key, data) => {
  if (key === "value" && element.tagName === "INPUT") {
    if (!data) {
      data = "";
    }
    if (element.getAttribute(key) === data) {
      return;
    }
    element.setAttribute(key, data);
    element.value = data;
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
      data = Object.entries(data).filter(([_, value]) => value).map(([key2]) => key2).join(" ");
    }
  }
  if (key === "style") {
    if (Array.isArray(data)) {
      data = data.join(" ");
    } else if (typeof data === "object") {
      data = Object.entries(data).filter(([_, value]) => value).map(([key2, value]) => `${key2}:${value}`).join(";");
    }
  }
  if (data === false || data === null || data === undefined || data === "") {
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

// ../common/src/utilities/Promise.js
var nativePromise = Function.prototype.toString.call(Function).replace("Function", "Promise").replace(/\(.*\)/, "()");
var isPromise = (value) => {
  return value && Object.prototype.toString.call(value) === "[object Promise]";
};

// src/directives/attribute.js
var attribute_default = ({ attributeDirectiveName }) => ({
  name: attributeDirectiveName,
  update: (component, attribute, processExpression) => {
    const directive = attribute.getDirective();
    const element = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const set = (value) => {
      if (modifiers.selector) {
        if (typeof value !== "string") {
          console.error('Doars: Value returned to "' + directive + '" directive must be a string if the selector modifier is set.');
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
          console.error('Doars: Value returned to "' + directive + '" directive of invalid type.');
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
});

// ../common/src/utilities/Transition.js
var TRANSITION_NAME = "-transition:";
var transition = (type, libraryOptions2, element, callback = null) => {
  if (element.nodeType !== 1) {
    if (callback) {
      callback();
    }
    return;
  }
  const transitionDirectiveName = libraryOptions2.prefix + TRANSITION_NAME + type;
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
var transitionIn = (libraryOptions2, element, callback) => {
  return transition("in", libraryOptions2, element, callback);
};
var transitionOut = (libraryOptions2, element, callback) => {
  return transition("out", libraryOptions2, element, callback);
};

// src/directives/cloak.js
var cloak_default = ({ cloakDirectiveName }) => ({
  name: cloakDirectiveName,
  update: (component, attribute) => {
    const element = attribute.getElement();
    const libraryOptions2 = component.getLibrary().getOptions();
    element.removeAttribute(attribute.getName());
    transitionIn(libraryOptions2, element);
  }
});

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

// src/directives/for.js
var createVariables = (names, ...values) => {
  const variables = {};
  for (let i = 0;i < values.length; i++) {
    if (i >= names.length) {
      break;
    }
    if (names[i] !== undefined) {
      variables[names[i]] = values[i];
    }
  }
  return variables;
};
var indexInSiblings = (dataByElement, elements, value, offset = -1) => {
  offset++;
  if (offset >= elements.length) {
    return -1;
  }
  if (dataByElement.get(elements[offset])?.value === value) {
    return offset;
  }
  return indexInSiblings(dataByElement, elements, value, offset);
};
var setAfter = (library, dataByElement, template, elements, index2, value, variables, allowInlineScript) => {
  const existingIndex = indexInSiblings(dataByElement, elements, value, index2);
  if (existingIndex >= 0) {
    if (existingIndex === index2 + 1) {
      return;
    }
    const element2 = elements[existingIndex];
    const data = dataByElement.get(element2);
    (elements[index2] ? elements[index2] : template).insertAdjacentElement("afterend", element2);
    library.update(`${data.id}:${libraryOptions.forContextName}`);
    return;
  }
  const element = document.importNode(template.content, true).firstElementChild;
  if (!element) {
    console.warn("Unable to get element from for template");
    return;
  }
  const sibling = index2 === -1 ? template : elements[index2];
  sibling.insertAdjacentElement("afterend", element);
  if (allowInlineScript) {
    readdScripts(element);
  }
  transitionIn(library.getOptions(), element);
  dataByElement.set(element, {
    id: library.generateId(),
    value,
    variables
  });
  elements.splice(index2 + 1, 0, element);
};
var removeAfter = (libraryOptions2, elements, maxLength) => {
  if (elements.length < maxLength) {
    return;
  }
  for (let i = elements.length - 1;i >= maxLength; i--) {
    const element = elements[i];
    elements.splice(i, 1);
    transitionOut(libraryOptions2, element, () => {
      element.remove();
    });
  }
};
var for_default2 = ({ allowInlineScript, forDirectiveName }) => ({
  name: forDirectiveName,
  update: (component, attribute, processExpression) => {
    const directive = attribute.getDirective();
    const template = attribute.getElement();
    if (template.tagName !== "TEMPLATE") {
      console.warn('Doars: "' + directive + '" directive must be placed on a TEMPLATE tag.');
      return;
    }
    const library = component.getLibrary();
    const libraryOptions2 = library.getOptions();
    let dataByElement = component.getData(libraryOptions2.forContextName);
    if (!dataByElement) {
      dataByElement = new WeakMap;
      component.setData(libraryOptions2.forContextName, dataByElement);
    }
    const modifiers = attribute.getModifiers();
    const expression = parseForExpression(attribute.getValue());
    if (!expression) {
      console.error(`Doars: Error in "${directive}" expression: `, attribute.getValue());
      return;
    }
    const setFor = (iterable) => {
      const data2 = attribute.getData();
      const elements = data2.elements ? data2.elements : [];
      const iterableType = typeof iterable;
      if (iterable !== null && iterable !== undefined) {
        if (iterableType === "number") {
          for (let index2 = 0;index2 < iterable; index2++) {
            const variables = createVariables(expression.variables, index2);
            setAfter(library, dataByElement, template, elements, index2 - 1, iterable, variables, allowInlineScript || modifiers.script);
          }
          removeAfter(libraryOptions2, elements, iterable);
        } else if (iterableType === "string") {
          for (let index2 = 0;index2 < iterable.length; index2++) {
            const value = iterable[index2];
            const variables = createVariables(expression.variables, value, index2);
            setAfter(library, dataByElement, template, elements, index2 - 1, value, variables, allowInlineScript || modifiers.script);
          }
          removeAfter(libraryOptions2, elements, iterable.length);
        } else {
          let isArray, length;
          try {
            const values = [...iterable];
            isArray = true;
            length = values.length;
          } catch {}
          if (isArray) {
            for (let index2 = 0;index2 < length; index2++) {
              const value = iterable[index2];
              const variables = createVariables(expression.variables, value, index2);
              setAfter(library, dataByElement, template, elements, index2 - 1, value, variables, allowInlineScript || modifiers.script);
            }
          } else {
            const keys = Object.keys(iterable);
            length = keys.length;
            for (let index2 = 0;index2 < length; index2++) {
              const key = keys[index2];
              const value = iterable[key];
              const variables = createVariables(expression.variables, key, value, index2);
              setAfter(library, dataByElement, template, elements, index2 - 1, value, variables, allowInlineScript || modifiers.script);
            }
          }
          removeAfter(libraryOptions2, elements, length);
        }
      }
      attribute.setData(Object.assign({}, data2, {
        elements
      }));
    };
    let result;
    if (!isNaN(expression.iterable)) {
      result = Number(expression.iterable);
    } else {
      result = processExpression(component, attribute, expression.iterable);
    }
    const data = attribute.getData();
    attribute.setData(Object.assign({}, data, {
      result
    }));
    if (isPromise(result)) {
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData().result !== result) {
          return;
        }
        setFor(resultResolved);
      });
    } else {
      setFor(result);
    }
  },
  destroy: (component, attribute) => {
    const data = attribute.getData();
    if (data.elements) {
      for (const element of data.elements) {
        transitionOut(component.getLibrary().getOptions(), element, () => {
          element.remove();
        });
      }
    }
  }
});

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

// src/directives/html.js
var html_default = ({ allowInlineScript, htmlDirectiveName }) => ({
  name: htmlDirectiveName,
  update: (component, attribute, processExpression) => {
    const element = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const setHtml = (html) => {
      if (html instanceof Node) {
        if (modifiers.clone) {
          html = html.cloneNode(true);
        }
        if (modifiers.outer) {
          element.insertAdjacentElement("beforebegin", html);
          element.remove();
        } else {
          for (const staleChild of element.children) {
            staleChild.remove();
          }
          element.append(html);
        }
        return;
      }
      if (html instanceof NodeList) {
        if (modifiers.outer) {
          for (let newChild of html) {
            if (modifiers.clone) {
              newChild = newChild.cloneNode(true);
            }
            element.insertAdjacentElement("beforebegin", newChild);
          }
          element.remove();
        } else {
          for (const staleChild of element.children) {
            staleChild.remove();
          }
          for (let newChild of html) {
            if (modifiers.clone) {
              newChild = newChild.cloneNode(true);
            }
            element.append(newChild);
          }
        }
        return;
      }
      if (typeof html === "string") {
        if (modifiers.decode) {
          html = decode(html);
        }
        if (modifiers.morph) {
          if (modifiers.outer) {
            morphTree(element, html);
          } else {
            if (element.children.length === 0) {
              element.append(document.createElement("div"));
            } else if (element.children.length > 1) {
              for (let i = element.children.length - 1;i >= 1; i--) {
                element.children[i].remove();
              }
            }
            const root = morphTree(element.children[0], html);
            if (!element.children[0].isSameNode(root)) {
              element.children[0].remove();
              element.append(root);
            }
          }
        } else if (modifiers.outer) {
          if (element.outerHTML !== html) {
            element.outerHTML = html;
            if (allowInlineScript || modifiers.script) {
              readdScripts(element);
            }
          }
        } else if (element.innerHTML !== html) {
          element.innerHTML = html;
          if (allowInlineScript || modifiers.script) {
            readdScripts(...element.children);
          }
        }
        return;
      }
      console.error(`Doars: Unknown type returned to "${attribute.getDirective()}" directive.`);
    };
    const result = processExpression(component, attribute, attribute.getValue());
    attribute.setData(result);
    if (isPromise(result)) {
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData() !== result) {
          return;
        }
        setHtml(resultResolved);
      });
    } else {
      setHtml(result);
    }
  }
});

// src/directives/if.js
var if_default = ({ allowInlineScript, ifDirectiveName }) => ({
  name: ifDirectiveName,
  update: (component, attribute, processExpression) => {
    const libraryOptions2 = component.getLibrary().getOptions();
    const directive = attribute.getDirective();
    const modifiers = attribute.getModifiers();
    const template = attribute.getElement();
    if (template.tagName !== "TEMPLATE") {
      console.warn(`Doars: "${directive}" must be placed on a \`<template>\`.`);
      return;
    }
    if (template.childCount > 1) {
      console.warn(`Doars: "${directive}" must have one child.`);
      return;
    }
    const setIf = (result2) => {
      const data2 = attribute.getData();
      let element = data2.element;
      let transition2 = data2.transition;
      if (!result2) {
        if (element) {
          if (transition2) {
            transition2();
          }
          transition2 = transitionOut(libraryOptions2, element, () => {
            element.remove();
          });
        }
      } else if (!element) {
        if (transition2) {
          transition2();
        }
        element = document.importNode(template.content, true).firstElementChild;
        if (element) {
          template.insertAdjacentElement("afterend", element);
          if (allowInlineScript || modifiers.script) {
            readdScripts(element);
          }
          transition2 = transitionIn(libraryOptions2, element);
        } else {
          console.warn("Unable to get element from if template");
        }
      }
      attribute.setData(Object.assign({}, data2, {
        element,
        transition: transition2
      }));
    };
    const result = processExpression(component, attribute, attribute.getValue());
    const data = attribute.getData();
    attribute.setData(Object.assign({}, data, {
      result
    }));
    if (isPromise(result)) {
      Promise.resolve(result).then((result2) => {
        if (attribute.getData().result !== result2) {
          return;
        }
        setIf(result2);
      });
    } else {
      setIf(result);
    }
  },
  destroy: (component, attribute) => {
    const data = attribute.getData();
    if (data.element) {
      transitionOut(component.getLibrary().getOptions(), data.element, () => {
        data.element.remove();
      });
    }
  }
});

// src/directives/initialized.js
var EVENT_NAME = "updated";
var destroy2 = (component, attribute) => {
  const data = attribute.getData();
  if (data) {
    const library = component.getLibrary();
    library.removeEventListener(EVENT_NAME, data.handler);
    attribute.setData();
  }
};
var initialized_default = ({ initializedDirectiveName }) => ({
  name: initializedDirectiveName,
  update: (component, attribute, processExpression) => {
    const library = component.getLibrary();
    const value = attribute.getValue();
    const data = attribute.getData();
    if (data) {
      if (data.value !== value) {
        library.removeEventListener(EVENT_NAME, data.handler);
        attribute.setData(null);
      }
    }
    const handler = () => {
      processExpression(component, attribute, value, null, {
        access: false,
        return: false
      });
      destroy2(component, attribute);
    };
    library.addEventListener(EVENT_NAME, handler, {
      once: true
    });
    attribute.setData({
      handler,
      value
    });
  },
  destroy: destroy2
});

// src/directives/on.js
var ON = Symbol("ON");
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
  THROTTLE: 5,
  DELAY: 6
};
var KEYPRESS_MODIFIERS = ["alt", "ctrl", "meta", "shift"];
var on_default = ({ onDirectiveName }) => ({
  name: onDirectiveName,
  update: (component, attribute, processExpression) => {
    const directive = attribute.getDirective();
    let eventName = attribute.getKeyRaw();
    if (!eventName) {
      console.warn(`Doars: "${directive}" directive must have a key.`);
      return;
    }
    let key;
    if (eventName.startsWith("keydown-")) {
      key = eventName.substring(8).toLowerCase();
      eventName = "keydown";
    } else if (eventName.startsWith("keyup-")) {
      key = eventName.substring(6).toLowerCase();
      eventName = "keyup";
    }
    const element = attribute.getElement();
    const value = attribute.getValue();
    if (attribute[ON]) {
      if (attribute[ON].value === value) {
        return;
      }
      attribute[ON].target.removeEventListener(attribute[ON].eventName, attribute[ON].handler);
      if (attribute[ON].timeout) {
        clearTimeout(attribute[ON].timeout);
      }
      delete attribute[ON];
    }
    const modifiers = Object.assign({}, attribute.getModifiers());
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
    } else if (modifiers.delay) {
      executionModifier = EXECUTION_MODIFIERS.DELAY;
      if (modifiers.delay === true) {
        modifiers.delay = 500;
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
      if ((eventName === "keydown" || eventName === "keyup") && key) {
        for (const keypressModifier of keypressModifiers) {
          if (!event[`${keypressModifier}Key`]) {
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
        processExpression(component, attribute, value, {
          $event: event,
          $events: attribute[ON].buffer
        }, {
          access: false,
          return: false
        });
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
        case EXECUTION_MODIFIERS.HELD: {
          if (!Object.hasOwn(CANCEL_EVENTS, eventName)) {
            console.warn('Doars: "' + directive + '" directive, event of name "' + eventName + '" is not cancelable and can not have "held" modifier.');
            return;
          }
          const cancelHeldName = CANCEL_EVENTS[eventName];
          const nowHeld = window.performance.now();
          attribute[ON].cancel = (cancelEvent) => {
            if (window.performance.now() - nowHeld < modifiers.held) {
              attribute[ON].prevent = false;
              return;
            }
            if (cancelHeldName === "keyup" && key) {
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[`${keypressModifier}Key`]) {
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
          target.addEventListener(cancelHeldName, attribute[ON].cancel, {
            once: true
          });
          return;
        }
        case EXECUTION_MODIFIERS.HOLD: {
          if (!Object.hasOwn(CANCEL_EVENTS, eventName)) {
            console.warn('Doars: "' + directive + '" directive, event of name "' + eventName + '" is not cancelable and can not have "hold" modifier.');
            return;
          }
          const cancelHoldName = CANCEL_EVENTS[eventName];
          attribute[ON].cancel = (cancelEvent) => {
            if (cancelHoldName === "keyup" && key) {
              let keyLetGo = false;
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[`${keypressModifier}Key`]) {
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
          target.addEventListener(cancelHoldName, attribute[ON].cancel, {
            once: true
          });
          attribute[ON].prevent = true;
          attribute[ON].timeout = setTimeout(() => {
            target.removeEventListener(cancelHoldName, attribute[ON].cancel);
            attribute[ON].prevent = false;
            execute();
          }, modifiers.hold);
          return;
        }
        case EXECUTION_MODIFIERS.THROTTLE: {
          const nowThrottle = window.performance.now();
          if (attribute[ON].lastExecution && nowThrottle - attribute[ON].lastExecution < modifiers.throttle) {
            return;
          }
          execute();
          attribute[ON].lastExecution = nowThrottle;
          return;
        }
        case EXECUTION_MODIFIERS.DELAY:
          attribute[ON].prevent = true;
          attribute[ON].timeout = setTimeout(() => {
            attribute[ON].prevent = false;
            execute();
          }, modifiers.delay);
          return;
      }
      execute();
    };
    target.addEventListener(eventName, handler, listenerOptions);
    attribute[ON] = {
      buffer: [],
      eventName,
      handler,
      target,
      timeout: attribute[ON] ? attribute[ON].timeout : undefined,
      value,
      prevent: false
    };
  },
  destroy: (_component, attribute) => {
    if (!attribute[ON]) {
      return;
    }
    attribute[ON].target.removeEventListener(attribute[ON].eventName, attribute[ON].handler);
    if (attribute[ON].cancel) {
      attribute[ON].target.removeEventListener(CANCEL_EVENTS[attribute[ON].eventName], attribute[ON].cancel);
    }
    if (attribute[ON].timeout) {
      clearTimeout(attribute[ON].timeout);
    }
    delete attribute[ON];
  }
});

// src/directives/reference.js
var reference_default = ({ referencesContextName, referenceDirectiveName }) => ({
  name: referenceDirectiveName,
  update: (component, attribute, processExpression) => {
    const library = component.getLibrary();
    const componentId = component.getId();
    const directive = attribute.getDirective();
    const element = attribute.getElement();
    const attributeId = attribute.getId();
    const { referenceDirectiveEvaluate } = library.getOptions();
    let name = attribute.getValue();
    name = referenceDirectiveEvaluate ? processExpression(component, attribute, name) : name.trim();
    if (!name || typeof name !== "string" || !/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(name)) {
      destroy(component, attribute);
      console.warn('Doars: "' + directive + `" directive's value not a valid variable name: "` + name.toString() + '".');
      return;
    }
    const data = component.getData(referenceDirectiveName) ?? {};
    data[attributeId] = {
      element,
      name
    };
    component.setData(referenceDirectiveName, data);
    component.setData(referencesContextName, null);
    library.update(`${componentId}:${referencesContextName}.${name}`);
  },
  destroy: (component, attribute) => {
    const referencesData = component.getData(referenceDirectiveName);
    if (!referencesData) {
      return;
    }
    const attributeId = attribute.getId();
    const referenceData = referencesData[attributeId];
    if (!referenceData) {
      return;
    }
    const library = component.getLibrary();
    const componentId = component.getId();
    delete referencesData[attributeId];
    component.setData(referencesContextName, null);
    if (Object.keys(referencesData).length === 0) {
      component.setData(referenceDirectiveName, null);
    }
    library.update(`${componentId}:${referencesContextName}.${referenceData.name}`);
  }
});

// src/directives/select.js
var TAG_SELECT = "SELECT";
var CHECKED = "checked";
var SELECTED = "selected";
var TYPE_CHECKBOX = "checkbox";
var select_default = ({ selectDirectiveName }) => ({
  name: selectDirectiveName,
  update: (component, attribute, processExpression) => {
    const element = attribute.getElement();
    const directive = attribute.getDirective();
    const type = element.getAttribute("type");
    if (element.tagName !== TAG_SELECT && !(element.tagName === "INPUT" && (type === TYPE_CHECKBOX || type === "radio"))) {
      console.warn('Doars: "' + directive + '" directive must be placed on a `select` tag or `input` of type checkbox or radio.');
      return;
    }
    const setSelect = (data) => {
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
        setSelect(resultResolved);
      });
    } else {
      setSelect(result);
    }
  }
});

// src/directives/show.js
var show_default = ({ showDirectiveName }) => ({
  name: showDirectiveName,
  update: (component, attribute, processExpression) => {
    const libraryOptions2 = component.getLibrary().getOptions();
    const element = attribute.getElement();
    const setShow = () => {
      const data2 = attribute.getData();
      if (data2.transition) {
        data2.transition();
      }
      let transition2;
      if (data2.result) {
        element.style.display = "";
        transition2 = transitionIn(libraryOptions2, element);
      } else {
        transition2 = transitionOut(libraryOptions2, element, () => {
          element.style.display = "none";
        });
      }
      attribute.setData(Object.assign({}, data2, {
        transition: transition2
      }));
    };
    const result = processExpression(component, attribute, attribute.getValue());
    const data = attribute.getData();
    if (isPromise(result)) {
      attribute.setData(Object.assign({}, data, {
        result
      }));
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData().result !== result) {
          return;
        }
        setShow(resultResolved);
      });
    } else if (!data || data.result !== result) {
      attribute.setData(Object.assign({}, data, {
        result
      }));
      setShow();
    }
  }
});

// src/directives/sync.js
var SYNC = Symbol("SYNC");
var sync_default = ({ syncDirectiveName }) => ({
  name: syncDirectiveName,
  update: (component, attribute, processExpression) => {
    const element = attribute.getElement();
    const directive = attribute.getDirective();
    const isNew = !attribute[SYNC];
    if (isNew) {
      if (!(element.tagName === "DIV" && element.hasAttribute("contenteditable")) && element.tagName !== "INPUT" && element.tagName !== "SELECT" && element.tagName !== "TEXTAREA") {
        console.warn('Doars: "' + directive + '" directive must be placed on an `<input>`, `<select>`, `<textarea>` tag, or a content editable `div`.');
        return;
      }
    }
    let value = attribute.getValue().trim();
    const key = attribute.getKey();
    if (key) {
      value = `$${key}.${value}`;
    }
    if (!/^[_$a-z]{1}[._$a-z0-9]{0,}$/i.test(value)) {
      console.warn('Doars: "' + directive + `" directive's value not a valid variable name "` + value + '".');
      return;
    }
    const valueSplit = value.split(".");
    if (isNew) {
      let handler;
      switch (element.tagName) {
        case "DIV":
          handler = () => {
            const { contexts, destroy: destroy3 } = createContexts(component, attribute, null, {
              access: false
            });
            setDeeply(contexts, valueSplit, escapeHtml(element.innerText));
            destroy3();
          };
          break;
        case "INPUT":
          handler = () => {
            const elementValue = escapeHtml(element.value);
            const { contexts, destroy: destroy3 } = createContexts(component, attribute, null, {
              access: false
            });
            if (element.type === "checkbox") {
              const dataValue2 = getDeeply(contexts, valueSplit);
              if (element.checked) {
                if (!dataValue2) {
                  setDeeply(contexts, valueSplit, [elementValue]);
                }
                if (!dataValue2.includes(element.value)) {
                  dataValue2.push(elementValue);
                }
              } else if (dataValue2) {
                const index2 = dataValue2.indexOf(element.value);
                if (index2 >= 0) {
                  dataValue2.splice(index2, 1);
                }
              }
            } else if (element.type === "radio") {
              const dataValue2 = getDeeply(contexts, valueSplit);
              if (element.checked) {
                if (dataValue2 !== element.value) {
                  setDeeply(contexts, valueSplit, elementValue);
                }
              } else if (dataValue2 === element.value) {
                setDeeply(contexts, valueSplit, null);
              }
            } else {
              setDeeply(contexts, valueSplit, elementValue);
            }
            destroy3();
          };
          break;
        case "TEXTAREA":
          handler = () => {
            const { contexts, destroy: destroy3 } = createContexts(component, attribute, null, {
              access: false
            });
            setDeeply(contexts, valueSplit, escapeHtml(element.innerText));
            destroy3();
          };
          break;
        case "SELECT":
          handler = () => {
            const { contexts, destroy: destroy3 } = createContexts(component, attribute, null, {
              access: false
            });
            if (element.multiple) {
              const elementValues = [];
              for (const option of element.selectedOptions) {
                elementValues.push(escapeHtml(option.value));
              }
              setDeeply(contexts, valueSplit, [elementValues.join("','")]);
            } else {
              setDeeply(contexts, valueSplit, escapeHtml(element.selectedOptions[0].value));
            }
            destroy3();
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
  destroy: (_component, attribute) => {
    if (!attribute[SYNC]) {
      return;
    }
    const element = attribute.getElement();
    element.removeEventListener("input", attribute[SYNC]);
    delete attribute[SYNC];
  }
});

// src/directives/text.js
var text_default = ({ textDirectiveName }) => ({
  name: textDirectiveName,
  update: (component, attribute, processExpression) => {
    const element = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const setText = (text) => {
      const textType = typeof text;
      if (textType !== "string") {
        text = String(text);
      }
      if (modifiers.inner) {
        if (element.innerText !== text) {
          element.innerText = text;
        }
      } else if (element.textContent !== text) {
        element.textContent = text;
      }
    };
    const result = processExpression(component, attribute, attribute.getValue());
    attribute.setData(result);
    if (isPromise(result)) {
      Promise.resolve(result).then((resultResolved) => {
        if (attribute.getData() !== result) {
          return;
        }
        setText(resultResolved);
      });
    } else {
      setText(result);
    }
  }
});

// src/directives/watch.js
var watch_default2 = ({ watchDirectiveName }) => ({
  name: watchDirectiveName,
  update: (component, attribute, processExpression) => processExpression(component, attribute, attribute.getValue(), null, {
    access: false,
    return: false
  })
});

// src/Doars.js
class Doars extends EventDispatcher {
  constructor(options) {
    super();
    let { prefix, processor, root, ignoreDirectiveName, stateDirectiveName } = options = Object.assign({
      prefix: "d",
      processor: null,
      root: document.body,
      allowInlineScript: false,
      forContextDeconstruct: true,
      stateContextDeconstruct: true,
      storeContextDeconstruct: false,
      storeContextInitial: {},
      indicatorDirectiveEvaluate: true,
      referenceDirectiveEvaluate: true,
      selectFromElementDirectiveEvaluate: true,
      targetDirectiveEvaluate: true,
      childrenContextName: "$children",
      componentContextName: "$component",
      dispatchContextName: "$dispatch",
      elementContextName: "$element",
      forContextName: "$for",
      inContextContextName: "$inContext",
      nextSiblingContextName: "$nextSibling",
      nextTickContextName: "$nextTick",
      parentContextName: "$parent",
      previousSiblingContextName: "$previousSibling",
      referencesContextName: "$references",
      siblingsContextName: "$siblings",
      stateContextName: "$state",
      storeContextName: "$store",
      watchContextName: "$watch",
      attributeDirectiveName: "attribute",
      cloakDirectiveName: "cloak",
      forDirectiveName: "for",
      htmlDirectiveName: "html",
      ifDirectiveName: "if",
      ignoreDirectiveName: "ignore",
      indicatorDirectiveName: "indicator",
      initializedDirectiveName: "initialized",
      onDirectiveName: "on",
      referenceDirectiveName: "reference",
      selectDirectiveName: "select",
      selectFromElementDirectiveName: "select",
      showDirectiveName: "show",
      stateDirectiveName: "state",
      syncDirectiveName: "sync",
      targetDirectiveName: "target",
      textDirectiveName: "text",
      transitionDirectiveName: "transition",
      watchDirectiveName: "watch",
      redirectHeaderName: "redirect",
      requestHeaderName: "request",
      titleHeaderName: "title"
    }, options);
    if (typeof root === "string") {
      root = options.root = document.querySelector(root);
    }
    options = Object.freeze(options);
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
    const idFactory = createIdFactory();
    let accessed, contextsByName, directivesNames, directivesObject, directivesRegexp, flushPromise, flushResolve, isEnabled = false, mutations, observer, processExpression, triggers;
    const componentName = `${prefix}-${stateDirectiveName}`, ignoreName = `${prefix}-${ignoreDirectiveName}`, componentByElement = new WeakMap, components = [], contextsSimple = {}, contexts = [
      children_default(options),
      component_default(options),
      element_default(options),
      dispatch_default(options),
      inContext_default(options),
      nextSibling_default(options),
      nextTick_default(options),
      parent_default(options),
      previousSibling_default(options),
      references_default(options),
      siblings_default(options),
      watch_default(options),
      store_default(options, idFactory()),
      state_default(options),
      for_default(options)
    ], directives = [
      reference_default(options),
      attribute_default(options),
      for_default2(options),
      html_default(options),
      if_default(options),
      text_default(options),
      cloak_default(options),
      initialized_default(options),
      on_default(options),
      select_default(options),
      show_default(options),
      sync_default(options),
      watch_default2(options)
    ], processorType = typeof processor;
    if (processorType === "function") {
      processExpression = processor;
    } else if (processorType === "string" && this.constructor[`${processor}Expression`]) {
      processExpression = this.constructor[`${processor}Expression`];
    } else {
      if (processor) {
        console.warn("Doars: Expression processor not found. Using fallback instead.");
      }
      processExpression = this.constructor.interpretExpression ?? this.constructor.executeExpression ?? this.constructor.callExpression;
    }
    if (!processExpression) {
      console.error("Doars: No expression processor available. Process option: ", process);
    }
    this.generateId = () => {
      return idFactory();
    };
    this.getOptions = () => {
      return options;
    };
    this.getEnabled = () => {
      return isEnabled;
    };
    this.enable = () => {
      if (isEnabled) {
        return this;
      }
      accessed = {};
      mutations = [];
      triggers = [];
      this.dispatchEvent("enabling", [this]);
      isEnabled = true;
      contextsByName = {};
      for (const context of contexts) {
        contextsByName[context.name] = context;
      }
      contextsByName = Object.freeze(contextsByName);
      directivesNames = [];
      directivesObject = {};
      for (const directive of directives) {
        directivesNames.push(directive.name);
        directivesObject[directive.name] = directive;
      }
      directivesNames = Object.freeze(directivesNames);
      directivesObject = Object.freeze(directivesObject);
      directivesRegexp = new RegExp("^" + prefix + "-(" + directivesNames.join("|") + ")(?:[$-_.a-z0-9]{0,})?$", "i");
      observer = new MutationObserver((newMutations) => {
        if (newMutations) {
          mutations.push(...newMutations);
        }
        flush();
      });
      observer.observe(root, {
        attributes: true,
        childList: true,
        subtree: true
      });
      const componentElements = [
        ...root.querySelectorAll(`[${componentName}]`)
      ];
      for (let i = componentElements.length - 1;i >= 0; i--) {
        if (componentElements[i].closest(`[${ignoreName}]`)) {
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
      accessed = {};
      mutations = [];
      triggers = [];
      this.dispatchEvent("disabling", [this], { reverse: true });
      removeComponentsByComponent(components);
      directivesNames = [];
      directivesObject = {};
      directivesRegexp = null;
      contextsByName = {};
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
        if (componentByElement.has(element)) {
          continue;
        }
        const component = Component_default(this, element);
        components.push(component);
        componentByElement.set(element, component);
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
        component.updateAllAttributes();
      }
      return results;
    };
    const removeComponents = (elements) => {
      const results = [];
      for (const element of elements) {
        if (!componentByElement.has(element)) {
          continue;
        }
        const component = componentByElement.get(element);
        results.push(element);
        component.destroy();
        componentByElement.delete(element);
        components.splice(index, 1);
      }
      if (results.length > 0) {
        this.dispatchEvent("components-removed", [this, results]);
      }
      return results;
    };
    const removeComponentsByComponent = (_components) => {
      const results = [];
      for (const component of _components) {
        const index2 = components.indexOf(component);
        if (index2 < 0) {
          continue;
        }
        const element = component.getElement();
        results.push(element);
        component.destroy();
        componentByElement.delete(element);
        components.splice(index2, 1);
      }
      if (results.length > 0) {
        this.dispatchEvent("components-removed", [this, results]);
      }
      return results;
    };
    this.closestComponent = (element) => {
      if (element.parentElement) {
        element = element.parentElement;
        if (componentByElement.has(element)) {
          return componentByElement.get(element);
        }
        return this.closestComponent(element);
      }
    };
    this.getSimpleContexts = () => Object.assign({}, contextsSimple);
    this.setSimpleContext = (name, value = null) => {
      if (value === null) {
        delete contextsSimple[name];
        this.dispatchEvent("simple-context-removed", [this, name]);
        return true;
      }
      if (!name.match("^([a-zA-Z_$][a-zA-Z\\d_$]*)$")) {
        console.warn('Doars: name of a bind can not start with a "$".');
        return false;
      }
      contextsSimple[name] = value;
      this.dispatchEvent("simple-context-added", [this, name, value]);
      return true;
    };
    this.setSimpleContexts = (contexts2) => {
      const result = {};
      for (const name in contexts2) {
        if (Object.hasOwn(contexts2, name)) {
          result[name] = this.setSimpleContext(name, contexts2[name]);
        }
      }
      return result;
    };
    this.getContexts = () => [...contexts];
    this.getContextsByName = () => contextsByName;
    this.addContexts = (index2, ..._contexts) => {
      if (isEnabled) {
        console.warn("Doars: Unable to add contexts after being enabled!");
        return;
      }
      if (index2 < 0) {
        index2 = contexts.length + index2 % contexts.length;
      } else if (index2 > contexts.length) {
        index2 = contexts.length;
      }
      const results = [];
      for (let i = 0;i < _contexts.length; i++) {
        const context = _contexts[i];
        if (contexts.includes(context)) {
          continue;
        }
        contexts.splice(index2 + i, 0, context);
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
        const index2 = contexts.indexOf(context);
        if (index2 < 0) {
          continue;
        }
        contexts.slice(index2, 1);
        results.push(context);
      }
      if (results.length > 0) {
        this.dispatchEvent("contexts-removed", [this, results]);
      }
      return results;
    };
    this.getDirectives = () => [...directives];
    this.getDirectiveByName = (name) => {
      for (const directive of directives) {
        if (directive.name === name) {
          return directive;
        }
      }
    };
    this.getDirectivesNames = () => directivesNames;
    this.getDirectivesObject = () => directivesObject;
    this.isDirectiveName = (attributeName) => directivesRegexp.test(attributeName);
    this.addDirectives = (index2, ..._directives) => {
      if (isEnabled) {
        console.warn("Doars: Unable to add directives after being enabled!");
        return;
      }
      if (index2 < 0) {
        index2 = directives.length + index2 % directives.length;
      } else if (index2 > directives.length) {
        index2 = directives.length;
      }
      const results = [];
      for (let i = 0;i < _directives.length; i++) {
        const directive = _directives[i];
        if (directives.includes(directive)) {
          continue;
        }
        directives.splice(index2 + i, 0, directive);
        results.push(directive);
      }
      if (results.length > 0) {
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
        const index2 = directives.indexOf(directive);
        if (index2 < 0) {
          continue;
        }
        directives.slice(index2, 1);
        results.push(directive);
      }
      if (results.length > 0) {
        this.dispatchEvent("directives-removed", [this, results]);
      }
      return results;
    };
    this.getProcessor = () => {
      return processExpression;
    };
    this.accessed = async (attribute, path) => {
      if (Object.hasOwn(accessed, path)) {
        if (!accessed[path].includes(attribute)) {
          accessed[path].push(attribute);
        }
      } else {
        accessed[path] = [attribute];
      }
    };
    this.update = (path) => {
      if (!isEnabled) {
        return;
      }
      if (path && !triggers.includes(path)) {
        triggers.push(path);
      }
      return flush();
    };
    const flush = async () => {
      if (flushPromise) {
        return flushPromise;
      }
      flushPromise = new Promise((resolve) => {
        flushResolve = resolve;
      });
      await Promise.resolve();
      do {
        flushUpdates();
        flushMutations();
      } while (triggers.length > 0 || mutations.length > 0);
      flushPromise = null;
      flushResolve();
    };
    const flushUpdates = () => {
      if (triggers.length > 0) {
        const newTriggers = triggers;
        triggers = [];
        this.dispatchEvent("updating", newTriggers);
        const updatedAttributes = [];
        for (const trigger of newTriggers) {
          if (Object.hasOwn(accessed, trigger)) {
            const attributes = accessed[trigger];
            delete accessed[trigger];
            for (const attribute of attributes) {
              if (!updatedAttributes.includes(attribute)) {
                attribute.update();
                updatedAttributes.push(attribute);
              }
            }
          }
        }
        this.dispatchEvent("updated", newTriggers);
      }
    };
    const flushMutations = () => {
      if (mutations.length > 0) {
        const newMutations = mutations;
        mutations = [];
        const componentsToAdd = [];
        const componentsToRemove = [];
        const remove = (element) => {
          if (element.nodeType !== 1) {
            return;
          }
          if (componentByElement.has(element)) {
            componentsToRemove.unshift(element);
            const componentElements = element.querySelectorAll(componentName);
            for (const componentElement of componentElements) {
              if (componentByElement.has(componentElement)) {
                componentsToRemove.unshift(componentElement);
              }
            }
          } else {
            const iterator = walk(element, (element2) => {
              if (componentByElement.has(element2)) {
                componentsToRemove.unshift(element2);
                return false;
              }
              return true;
            });
            do {} while (element = iterator());
          }
        };
        const add = (element) => {
          if (element.nodeType !== 1) {
            return;
          }
          const ignoreParent = element.closest(`[${ignoreName}]`);
          if (ignoreParent) {
            return;
          }
          const componentElements = element.querySelectorAll(`[${componentName}]`);
          for (const componentElement of componentElements) {
            const ignoreParent2 = componentElement.closest(`[${ignoreName}]`);
            if (ignoreParent2) {
              continue;
            }
            componentsToAdd.push(componentElement);
          }
          if (element.hasAttribute(componentName)) {
            componentsToAdd.push(element);
            return;
          }
          const component = this.closestComponent(element);
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
              if (componentByElement.has(element)) {
                continue;
              }
              const component2 = this.closestComponent(element);
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
            const component = this.closestComponent(element);
            if (!component) {
              continue;
            }
            let attribute = null;
            if (element[ATTRIBUTES]) {
              for (const targetAttribute of element[ATTRIBUTES]) {
                if (targetAttribute.getName() === mutation.attributeName) {
                  attribute = targetAttribute;
                  break;
                }
              }
            }
            const value = element.getAttribute(mutation.attributeName);
            if (!attribute) {
              if (value) {
                attribute = component.addAttribute(element, mutation.attributeName, value);
                attribute.update();
              }
              continue;
            }
            attribute.setValue(value);
            attribute.update();
          }
        }
        if (componentsToRemove.length > 0) {
          removeComponents(...componentsToRemove);
        }
        if (componentsToAdd.length > 0) {
          addComponents(...componentsToAdd);
        }
      }
    };
  }
}

// src/utilities/Call.js
var PATH_VALIDATOR = /^[a-z$_]+[0-9a-z$_]*(?:\.[a-z$_]+[0-9a-z$_]*)*$/is;
var call = (component, attribute, expression, extra = null, options = null) => {
  const { contexts, destroy: destroy3 } = createContexts(component, attribute, extra, options);
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
        console.error("ExpressionError in:", expression, `
${error.name}: ${error.message}`);
        result = null;
      }
    }
  }
  destroy3();
  if (!options || options?.return) {
    return result;
  }
};

// src/DoarsCall.js
Doars.callExpression = call;
var DoarsCall_default = Doars;
export {
  DoarsCall_default as default
};

//# debugId=B2EAD1A0E2DDC5E264756E2164756E21
