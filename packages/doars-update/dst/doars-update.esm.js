// src/contexts/update.js
var update_default = ({
  updateContextName
}, updater) => {
  const id = updater.getId();
  const proxy = updater.getProxy();
  const time = updater.getTime();
  return {
    name: updateContextName,
    create: (component, attribute) => {
      const onGet = (target, path) => attribute.accessed(id, path.join("."));
      proxy.addEventListener("get", onGet);
      return {
        value: time,
        // Remove event listeners.
        destroy: () => {
          proxy.removeEventListener("get", onGet);
        }
      };
    }
  };
};

// src/directives/update.js
var update_default2 = ({
  defaultOrder,
  updateDirectiveName
}) => {
  const itemIds = [];
  const items = [];
  const directive = {
    name: updateDirectiveName,
    update: (component, attribute, processExpression) => {
      if (!directive._execute) {
        directive._execute = processExpression;
      }
      const id = attribute.getId();
      if (itemIds.indexOf(id) >= 0) {
        return;
      }
      let { order } = attribute.getModifiers();
      if (!order) {
        order = defaultOrder;
      }
      let index = 0;
      for (let i = 0; i < items.length; i++) {
        if (items[i].order >= order) {
          index = i;
          break;
        }
      }
      items.splice(index, 0, {
        attribute,
        component,
        order
      });
    },
    destroy: (component, attribute) => {
      const id = attribute.getId();
      const index = itemIds.indexOf(id);
      if (index >= 0) {
        return;
      }
      itemIds.splice(index, 1);
      for (let i = 0; i < items.length; i++) {
        if (items[i].attribute === attribute) {
          items.splice(i, 1);
          break;
        }
      }
    }
  };
  return [
    directive,
    () => {
      for (const item of items) {
        directive._execute(
          item.component,
          item.attribute.clone(),
          item.attribute.getValue(),
          {},
          {
            return: false
          }
        );
      }
    }
  ];
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
var RevocableProxy_default = (target, handler) => {
  let revoked = false;
  const revocableHandler = {};
  for (const key of PROXY_TRAPS) {
    revocableHandler[key] = (...parameters) => {
      if (revoked) {
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
  /**
   * Creates a proxy dispatcher instance.
   * @param {ProxyOptions} options Options for proxy dispatcher.
   */
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

// src/Updater.js
var Updater = class {
  /**
   * @param {object} options Updater options.
   * @param {number} options.stepMinimum Minimum duration of a tick in milliseconds.
   * @param {UpdateCallback} callback Called every update tick.
   */
  constructor({
    stepMinimum
  }, callback) {
    const id = Symbol("ID_UPDATE");
    let isEnabled = false, request;
    const proxy = new ProxyDispatcher({
      // We don't care when they are updated, we have a callback for that. They should never be updated by the user anyway.
      delete: false,
      set: false
    });
    const time = proxy.add({});
    const update = (timeAbsolute) => {
      if (!isEnabled) {
        return;
      }
      request = window.requestAnimationFrame(update);
      if (!time.startMs) {
        time.currentMs = time.lastMs = time.startMs = timeAbsolute;
        time.current = time.last = time.start = timeAbsolute / 1e3;
        time.delta = time.passed = time.deltaMs = time.passedMs = 0;
        return;
      }
      const deltaMs = timeAbsolute - time.lastMs;
      if (deltaMs <= stepMinimum) {
        return;
      }
      time.lastMs = time.currentMs;
      time.last = time.current;
      time.currentMs = timeAbsolute;
      time.current = timeAbsolute / 1e3;
      time.deltaMs = deltaMs;
      time.delta = deltaMs / 1e3;
      time.passedMs += deltaMs;
      time.passed = time.passedMs / 1e3;
      callback();
    };
    this.isEnabled = () => {
      return isEnabled;
    };
    this.getId = () => {
      return id;
    };
    this.getProxy = () => {
      return proxy;
    };
    this.getTime = () => {
      return time;
    };
    this.enable = () => {
      if (isEnabled) {
        return;
      }
      isEnabled = true;
      request = window.requestAnimationFrame(update);
    };
    this.disable = () => {
      if (!isEnabled) {
        return;
      }
      isEnabled = false;
      if (request) {
        cancelAnimationFrame(request);
        request = null;
      }
    };
  }
};

// src/DoarsUpdate.js
function DoarsUpdate_default(library, options = null) {
  options = Object.assign({
    defaultOrder: 500,
    stepMinimum: 0,
    updateContextName: "$update",
    updateDirectiveName: "update"
  }, options);
  let isEnabled = false;
  const updater = new Updater(
    options,
    () => {
      update();
      library.update([{
        id: updater.getId(),
        path: "current"
      }, {
        id: updater.getId(),
        path: "delta"
      }, {
        id: updater.getId(),
        path: "last"
      }, {
        id: updater.getId(),
        path: "passed"
      }]);
    }
  );
  const contextUpdate = update_default(options, updater);
  const [directiveUpdate, update] = update_default2(options);
  const onEnable = () => {
    library.addContexts(0, contextUpdate);
    library.addDirectives(-1, directiveUpdate);
    updater.enable();
  };
  const onDisable = () => {
    library.removeContexts(contextUpdate);
    library.removeDirectives(directiveUpdate);
    updater.disable();
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
  DoarsUpdate_default as default
};
//# sourceMappingURL=doars-update.esm.js.map
