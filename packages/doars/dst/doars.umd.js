(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Doars = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
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

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

  var ATTRIBUTES = Symbol('ATTRIBUTES');
  var COMPONENT = Symbol('COMPONENT');
  var COMPONENT_SUFFIX = '-state';
  var FOR = Symbol('FOR');
  var IF = Symbol('IF');
  var INITIALIZED = Symbol('INITIALIZED');
  var SYNC_STATE = Symbol('SYNC_STATE');
  var ON = Symbol('ON');
  var REFERENCES = Symbol('REFERENCES');
  var REFERENCES_CACHE = Symbol('REFERENCES_CACHE');

  var EventDispatcher =
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
  };

  /**
    * Convert a string from kebab-case to camelCase.
    * @param {String} text String to modify.
    * @returns {String} Converted string.
    */
  var kebabToCamel = function kebabToCamel(text) {
    return text.replace(/-(\w)/g, function (match, character) {
      return character.toUpperCase();
    });
  };
  /**
   * Parse list of modifiers to an object.
   * - [ 'hello', 'there-100', 'general-kenobi' ]
   *    -> { 'hello': true, 'there': 100, 'general': 'kenobi' }
   * @param {Array<String>} modifiers List of modifiers to parse.
   * @returns {Object} Parsed modifiers.
   */

  var parseAttributeModifiers = function parseAttributeModifiers(modifiers) {
    var result = {};

    var _iterator = _createForOfIteratorHelper(modifiers),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var modifier = _step.value;
        // Get index of hyphen.
        var hyphenIndex = modifier.indexOf('-'); // If no hyphen then set the modifiers to true.

        if (hyphenIndex < 0) {
          result[modifier] = true;
          continue;
        } // If it starts with hyphen then set the modifier to false.


        if (hyphenIndex === 0) {
          result[modifier.substring(1)] = false;
          continue;
        } // If the hyphen is somewhere in the modifier then assume it is used as a split character.


        var key = modifier.substring(0, hyphenIndex);
        var value = modifier.substring(hyphenIndex + 1); // Try to parse the value as a number.

        var tmpValue = Number.parseInt(value);

        if (!isNaN(tmpValue)) {
          value = tmpValue;
        } // Store modifier data.


        result[key] = value;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return result;
  };
  /**
   * Parse attribute name to list of segments.
   * Valid formats are:
   * - "d-directive"
   *    -> [ 'directive', null, null, null ]
   * - "d-directive:key"
   *    -> [ 'directive', 'key', 'key', null ]
   * - "d-directive:key-name"
   *    -> [ 'directive', 'key-name', 'keyName', null ]
   * - "d-directive:key-name.modifiers"
   *    -> [ 'directive', 'key-name', 'keyName', [ 'modifiers' ] ]
   * - "d-directive.modifiers.multiple"
   *    -> [ 'directive', null, null, [ 'modifiers', 'multiple' ] ]
   * @param {String} name Name to parse.
   * @returns {Array<String>} list of segments.
   */

  var parseAttributeName = function parseAttributeName(prefix, name) {
    // Match with expression.
    name = name.match(new RegExp('^' + prefix + '-([a-z][0-9a-z-]{1,}):?([a-z][0-9a-z-]*)?(\\..*]*)?$', 'i'));

    if (!name) {
      return;
    } // Deconstruct match.


    var _name = name,
        _name2 = _slicedToArray(_name, 4);
        _name2[0];
        var directive = _name2[1],
        keyRaw = _name2[2],
        modifiers = _name2[3]; // eslint-disable-line no-unused-vars
    // If no key provided set it to null instead of empty.


    keyRaw = keyRaw !== '' ? keyRaw : null;
    var key = keyRaw ? kebabToCamel(keyRaw) : null; // Ensure modifiers is and array.

    modifiers = modifiers ? modifiers.substring(1).split('.') : []; // Return result a single array.

    return [directive, keyRaw, key, modifiers];
  };
  /**
   * Parses for expression. Valid expression formats are:
   * - "index of 4"
   *    -> { iterable: "4", variables: [ "index" ] }
   * - "item of items"
   *    -> { iterable: "items", variables: [ "item" ] }
   * - "key in object"
   *    -> { iterable: "object", variables: [ "key" ] }
   * - "(key, value) in object"
   *    -> { iterable: "object", variables: [ "key", "value" ] }
   * - "(key, value, index) in object"
   *    -> { iterable: "object", variables: [ "key", "value", "index" ] }
   * - "(key, , index) in object"
   *    -> { iterable: "object", variables: [ "key", undefined, "index" ] }
   */

  var parseForExpression = function parseForExpression(expression) {
    // Split variables from items expression.
    var match = expression.match(/^([$_a-z0-9,(){}\s]{1,}?)\s+(?:in|of)\s+([\s\S]{1,})$/i);

    if (!match) {
      return;
    } // Remove parenthesis.


    var variables = match[1].replace(/^[\s({]*|[)}\s]*$/g, ''); // Parse for variables.

    variables = variables.match(/^([$_a-z0-9]{1,})?(?:,\s+?)?([$_a-z0-9]{1,})?(?:,\s+)?([$_a-z0-9]{1,})?$/i);

    if (!variables) {
      return;
    }

    variables.shift();
    return {
      iterable: match[2].trim(),
      variables: _toConsumableArray(variables) // Convert it to an array instead of a regular expression match.

    };
  };
  /**
   * Parse selector to an attributes object.
   * @param {String} selector Selector to parse.
   * @returns {Object} Attributes. Do note the class property is a list of strings not a single string.
   */

  var parseSelector = function parseSelector(selector) {
    // Convert to array.
    if (typeof selector === 'string') {
      selector = selector.split(/(?=\.)|(?=#)|(?=\[)/);
    }

    if (!Array.isArray(selector)) {
      console.error('Doars: parseSelector expects Array of string or a single string.');
      return;
    }

    var attributes = {};

    var _iterator2 = _createForOfIteratorHelper(selector),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var selectorSegment = _step2.value;
        // Trim spaces.
        selectorSegment = selectorSegment.trim(); // Base what to do of the leading character.

        switch (selectorSegment[0]) {
          case '#':
            // Remove leading character and store as id.
            attributes.id = selectorSegment.substring(1);
            break;

          case '.':
            // Remove leading character.
            selectorSegment = selectorSegment.substring(1); // Add to classlist.

            if (!attributes["class"]) {
              attributes["class"] = [];
            }

            if (!attributes["class"].includes(selectorSegment)) {
              attributes["class"].push(selectorSegment);
            }

            break;

          case '[':
            // Remove brackets and split key from value.
            var _selectorSegment$matc = selectorSegment.match(/^(?:\[)?([-$_.a-z0-9]{1,})(?:[$*^])?(?:=)?([\s\S]{0,})(?:\])$/i),
                _selectorSegment$matc2 = _slicedToArray(_selectorSegment$matc, 3),
                full = _selectorSegment$matc2[0],
                key = _selectorSegment$matc2[1],
                value = _selectorSegment$matc2[2]; // eslint-disable-line no-unused-vars
            // Store attribute value in results.


            attributes[key] = value;
            break;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return attributes;
  };

  var Attribute = /*#__PURE__*/function (_EventDispatcher) {
    _inherits(Attribute, _EventDispatcher);

    var _super = _createSuper(Attribute);

    /**
     * Create instance.
     * @param {Component} component Component instance.
     * @param {HTMLElement} element Element.
     * @param {String} name Attribute name (with library prefix removed).
     * @param {String} value Attribute value.
     * @param {Boolean} isClone Whether this will be a clone of an existing attribute.
     */
    function Attribute(component, element, name, value) {
      var _this;

      var isClone = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _classCallCheck(this, Attribute);

      _this = _super.call(this); // Create unique ID.

      var id = Symbol('ID_ATTRIBUTE');

      if (!isClone) {
        // Add attribute reference to the element.
        if (!element[ATTRIBUTES]) {
          element[ATTRIBUTES] = [];
        }

        element[ATTRIBUTES].push(_assertThisInitialized(_this));
      } // Create private variables.


      var accessedItems = {},
          directive,
          key,
          keyRaw,
          modifiersRaw,
          modifiers; // Parse and store name.

      if (name) {
        // Parse and store attribute name.
        var _parseAttributeName = parseAttributeName(component.getLibrary().getOptions().prefix, name),
            _parseAttributeName2 = _slicedToArray(_parseAttributeName, 4),
            _directive = _parseAttributeName2[0],
            _keyRaw = _parseAttributeName2[1],
            _key = _parseAttributeName2[2],
            _modifiers = _parseAttributeName2[3];

        directive = _directive;
        key = _key;
        keyRaw = _keyRaw;
        modifiersRaw = _modifiers; // Parse and store modifiers.

        if (_modifiers) {
          modifiers = parseAttributeModifiers(_modifiers);
        }
      }
      /**
       * Get the component this attribute is a part of.
       * @returns {Component} Attribute's component.
       */


      _this.getComponent = function () {
        return component;
      };
      /**
       * Get the element this attribute belongs to.
       * @returns {HTMLElement} Element.
       */


      _this.getElement = function () {
        return element;
      };
      /**
       * Get attribute id.
       * @returns {Symbol} Unique identifier.
       */


      _this.getId = function () {
        return id;
      };
      /**
       * Get the directive this attribute matches.
       * @returns {String} Directive name.
       */


      _this.getDirective = function () {
        return directive;
      };
      /**
       * Get the optional key of the attribute.
       * @returns {String} Key.
       */


      _this.getKey = function () {
        return key;
      };
      /**
       * Get the optional key of the attribute before being processed.
       * @returns {String} Raw key.
       */


      _this.getKeyRaw = function () {
        return keyRaw;
      };
      /**
       * Get the optional modifiers of the attribute.
       * @returns {Object} Modifiers object.
       */


      _this.getModifiers = function () {
        return Object.assign({}, modifiers);
      };
      /**
       * Get the optional modifiers of the attribute before being processed.
       * @returns {Array<String>} List of raw modifiers.
       */


      _this.getModifiersRaw = function () {
        return modifiersRaw;
      };
      /**
       * Get attribute's name.
       * @returns {String} Attribute name.
       */


      _this.getName = function () {
        return name;
      };
      /**
       * Get the attribute's value.
       * @returns {String} Value.
       */


      _this.getValue = function () {
        return value;
      };
      /**
       * Set the attribute's value.
       * @param {String} value New value.
       */


      _this.setValue = function (_value) {
        value = _value; // Dispatch changed event.

        _this.dispatchEvent('changed', [_assertThisInitialized(_this)]);
      };
      /**
       * Destroy the attribute.
       */


      _this.destroy = function () {
        // Clear accessed.
        _this.clearAccessed(); // Remove attribute from element's attributes.


        var indexInElement = element[ATTRIBUTES].indexOf(_assertThisInitialized(_this));

        if (indexInElement >= 0) {
          element[ATTRIBUTES].splice(indexInElement, 1);
        } // Dispatch destroy event.


        _this.dispatchEvent('destroyed', [_assertThisInitialized(_this)]); // Remove all listeners.


        _this.removeAllEventListeners();
      };
      /**
       * Mark an item as accessed.
       * @param {Symbol} id Unique identifier.
       * @param {String} path Context path.
       */


      _this.accessed = function (id, path) {
        if (!accessedItems[id]) {
          accessedItems[id] = [];
        } else if (accessedItems[id].includes(path)) {
          return;
        }

        accessedItems[id].push(path); // Dispatch accessed event.

        _this.dispatchEvent('accessed', [_assertThisInitialized(_this), id, path]);
      };
      /**
       * Clear list of accessed items.
       */


      _this.clearAccessed = function () {
        accessedItems = {};
      };
      /**
       * Check if attribute accessed any of the item's paths.
       * @param {Symbol} id Unique identifier.
       * @param {Array<String>} paths Contexts path.
       * @returns {Boolean} Whether any item's path was accessed.
       */


      _this.hasAccessed = function (id, paths) {
        if (!(id in accessedItems)) {
          return false;
        }

        var accessedAtId = accessedItems[id];

        var _iterator = _createForOfIteratorHelper(paths),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var path = _step.value;

            if (accessedAtId.includes(path)) {
              return true;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return false;
      };
      /**
       * Creates a clone of the attribute without copying over the id and accessed values.
       * @returns {Attribute} Cloned attribute.
       */


      _this.clone = function () {
        // Create new attribute as clone.
        return new Attribute(component, element, name, value, true);
      };

      return _this;
    }

    return Attribute;
  }(EventDispatcher);

  // List of methods to revoke access to.
  var REFLECTION_METHODS = ['apply', 'construct', 'defineProperty', 'deleteProperty', 'get', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'isExtensible', 'ownKeys', 'preventExtensions', 'set', 'setPrototypeOf'];
  /**
   * Revocable proxy made using regular a proxy and a simple boolean.
   */

  function RevocableProxy (target, handler) {
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
  }

  var ProxyDispatcher = /*#__PURE__*/function (_EventDispatcher) {
    _inherits(ProxyDispatcher, _EventDispatcher);

    var _super = _createSuper(ProxyDispatcher);

    function ProxyDispatcher() {
      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, ProxyDispatcher);

      _this = _super.call(this);
      options = Object.assign({
        "delete": true,
        get: true,
        set: true
      }, options); // Setup WeakMap for keep track of created proxies.

      var map = new WeakMap();
      /**
       * Add object to start keeping track of it.
       * @param {Object} target Object that is being kept track of.
       * @param {Array<String>} path Path of object on optional parent object, used for recursion.
       * @returns {Proxy} Object to access and mutate.
       */

      _this.add = function (target) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        // Exit early if proxy already exists.
        if (map.has(target)) {
          return map.get(target);
        } // Recursively create proxies for each property.


        for (var key in target) {
          if (target[key] && _typeof(target[key]) === 'object') {
            target[key] = _this.add(target[key], [].concat(_toConsumableArray(path), [key]));
          }
        } // Create handler and add the handler for which a callback exits..


        var handler = {};

        if (options["delete"]) {
          handler.deleteProperty = function (target, key) {
            // Exit early successful if property doesn't exist.
            if (!Reflect.has(target, key)) {
              return true;
            } // Remove proxy.


            _this.remove(target, key); // Delete property.


            var deleted = Reflect.deleteProperty(target, key); // Dispatch delete event.

            if (deleted) {
              _this.dispatchEvent('delete', [target, Array.isArray(target) ? _toConsumableArray(path) : [].concat(_toConsumableArray(path), [key])]);
            } // Return deleted.


            return deleted;
          };
        }

        if (options.get) {
          handler.get = function (target, key, receiver) {
            // Dispatch get event.
            if (key !== Symbol.unscopables) {
              _this.dispatchEvent('get', [target, [].concat(_toConsumableArray(path), [key]), receiver]);
            } // Return value from object.


            return Reflect.get(target, key, receiver);
          };
        }

        if (options.set) {
          handler.set = function (target, key, value, receiver) {
            // Exit early if not changed.
            if (target[key] === value) {
              return true;
            } // Add proxy if value is an object.


            if (_typeof(value) === 'object') {
              value = _this.add(value, [].concat(_toConsumableArray(path), [key]));
            } // Store value.


            target[key] = value; // Dispatch set event. If the target is an array and a new item has been pushed then the length has also changed, therefore a more generalizable path will be dispatched.

            _this.dispatchEvent('set', [target, Array.isArray(target) ? _toConsumableArray(path) : [].concat(_toConsumableArray(path), [key]), value, receiver]); // Return success.


            return true;
          };
        } // Create proxy.


        var revocable = RevocableProxy(target, handler); // Store target at proxy.

        map.set(revocable, target); // Return proxy.

        return revocable.proxy;
      };
      /**
       * Remove object from being kept track of.
       * @param {Object} target Object that is being kept track of.
       */


      _this.remove = function (target) {
        // Remove target from the map.
        if (!map.has(target)) {
          return;
        }

        var revocable = map.get(target);
        map["delete"](revocable); // Recursively remove properties as well.

        for (var property in revocable.proxy) {
          if (_typeof(revocable.proxy[property]) === 'object') {
            _this.remove(revocable.proxy[property]);
          }
        } // Revoke proxy.


        revocable.revoke();
      };

      return _this;
    }

    return ProxyDispatcher;
  }(EventDispatcher);

  // Import symbols.
  /**
   * Get closest component in hierarchy.
   * @param {HTMLElement} element Element to start searching from.
   * @returns {Component} Closest component.
   */

  var closestComponent = function closestComponent(element) {
    if (!element.parentElement) {
      return;
    }

    element = element.parentElement;

    if (element[COMPONENT]) {
      return element[COMPONENT];
    }

    return closestComponent(element);
  };

  /**
   * Create an object with utility function.
   * @returns {Object} Utils.
   */

  var createContextUtils = function createContextUtils() {
    return {
      createContexts: createContexts,
      createContextsProxy: createContextsProxy,
      RevocableProxy: RevocableProxy
    };
  };
  /**
   * Create component's contexts for an attributes expression.
   * @param {Component} component Instance of the component.
   * @param {Attribute} attribute Instance of the attribute.
   * @param {Function} update Called when update needs to be invoked.
   * @param {Object} extra Optional extra context items.
   * @returns {Array<Object, Function>} Expressions contexts and destroy functions.
   */


  var createContexts = function createContexts(component, attribute, update) {
    var extra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    // Iterate over all contexts.
    var results = {};
    var _destroy2 = [];
    var after = '';
    var before = '';
    var contexts = component.getLibrary().getContexts();

    var _iterator = _createForOfIteratorHelper(contexts),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var context = _step.value;

        if (!context || !context.name) {
          continue;
        } // Get context result.


        var result = context.create(component, attribute, update, createContextUtils());

        if (!result || !result.value) {
          continue;
        } // Store destroy functions.


        if (result.destroy && typeof result.destroy === 'function') {
          _destroy2.push(result.destroy);
        } // Deconstruct options if marked as such.


        if (context.deconstruct && _typeof(result.value) === 'object') {
          before += 'with(' + context.name + ') { ';
          after += ' }';
        } // Store result value in context results.


        results[context.name] = result.value;
      } // Add extra items to context.

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (_typeof(extra) === 'object') {
      for (var name in extra) {
        results[name] = extra[name];
      }
    }

    return {
      after: after,
      before: before,
      destroy: function destroy() {
        // Call all destroy functions.
        _destroy2.forEach(function (_destroy) {
          return _destroy(createContextUtils());
        });
      },
      contexts: results
    };
  };
  /**
   * Create component's contexts only after the context gets used.
   * @param {Component} component Instance of the component.
   * @param {Attribute} attribute Instance of the attribute.
   * @param {Object} extra Optional extra context items.
   * @param {Function} update Called when update needs to be invoked.
   * @returns {Proxy} Expressions contexts' proxy.
   */

  var createContextsProxy = function createContextsProxy(component, attribute, update) {
    var extra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    // Store context after first call.
    var data = null; // Create context proxy.

    var revocable = RevocableProxy({}, {
      get: function get(target, property) {
        // Create context.
        if (!data) {
          data = createContexts(component, attribute, update, extra);
        } // Check if name exists in context.


        if (property in data.contexts) {
          // Call accessed callback if element or state is accessed.
          attribute.accessed(component.getId(), property); // Return value.

          return data.contexts[property];
        } // Try and get value from state.


        if (data.contexts.$state) {
          if (property in data.contexts.$state) {
            // Call accessed callback if element or state is accessed.
            attribute.accessed(component.getId(), '$state'); // Return value.

            return data.contexts.$state[property];
          }
        }
      }
    }); // Return context.

    return {
      contexts: revocable.proxy,
      destroy: function destroy() {
        // Call destroy on created context.
        if (data && data.destroy) {
          data.destroy(component, attribute);
        } // Revoke proxy.


        revocable.revoke();
      }
    };
  };
  /**
   * Executes value in the correct context.
   * @param {Component} component Instance of the component.
   * @param {Attribute} attribute Instance of the attribute.
   * @param {String} expression Expression to execute.
   * @param {Object} extra Optional extra context items.
   * @param {Object} options Optional options object.
   * @returns {Any} Result of expression.
   */

  var executeExpression = function executeExpression(component, attribute, expression) {
    var extra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    // Override default with given options.
    options = Object.assign({
      "return": true
    }, options); // Collect update triggers.

    var triggers = [];

    var update = function update(id, context) {
      triggers.push({
        id: id,
        path: context
      });
    }; // Create function context.


    var _createContexts = createContexts(component, attribute, update, extra),
        after = _createContexts.after,
        before = _createContexts.before,
        contexts = _createContexts.contexts,
        destroy = _createContexts.destroy; // Apply options.


    if (options["return"]) {
      before += 'return ';
    } // Try to execute code.


    var result;

    try {
      result = _construct(Function, _toConsumableArray(Object.keys(contexts)).concat([before + expression + after])).apply(void 0, _toConsumableArray(Object.values(contexts))); // eslint-disable-line no-new-func
    } catch (error) {
      throw Error(error);
    } // Invoke destroy.


    destroy(); // Dispatch update triggers.

    if (triggers.length > 0) {
      component.getLibrary().update(triggers);
    }

    return result;
  };

  /**
   * Add attributes on an element based of an object.
   * @param {HTMLElement} element Element to add the attributes to.
   * @param {Object} data Attribute data to add.
   */
  var addAttributes = function addAttributes(element, data) {
    for (var name in data) {
      if (name === 'class') {
        // Add classes to classlist.
        var _iterator = _createForOfIteratorHelper(data["class"]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var className = _step.value;
            element.classList.add(className);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        continue;
      } // Set attribute.


      element.setAttribute(name, data[name]);
    }
  };
  /**
   * Remove attributes on an element based of an object.
   * @param {HTMLElement} element Element to remove the attributes from.
   * @param {Object} data Attribute data to remove.
   */

  var removeAttributes = function removeAttributes(element, data) {
    for (var name in data) {
      if (name === 'class') {
        // Add classes to classlist.
        var _iterator2 = _createForOfIteratorHelper(data["class"]),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var className = _step2.value;
            element.classList.remove(className);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        continue;
      } // Check if optional values match.


      if (data[name] && element.attributes[name] !== data[name]) {
        continue;
      } // Remove attribute.


      element.removeAttribute(name);
    }
  };
  /**
   * Set data at key on element as attribute.
   * @param {HTMLElement} element Element to set attribute of.
   * @param {String} key Attribute name.
   * @param {Any} data Attribute data.
   */

  var setAttribute = function setAttribute(element, key, data) {
    // Check if a special attribute key.
    if (key === 'value' && element.tagName === 'INPUT') {
      if (!data) {
        data = '';
      } // Exit early if nothing will change.


      if (element.getAttribute(key) === data) {
        return;
      } // Update attribute.


      element.setAttribute(key, data); // Exit special cases early.

      return;
    } // If checked attribute then set the checked property instead.


    if (key === 'checked') {
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = !!data;
        return;
      }
    }

    if (key === 'class') {
      if (Array.isArray(data)) {
        // Join values together if it is a list of classes.
        data = data.join(' ');
      } else if (_typeof(data) === 'object') {
        // List keys of object as a string if the value is truthy.
        data = Object.entries(data).filter(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);
              _ref2[0];
              var value = _ref2[1];

          return value;
        }).map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 1),
              key = _ref4[0];

          return key;
        }).join(' ');
      }
    }

    if (key === 'style') {
      if (Array.isArray(data)) {
        // Join values together if it is a list of classes.
        data = data.join(' ');
      } else if (_typeof(data) === 'object') {
        // List keys of object as a string if the value is truthy.
        data = Object.entries(data).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              key = _ref6[0],
              value = _ref6[1];

          return key + ':' + value;
        }).join(';');
      }
    } // Update attribute on element.


    if (data === false || data === null || data === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, data);
    }
  };
  /**
   * Set attributes on an element based of an object.
   * @param {HTMLElement} element Element to add the attributes to.
   * @param {Object} data Attribute data to set.
   */

  var setAttributes = function setAttributes(element, data) {
    for (var name in data) {
      setAttribute(element, name, data[name]);
    }
  };

  // Import utils.

  var TRANSITION_NAME = '-transition:';
  /**
   * Transition an element.
   * @param {String} type Type of transition, for example 'in' and 'out'.
   * @param {Component} component Component the transitioning element is part of.
   * @param {HTMLElement} element Element to transition.
   * @param {Function} callback Function to call after transition is done.
   */

  var transition = function transition(type, component, element) {
    var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    // Only transition element nodes.
    if (element.nodeType !== 1) {
      if (callback) {
        callback();
      }

      return;
    } // Get library options.


    var _component$getLibrary = component.getLibrary().getOptions(),
        prefix = _component$getLibrary.prefix; // Transition attribute name.


    var transitionName = prefix + TRANSITION_NAME + type; // Setup dispatcher function.

    var dispatchEvent = function dispatchEvent(phase) {
      element.dispatchEvent(new CustomEvent('transition-' + phase));
      element.dispatchEvent(new CustomEvent('transition-' + type + '-' + phase));
    }; // Declare variables for later.


    var name, value, timeout, requestFrame;
    var isDone = false;
    var selectors = {}; // Process transition during attribute.

    name = transitionName;
    value = element.getAttribute(name); // Parse and apply returned selector.

    if (value) {
      selectors.during = parseSelector(value);
      addAttributes(element, selectors.during);
    } // Process transition from attribute.


    name = transitionName + '.from';
    value = element.getAttribute(name); // Parse and apply returned selector.

    if (value) {
      selectors.from = parseSelector(value);
      addAttributes(element, selectors.from);
    } // Dispatch transition event.


    dispatchEvent('start');
    requestFrame = requestAnimationFrame(function () {
      requestFrame = null; // If cancelled then stop immediately.

      if (isDone) {
        return;
      } // Remove from selector.


      if (selectors.from) {
        removeAttributes(element, selectors.from);
        selectors.from = undefined;
      } // Process transition to attribute.


      name = transitionName + '.to';
      value = element.getAttribute(name); // Parse and apply returned selector.

      if (value) {
        selectors.to = parseSelector(value);
        addAttributes(element, selectors.to);
      } else if (!selectors.during) {
        // Exit early if no active selectors set.
        // Dispatch end event.
        dispatchEvent('end'); // Invoke callback.

        if (callback) {
          callback();
        } // Mark as done.


        isDone = true;
        return;
      } // Get computes style.


      var styles = getComputedStyle(element);
      var duration = Number(styles.transitionDuration.replace(/,.*/, '').replace('s', '')) * 1000;

      if (duration === 0) {
        duration = Number(styles.animationDuration.replace('s', '')) * 1000;
      }

      timeout = setTimeout(function () {
        timeout = null; // If cancelled then stop immediately.

        if (isDone) {
          return;
        } // Remove during selector.


        if (selectors.during) {
          removeAttributes(element, selectors.during);
          selectors.during = undefined;
        } // Remove to selector.


        if (selectors.to) {
          removeAttributes(element, selectors.to);
          selectors.to = undefined;
        } // Dispatch end event.


        dispatchEvent('end'); // Invoke callback.

        if (callback) {
          callback();
        } // Mark as done.


        isDone = true;
      }, duration);
    });
    return function () {
      if (!isDone) {
        return;
      }

      isDone = true; // Remove applied selector.

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
      } // Clear request animation frame and timeout.


      if (requestFrame) {
        cancelAnimationFrame(requestFrame);
        requestFrame = null;
      } else if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      } // Dispatch end event.


      dispatchEvent('end'); // Invoke callback.

      if (callback) {
        callback();
      }
    };
  };
  /**
   * Transition an element in.
   * @param {Component} component Component the transitioning element is part of.
   * @param {HTMLElement} element Element to transition.
   * @param {Function} callback Function to call after transition is done.
   */

  var transitionIn = function transitionIn(component, element, callback) {
    return transition('in', component, element, callback);
  };
  /**
   * Transition an element out.
   * @param {Component} component Component the transitioning element is part of.
   * @param {HTMLElement} element Element to transition.
   * @param {Function} callback Function to call after transition is done.
   */

  var transitionOut = function transitionOut(component, element, callback) {
    return transition('out', component, element, callback);
  };

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
  /**
   * Iterate over all descendants of a given node.
   * @param {HTMLElement} element Element to walk over.
   * @param {Function} filter Filter function, return false to skip element.
   * @returns {Function} Iterator function. Call until a non-truthy value is returned.
   */

  var walk = function walk(element, filter) {
    var index = -1;
    var iterator = null;
    return function () {
      // First go over iterator.
      if (index >= 0 && iterator) {
        var _child = iterator();

        if (_child) {
          return _child;
        }
      } // Get next child that passes the filter.


      var child = null;

      do {
        index++;

        if (index >= element.childElementCount) {
          return null;
        }

        child = element.children[index];
      } while (!filter(child)); // Setup iterator for child.


      if (child.childElementCount) {
        iterator = walk(child, filter);
      } // Return the child.


      return child;
    };
  };

  /**
   * Create an object with utility function.
   * @returns {Object} Utils.
   */

  var createDirectiveUtils = function createDirectiveUtils() {
    return {
      executeExpression: executeExpression,
      transition: transition,
      transitionIn: transitionIn,
      transitionOut: transitionOut
    };
  };

  var Component =
  /**
   * Create instance.
   * @param {Doars} library Library instance.
   * @param {HTMLElement} element Element.
   */
  function Component(library, element) {
    var _this = this;

    _classCallCheck(this, Component);

    // Create unique ID.
    var id = Symbol('ID_COMPONENT'); // Deconstruct library options.

    var _library$getOptions = library.getOptions(),
        prefix = _library$getOptions.prefix; // create private variables.


    var attributes = [],
        hasUpdated = false,
        isInitialized = false,
        data,
        proxy,
        state; // Check if element has a state attribute.

    if (!element.attributes[prefix + COMPONENT_SUFFIX]) {
      console.error('Doars: element given to component does not contain a state attribute!');
      return;
    } // Add reference to element.


    element[COMPONENT] = this; // Update position in hierarchy.

    var children = []; // Get current parent component.

    var parent = closestComponent(element);

    if (parent) {
      // Add to list of children in parent.
      if (!parent.getChildren().includes(this)) {
        parent.getChildren().push(this); // Trigger children update.

        library.update([{
          id: parent.getId(),
          path: 'children'
        }]);
      }
    }
    /**
     * Get the attributes in this component.
     * @returns {Array<Attribute>} List of attributes.
     */


    this.getAttributes = function () {
      return attributes;
    };
    /**
     * Get child components in hierarchy of this component.
     * @returns {Array<Component>} List of components.
     */


    this.getChildren = function () {
      return children;
    };
    /**
     * Get root element of the component.
     * @returns {HTMLElement} Element.
     */


    this.getElement = function () {
      return element;
    };
    /**
     * Get component id.
     * @returns {Symbol} Unique identifier.
     */


    this.getId = function () {
      return id;
    };
    /**
     * Get the library instance this component is from.
     * @returns {Doars} Doars instance.
     */


    this.getLibrary = function () {
      return library;
    };
    /**
     * Get parent component in hierarchy of this component.
     * @returns {Component} Component.
     */


    this.getParent = function () {
      return parent;
    };
    /**
     * Get the event dispatcher of state's proxy.
     * @returns {ProxyDispatcher} State's proxy dispatcher.
     */


    this.getProxy = function () {
      return proxy;
    };
    /**
     * Get the component's state.
     * @returns {Proxy} State.
     */


    this.getState = function () {
      return state;
    };
    /**
     * Set new parent component of this component.
     * @param {Component} _parent Parent component.
     */


    this.setParent = function (_parent) {
      parent = _parent;
    };
    /**
     * Initialize the component.
     */


    this.initialize = function () {
      var _executeExpression;

      if (isInitialized) {
        return;
      } // Set as enabled.


      isInitialized = true; // Get component's state attribute.

      var componentName = prefix + COMPONENT_SUFFIX;
      var value = element.attributes[componentName].value; // Execute expression for generating the state using a mock attribute.

      data = (_executeExpression = executeExpression(_this, new Attribute(_this, element, null, value), value)) !== null && _executeExpression !== void 0 ? _executeExpression : {};

      if (Array.isArray(data) || _typeof(data) !== 'object') {
        console.error('Doars: component tag must return an object!');
        return;
      } // Create proxy dispatcher for state.


      proxy = new ProxyDispatcher(); // Add data to dispatcher to create the state.

      state = proxy.add(data); // Scan for attributes.

      _this.scanAttributes(element);
    };
    /**
     * Destroy the component.
     */


    this.destroy = function () {
      if (!isInitialized) {
        return;
      }

      if (attributes.length > 0) {
        // Filter out directives without a destroy function.
        var directives = library.getDirectivesObject();

        for (var key in directives) {
          if (!directives[key].destroy) {
            directives[key] = undefined;
          }
        }

        var _iterator = _createForOfIteratorHelper(attributes),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var attribute = _step.value;
            // Clean up attribute if the directive has a destroy function.
            var directive = directives[attribute.getKey()];

            if (directive) {
              directive.destroy(_this, attribute, createDirectiveUtils());
            } // Destroy the attribute.


            attribute.destroy();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } // Remove reference from element.


      delete element[COMPONENT]; // Reset variables.

      attributes = []; // Set as not initialized.

      isInitialized = false; // Remove state and state handling.

      proxy.remove(data);
      state = null;
      proxy = null;
      data = null; // Store update triggers.

      var triggers = []; // Set children as children of parent.

      if (children.length > 0) {
        var _iterator2 = _createForOfIteratorHelper(children),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var child = _step2.value;
            // Set new parent of children.
            child.setParent(parent); // Add parent update trigger.

            triggers.push({
              id: child.getId(),
              path: 'parent'
            });
          } // Add children update trigger.

        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        triggers.push({
          id: id,
          path: 'children'
        });
      }

      if (parent) {
        if (children.length > 0) {
          var _parent$getChildren;

          // Add children to parent.
          (_parent$getChildren = parent.getChildren()).push.apply(_parent$getChildren, children); // Add children update trigger.


          triggers.push({
            id: parent.getId(),
            path: 'children'
          });
        } // Add parent update trigger.


        triggers.push({
          id: id,
          path: 'parent'
        });
      } // Dispatch triggers.


      if (triggers.length > 0) {
        library.update(triggers);
      } // Dispatch event.


      dispatchEvent('destroyed', {
        element: element,
        id: id
      });
    };
    /**
     * Create and add an attribute. Assumes this attribute has not been added before.
     * @param {HTMLElement} element Attribute element.
     * @param {String} name Name of the attribute.
     * @param {String} value Value of the attribute.
     * @returns {Attribute} New attribute.
     */


    this.addAttribute = function (element, name, value) {
      // Get directive keys from library.
      var directivesKeys = library.getDirectivesNames(); // Create and add attribute.

      var attribute = new Attribute(_this, element, name, value); // Get index to add attribute at.

      var index = attribute.length;
      var directiveIndex = directivesKeys.indexOf(attribute.getDirective());

      for (var i = attributes.length - 1; i >= 0; i--) {
        // If the other attribute is further down the keys list than add it after that item.
        if (directivesKeys.indexOf(attributes[i].getDirective()) <= directiveIndex) {
          index = i + 1;
          break;
        }
      } // Add to list of attributes.


      attributes.splice(index, 0, attribute); // Return new attribute.

      return attribute;
    };
    /**
     * Remove an attribute.
     * @param {Attribute} attribute The attribute to remove.
     */


    this.removeAttribute = function (attribute) {
      // Get index of attribute in list.
      var indexInAttributes = attributes.indexOf(attribute);

      if (indexInAttributes < 0) {
        return;
      } // Get directives.


      var directives = library.getDirectivesObject; // Attribute has been removed, call the destroy directive.

      var directive = directives[attribute.getKey()];

      if (directive && directive.destroy) {
        directive.destroy(_this, attribute, createDirectiveUtils());
      } // Remove attribute from list.


      attributes.splice(indexInAttributes, 1); // Destroy attribute.

      attribute.destroy();
    };
    /**
     * Scans element for new attributes. It assumes this element as not been read before and is part of the component.
     * @param {HTMLElement} element Element to scan.
     * @returns {Array<Attribute>} New attributes.
     */


    this.scanAttributes = function (element) {
      // Get component's state attribute.
      var componentName = prefix + COMPONENT_SUFFIX; // Store new attributes.

      var newAttributes = []; // Create iterator for walking over all elements in the component, skipping elements that are components.

      var iterator = walk(element, function (element) {
        return !element.hasAttribute(componentName);
      }); // Start on the given element then continue iterating over all children.

      do {
        var _iterator3 = _createForOfIteratorHelper(element.attributes),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _step3$value = _step3.value,
                name = _step3$value.name,
                value = _step3$value.value;

            // Skip attribute if it is not that of a directive.
            if (library.isDirectiveName(name)) {
              newAttributes.push(_this.addAttribute(element, name, value));
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      } while (element = iterator()); // Return new attributes.


      return newAttributes;
    };
    /**
     * Update an attribute.
     * @param {Attribute} attribute The attribute to update.
     */


    this.updateAttribute = function (attribute) {
      // Check if the attribute is still relevant, since the attribute or element could have been removed.
      if (!attribute.getElement() || attribute.getValue() === null || attribute.getValue() === undefined) {
        _this.removeAttribute(attribute);

        return;
      } // Get directives.


      var directives = library.getDirectivesObject(); // Clear accessed.

      attribute.clearAccessed(); // Execute directive on attribute.

      var directive = directives[attribute.getDirective()];

      if (directive) {
        directive.update(_this, attribute, createDirectiveUtils());
      }
    };
    /**
     * Update the specified attributes of the component.
     * @param {Array<Attribute>} attributes Attributes to update.
     */


    this.updateAttributes = function (attributes) {
      if (!isInitialized || attributes.length <= 0) {
        if (!hasUpdated) {
          // Dispatch updated event anyway.
          hasUpdated = true;
          dispatchEvent('updated', {
            attributes: attributes,
            element: element,
            id: id
          });
        }

        return;
      }

      var _iterator4 = _createForOfIteratorHelper(attributes),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var attribute = _step4.value;

          _this.updateAttribute(attribute);
        } // Dispatch updated event.

      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      hasUpdated = true;
      dispatchEvent('updated', {
        attributes: attributes,
        element: element,
        id: id
      });
    };
    /**
     * Start updating the component's attributes.
     * @param {Array<Object>} triggers List of triggers.
     */


    this.update = function (triggers) {
      if (!isInitialized) {
        return;
      } // Get all ids of triggers.


      var triggerIds = Object.getOwnPropertySymbols(triggers); // Update all attributes whose accessed items match any update trigger.

      var updatedAttributes = [];

      var _iterator5 = _createForOfIteratorHelper(attributes),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var attribute = _step5.value;

          var _iterator6 = _createForOfIteratorHelper(triggerIds),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var _id = _step6.value;

              if (attribute.hasAccessed(_id, triggers[_id])) {
                _this.updateAttribute(attribute);

                updatedAttributes.push(attribute);
              }
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        } // Dispatch updated event.

      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      if (!hasUpdated || updatedAttributes.length > 0) {
        hasUpdated = true;
        dispatchEvent('updated', {
          attributes: updatedAttributes,
          element: element,
          id: id
        });
      }
    };
    /**
     * Dispatch an event from this component.
     * @param {String} name Name of the event.
     */


    var dispatchEvent = function dispatchEvent(name, detail) {
      element.dispatchEvent(new CustomEvent(prefix + '-' + name, {
        detail: detail,
        bubbles: true
      }));
    };
  };

  var contextChildren = {
    name: '$children',
    create: function create(component, attribute, update, _ref) {
      var createContextsProxy = _ref.createContextsProxy,
          RevocableProxy = _ref.RevocableProxy;
      // Create contexts proxy for children.
      var children;
      var revocable = RevocableProxy(component.getChildren(), {
        get: function get(target, key, receiver) {
          if (!children) {
            // Create list of child contexts.
            children = target.map(function (child) {
              return createContextsProxy(child, attribute, update);
            }); // Set children of this component as accessed.

            attribute.accessed(component.getId(), 'children');
          } // If not a number then do a normal access.


          if (isNaN(key)) {
            return Reflect.get(children, key, receiver);
          } // Return context from child.


          var child = Reflect.get(children, key, receiver);

          if (child) {
            return child.contexts;
          }
        }
      });
      return {
        value: revocable.proxy,
        destroy: function destroy() {
          // Call destroy on all created contexts.
          if (children) {
            children.forEach(function (child) {
              return child.destroy();
            });
          } // Revoke proxy.


          revocable.revoke();
        }
      };
    }
  };

  var contextComponent = {
    name: '$component',
    create: function create(component) {
      // Return the component's element.
      return {
        value: component.getElement()
      };
    }
  };

  var contextElement = {
    name: '$element',
    create: function create(component, attribute) {
      // Return the attribute's element.
      return {
        value: attribute.getElement()
      };
    }
  };

  var contextDispatch = {
    name: '$dispatch',
    create: function create(component) {
      // Return the dispatch method.
      return {
        value: function value(name) {
          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          // Dispatch the event after the elements have updated.
          component.getElement().dispatchEvent(new CustomEvent(name, {
            detail: detail,
            bubbles: true
          }));
        }
      };
    }
  };

  var contextFor = {
    deconstruct: true,
    name: '$for',
    create: function create(component, attribute, update, _ref) {
      var RevocableProxy = _ref.RevocableProxy;

      // Exit early in parent contexts.
      if (component !== attribute.getComponent()) {
        return;
      } // Deconstruct attribute.


      var element = attribute.getElement(); // Walk up the tree until the component's root element is found.

      var componentElement = component.getElement(),
          items = [],
          target = {};

      while (element && !element.isSameNode(componentElement)) {
        // Check if element has for symbol.
        var data = element[FOR];

        if (data) {
          items.push(data);

          for (var key in data.variables) {
            target[key] = data.variables[key];
          }
        } // Go up the document tree.


        element = element.parentNode;
      }

      if (items.length === 0) {
        return;
      } // Create revocable proxy.


      var revocable = RevocableProxy(target, {
        get: function get(target, key) {
          var _iterator = _createForOfIteratorHelper(items),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var item = _step.value;

              if (key in item.variables) {
                // Mark as accessed for data.
                attribute.accessed(item.id, '$for'); // Return value at key.

                return item.variables[key];
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }
      }); // Set keys and return values.

      return {
        value: revocable.proxy,
        destroy: function destroy() {
          revocable.revoke();
        }
      };
    }
  };

  var contextInContext = {
    name: '$inContext',
    create: function create(component, attribute, update, _ref) {
      var createContexts = _ref.createContexts;
      return {
        value: function value(callback) {
          // Create contexts.
          var _createContexts = createContexts(component, attribute, update, {}),
              contexts = _createContexts.contexts,
              destroy = _createContexts.destroy; // Invoke callback and store its result.


          var result = callback(contexts); // Destroy contexts.

          destroy(); // Return callback's result.

          return result;
        }
      };
    }
  };

  var contextNextTick = {
    name: '$nextTick',
    create: function create(component, attribute, update, _ref) {
      var createContexts = _ref.createContexts;
      // Keep track of callbacks.
      var callbacks; // The setup process is delayed since we only want this code to run if the context is used.

      var isSetup = false;

      var setup = function setup() {
        // Exit early if already setup.
        if (isSetup) {
          return;
        }

        isSetup = true; // Deconstruct component.

        var library = component.getLibrary(); // Setup callbacks list.

        callbacks = []; // Remove and invoke each callback in the list.

        var handleUpdate = function handleUpdate() {
          // Stop listening the update has happened.
          stopListening(); // Create function context.

          var _createContexts = createContexts(component, attribute, update, {}),
              contexts = _createContexts.contexts,
              destroy = _createContexts.destroy; // Invoke all callbacks.


          var _iterator = _createForOfIteratorHelper(callbacks),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var callback = _step.value;
              callback(contexts);
            } // Destroy contexts.

          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          destroy();
        }; // Stop listening for the update event and attribute changes.


        var stopListening = function stopListening() {
          // Stop listening for updated event.
          library.removeEventListener('updated', handleUpdate); // Remove self from listening.

          attribute.removeEventListener('changed', stopListening);
          attribute.removeEventListener('destroyed', stopListening);
        }; // Listen to the libraries updated event.


        library.addEventListener('updated', handleUpdate); // Stop listening if the attribute changes since this directive will be run again.

        attribute.addEventListener('changed', stopListening);
        attribute.addEventListener('destroyed', stopListening);
      };

      return {
        value: function value(callback) {
          // Do delayed setup now.
          setup(); // Add callback to list.

          callbacks.push(callback);
        }
      };
    }
  };

  var contextParent = {
    name: '$parent',
    create: function create(component, attribute, update, _ref) {
      var createContextsProxy = _ref.createContextsProxy;
      // Deconstruct component.
      var parent = component.getParent();

      if (!parent) {
        return {
          key: '$parent',
          value: null
        };
      } // Create contexts proxy for parent.


      var _createContextsProxy = createContextsProxy(parent, attribute, update),
          contexts = _createContextsProxy.contexts,
          destroy = _createContextsProxy.destroy;

      return {
        value: contexts,
        destroy: destroy
      };
    }
  };

  var contextReferences = {
    name: '$references',
    create: function create(component, attribute, update, _ref) {
      var RevocableProxy = _ref.RevocableProxy;

      // Exit early if no references exist.
      if (!component[REFERENCES]) {
        return {
          key: '$references',
          value: []
        };
      } // Generate references cache.


      var cache = component[REFERENCES_CACHE];

      if (!cache) {
        // Get references from component.
        var references = component[REFERENCES];
        var attributeIds = Object.getOwnPropertySymbols(references); // Convert references to a named object.

        cache = {};

        var _iterator = _createForOfIteratorHelper(attributeIds),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var id = _step.value;
            var _references$id = references[id],
                element = _references$id.element,
                name = _references$id.name;
            cache[name] = element;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        component[REFERENCES_CACHE] = cache;
      } // Create revocable proxy.


      var revocable = RevocableProxy(cache, {
        get: function get(target, propertyKey, receiver) {
          // Mark references as accessed.
          attribute.accessed(component.getId(), '$references.' + propertyKey); // Return reference.

          return Reflect.get(target, propertyKey, receiver);
        }
      }); // Return references proxy.

      return {
        value: revocable.proxy,
        destroy: function destroy() {
          revocable.revoke();
        }
      };
    }
  };

  var contextState = {
    deconstruct: true,
    name: '$state',
    create: function create(component, attribute, update, _ref) {
      var RevocableProxy = _ref.RevocableProxy;
      // Deconstruct component.
      var proxy = component.getProxy();
      var state = component.getState();

      if (!proxy || !state) {
        return;
      } // Create event handlers.


      var onDelete = function onDelete(target, path) {
        return update(component.getId(), '$state.' + path.join('.'));
      };

      var onGet = function onGet(target, path) {
        return attribute.accessed(component.getId(), '$state.' + path.join('.'));
      };

      var onSet = function onSet(target, path) {
        return update(component.getId(), '$state.' + path.join('.'));
      }; // Add event listeners.


      proxy.addEventListener('delete', onDelete);
      proxy.addEventListener('get', onGet);
      proxy.addEventListener('set', onSet); // Wrap in a revocable proxy.

      var revocable = RevocableProxy(state, {});
      return {
        value: revocable.proxy,
        // Remove event listeners.
        destroy: function destroy() {
          proxy.removeEventListener('delete', onDelete);
          proxy.removeEventListener('get', onGet);
          proxy.removeEventListener('set', onSet); // Revoke access to state.

          revocable.revoke();
        }
      };
    }
  };

  var directiveAttribute = {
    name: 'attribute',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var element = attribute.getElement();
      var modifiers = attribute.getModifiers(); // Execute attribute value.

      var data = executeExpression(component, attribute, attribute.getValue());

      if (modifiers.selector) {
        if (typeof data !== 'string') {
          console.error('Doars: Value returned to attribute directive must be a string if the selector modifier is set.');
          return;
        }

        data = parseSelector(data);
        setAttributes(element, data);
        return;
      }

      if (Array.isArray(data)) {
        console.error('Doars: Value returned to attribute directive can not be of type array.');
        return;
      } // Set attributes on element.


      if (_typeof(data) === 'object') {
        setAttributes(element, data);
        return;
      } // Deconstruct attribute.


      var key = attribute.getKey(); // Set attribute on element at key.

      setAttribute(element, key, data);
    }
  };

  var directiveCloak = {
    name: 'cloak',
    update: function update(component, attribute, _ref) {
      var transitionIn = _ref.transitionIn;
      // Deconstruct attribute.
      var element = attribute.getElement(); // Remove attribute from element.

      element.removeAttribute(component.getLibrary().getOptions().prefix + '-' + this.name); // Transition in.

      transitionIn(component, element);
    }
  };

  /**
   * Add values add object by name in given order.
   * @param {Array<String>} names Names of values.
   * @param  {...Any} values Values to add to object.
   * @returns {Object} Resulting object with values at names.
   */

  var createVariables = function createVariables(names) {
    var variables = {};

    for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
      if (i >= names.length) {
        break;
      }

      variables[names[i]] = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
    }

    return variables;
  };
  /**
   * Finds the index of an element in list matching the value.
   * @param {HTMLElement} elements List of elements to search through.
   * @param {Any} value Value to compare to.
   * @param {Number} index The index to start searching after.
   */


  var indexInSiblings = function indexInSiblings(elements, value) {
    var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    index++;

    if (index >= elements.length) {
      return -1;
    }

    if (elements[index][FOR].value === value) {
      return index;
    }

    return indexInSiblings(elements, value, index);
  };
  /**
   * Adds item to document at right index.
   * @param {Component} component Component attribute is part of.
   * @param {Function} update Update trigger function.
   * @param {DocumentFragment} template Template of items.
   * @param {Array<HTMLElement>} elements Existing item elements.
   * @param {Number} index Index to start looking from.
   * @param {Any} value Value of item to add.
   * @param {Object} variables Variables associated with item.
   */


  var setAfter = function setAfter(component, update, template, elements, index, value, variables) {
    var existingIndex = indexInSiblings(elements, value, index);

    if (existingIndex >= 0) {
      var _elements$index;

      // Exit early it is already in place.
      if (existingIndex === index + 1) {
        return;
      } // Get existing element to move.


      var _element = elements[existingIndex]; // Move element after element at index or directly after the template.

      insertAfter((_elements$index = elements[index]) !== null && _elements$index !== void 0 ? _elements$index : template, _element); // Update all attributes using this for item's data.

      update(_element[FOR].id);
      return;
    } // Create new element from template.


    var element = document.importNode(template.content, true); // Add element after template or element at index.

    var sibling = index === -1 ? template : elements[index];
    insertAfter(sibling, element); // Get HTMLElement reference instead of DocumentFragment.

    element = sibling.nextElementSibling; // Transition in.

    transitionIn(component, element); // Store data.

    element[FOR] = {
      id: Symbol('ID_FOR'),
      value: value,
      variables: variables
    }; // Store reference.

    elements.splice(index + 1, 0, element);
  };
  /**
   * Removes elements after maximum length.
   * @param {Array<HTMLElement>} elements List of existing elements.
   * @param {Number} maxLength Maximum number of elements.
   */


  var removeAfter = function removeAfter(component, elements, maxLength) {
    // Exit early if length is not exceeded.
    if (elements.length < maxLength) {
      return;
    } // Iterate over exceeding elements.


    var _loop = function _loop(i) {
      // Remove element from list.
      var element = elements[i];
      elements.splice(i, 1); // Transition out.

      transitionOut(component, element, function () {
        element.remove();
      });
    };

    for (var i = elements.length - 1; i >= maxLength; i--) {
      _loop(i);
    }
  };

  var directiveFor = {
    name: 'for',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var template = attribute.getElement(); // Check if placed on a template tag.

      if (template.tagName !== 'TEMPLATE') {
        console.warn('Doars: `for` directive must be placed on a `<template>` tag.');
        return;
      }

      var data = parseForExpression(attribute.getValue());

      if (!data) {
        console.error('Doars: Error in `for` expression: ', attribute.getValue());
        return;
      } // Get list of elements already made by this attribute.


      if (!attribute[FOR]) {
        attribute[FOR] = [];
      }

      var elements = attribute[FOR]; // Setup update method.

      var triggers = {};

      var update = function update(id) {
        if (!triggers[id]) {
          triggers[id] = ['$for'];
        }
      }; // Get iterable value.


      var iterable; // Check if iterable is a number.

      if (!isNaN(data.iterable)) {
        iterable = Number(data.iterable);
      } else {
        // Get iterable data, and this will automatically mark the data as being accessed by this component.
        iterable = executeExpression(component, attribute, data.iterable);
      }

      var iterableType = _typeof(iterable); // Process iterable based on type.


      if (iterableType === 'number') {
        for (var index = 0; index < iterable; index++) {
          // Setup variables for context.
          var variables = createVariables(data.variables, index); // Add element based on data after previously iterated value.

          setAfter(component, update, template, elements, index - 1, iterable, variables);
        } // Remove old values.


        removeAfter(component, elements, iterable);
      } else if (iterableType === 'string') {
        for (var _index = 0; _index < iterable.length; _index++) {
          // Get value at index.
          var value = iterable[_index]; // Setup variables for context.

          var _variables = createVariables(data.variables, value, _index); // Add element based on data after previously iterated value.


          setAfter(component, update, template, elements, _index - 1, value, _variables);
        } // Remove old values.


        removeAfter(component, elements, iterable.length);
      } else {
        // We can't rely on Array.isArray since it might be a proxy, therefore we try to convert it to an array.
        var isArray, length;

        try {
          var values = _toConsumableArray(iterable);

          isArray = true;
          length = values.length;
        } catch (_unused) {}

        if (isArray) {
          for (var _index2 = 0; _index2 < length; _index2++) {
            // Get value at index.
            var _value = iterable[_index2]; // Setup variables for context.

            var _variables2 = createVariables(data.variables, _value, _index2); // Add element based on data after previously iterated value.


            setAfter(component, update, template, elements, _index2 - 1, _value, _variables2);
          }
        } else {
          var keys = Object.keys(iterable);
          length = keys.length;

          for (var _index3 = 0; _index3 < length; _index3++) {
            // Get value at index.
            var key = keys[_index3];
            var _value2 = iterable[key]; // Setup variables for context.

            var _variables3 = createVariables(data.variables, key, _value2, _index3); // Add element based on data after previously iterated value.


            setAfter(component, update, template, elements, _index3 - 1, _value2, _variables3);
          }
        } // Remove old values.


        removeAfter(component, elements, length);
      } // Dispatch triggers.


      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        component.update(triggers);
      }
    },
    destroy: function destroy(component, attribute) {
      // Check if an object of lists exists.
      if (!component[FOR]) {
        return;
      } // Check if list made by this attribute exist.


      if (!attribute[FOR]) {
        return;
      } // Get list of elements created by this attribute.


      var elements = attribute[FOR]; // Iterate over generated elements.

      var _iterator = _createForOfIteratorHelper(elements),
          _step;

      try {
        var _loop2 = function _loop2() {
          var element = _step.value;
          // Transition out.
          transitionOut(component, element, function () {
            // Remove element.
            element.remove();
          });
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop2();
        } // Delete list of elements.

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      delete attribute[FOR];
    }
  };

  var directiveHtml = {
    name: 'html',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var element = attribute.getElement(); // Execute value and retrieve html.

      var html = executeExpression(component, attribute, attribute.getValue()); // Assign html.

      if (element.innerHTML !== html) {
        element.innerHTML = html;
      }
    }
  };

  // Import symbols.
  var directiveIf = {
    name: 'if',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression,
          transitionIn = _ref.transitionIn,
          transitionOut = _ref.transitionOut;
      // Deconstruct attribute.
      var template = attribute.getElement(); // Check if placed on a template tag.

      if (template.tagName !== 'TEMPLATE') {
        console.warn('Doars: `if` directive must be placed on a `<template>` tag.');
        return;
      } // Check if it only has one child.


      if (template.childCount > 1) {
        console.warn('Doars: `if` directive must have only one child node.');
        return;
      } // Execute expression.


      var data = executeExpression(component, attribute, attribute.getValue()); // Get existing reference element.

      var element = template[IF];

      if (!data) {
        // If the element exists then transition out and remove the element.
        if (element) {
          transitionOut(component, element, function () {
            element.remove();
          });
        } // Exit early.


        return;
      } // If the reference does not exist create the element.


      if (!element) {
        // Create new element from template.
        element = document.importNode(template.content, true); // Add element after the template element.

        insertAfter(template, element); // Get HTMLElement reference instead of DocumentFragment.

        template[IF] = element = template.nextElementSibling; // Transition element in.

        transitionIn(component, element);
      }
    },
    destroy: function destroy(component, attribute, _ref2) {
      var transitionOut = _ref2.transitionOut;
      // Deconstruct attribute.
      var template = attribute.getElement(); // Get element from template.

      var element = template[IF]; // If the element exists then transition out and remove the element.

      if (element) {
        transitionOut(component, element, function () {
          element.remove();
          template[IF] = undefined;
        });
      }
    }
  };

  // Import symbols.

  var destroy$1 = function destroy(component, attribute) {
    // Exit early if no listeners can be found.
    if (!attribute[INITIALIZED]) {
      return;
    } // Deconstruct component.


    var element = component.getElement(); // Create event name.

    var name = component.getLibrary().getOptions().prefix + '-updated'; // Remove existing listener and delete directive data.

    element.removeEventListener(name, attribute[INITIALIZED].handler);
    delete attribute[INITIALIZED];
  };

  var directiveInitialized = {
    name: 'initialized',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct component.
      var element = component.getElement(); // Deconstruct attribute.

      var value = attribute.getValue(); // Create event name.

      var name = component.getLibrary().getOptions().prefix + '-updated'; // Check if existing listener exists.

      if (attribute[INITIALIZED]) {
        // Exit early if listener has not changed.
        if (attribute[INITIALIZED].value === value) {
          return;
        } // Remove existing listener so we don' listen twice.


        element.removeEventListener(name, attribute[INITIALIZED].handler);
        delete attribute[INITIALIZED];
      }

      var handler = function handler(_ref2) {
        var detail = _ref2.detail;

        // Only execute on self.
        if (detail.component !== component) {
          return;
        } // Execute value using a copy of the attribute since this attribute does not need to update based on what it accesses.


        executeExpression(component, attribute.clone(), value, {}, {
          "return": false
        }); // Call destroy.

        destroy$1(component, attribute);
      }; // Add listener to component.


      element.addEventListener(name, handler, {
        once: true
      }); // Store listener data on the component.

      attribute[INITIALIZED] = {
        handler: handler,
        value: value
      };
    },
    destroy: destroy$1
  };

  var EXECUTION_MODIFIERS = {
    NONE: 0,
    BUFFER: 1,
    DEBOUNCE: 2,
    THROTTLE: 3
  };
  var KEYPRESS_MODIFIERS = ['alt', 'ctrl', 'meta', 'shift'];
  var directiveOn = {
    name: 'on',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var name = attribute.getKeyRaw(); // Check if required key is set.

      if (!name) {
        console.warn('Doars: `on` directive must have a key.');
        return;
      } // Process keyboard events.


      var key;

      if (name.startsWith('keydown-')) {
        key = name.substring(8).toLowerCase();
        name = 'keydown';
      } else if (name.startsWith('keyup-')) {
        key = name.substring(6).toLowerCase();
        name = 'keyup';
      } // Deconstruct attribute.


      var element = attribute.getElement();
      var value = attribute.getValue(); // Check if existing listener exists.

      if (attribute[ON]) {
        // Exit early if value has not changed.
        if (attribute[ON].value === value) {
          return;
        } // Remove existing listener so we don't listen twice.


        attribute[ON].target.removeEventListener(name, attribute[ON].handler); // Clear any ongoing timeouts.

        if (attribute[ON].timeout) {
          clearTimeout(attribute[ON].timeout);
        } // Delete directive data.


        delete attribute[ON];
      } // Deconstruct attribute.


      var modifiers = attribute.getModifiers(); // Process modifiers.
      // Set listener options.

      var options = {};

      if (modifiers.capture) {
        options.capture = true;
      }

      if (modifiers.once) {
        options.once = true;
      }

      if (modifiers.passive) {
        options.passive = true;
      } // Process execution modifiers.


      var executionModifier = EXECUTION_MODIFIERS.NONE;

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
      } else if (modifiers.throttle) {
        executionModifier = EXECUTION_MODIFIERS.THROTTLE;

        if (modifiers.throttle === true) {
          modifiers.throttle = 500;
        }
      } // Store keypress modifiers.


      var keypressModifiers = [];

      if (key) {
        // Convert command and super to meta.
        modifiers.meta = modifiers.meta ? true : modifiers.cmd || modifiers["super"];

        var _iterator = _createForOfIteratorHelper(KEYPRESS_MODIFIERS),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var modifier = _step.value;

            if (modifiers[modifier]) {
              keypressModifiers.push(modifier);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      var handler = function handler(event) {
        // Only fire when self is provided if the target is the element itself.
        if (modifiers.self && event.target !== element) {
          return;
        }

        if (modifiers.outside && element.contains(event.target)) {
          // Don't fire with outside modifier unless the event came from outside.
          return;
        }

        if ((name === 'keydown' || name === 'keyup') && key) {
          // For keyboard events check the key pressed.
          // Check if all key press modifiers are held.
          var _iterator2 = _createForOfIteratorHelper(keypressModifiers),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var keypressModifier = _step2.value;

              if (!event[keypressModifier + 'Key']) {
                return;
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          var eventKey = modifiers.code ? event.code : event.key;

          if (eventKey === ' ') {
            eventKey = 'space';
          }

          eventKey = eventKey.toLowerCase();

          if (key !== eventKey) {
            return;
          }
        } // Prevent default if the prevent modifier is present.


        if (modifiers.prevent) {
          event.preventDefault();
        } // Stop propagation if the stop modifier is present.


        if (modifiers.stop) {
          event.stopPropagation();
        }

        var execute = function execute() {
          // Execute value using a copy of the attribute since this attribute should not update based on what contexts will be accessed.
          executeExpression(component, attribute.clone(), value, {
            $event: event,
            $events: attribute[ON].buffer
          }, {
            "return": false
          }); // Reset the buffer.

          attribute[ON].buffer = [];
        }; // Store event in buffer.


        attribute[ON].buffer.push(event); // Check if we need to apply an execution modifier.

        if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          // Exit early if buffer is not full.
          if (attribute[ON].buffer.length < modifiers.buffer) {
            return;
          }

          execute();
        } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          // Clear existing timeout.
          if (attribute[ON].timeout) {
            clearTimeout(attribute[ON].timeout);
            attribute[ON].timeout = null;
          } // Setup timeout and execute expression when it finishes.


          attribute[ON].timeout = setTimeout(execute, modifiers.debounce);
        } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
          // Get current time in milliseconds.
          var now = window.performance.now(); // Exit early if throttle time has not passed.

          if (attribute[ON].lastExecution && now - attribute[ON].lastExecution < modifiers.throttle) {
            return;
          }

          execute(); // Store new latest execution time.

          attribute[ON].lastExecution = now;
        } else {
          // Execute expression.
          execute();
        }
      }; // Set listener target and start listening.


      var target = modifiers.outside ? document : element;
      target.addEventListener(name, handler, options); // Store listener data on the component.

      attribute[ON] = {
        buffer: [],
        handler: handler,
        target: target,
        timeout: attribute[ON] ? attribute[ON].timeout : undefined,
        value: value
      };
    },
    destroy: function destroy(component, attribute) {
      // Exit early if no listeners can be found.
      if (!attribute[ON]) {
        return;
      } // Deconstruct attribute.


      var key = attribute.getKeyRaw(); // Remove existing listener.

      attribute[ON].target.removeEventListener(key, attribute[ON].handler); // Clear any ongoing timeouts.

      if (attribute[ON].timeout) {
        clearTimeout(attribute[ON].timeout);
      } // Delete directive data.


      delete attribute[ON];
    }
  };

  // Import symbols.

  var destroy = function destroy(component, attribute) {
    // Exit early if not set.
    if (!component[REFERENCES]) {
      return;
    } // Deconstruct attribute.


    var attributeId = attribute.getId(); // Exit early if not the same attribute.

    if (!component[REFERENCES][attributeId]) {
      return;
    } // Deconstruct component.


    var library = component.getLibrary();
    var componentId = component.getId(); // Deconstruct attribute.

    var value = attribute.getValue().trim(); // Remove reference from object.

    delete component[REFERENCES][attributeId]; // Remove context cache.

    delete component[REFERENCES_CACHE]; // Remove object if it is empty now.

    if (Object.keys(component[REFERENCES]).length === 0) {
      delete component[REFERENCES];
    } // Trigger references update.


    library.update([{
      id: componentId,
      path: '$references.' + value
    }]);
  };

  var directiveReference = {
    name: 'reference',
    update: function update(component, attribute) {
      // Deconstruct attribute.
      var value = attribute.getValue().trim(); // Check if value is a valid variable name.

      if (!/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(value)) {
        destroy(component, attribute);
        console.warn('Doars: `reference` directive\'s value not a valid variable name: "' + value + '".');
        return;
      } // Deconstruct component.


      var library = component.getLibrary();
      var componentId = component.getId(); // Deconstruct attribute.

      var element = attribute.getElement();
      var attributeId = attribute.getId(); // Check if references object exists.

      if (!component[REFERENCES]) {
        component[REFERENCES] = {};
      } // Store reference.


      component[REFERENCES][attributeId] = {
        element: element,
        name: value
      }; // Remove context cache.

      delete component[REFERENCES_CACHE]; // Trigger references update.

      library.update([{
        id: componentId,
        path: '$references.' + value
      }]);
    },
    destroy: destroy
  };

  var directiveSelect = {
    name: 'select',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var element = attribute.getElement(); // Check if placed on a select tag.

      var type = element.getAttribute('type');

      if (element.tagName !== 'SELECT' && !(element.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio'))) {
        console.warn('Doars: `select` directive must be placed on a `select` tag or `input` of type checkbox or radio.');
        return;
      } // Execute attribute value.


      var data = executeExpression(component, attribute, attribute.getValue()); // Iterate over the select options.

      if (element.tagName === 'SELECT') {
        for (var _i = 0, _Array$from = Array.from(element.options); _i < _Array$from.length; _i++) {
          var option = _Array$from[_i];
          // Update option if the selected value has changed.
          var select = Array.isArray(data) ? data.includes(option.value) : data === option.value;

          if (option.selected !== select) {
            // Update option's status.
            option.selected = select; // Update option's attribute.

            if (select) {
              option.setAttribute('selected', '');
            } else {
              option.removeAttribute('selected');
            }
          }
        }
      } else if (type === 'checkbox') {
        // Update option if the checked value has changed.
        var checked = data.includes(element.value);

        if (element.checked !== checked) {
          // Update checked attribute.
          if (checked) {
            element.setAttribute('checked', '');
          } else {
            element.removeAttribute('checked');
          }
        }
      } else {
        // Update option if the checked value has changed.
        var _checked = data === element.value;

        if (element.checked !== _checked) {
          // Update checked attribute.
          if (_checked) {
            element.setAttribute('checked', '');
          } else {
            element.removeAttribute('checked');
          }
        }
      }
    }
  };

  var directiveShow = {
    name: 'show',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression,
          transitionIn = _ref.transitionIn,
          transitionOut = _ref.transitionOut;
      // Deconstruct attribute.
      var element = attribute.getElement(); // Execute attribute value.

      var data = executeExpression(component, attribute, attribute.getValue()); // Assign display based on truthiness of expression result.

      if (data) {
        element.style.display = null;
        transitionIn(component, element);
      } else {
        transitionOut(component, element, function () {
          element.style.display = 'none';
        });
      }
    }
  };

  /**
   * Set value on path at object.
   * @param {Object} object Object to set on.
   * @param {Array<String>} path Path to value.
   * @param {Any} value Value to set.
   */

  var set = function set(object, path, value) {
    // Exit early if not an object.
    if (_typeof(object) !== 'object') {
      return;
    }

    var i = 0;

    for (; i < path.length - 1; i++) {
      object = object[path[i]]; // Exit early if not an object.

      if (_typeof(object) !== 'object') {
        return;
      }
    }

    object[path[i]] = value;
  };

  function createDirectiveSync (symbol, getData, contextPrefix) {
    var destroy = function destroy(component, attribute) {
      // Exit early if nothing to destroy.
      if (!attribute[symbol]) {
        return;
      } // Deconstruct attribute.


      var element = attribute.getElement(); // Remove existing event listeners.

      element.removeEventListener('input', attribute[symbol]); // Remove data from attribute.

      delete attribute[symbol];
    };

    return {
      update: function update(component, attribute, _ref) {
        var executeExpression = _ref.executeExpression;
        // Deconstruct attribute.
        var element = attribute.getElement(); // Store whether this call is an update.

        var isNew = !attribute[symbol];

        if (isNew) {
          // Check if placed on a correct tag.
          if (!(element.tagName === 'DIV' && element.hasAttribute('contenteditable')) && element.tagName !== 'INPUT' && element.tagName !== 'SELECT' && element.tagName !== 'TEXTAREA') {
            console.warn('Doars: `sync` directive must be placed on an `<input>`, `<select>`, `<textarea>` tag, or a content editable `div`.');
            return;
          }
        } // Deconstruct attribute.


        var value = attribute.getValue(); // Check if value is a valid variable name.

        if (!/^[_$a-z]{1}[._$a-z0-9]{0,}$/i.test(value)) {
          destroy(component, attribute);
          console.warn('Doars: `sync` directive\'s value not a valid variable name: "' + value + '".');
          return;
        } // Remove context prefix.


        var pathSplit = value;

        if (pathSplit.startsWith(contextPrefix)) {
          pathSplit = pathSplit.substring(contextPrefix.length);
        } // Split value into path segments.


        pathSplit = pathSplit.split('.');

        if (isNew) {
          // Get data for syncing.
          var _getData = getData(component, attribute),
              data = _getData.data,
              id = _getData.id,
              path = _getData.path; // Set handler that updates data based of node tag.


          var handler;

          switch (element.tagName) {
            case 'DIV':
              handler = function handler() {
                set(data, pathSplit, element.innerText);
                return true;
              };

              break;

            case 'INPUT':
              handler = function handler() {
                if (element.type === 'checkbox') {
                  var _dataValue = executeExpression(component, attribute.clone(), value);

                  if (element.checked) {
                    if (!_dataValue) {
                      set(data, pathSplit, [element.value]);
                      return true;
                    }

                    if (!_dataValue.includes(element.value)) {
                      _dataValue.push(element.value);

                      return true;
                    }
                  } else if (_dataValue) {
                    var index = _dataValue.indexOf(element.value);

                    if (index >= 0) {
                      _dataValue.splice(index, 1);

                      return true;
                    }
                  }
                } else if (element.type === 'radio') {
                  var _dataValue2 = executeExpression(component, attribute.clone(), value);

                  if (element.checked) {
                    if (_dataValue2 !== element.value) {
                      set(data, pathSplit, element.value);
                      return true;
                    }
                  } else if (_dataValue2 === element.value) {
                    set(data, pathSplit, null);
                    return true;
                  }
                } else {
                  set(data, pathSplit, element.value);
                  return true;
                }

                return false;
              };

              break;

            case 'TEXTAREA':
              handler = function handler() {
                set(data, pathSplit, element.value);
                return true;
              };

              break;

            case 'SELECT':
              handler = function handler() {
                if (element.multiple) {
                  var values = [];

                  var _iterator = _createForOfIteratorHelper(element.selectedOptions),
                      _step;

                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      var option = _step.value;
                      values.push(option.value);
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }

                  set(data, pathSplit, values);
                  return true;
                }

                set(data, pathSplit, element.selectedOptions[0].value);
                return true;
              };

              break;
          } // Wrap handler so an update is triggered.


          var handlerWrapper = function handlerWrapper() {
            // Call handler.
            if (handler()) {
              // Dispatch update trigger.
              component.getLibrary().update([{
                id: id,
                path: path
              }]);
            }
          }; // Add event listener.


          element.addEventListener('input', handlerWrapper); // Store handler wrapper.

          attribute[symbol] = handlerWrapper;
        }

        var dataValue = executeExpression(component, attribute, value);

        switch (element.tagName) {
          case 'DIV':
          case 'TEXTAREA':
            // Check if current value is different than attribute value.
            if (dataValue !== element.innerText) {
              // Update current value.
              element.innerText = dataValue;
            }

            break;

          case 'INPUT':
            if (element.type === 'checkbox') {
              // Update option if the checked value has changed.
              var checked = dataValue.includes(element.value);

              if (element.checked !== checked) {
                // Update checked value.
                element.checked = checked; // Update checked attribute.

                if (checked) {
                  element.setAttribute('checked', '');
                } else {
                  element.removeAttribute('checked');
                }
              }
            } else if (element.type === 'radio') {
              // Update option if the checked value has changed.
              var _checked = dataValue === element.value;

              if (element.checked !== _checked) {
                // Update checked value.
                element.checked = _checked; // Update checked attribute.

                if (_checked) {
                  element.setAttribute('checked', '');
                } else {
                  element.removeAttribute('checked');
                }
              }
            } else if (dataValue !== element.value) {
              // Check if current value is different than attribute value.
              // Update current value.
              element.setAttribute('value', dataValue);
            }

            break;

          case 'SELECT':
            // Iterate over the select options.
            for (var _i = 0, _Array$from = Array.from(element.options); _i < _Array$from.length; _i++) {
              var option = _Array$from[_i];
              // Update option if the selected value has changed.
              var select = Array.isArray(dataValue) ? dataValue.includes(option.value) : dataValue === option.value;

              if (option.selected !== select) {
                // Update option status.
                option.selected = select; // Update option attribute.

                if (select) {
                  option.setAttribute('selected', '');
                } else {
                  option.removeAttribute('selected');
                }
              }
            }

            break;
        }
      },
      destroy: destroy
    };
  }

  // Import symbols.
  var STATE_PREFIX = '$state.';
  var directive = createDirectiveSync(SYNC_STATE, function (component, attribute) {
    // Add prefix to value.
    var value = attribute.getValue();

    if (!value.startsWith(STATE_PREFIX)) {
      value = STATE_PREFIX + value;
    } // Return directive data.


    return {
      data: component.getState(),
      id: component.getId(),
      path: value
    };
  }, STATE_PREFIX);
  directive.name = 'sync-state';

  var directiveText = {
    name: 'text',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var element = attribute.getElement();
      var modifiers = attribute.getModifiers(); // Execute value and retrieve text.

      var text = executeExpression(component, attribute, attribute.getValue()); // Assign text.

      if (modifiers.content) {
        if (element.textContent !== text) {
          element.textContent = text;
        }
      } else if (element.innerText !== text) {
        element.innerText = text;
      }
    }
  };

  var directiveWatch = {
    name: 'watch',
    update: function update(component, attribute, _ref) {
      var executeExpression = _ref.executeExpression;
      // Deconstruct attribute.
      var value = attribute.getValue(); // Execute attribute expression.

      executeExpression(component, attribute, value, {}, {
        "return": false
      });
    }
  };

  var Doars = /*#__PURE__*/function (_EventDispatcher) {
    _inherits(Doars, _EventDispatcher);

    var _super = _createSuper(Doars);

    /**
     * Create instance.
     * @param {Object} options Options.
     */
    function Doars(options) {
      var _this;

      _classCallCheck(this, Doars);

      _this = _super.call(this); // Deconstruct options.

      var _options = options = Object.assign({
        prefix: 'd',
        root: document.body.firstElementChild
      }, options),
          prefix = _options.prefix,
          root = _options.root; // If root is a string assume it is a selector.


      if (typeof root === 'string') {
        options.root = root = document.querySelector(root);
      } // Validate options.


      {
        if (!prefix) {
          console.error('Doars: `prefix` option not set.');
          return _possibleConstructorReturn(_this);
        }

        if (typeof prefix !== 'string') {
          console.error('Doars: `prefix` option must be of type string.');
          return _possibleConstructorReturn(_this);
        }

        if (!root) {
          console.error('Doars: `root` option not set.');
          return _possibleConstructorReturn(_this);
        }

        if (_typeof(root) !== 'object') {
          console.error('Doars: `root` option must be a string or HTMLElement.');
          return _possibleConstructorReturn(_this);
        }
      } // Create unique identifier.


      var id = Symbol('ID_DOARS'); // Create private variables.

      var isEnabled = false,
          isUpdating = false,
          mutations,
          observer,
          triggers;
      var components = [];
      var contexts = [contextChildren, contextComponent, contextElement, contextDispatch, contextInContext, contextNextTick, contextParent, contextReferences, // Order of `state` before `for` context is important for deconstruction.
      contextState, contextFor];
      var directives = [// Must happen first as other directives can rely on it.
      directiveReference, // Then execute those that modify the document tree, since it could make other directives redundant and save on processing.
      directiveAttribute, directiveFor, directiveHtml, directiveIf, directiveText, // Order does not matter any more.
      directiveCloak, directiveInitialized, directiveOn, directiveSelect, directiveShow, directive, directiveWatch];
      var directivesNames, directivesObject, directivesRegexp;
      /**
       * Whether this is currently enabled.
       * @returns {Boolean} Whether the library is enabled.
       */

      _this.getEnabled = function () {
        return isEnabled;
      };
      /**
       * Get the unique identifier.
       * @returns {Symbol} Unique identifier.
       */


      _this.getId = function () {
        return id;
      };
      /**
       * Get the current options.
       * @returns {Object} Current options.
       */


      _this.getOptions = function () {
        return Object.assign({}, options);
      };
      /**
       * Enable the library.
       * @returns {Doars} This instance.
       */


      _this.enable = function () {
        if (isEnabled) {
          return _assertThisInitialized(_this);
        } // Setup values.


        isUpdating = false;
        mutations = [];
        triggers = {}; // Dispatch event.

        _this.dispatchEvent('enabling', [_assertThisInitialized(_this)]); // Mark as enabled.


        isEnabled = true; // Create list of directive names.

        directivesNames = directives.map(function (directive) {
          return directive.name;
        }); // Create directives object.

        directivesObject = {};

        var _iterator = _createForOfIteratorHelper(directives),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var directive = _step.value;
            directivesObject[directive.name] = directive;
          } // Dynamically create expression for matching any attribute names to known directive keys.

        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        directivesRegexp = new RegExp('^' + prefix + '-(' + directivesNames.join('|') + ')(?:[$-_.a-z0-9]{0,})?$', 'i'); // eslint-disable-line prefer-regex-literals
        // Create mutation observer.

        observer = new MutationObserver(handleMutation.bind(_assertThisInitialized(_this)));
        observer.observe(root, {
          attributes: true,
          childList: true,
          subtree: true
        }); // Scan for components.

        var componentName = prefix + COMPONENT_SUFFIX;
        var elements = root.querySelectorAll('[' + componentName + ']');
        addComponents.apply(void 0, [root.hasAttribute(componentName) ? root : null].concat(_toConsumableArray(elements))); // Dispatch events.

        _this.dispatchEvent('enabled', [_assertThisInitialized(_this)]);

        _this.dispatchEvent('updated', [_assertThisInitialized(_this)]);

        return _assertThisInitialized(_this);
      };
      /**
       * Disable the library.
       * @returns {Doars} This instance.
       */


      _this.disable = function () {
        if (!isEnabled) {
          return _assertThisInitialized(_this);
        } // Disable mutation observer.


        observer.disconnect();
        observer = null; // Reset values.

        isUpdating = mutations = triggers = null; // Dispatch event.

        _this.dispatchEvent('disabling', [_assertThisInitialized(_this)], {
          reverse: true
        }); // Remove components.


        removeComponents.apply(void 0, components); // Reset directives helper.

        directivesNames = directivesObject = directivesRegexp = null; // Mark as disabled.

        isEnabled = false; // Dispatch event.

        _this.dispatchEvent('disabled', [_assertThisInitialized(_this)], {
          reverse: true
        });

        return _assertThisInitialized(_this);
      };
      /**
       * Add components to instance.
       * @param  {...HTMLElement} elements Elements to add as components.
       * @returns {Array<Component>} List of added components.
       */


      var addComponents = function addComponents() {
        var results = [];
        var resultElements = [];

        for (var _len = arguments.length, elements = new Array(_len), _key = 0; _key < _len; _key++) {
          elements[_key] = arguments[_key];
        }

        for (var _i = 0, _elements = elements; _i < _elements.length; _i++) {
          var element = _elements[_i];

          if (!element) {
            continue;
          } // Skip if already a component.


          if (element[COMPONENT]) {
            continue;
          } // Create component.


          var component = new Component(_assertThisInitialized(_this), element); // Add to list.

          components.push(component); // Add to results.

          results.push(component);
          resultElements.push(element);
        }

        if (resultElements.length > 0) {
          // Dispatch event.
          _this.dispatchEvent('components-added', [_assertThisInitialized(_this), resultElements]);
        } // Initialize new components.


        for (var _i2 = 0, _results = results; _i2 < _results.length; _i2++) {
          var _component = _results[_i2];

          _component.initialize();
        } // Update all attributes on new components.


        for (var _i3 = 0, _results2 = results; _i3 < _results2.length; _i3++) {
          var _component2 = _results2[_i3];

          _component2.updateAttributes(_component2.getAttributes());
        }

        return results;
      };
      /**
       * Remove components from instance.
       * @param  {...Component} components Component to remove.
       * @returns {Array<HTMLElement>} List of elements of removed components.
       */


      var removeComponents = function removeComponents() {
        var results = [];

        for (var _len2 = arguments.length, _components = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          _components[_key2] = arguments[_key2];
        }

        for (var _i4 = 0, _components2 = _components; _i4 < _components2.length; _i4++) {
          var component = _components2[_i4];
          // Skip if not in list.
          var index = components.indexOf(component);

          if (index < 0) {
            continue;
          } // Add to results.


          results.push(component.getElement()); // Destroy component.

          component.destroy(); // Remove from list.

          components.splice(index, 1);
        }

        if (results.length > 0) {
          // Dispatch event.
          _this.dispatchEvent('components-removed', [_assertThisInitialized(_this), results]);
        }

        return results;
      };
      /**
       * Get list contexts.
       * @returns {Array<Object>} List of contexts.
       */


      _this.getContexts = function () {
        return [].concat(contexts);
      };
      /**
       * Add contexts at the index. *Can only be called when NOT enabled.*
       * @param {Number} index Index to start adding at.
       * @param {...Object} _contexts List of contexts to add.
       * @returns {Array<Object>} List of added contexts.
       */


      _this.addContexts = function (index) {
        if (isEnabled) {
          console.warn('Doars: Unable to add contexts after being enabled!');
          return;
        }

        if (index < 0) {
          index = contexts.length + index % contexts.length;
        } else if (index > contexts.length) {
          index = contexts.length;
        }

        var results = [];

        for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
          // Get context from list.
          var context = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1]; // Skip if already in list.

          if (contexts.includes(context)) {
            continue;
          } // Add to list.


          contexts.splice(index + i, 0, context); // Add to results.

          results.push(context);
        }

        if (results.length > 0) {
          // Dispatch event.
          _this.dispatchEvent('contexts-added', [_assertThisInitialized(_this), results]);
        }

        return results;
      };
      /**
       * Remove contexts. *Can only be called when NOT enabled.*
       * @param {...Object} _contexts List of contexts to remove.
       * @returns {Array<Object>} List of removed contexts.
       */


      _this.removeContexts = function () {
        if (isEnabled) {
          console.warn('Doars: Unable to remove contexts after being enabled!');
          return;
        }

        var results = [];

        for (var _len3 = arguments.length, _contexts = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          _contexts[_key3] = arguments[_key3];
        }

        for (var _i5 = 0, _contexts2 = _contexts; _i5 < _contexts2.length; _i5++) {
          var context = _contexts2[_i5];
          // Skip if not in list.
          var index = contexts.indexOf(context);

          if (index < 0) {
            continue;
          } // Remove from list.

          results.push(context);
        }

        if (results.length > 0) {
          // Dispatch event.
          _this.dispatchEvent('contexts-removed', [_assertThisInitialized(_this), results]);
        }

        return results;
      };
      /* Directives */

      /**
       * Get list directives.
       * @returns {Array<Object>} List of directives.
       */


      _this.getDirectives = function () {
        return [].concat(directives);
      };
      /**
       * Get list of directive names.
       * @returns {Array<String>} List of directive names.
       */


      _this.getDirectivesNames = function () {
        return _toConsumableArray(directivesNames);
      };
      /**
       * Get object of directives with the directive name as key.
       * @returns {Object} Object of directives.
       */


      _this.getDirectivesObject = function () {
        return Object.assign({}, directivesObject);
      };
      /**
       * Check whether a name matches that of a directive.
       * @param {String} attributeName Name of the attribute to match.
       * @returns {Boolean} Whether the name matches that of a directive.
       */


      _this.isDirectiveName = function (attributeName) {
        return directivesRegexp.test(attributeName);
      };
      /**
       * Add directives at the index. *Can only be called when NOT enabled.*
       * @param {Number} index Index to start adding at.
       * @param  {...Object} _directives List of directives to add.
       * @returns {Array<Object>} List of added directives.
       */


      _this.addDirectives = function (index) {
        if (isEnabled) {
          console.warn('Doars: Unable to add directives after being enabled!');
          return;
        }

        if (index < 0) {
          index = directives.length + index % directives.length;
        } else if (index > directives.length) {
          index = directives.length;
        }

        var results = [];

        for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
          // Get directive from list.
          var directive = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1]; // Skip if already in list.

          if (directives.includes(directive)) {
            continue;
          } // Add to list.


          directives.splice(index + i, 0, directive); // Add to results.

          results.push(directive);
        }

        if (results.length > 0) {
          // Reset directives helpers.
          directivesNames = directivesObject = directivesRegexp = null; // Dispatch event.

          _this.dispatchEvent('directives-added', [_assertThisInitialized(_this), results]);
        }

        return results;
      };
      /**
       * Remove directives. *Can only be called when NOT enabled.*
       * @param  {...Object} _directives List of directives to remove.
       * @returns {Array<Object>} List of removed directives.
       */


      _this.removeDirectives = function () {
        if (isEnabled) {
          console.warn('Doars: Unable to remove directives after being enabled!');
          return;
        }

        var results = [];

        for (var _len4 = arguments.length, _directives = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          _directives[_key4] = arguments[_key4];
        }

        for (var _i6 = 0, _directives2 = _directives; _i6 < _directives2.length; _i6++) {
          var directive = _directives2[_i6];
          // Skip if not in list.
          var index = directives.indexOf(directive);

          if (index < 0) {
            continue;
          } // Remove from list.

          results.push(directive);
        }

        if (results.length > 0) {
          // Reset directives helpers.
          directivesNames = directivesObject = directivesRegexp = null; // Dispatch event.

          _this.dispatchEvent('directives-removed', [_assertThisInitialized(_this), results]);
        }

        return results;
      };
      /**
       * Update directives based on triggers. *Can only be called when enabled.*
       * @param {Array<Object>} _triggers List of triggers to update with.
       */


      _this.update = function (_triggers) {
        if (!isEnabled) {
          // Exit early since it needs to enabled first.
          return;
        }

        if (_triggers) {
          // Add new triggers to existing triggers.
          var _iterator2 = _createForOfIteratorHelper(_triggers),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var trigger = _step2.value;
              // Deconstruct new trigger.
              var _id = trigger.id,
                  path = trigger.path; // Create list at id if not already there.

              if (!(_id in triggers)) {
                triggers[_id] = [path];
                continue;
              } // Add path to list at id.


              if (!triggers[_id].includes(path)) {
                triggers[_id].push(path);
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } // Don't update while another update is going on.


        if (isUpdating) {
          return;
        } // Check if there is something to update.


        if (Object.getOwnPropertySymbols(triggers).length === 0) {
          return;
        } // Set as updating.


        isUpdating = true; // Move update triggers to local scope only.

        _triggers = triggers;
        triggers = {}; // Update each component and collect any triggers.

        var _iterator3 = _createForOfIteratorHelper(components),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var component = _step3.value;
            component.update(_triggers); // If this ever needs to be done in hierarchical order try the following. Go over each component and check if its parent is further down in the list. If so place the component directly after the parent. Then continue iteration over the components. This sorting only has to happen when a component is added to or moved in the hierarchy.
          } // Set as NOT updating.

        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        isUpdating = false; // If there are triggers again then update again.

        if (Object.getOwnPropertySymbols(triggers).length > 0) {
          console.warn('Doars: during an update another update has been triggered. Normally this should not happen unless an expression in one of the directives is modifying a state which could cause a infinite loop!'); // Use an animation frame to delay the update to prevent freezing.

          window.requestAnimationFrame(function () {
            return _this.update();
          });
          return;
        } // If there are any mutation to handle then handle them.


        if (mutations.length > 0) {
          handleMutation();
          return;
        }

        _this.dispatchEvent('updated', [_assertThisInitialized(_this)]);
      };
      /**
       * Handle document mutations by update internal data and executing directives.
       * @param {Array<MutationRecord>} newMutations List of mutations.
       */


      var handleMutation = function handleMutation(newMutations) {
        var _mutations;

        // Add mutations to existing list.
        (_mutations = mutations).push.apply(_mutations, _toConsumableArray(newMutations)); // Don't handle mutations while an update is going on.


        if (isUpdating) {
          return;
        } // Check if there are any mutations to handle.


        if (mutations.length === 0) {
          return;
        } // Set as updating.


        isUpdating = true; // Get mutations to handle.

        newMutations = _toConsumableArray(mutations);
        mutations = []; // Construct component name.

        var componentName = prefix + COMPONENT_SUFFIX; // Store new attribute and elements that define new components.

        var componentsToAdd = [];
        var componentsToRemove = []; // Iterate over mutations.

        var _iterator4 = _createForOfIteratorHelper(newMutations),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var mutation = _step4.value;

            if (mutation.type === 'childList') {
              // Iterate over removed elements.
              var _iterator5 = _createForOfIteratorHelper(mutation.removedNodes),
                  _step5;

              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var element = _step5.value;

                  // Skip if not an element.
                  if (element.nodeType !== 1) {
                    continue;
                  } // Check if element is a component itself.


                  if (element[COMPONENT]) {
                    // Add component to remove list.
                    componentsToRemove.unshift(element[COMPONENT]); // Scan for more components inside this.

                    var componentElements = element.querySelectorAll(componentName);

                    var _iterator7 = _createForOfIteratorHelper(componentElements),
                        _step7;

                    try {
                      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                        var componentElement = _step7.value;

                        if (componentElement[COMPONENT]) {
                          componentsToRemove.unshift(componentElement);
                        }
                      }
                    } catch (err) {
                      _iterator7.e(err);
                    } finally {
                      _iterator7.f();
                    }
                  } else {
                    // Create iterator for walking over all elements in the component, skipping elements that are components and adding those to the remove list.
                    var iterator = walk(element, function (element) {
                      if (element[COMPONENT]) {
                        componentsToRemove.unshift(element[COMPONENT]);
                        return false;
                      }

                      return true;
                    });

                    do {
                      // Check if element has attributes.
                      if (!element[ATTRIBUTES]) {
                        continue;
                      } // Remove attributes from their component.


                      var _iterator8 = _createForOfIteratorHelper(element[ATTRIBUTES]),
                          _step8;

                      try {
                        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                          var attribute = _step8.value;
                          attribute.getComponent().removeAttribute(attribute);
                        }
                      } catch (err) {
                        _iterator8.e(err);
                      } finally {
                        _iterator8.f();
                      }
                    } while (element = iterator());
                  }
                } // Iterate over added elements.

              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }

              var _iterator6 = _createForOfIteratorHelper(mutation.addedNodes),
                  _step6;

              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var _element = _step6.value;

                  // Skip if not an element.
                  if (_element.nodeType !== 1) {
                    continue;
                  } // Scan for new components and add them to the list.


                  var _componentElements = _element.querySelectorAll('[' + componentName + ']');

                  var _iterator9 = _createForOfIteratorHelper(_componentElements),
                      _step9;

                  try {
                    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                      var _componentElement = _step9.value;
                      componentsToAdd.push(_componentElement);
                    } // Check if this elements defines a new component.

                  } catch (err) {
                    _iterator9.e(err);
                  } finally {
                    _iterator9.f();
                  }

                  if (_element.hasAttribute(componentName)) {
                    // Store new component element and exit early.
                    componentsToAdd.push(_element);
                    continue;
                  } // Find nearest component.


                  var component = closestComponent(_element);

                  if (component) {
                    // Scan for and update new attributes.
                    var attributes = component.scanAttributes(_element);
                    component.updateAttributes(attributes);
                    continue;
                  }
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
            } else if (mutation.type === 'attributes') {
              // Check if new component is defined.
              if (mutation.attributeName === componentName) {
                // If a component is already defined ignore the change.
                if (mutation.target[COMPONENT]) {
                  continue;
                } // Get nearest component, this will become the parent.


                var _component4 = closestComponent(mutation.target);

                if (_component4) {
                  // Remove attributes part of nearest component, that will become part of the new component.
                  var _element2 = mutation.target;

                  var _iterator10 = walk(_element2, function (element) {
                    return element.hasAttribute(componentName);
                  });

                  do {
                    var _iterator11 = _createForOfIteratorHelper(_element2[ATTRIBUTES]),
                        _step10;

                    try {
                      for (_iterator11.s(); !(_step10 = _iterator11.n()).done;) {
                        var _attribute2 = _step10.value;

                        _component4.removeAttribute(_attribute2);
                      }
                    } catch (err) {
                      _iterator11.e(err);
                    } finally {
                      _iterator11.f();
                    }
                  } while (_element2 = _iterator10());
                } // Add new component.


                addComponents(mutation.target);
                continue;
              } // Check if a directive is added.


              if (!directivesRegexp.test(mutation.attributeName)) {
                continue;
              } // Get component of mutated element.


              var _component3 = closestComponent(mutation.target);

              if (!_component3) {
                continue;
              } // Get attribute from component and value from element.


              var _attribute = null;

              var _iterator12 = _createForOfIteratorHelper(mutation.target[ATTRIBUTES]),
                  _step11;

              try {
                for (_iterator12.s(); !(_step11 = _iterator12.n()).done;) {
                  var targetAttribute = _step11.value;

                  if (targetAttribute.getName() === mutation.attributeName) {
                    _attribute = targetAttribute;
                    break;
                  }
                }
              } catch (err) {
                _iterator12.e(err);
              } finally {
                _iterator12.f();
              }

              var value = mutation.target.getAttribute(mutation.attributeName); // If no attribute found add it.

              if (!_attribute) {
                if (value) {
                  _component3.addAttribute(mutation.target, mutation.attributeName, value);
                }

                continue;
              } // Update attribute.


              _attribute.setValue(value);

              _component3.updateAttribute(_attribute);
            }
          } // Remove old components.

        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        if (componentsToRemove.length > 0) {
          removeComponents.apply(void 0, componentsToRemove);
        } // Add new components.


        if (componentsToAdd.length > 0) {
          addComponents.apply(void 0, componentsToAdd);
        } // Set as NOT updating.


        isUpdating = false; // If there are any mutation to handle then handle them.

        if (mutations.length > 0) {
          handleMutation();
          return;
        } // If there are any triggers then trigger an update.


        if (Object.getOwnPropertySymbols(triggers).length > 0) {
          _this.update();
        }
      };

      return _this;
    }

    return Doars;
  }(EventDispatcher);

  return Doars;

})));
//# sourceMappingURL=doars.umd.js.map
