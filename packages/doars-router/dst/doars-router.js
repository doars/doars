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

// src/symbols.js
var ROUTE_TO = Symbol("ROUTE_TO");
var ROUTER = Symbol("ROUTER");
var ROUTE = Symbol("ROUTE");

// src/utilities/closestRouter.js
var closestRouter = (element) => {
  if (!element.parentElement) {
    return;
  }
  element = element.parentElement;
  if (element[ROUTER]) {
    return element[ROUTER];
  }
  return closestRouter(element);
};
var closestRouter_default = closestRouter;

// src/contexts/router.js
var router_default = {
  name: "$router",
  create: (component, attribute) => {
    const element = attribute.getElement();
    let router = null;
    const revocable = RevocableProxy_default({}, {
      get: (target, propertyKey, receiver) => {
        if (router === null) {
          if (element[ROUTER]) {
            router = element[ROUTER];
          } else {
            router = closestRouter_default(element);
          }
          if (!router) {
            router = false;
          }
        }
        attribute.accessed(router.getId(), "");
        if (!router) {
          return;
        }
        return Reflect.get(router, propertyKey, receiver);
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

// ../../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
  var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || defaultPattern,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            route += "((?:".concat(token.pattern, ")").concat(token.modifier, ")");
          } else {
            route += "(".concat(token.pattern, ")").concat(token.modifier);
          }
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}

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

// src/Router.js
var Router = class extends EventDispatcher_default {
  constructor(options = {}) {
    super();
    const id = Symbol("ID_ROUTER");
    options = Object.assign({
      basePath: "",
      path: null,
      pathToRegexp: {},
      updateHistory: false
    }, options);
    let path = options.path;
    let route = null;
    let routes = {};
    const handleHistory = () => {
      this.setPath(window.location.pathname);
    };
    if (options.updateHistory) {
      window.addEventListener("popstate", handleHistory);
    }
    const updateRoute = (url, newPath, newRoute) => {
      path = newPath;
      route = newRoute;
      if (options.updateHistory) {
        const _url = url.includes(options.basePath) ? url : options.basePath + url;
        if (_url !== window.location.pathname) {
          window.history.pushState(null, window.document.title, _url);
        }
      }
      this.dispatchEvent("changed", [this, route, path]);
    };
    this.getId = () => {
      return id;
    };
    this.getPath = () => {
      return path;
    };
    this.getRoute = () => {
      return route;
    };
    this.getRoutes = () => {
      return Object.keys(routes);
    };
    this.destroy = () => {
      if (options.updateHistory) {
        window.removeEventListener("popstate", handleHistory);
      }
      options = null;
      path = null;
      route = null;
      routes = null;
      this.dispatchEvent("destroyed", [this]);
      this.removeAllEventListeners();
    };
    this.addRoute = (_route) => {
      routes[_route] = pathToRegexp(_route, [], options.pathToRegexp);
      this.dispatchEvent("added", [this, _route]);
      if (path) {
        const _path = path.replace(options.basePath, "");
        if (routes[_route].test(_path)) {
          updateRoute(path, _path, _route);
        }
      }
    };
    this.removeRoute = (_route) => {
      delete routes[_route];
      this.dispatchEvent("removed", [this, _route]);
      if (route === _route) {
        path = null;
        route = null;
        this.dispatchEvent("changed", [this, route, path]);
      }
    };
    this.setPath = (url) => {
      const newPath = url.replace(options.basePath, "");
      if (path === newPath) {
        return;
      }
      let newRoute = null;
      for (const _route in routes) {
        if (routes[_route].test(newPath)) {
          newRoute = _route;
          break;
        }
      }
      updateRoute(url, newPath, newRoute);
    };
  }
};
var Router_default = Router;

// src/factories/directives/router.js
var router_default2 = (routerOptions) => {
  return {
    name: "router",
    update: (component, attribute, { processExpression }) => {
      const element = attribute.getElement();
      let router = element[ROUTER];
      if (!router) {
        const options = Object.assign({}, routerOptions, processExpression(component, attribute.clone(), attribute.getValue()));
        router = element[ROUTER] = new Router_default(options);
      }
    },
    destroy: (component, attribute) => {
      const element = attribute.getElement();
      const router = element[ROUTER];
      if (!router) {
        return;
      }
      delete element[ROUTER];
      const id = router.getId();
      router.destroy();
      const library = component.getLibrary();
      library.update([{ id, path: "" }]);
    }
  };
};

// ../common/src/utilities/Element.js
var insertAfter = (reference, node) => {
  if (reference.nextSibling) {
    reference.parentNode.insertBefore(node, reference.nextSibling);
  } else {
    reference.parentNode.appendChild(node);
  }
};

// src/directives/route.js
var route_default = {
  name: "route",
  update: (component, attribute, { transitionIn, transitionOut }) => {
    const element = attribute.getElement();
    let router;
    const setup = () => {
      if (router && attribute[ROUTE]) {
        router.removeEventListener("changed", attribute[ROUTE].handler);
        router.removeEventListener("destroyed", attribute[ROUTE].setup);
        delete attribute[ROUTE];
      }
      router = closestRouter_default(element);
      if (!router) {
        console.warn("DoarsRouter: Router not found for route.");
        return;
      }
      attribute[ROUTE] = {
        setup
      };
      const value = attribute.getValue();
      router.addRoute(value);
      const handleChange = (router2, route) => {
        if (route !== value) {
          if (element.tagName === "TEMPLATE") {
            if (attribute[ROUTE] && attribute[ROUTE].element) {
              const routeElement = attribute[ROUTE].element;
              transitionOut(component, routeElement, () => {
                routeElement.remove();
                attribute[ROUTE].element = void 0;
              });
            }
          } else {
            transitionOut(component, element, () => {
              element.style.display = "none";
            });
          }
        } else if (element.tagName === "TEMPLATE") {
          const templateInstance = document.importNode(element.content, true);
          insertAfter(element, templateInstance);
          attribute[ROUTE].element = element.nextSibling;
          transitionIn(component, attribute[ROUTE].element);
        } else {
          element.style.display = null;
          transitionIn(component, element);
        }
      };
      attribute[ROUTE].handler = handleChange;
      router.addEventListener("changed", handleChange);
      handleChange(router, router.getRoute());
      router.addEventListener("destroyed", setup);
    };
    setup();
  },
  destroy: (component, attribute, { transitionOut }) => {
    const element = attribute.getElement();
    if (element.tagName === "TEMPLATE") {
      if (attribute[ROUTE] && attribute[ROUTE].element) {
        const routeElement = attribute[ROUTE].element;
        transitionOut(component, routeElement, () => {
          routeElement.remove();
          attribute[ROUTE].element = void 0;
        });
      }
    } else {
      transitionOut(component, element, () => {
        element.style.display = "none";
      });
    }
    const router = closestRouter_default(element);
    if (!router) {
      return;
    }
    if (attribute[ROUTE]) {
      router.removeEventListener("destroyed", attribute[ROUTE].setup);
      if (attribute[ROUTE].handler) {
        router.removeEventListener("change", attribute[ROUTE].handler);
      }
    }
  }
};

// src/directives/routeTo.js
var CLICK = "click";
var routeTo_default = {
  name: "route-to",
  update: (component, attribute) => {
    const element = attribute.getElement();
    const modifiers = attribute.getModifiers();
    const value = attribute.getValue();
    if (attribute[ROUTE_TO]) {
      if (attribute[ROUTE_TO].value === value) {
        return;
      }
      attribute[ROUTE_TO].target.removeEventListener(CLICK, attribute[ROUTE_TO].handler);
    }
    const handler = (event) => {
      if (modifiers.self && event.target !== element) {
        return;
      }
      if (modifiers.prevent) {
        event.preventDefault();
      }
      if (modifiers.stop) {
        event.stopPropagation();
      }
      const router = closestRouter_default(element);
      if (!router) {
        return;
      }
      router.setPath(value);
    };
    element.addEventListener(CLICK, handler);
    attribute[ROUTE_TO] = {
      handler,
      value
    };
  },
  destroy: (component, attribute) => {
    if (!attribute[ROUTE_TO]) {
      return;
    }
    const element = attribute.getElement();
    element.removeEventListener(CLICK, attribute[ROUTE_TO].handler);
    delete attribute[ROUTE_TO];
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

// src/DoarsRouter.js
function DoarsRouter_default(library, options = null) {
  options = deepAssign({}, options);
  let isEnabled = false;
  let directiveRouter;
  const onEnable = function() {
    library.addContexts(0, router_default);
    directiveRouter = router_default2(options);
    library.addDirectives(-1, directiveRouter, route_default, routeTo_default);
  };
  const onDisable = function() {
    library.removeContexts(router_default);
    library.removeDirectives(directiveRouter, route_default, routeTo_default);
    directiveRouter = null;
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
export {
  DoarsRouter_default as default
};
//# sourceMappingURL=doars-router.js.map
