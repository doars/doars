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

// ../common/src/factories/createState.js
var createState_default = (name, id, state, proxy) => {
  return (component, attribute, update) => {
    const onDelete = (target, path) => update(id, name + "." + path.join("."));
    const onGet = (target, path) => attribute.accessed(id, name + "." + path.join("."));
    const onSet = (target, path) => update(id, name + "." + path.join("."));
    proxy.addEventListener("delete", onDelete);
    proxy.addEventListener("get", onGet);
    proxy.addEventListener("set", onSet);
    const revocable = RevocableProxy_default(state, {});
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
  };
};

// ../common/src/factories/createStateContext.js
var createStateContext_default = (name, id, state, proxy, deconstruct) => ({
  deconstruct,
  name,
  create: createState_default(
    name,
    id,
    state,
    proxy
  )
});

// src/utilities/cookies.js
var _cache = null;
var getAll = () => {
  if (_cache === null) {
    _cache = Object.fromEntries(
      document.cookie.split(/; */).map((cookie) => {
        const [key, ...value] = cookie.split("=");
        return [key, decodeURIComponent(value.join("="))];
      })
    );
  }
  return _cache;
};
var set = (name, value = "", days = 60) => {
  name = name.trim();
  if (!value || value === "") {
    document.cookie = name + "=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/; SameSite=Strict;";
    if (_cache !== null) {
      delete _cache[name];
    }
  } else {
    let expires = "";
    if (days) {
      const date = /* @__PURE__ */ new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; Path=/; SameSite=Strict;";
    getAll();
    _cache[name] = value;
  }
};

// src/contexts/cookies.js
var cookies_default = ({
  cookiesContextDeconstruct,
  cookiesContextName
}) => {
  const proxy = new ProxyDispatcher();
  const onMutate = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested cookies impossible tried to set "' + path.join(".") + '".');
    }
    set(path[0], target[path[0]]);
  };
  proxy.addEventListener("delete", onMutate);
  proxy.addEventListener("set", onMutate);
  return createStateContext_default(
    cookiesContextName,
    Symbol("ID_COOKIES"),
    proxy.add(getAll()),
    proxy,
    !!cookiesContextDeconstruct
  );
};

// src/utilities/localStorage.js
var getAll2 = () => {
  const data = {};
  const keys = Object.keys(localStorage);
  for (let i = keys.length - 1; i >= 0; i--) {
    data[keys[i]] = localStorage.getItem(keys[i]);
  }
  return data;
};

// src/contexts/localStorage.js
var localStorage_default = ({
  localStorageContextDeconstruct,
  localStorageContextName
}) => {
  const proxy = new ProxyDispatcher();
  proxy.addEventListener("delete", (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    localStorage.removeItem(path[0]);
  });
  proxy.addEventListener("set", (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    localStorage.setItem(path[0], target[path[0]]);
  });
  return createStateContext_default(
    localStorageContextName,
    Symbol("ID_LOCAL_STORAGE"),
    proxy.add(getAll2()),
    proxy,
    !!localStorageContextDeconstruct
  );
};

// src/utilities/sessionStorage.js
var getAll3 = () => {
  const data = {};
  const keys = Object.keys(sessionStorage);
  for (let i = keys.length - 1; i >= 0; i--) {
    data[keys[i]] = sessionStorage.getItem(keys[i]);
  }
  return data;
};

// src/contexts/sessionStorage.js
var sessionStorage_default = ({
  sessionStorageContextDeconstruct,
  sessionStorageContextName
}) => {
  const proxy = new ProxyDispatcher();
  proxy.addEventListener("delete", (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    sessionStorage.removeItem(path[0]);
  });
  proxy.addEventListener("set", (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join(".") + '".');
    }
    sessionStorage.setItem(path[0], target[path[0]]);
  });
  return createStateContext_default(
    sessionStorageContextName,
    Symbol("ID_LOCAL_STORAGE"),
    proxy.add(getAll3()),
    proxy,
    !!sessionStorageContextDeconstruct
  );
};

// src/DoarsPersist.js
function DoarsPersist_default(library, options = null) {
  options = Object.assign({
    cookiesContextDeconstruct: false,
    cookiesContextName: "$cookies",
    localStorageContextDeconstruct: false,
    localStorageContextName: "$localStorage",
    sessionStorageContextDeconstruct: false,
    sessionStorageContextName: "$sessionStorage"
  }, options);
  let isEnabled = false;
  let cookiesContext, localStorageContext, sessionStorageContext;
  const onEnable = () => {
    cookiesContext = cookies_default(options);
    localStorageContext = localStorage_default(options);
    sessionStorageContext = sessionStorage_default(options);
    const existingContexts = library.getContexts();
    let stateIndex = 0;
    for (let i = existingContexts.length - 1; i >= 0; i--) {
      const context = existingContexts[i];
      if (context.name === "$state") {
        stateIndex = i;
        break;
      }
    }
    library.addContexts(
      stateIndex,
      cookiesContext,
      localStorageContext,
      sessionStorageContext
    );
  };
  const onDisable = () => {
    library.removeContexts(
      cookiesContext,
      localStorageContext,
      sessionStorageContext
    );
    cookiesContext = null;
    localStorageContext = null;
    sessionStorageContext = null;
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
  DoarsPersist_default as default
};
//# sourceMappingURL=doars-persist.esm.js.map
