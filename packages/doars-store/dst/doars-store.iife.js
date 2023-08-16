(() => {
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

  // src/factories/contexts/store.js
  var store_default = (id2, state, proxy, deconstruct) => createStateContext_default(
    "$store",
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

  // src/DoarsStore.js
  var id = Symbol("ID_STORE");
  function DoarsStore_default(library, options = null, dataStore = {}) {
    options = Object.assign({
      deconstruct: false
    }, options);
    let isEnabled = false;
    let contextStore, data, proxy, store;
    const onEnable = () => {
      data = deepAssign({}, dataStore);
      proxy = new ProxyDispatcher();
      store = proxy.add(data);
      contextStore = store_default(id, store, proxy, !!options.deconstruct);
      const existingContexts = library.getContexts();
      let stateIndex = 0;
      for (let i = existingContexts.length - 1; i >= 0; i--) {
        const context = existingContexts[i];
        if (context.name === "$state") {
          stateIndex = i;
          break;
        }
      }
      library.addContexts(stateIndex, contextStore);
    };
    const onDisable = () => {
      library.removeContexts(contextStore);
      store = null;
      proxy.remove(data);
      proxy = null;
      data = null;
      contextStore = null;
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

  // src/DoarsStore.iife.js
  window.DoarsStore = DoarsStore_default;
})();
//# sourceMappingURL=doars-store.iife.js.map
