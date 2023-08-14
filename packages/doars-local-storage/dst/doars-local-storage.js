// ../common/src/factories/createStateContext.js
var createStateContext_default = (name, id2, state, proxy, deconstruct) => ({
  deconstruct,
  name,
  create: (component, attribute, update, {
    RevocableProxy
  }) => {
    const onDelete = (target, path) => update(id2, name + "." + path.join("."));
    const onGet = (target, path) => attribute.accessed(id2, name + "." + path.join("."));
    const onSet = (target, path) => update(id2, name + "." + path.join("."));
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
});

// src/factories/contexts/localStorage.js
var localStorage_default = (id2, state, proxy, deconstruct) => createStateContext_default(
  "$localStorage",
  id2,
  state,
  proxy,
  deconstruct
);

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
        console.error("proxy revoked");
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

// ../common/src/events/ProxyDispatcher.js
var ProxyDispatcher = class extends EventDispatcher {
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

// src/utilities/localStorage.js
var getAll = () => {
  const data = {};
  const keys = Object.keys(localStorage);
  for (let i = keys.length - 1; i >= 0; i--) {
    data[keys[i]] = localStorage.getItem(keys[i]);
  }
  return data;
};

// src/DoarsLocalStorage.js
var id = Symbol("ID_LOCAL_STORAGE");
function DoarsLocalStorage_default(library, options = null) {
  options = Object.assign({
    deconstruct: false
  }, options);
  let isEnabled = false;
  let context, data, proxy, state;
  const onDelete = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    localStorage.removeItem(path[0]);
  };
  const onSet = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    localStorage.setItem(path[0], target[path[0]]);
  };
  const onEnable = () => {
    data = getAll();
    proxy = new ProxyDispatcher();
    state = proxy.add(data);
    proxy.addEventListener("delete", onDelete);
    proxy.addEventListener("set", onSet);
    context = localStorage_default(id, state, proxy, !!options.deconstruct);
    const existingContexts = library.getContexts();
    let stateIndex = 0;
    for (let i = existingContexts.length - 1; i >= 0; i--) {
      const context2 = existingContexts[i];
      if (context2.name === "$state") {
        stateIndex = i;
        break;
      }
    }
    library.addContexts(stateIndex, context);
  };
  const onDisable = () => {
    library.removeContexts(context);
    proxy.removeEventListener("delete", onDelete);
    proxy.removeEventListener("set", onSet);
    state = null;
    proxy.remove(data);
    proxy = null;
    data = null;
    context = null;
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
  DoarsLocalStorage_default as default
};
//# sourceMappingURL=doars-local-storage.js.map
