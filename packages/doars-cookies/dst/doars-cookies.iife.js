(() => {
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
      this.addEventListener = (name2, callback, options = null) => {
        if (!(name2 in events)) {
          events[name2] = [];
        }
        events[name2].push({
          callback,
          options
        });
      };
      this.removeEventListener = (name2, callback) => {
        if (!Object.keys(events).includes(name2)) {
          return;
        }
        const eventData = events[name2];
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
          delete events[name2];
        }
      };
      this.removeEventListeners = (name2) => {
        if (!name2) {
          return;
        }
        delete events[name2];
      };
      this.removeAllEventListeners = () => {
        events = {};
      };
      this.dispatchEvent = (name2, parameters, options = null) => {
        if (!events[name2]) {
          return;
        }
        const eventData = events[name2];
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

  // src/utilities/cookies.js
  var _cookies = null;
  var getAll = () => {
    if (_cookies === null) {
      _cookies = Object.fromEntries(
        document.cookie.split(/; */).map((cookie) => {
          const [key, ...value] = cookie.split("=");
          return [key, decodeURIComponent(value.join("="))];
        })
      );
    }
    return _cookies;
  };
  var set = (name2, value = "", days = 60) => {
    name2 = name2.trim();
    if (!value || value === "") {
      document.cookie = name2 + "=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/; SameSite=Strict;";
      if (_cookies !== null) {
        delete _cookies[name2];
      }
    } else {
      let expires = "";
      if (days) {
        const date = /* @__PURE__ */ new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name2 + "=" + encodeURIComponent(value) + expires + "; Path=/; SameSite=Strict;";
      getAll();
      _cookies[name2] = value;
    }
  };

  // src/factories/contexts/cookies.js
  var name = "$cookies";
  var cookies_default = (options, id2, state, proxy) => ({
    deconstruct: !!options.deconstruct,
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

  // src/DoarsCookies.js
  var id = Symbol("ID_COOKIES");
  function DoarsCookies_default(library, options = null) {
    options = Object.assign({
      deconstruct: false
    }, options);
    let isEnabled = false;
    let contextCookies, data, proxy, cookies;
    const onMutate = (target, path) => {
      if (path.length > 1) {
        console.warn('Nested cookies impossible tried to set "' + path.join(".") + '".');
      }
      set(path[0], target[path[0]]);
    };
    const onEnable = function() {
      data = getAll();
      proxy = new ProxyDispatcher_default();
      cookies = proxy.add(data);
      proxy.addEventListener("delete", onMutate);
      proxy.addEventListener("set", onMutate);
      contextCookies = cookies_default(options, id, cookies, proxy);
      const existingContexts = library.getContexts();
      let stateIndex = 0;
      for (let i = existingContexts.length - 1; i >= 0; i--) {
        const context = existingContexts[i];
        if (context.name === "$state") {
          stateIndex = i;
          break;
        }
      }
      library.addContexts(stateIndex, contextCookies);
    };
    const onDisable = function() {
      library.removeContexts(contextCookies);
      proxy.removeEventListener("delete", onMutate);
      proxy.removeEventListener("set", onMutate);
      cookies = null;
      proxy.remove(data);
      proxy = null;
      data = null;
      contextCookies = null;
    };
    this.disable = function() {
      if (!library.getEnabled() && isEnabled) {
        isEnabled = false;
        library.removeEventListener("enabling", onEnable);
        library.removeEventListener("disabling", onDisable);
      }
    };
    this.enable = function() {
      if (!isEnabled) {
        isEnabled = true;
        library.addEventListener("enabling", onEnable);
        library.addEventListener("disabling", onDisable);
      }
    };
    this.enable();
  }

  // src/DoarsCookies.iife.js
  window.DoarsCookies = DoarsCookies_default;
})();
//# sourceMappingURL=doars-cookies.iife.js.map
