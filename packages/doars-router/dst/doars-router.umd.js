(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DoarsRouter = factory());
})(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  // List of methods to revoke access to.
  var REFLECTION_METHODS = ['apply', 'construct', 'defineProperty', 'deleteProperty', 'get', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'isExtensible', 'ownKeys', 'preventExtensions', 'set', 'setPrototypeOf'];
  /**
   * Revocable proxy made using regular a proxy and a simple boolean.
   */

  var RevocableProxy = (function (target, handler) {
    // Keep track of status.
    var revoked = false; // Add revocable handlers for each given handlers.

    var revocableHandler = {};

    var _iterator = _createForOfIteratorHelper(REFLECTION_METHODS),
        _step;

    try {
      var _loop = function _loop() {
        var key = _step.value;

        revocableHandler[key] = function () {
          if (revoked) {
            console.error('illegal operation attempted on a revoked proxy');
            return;
          }

          if (key in handler) {
            return handler[key].apply(handler, arguments);
          }

          return Reflect[key].apply(Reflect, arguments);
        };
      };

      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _loop();
      } // Return proxy and revoke method.

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return {
      proxy: new Proxy(target, revocableHandler),
      revoke: function revoke() {
        revoked = true;
      }
    };
  });

  var ROUTE_TO = Symbol('ROUTE_TO');
  var ROUTER = Symbol('ROUTER');
  var ROUTE = Symbol('ROUTE');

  // Import symbols.
  /**
   * Get closest router in hierarchy.
   * @param {HTMLElement} element Element to start searching from.
   * @returns {Router} Closest router.
   */

  var closestRouter = function closestRouter(element) {
    if (!element.parentElement) {
      return;
    }

    element = element.parentElement;

    if (element[ROUTER]) {
      return element[ROUTER];
    }

    return closestRouter(element);
  };

  // Import polyfill.
  var contextRouter = {
    name: '$router',
    create: function create(component, attribute) {
      // Deconstruct attribute.
      var element = attribute.getElement();
      var router = null;
      var revocable = RevocableProxy({}, {
        get: function get(target, propertyKey, receiver) {
          // Get closest router from hierarchy.
          if (router === null) {
            if (element[ROUTER]) {
              router = element[ROUTER];
            } else {
              router = closestRouter(element);
            } // Set router to false so we don't look twice.


            if (!router) {
              router = false;
            }
          } // Mark as router accessed.


          attribute.accessed(router.getId(), '');

          if (!router) {
            return;
          } // Return router property.


          return Reflect.get(router, propertyKey, receiver);
        }
      });
      return {
        value: revocable.proxy,
        destroy: function destroy() {
          revocable.revoke();
        }
      };
    }
  };

  /**
   * Tokenize input string.
   */
  function lexer(str) {
    var tokens = [];
    var i = 0;

    while (i < str.length) {
      var char = str[i];

      if (char === "*" || char === "+" || char === "?") {
        tokens.push({
          type: "MODIFIER",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "\\") {
        tokens.push({
          type: "ESCAPED_CHAR",
          index: i++,
          value: str[i++]
        });
        continue;
      }

      if (char === "{") {
        tokens.push({
          type: "OPEN",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === "}") {
        tokens.push({
          type: "CLOSE",
          index: i,
          value: str[i++]
        });
        continue;
      }

      if (char === ":") {
        var name = "";
        var j = i + 1;

        while (j < str.length) {
          var code = str.charCodeAt(j);

          if ( // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95) {
            name += str[j++];
            continue;
          }

          break;
        }

        if (!name) throw new TypeError("Missing parameter name at " + i);
        tokens.push({
          type: "NAME",
          index: i,
          value: name
        });
        i = j;
        continue;
      }

      if (char === "(") {
        var count = 1;
        var pattern = "";
        var j = i + 1;

        if (str[j] === "?") {
          throw new TypeError("Pattern cannot start with \"?\" at " + j);
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
              throw new TypeError("Capturing groups are not allowed at " + j);
            }
          }

          pattern += str[j++];
        }

        if (count) throw new TypeError("Unbalanced pattern at " + i);
        if (!pattern) throw new TypeError("Missing pattern at " + i);
        tokens.push({
          type: "PATTERN",
          index: i,
          value: pattern
        });
        i = j;
        continue;
      }

      tokens.push({
        type: "CHAR",
        index: i,
        value: str[i++]
      });
    }

    tokens.push({
      type: "END",
      index: i,
      value: ""
    });
    return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */


  function parse(str, options) {
    if (options === void 0) {
      options = {};
    }

    var tokens = lexer(str);
    var _a = options.prefixes,
        prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";

    var tryConsume = function tryConsume(type) {
      if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    };

    var mustConsume = function mustConsume(type) {
      var value = tryConsume(type);
      if (value !== undefined) return value;
      var _a = tokens[i],
          nextType = _a.type,
          index = _a.index;
      throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    };

    var consumeText = function consumeText() {
      var result = "";
      var value; // tslint:disable-next-line

      while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
        result += value;
      }

      return result;
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
          prefix: prefix,
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
          prefix: prefix,
          suffix: suffix,
          modifier: tryConsume("MODIFIER") || ""
        });
        continue;
      }

      mustConsume("END");
    }

    return result;
  }
  /**
   * Escape a regular expression string.
   */

  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */


  function flags(options) {
    return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */


  function regexpToRegexp(path, keys) {
    if (!keys) return path;
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
  /**
   * Transform an array into a regexp.
   */


  function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) {
      return pathToRegexp(path, keys, options).source;
    });
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  /**
   * Create a path regexp from string input.
   */


  function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
  }
  /**
   * Expose a function for taking tokens and returning a RegExp.
   */


  function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) {
      options = {};
    }

    var _a = options.strict,
        strict = _a === void 0 ? false : _a,
        _b = options.start,
        start = _b === void 0 ? true : _b,
        _c = options.end,
        end = _c === void 0 ? true : _c,
        _d = options.encode,
        encode = _d === void 0 ? function (x) {
      return x;
    } : _d;
    var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
    var route = start ? "^" : ""; // Iterate over the tokens and create our regexp string.

    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
      var token = tokens_1[_i];

      if (typeof token === "string") {
        route += escapeString(encode(token));
      } else {
        var prefix = escapeString(encode(token.prefix));
        var suffix = escapeString(encode(token.suffix));

        if (token.pattern) {
          if (keys) keys.push(token);

          if (prefix || suffix) {
            if (token.modifier === "+" || token.modifier === "*") {
              var mod = token.modifier === "*" ? "?" : "";
              route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
            } else {
              route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
            }
          } else {
            route += "(" + token.pattern + ")" + token.modifier;
          }
        } else {
          route += "(?:" + prefix + suffix + ")" + token.modifier;
        }
      }
    }

    if (end) {
      if (!strict) route += delimiter + "?";
      route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    } else {
      var endToken = tokens[tokens.length - 1];
      var isEndDelimited = typeof endToken === "string" ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
      endToken === undefined;

      if (!strict) {
        route += "(?:" + delimiter + "(?=" + endsWith + "))?";
      }

      if (!isEndDelimited) {
        route += "(?=" + delimiter + "|" + endsWith + ")";
      }
    }

    return new RegExp(route, flags(options));
  }
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */

  function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) return regexpToRegexp(path, keys);
    if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
  }

  var EventDispatcher = /*#__PURE__*/_createClass(
  /**
   * Create instance.
   */
  function EventDispatcher() {
    _classCallCheck(this, EventDispatcher);

    var events = {};
    /**
     * Add callback to event.
     * @param {String} name Event name.
     * @param {Function} callback Function to call on dispatch.
     * @param {Object} options Callback options.
     */

    this.addEventListener = function (name, callback) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      // Check if event name exits and callback is not already present.
      if (!(name in events)) {
        events[name] = [];
      } // Add to events.


      events[name].push({
        callback: callback,
        options: options
      });
    };
    /**
     * Remove callback from event.
     * @param {String} name Event name.
     * @param {Function} callback Function that would be called.
     */


    this.removeEventListener = function (name, callback) {
      // Check if event exists.
      if (!Object.keys(events).includes(name)) {
        return;
      }

      var eventData = events[name]; // Get index of callback in events.

      var index = -1;

      for (var i = 0; i < eventData.length; i++) {
        if (eventData[i].callback === callback) {
          index = i;
          break;
        }
      }

      if (index < 0) {
        return;
      } // Remove item from events.


      eventData.splice(index, 1); // Remove event if list is empty.

      if (Object.keys(eventData).length === 0) {
        delete events[name];
      }
    };
    /**
     * Remove listeners to an event.
     * @param {String} name Event name.
     */


    this.removeEventListeners = function (name) {
      if (!name) {
        return;
      } // Remove all handlers with the event name.


      delete events[name];
    };
    /**
     * Remove all listeners.
     * @param {String} name Event name.
     */


    this.removeAllEventListeners = function () {
      // Remove all listeners.
      events = {};
    };
    /**
     * Trigger event and dispatch data to listeners.
     * @param {String} name Event name.
     * @param {Array<Any>} parameters Event parameters to pass through.
     * @param {Object} options Dispatch options.
     */


    this.dispatchEvent = function (name, parameters) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      // Check if event exists.
      if (!events[name]) {
        return;
      } // Get events by trigger name.


      var eventData = events[name]; // Dispatch a call to each event.

      for (var i = 0; i < eventData.length; i++) {
        var event = options && options.reverse ? eventData[eventData.length - (i + 1)] : eventData[i]; // If once is truthy then remove the callback.

        if (event.options && event.options.once) {
          eventData.splice(i, 1);
        } // Execute callback.


        event.callback.apply(event, _toConsumableArray(parameters));
      }
    };
  });

  var Router = /*#__PURE__*/function (_EventDispatcher) {
    _inherits(Router, _EventDispatcher);

    var _super = _createSuper(Router);

    function Router() {
      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Router);

      _this = _super.call(this); // Create id.

      var id = Symbol('ID_ROUTER'); // Overwrite default with given options.

      options = Object.assign({
        basePath: '',
        path: null,
        pathToRegexp: {},
        updateHistory: false
      }, options);
      var path = options.path;
      var route = null;
      var routes = {}; // Listen for history state changes.

      var handleHistory = function handleHistory() {
        _this.setPath(window.location.pathname);
      };

      if (options.updateHistory) {
        window.addEventListener('popstate', handleHistory);
      }
      /**
       * Update route.
       * @param {String} url URL.
       * @param {String} _path Path.
       * @param {String} _route Route.
       */


      var updateRoute = function updateRoute(url, newPath, newRoute) {
        // Update stored data.
        path = newPath;
        route = newRoute; // Update page history if the option is set.

        if (options.updateHistory) {
          // Construct url.
          var _url = url.includes(options.basePath) ? url : options.basePath + url; // Check if url is not current url.


          if (_url !== window.location.pathname) {
            // Add path to history.
            window.history.pushState(null, window.document.title, _url);
          }
        } // Dispatch event on router.


        _this.dispatchEvent('changed', [_assertThisInitialized(_this), route, path]);
      };
      /**
       * Get router id.
       * @returns {Symbol} Unique identifier.
       */


      _this.getId = function () {
        return id;
      };
      /**
       * Get current path.
       * @returns {String} path.
       */


      _this.getPath = function () {
        return path;
      };
      /**
       * Get current route.
       * @returns {String} Route.
       */


      _this.getRoute = function () {
        return route;
      };
      /**
       * Get observed routes.
       * @returns {Array<String>} List of routers.
       */


      _this.getRoutes = function () {
        return Object.keys(routes);
      };
      /**
       * Destroy router instance.
       */


      _this.destroy = function () {
        // Stop listening to state changes.
        if (options.updateHistory) {
          window.removeEventListener('popstate', handleHistory);
        }

        options = null;
        path = null;
        route = null;
        routes = null; // Dispatch add event.

        _this.dispatchEvent('destroyed', [_assertThisInitialized(_this)]); // Remove all listeners.


        _this.removeAllEventListeners();
      };
      /**
       * Add route.
       * @param {String} _route Route pattern.
       */


      _this.addRoute = function (_route) {
        // Convert path to regexp and store it in routes.
        routes[_route] = pathToRegexp(_route, [], options.pathToRegexp); // Dispatch add event.

        _this.dispatchEvent('added', [_assertThisInitialized(_this), _route]);

        if (path) {
          // Remove base url, if present.
          var _path = path.replace(options.basePath, ''); // Check if current route is.


          if (routes[_route].test(_path)) {
            updateRoute(path, _path, _route);
          }
        }
      };
      /**
       * Remove route.
       * @param {String} _route Route pattern.
       */


      _this.removeRoute = function (_route) {
        // Delete route.
        delete routes[_route]; // Dispatch removed event.

        _this.dispatchEvent('removed', [_assertThisInitialized(_this), _route]);

        if (route === _route) {
          // Set current route as none.
          path = null;
          route = null; // Dispatch changed event.

          _this.dispatchEvent('changed', [_assertThisInitialized(_this), route, path]);
        }
      };
      /**
       * Set current route.
       * @param {String} url URL path.
       */


      _this.setPath = function (url) {
        // Remove base url, if present.
        var newPath = url.replace(options.basePath, '');

        if (path === newPath) {
          return;
        } // Find matching routes.


        var newRoute = null;

        for (var _route in routes) {
          // Test route.
          if (routes[_route].test(newPath)) {
            newRoute = _route;
            break;
          }
        } // Update route.


        updateRoute(url, newPath, newRoute);
      };

      return _this;
    }

    return _createClass(Router);
  }(EventDispatcher);

  // Import router.
  var createDirectiveRouter = (function (routerOptions) {
    return {
      name: 'router',
      update: function update(component, attribute, _ref) {
        var executeExpression = _ref.executeExpression;
        // Deconstruct attribute.
        var element = attribute.getElement(); // Get router.

        var router = element[ROUTER];

        if (!router) {
          // Construct options.
          var options = Object.assign({}, routerOptions, executeExpression(component, attribute.clone(), attribute.getValue())); // Create router

          router = element[ROUTER] = new Router(options);
        }
      },
      destroy: function destroy(component, attribute) {
        // Deconstruct attribute.
        var element = attribute.getElement(); // Get router.

        var router = element[ROUTER];

        if (!router) {
          return;
        } // Remove router reference.


        delete element[ROUTER]; // Deconstruct router.

        var id = router.getId(); // Destroy router.

        router.destroy(); // Deconstruct component.

        var library = component.getLibrary(); // Trigger update due to changed router.

        library.update([{
          id: id,
          path: ''
        }]);
      }
    };
  });

  /**
   * Convert string to HTML element.
   * @param {String} string Element contents.
   * @returns {HTMLElement} HTML element part of a document fragment.
   */
  /**
   * Inserts an element after the reference element opposite of insertBefore and more reliable then ChildNode.after()
   * @param {HTMLElement} reference Node to insert after.
   * @param {Node} node Node to insert.
   */

  var insertAfter = function insertAfter(reference, node) {
    if (reference.nextSibling) {
      reference.parentNode.insertBefore(node, reference.nextSibling);
    } else {
      reference.parentNode.appendChild(node);
    }
  };

  // Import symbols.
  var directiveRoute = {
    name: 'route',
    update: function update(component, attribute, _ref) {
      var transitionIn = _ref.transitionIn,
          transitionOut = _ref.transitionOut;
      // Deconstruct attribute.
      var element = attribute.getElement();
      var router;

      var setup = function setup() {
        // Stop listening to router and remove it.
        if (router && attribute[ROUTE]) {
          router.removeEventListener('changed', attribute[ROUTE].handler);
          router.removeEventListener('destroyed', attribute[ROUTE].setup);
          delete attribute[ROUTE];
        } // Get closest router in parent nodes.


        router = closestRouter(element);

        if (!router) {
          console.warn('DoarsRouter: Router not found for route.');
          return;
        } // Setup route data.


        attribute[ROUTE] = {
          setup: setup
        }; // Deconstruct attribute.

        var value = attribute.getValue(); // Add route to router.

        router.addRoute(value); // Handle router changes.

        var handleChange = function handleChange(router, route) {
          if (route !== value) {
            if (element.tagName === 'TEMPLATE') {
              if (attribute[ROUTE] && attribute[ROUTE].element) {
                // Transition out.
                var routeElement = attribute[ROUTE].element;
                transitionOut(component, routeElement, function () {
                  // Remove node.
                  routeElement.remove();
                  attribute[ROUTE].element = undefined;
                });
              }
            } else {
              // Transition out and set display none.
              transitionOut(component, element, function () {
                element.style.display = 'none';
              });
            }
          } else if (element.tagName === 'TEMPLATE') {
            // Create new element from template.
            var templateInstance = document.importNode(element.content, true); // Add element after the template element.

            insertAfter(element, templateInstance); // Get HTMLElement reference instead of DocumentFragment.

            attribute[ROUTE].element = element.nextSibling; // Transition in.

            transitionIn(component, attribute[ROUTE].element);
          } else {
            // Remove display none.
            element.style.display = null; // Transition in.

            transitionIn(component, element);
          }
        };

        attribute[ROUTE].handler = handleChange; // Listen to router changes and perform initial run.

        router.addEventListener('changed', handleChange);
        handleChange(router, router.getRoute()); // If the router is destroyed look for another

        router.addEventListener('destroyed', setup);
      }; // Perform initial setup.


      setup();
    },
    destroy: function destroy(component, attribute, _ref2) {
      var transitionOut = _ref2.transitionOut;
      // Deconstruct attribute.
      var element = attribute.getElement();

      if (element.tagName === 'TEMPLATE') {
        if (attribute[ROUTE] && attribute[ROUTE].element) {
          // Transition out.
          var routeElement = attribute[ROUTE].element;
          transitionOut(component, routeElement, function () {
            // Remove node.
            routeElement.remove();
            attribute[ROUTE].element = undefined;
          });
        }
      } else {
        // Transition out and set display none.
        transitionOut(component, element, function () {
          element.style.display = 'none';
        });
      } // Get closest router in parent nodes.


      var router = closestRouter(element);

      if (!router) {
        return;
      } // Remove router listeners.


      if (attribute[ROUTE]) {
        router.removeEventListener('destroyed', attribute[ROUTE].setup);

        if (attribute[ROUTE].handler) {
          router.removeEventListener('change', attribute[ROUTE].handler);
        }
      }
    }
  };

  // Import symbols.
  var directiveRouteTo = {
    name: 'route-to',
    update: function update(component, attribute) {
      var element = attribute.getElement();
      var modifiers = attribute.getModifiers();
      var value = attribute.getValue(); // Check for existing data.

      if (attribute[ROUTE_TO]) {
        // Exit early if listener has not changed.
        if (attribute[ROUTE_TO].value === value) {
          return;
        } // Remove existing listeners so we don't listen twice.


        attribute[ROUTE_TO].target.removeEventListener('click', attribute[ROUTE_TO].handler);
      }

      var handler = function handler(event) {
        if (modifiers.self && event.target !== element) {
          return;
        }

        if (modifiers.prevent) {
          event.preventDefault();
        }

        if (modifiers.stop) {
          event.stopPropagation();
        }

        var router = closestRouter(element);

        if (!router) {
          return;
        }

        router.setPath(value);
      }; // Listen to click and keyboard events.


      element.addEventListener('click', handler); // Store listener data on the component.

      attribute[ROUTE_TO] = {
        handler: handler,
        value: value
      };
    },
    destroy: function destroy(component, attribute) {
      if (!attribute[ROUTE_TO]) {
        return;
      }

      var element = attribute.getElement();
      element.removeEventListener('click', attribute[ROUTE_TO].handler);
      delete attribute[ROUTE_TO];
    }
  };

  /**
   * Deeply assign a series of objects properties together.
   * @param {Object} target Target object to merge to.
   * @param  {...Object} sources Objects to merge into the target.
   */
  var deepAssign = function deepAssign(target) {
    for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    if (!sources.length) {
      return target;
    }

    var source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (var key in source) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, {
              [key]: {}
            });
          }

          deepAssign(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
          target[key] = source[key].map(function (value) {
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

    return deepAssign.apply(void 0, [target].concat(sources));
  };
  /**
   * Check whether the value is an object.
   * @param {Any} value Value of unknown type.
   * @returns Whether the value is an object.
   */

  var isObject = function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  };

  var DoarsRouter = /*#__PURE__*/_createClass(
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  function DoarsRouter(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, DoarsRouter);

    // Clone options.
    options = deepAssign({}, options); // Set private variables.

    var directiveRouter; // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      // Add contexts and directives.
      library.addContexts(0, contextRouter);
      directiveRouter = createDirectiveRouter(options);
      library.addDirectives(-1, directiveRouter, directiveRoute, directiveRouteTo);
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      // Remove contexts and directives.
      library.removeContexts(contextRouter);
      library.removeDirectives(directiveRouter, directiveRoute, directiveRouteTo); // Remove router.

      directiveRouter = null;
    });
  });

  return DoarsRouter;

}));
//# sourceMappingURL=doars-router.umd.js.map
