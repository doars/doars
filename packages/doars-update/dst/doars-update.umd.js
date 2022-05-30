(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DoarsUpdate = factory());
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
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
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
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

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

  var createContextUpdate = (function (updater) {
    // Deconstruct updater.
    var id = updater.getId();
    var proxy = updater.getProxy();
    var time = updater.getTime();
    return {
      name: '$update',
      create: function create(component, attribute) {
        // Create event handlers.
        var onGet = function onGet(target, path) {
          return attribute.accessed(id, path.join('.'));
        }; // Add event listeners.


        proxy.addEventListener('get', onGet);
        return {
          value: time,
          // Remove event listeners.
          destroy: function destroy() {
            proxy.removeEventListener('get', onGet);
          }
        };
      }
    };
  });

  var createDirectiveUpdate = (function (options) {
    // Overwrite default options.
    options = Object.assign({
      defaultOrder: 500
    }, options); // Create list of update directives.

    var itemIds = [];
    var items = [];
    var directive = {
      name: 'update',
      update: function update(component, attribute, _ref) {
        var processExpression = _ref.processExpression;

        // Store execute expression locally.
        if (!this._execute) {
          this._execute = processExpression;
        } // Deconstruct attribute.


        var id = attribute.getId(); // Exit early if already in list.

        if (itemIds.indexOf(id) >= 0) {
          return;
        } // Deconstruct attribute.


        var _attribute$getModifie = attribute.getModifiers(),
            order = _attribute$getModifie.order;

        if (!order) {
          order = options.defaultOrder;
        } // Get index to place item at based on order.


        var index = 0;

        for (var i = 0; i < items.length; i++) {
          if (items[i].order >= order) {
            index = i;
            break;
          }
        } // Add item at index in list.


        items.splice(index, 0, {
          attribute: attribute,
          component: component,
          order: order
        });
      },
      destroy: function destroy(component, attribute) {
        // Deconstruct attribute.
        var id = attribute.getId(); // Exit early if already in list.

        var index = itemIds.indexOf(id);

        if (index >= 0) {
          return;
        } // Remove attribute id from item ids list.


        itemIds.splice(index, 1); // Remove attribute from items list.

        for (var i = 0; i < items.length; i++) {
          if (items[i].attribute === attribute) {
            // Remove item from list.
            items.splice(i, 1);
            break;
          }
        }
      }
    };
    return [directive, function () {
      // Run expression of each item in order.
      var _iterator = _createForOfIteratorHelper(items),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;

          directive._execute(item.component, item.attribute.clone(), item.attribute.getValue(), {}, {
            return: false
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }];
  });

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

  var ProxyDispatcher = /*#__PURE__*/function (_EventDispatcher) {
    _inherits(ProxyDispatcher, _EventDispatcher);

    var _super = _createSuper(ProxyDispatcher);

    function ProxyDispatcher() {
      var _this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, ProxyDispatcher);

      _this = _super.call(this);
      options = Object.assign({
        delete: true,
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
          if (target[key] && typeof target[key] === 'object') {
            target[key] = _this.add(target[key], [].concat(_toConsumableArray(path), [key]));
          }
        } // Create handler and add the handler for which a callback exits..


        var handler = {};

        if (options.delete) {
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


            if (typeof value === 'object') {
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
        map.delete(revocable); // Recursively remove properties as well.

        for (var property in revocable.proxy) {
          if (typeof revocable.proxy[property] === 'object') {
            _this.remove(revocable.proxy[property]);
          }
        } // Revoke proxy.


        revocable.revoke();
      };

      return _this;
    }

    return _createClass(ProxyDispatcher);
  }(EventDispatcher);

  var Updater = /*#__PURE__*/_createClass(function Updater(options, callback) {
    _classCallCheck(this, Updater);

    // Overwrite default options.
    options = Object.assign({
      stepMinimum: 0
    }, options); // Create id.

    var id = Symbol('ID_UPDATE'); // Set private variables.

    var isEnabled = false,
        request; // Setup time proxy.

    var proxy = new ProxyDispatcher({
      // We don't care when they are updated, we have a callback for that. They should never be updated by the user anyway.
      delete: false,
      set: false
    });
    var time = proxy.add({});

    var update = function update(timeAbsolute) {
      // Exit if not enabled any more.
      if (!isEnabled) {
        return;
      } // Request to be updated next frame.


      request = window.requestAnimationFrame(update); // Set initial time values.

      if (!time.startMs) {
        time.currentMs = time.lastMs = time.startMs = timeAbsolute;
        time.current = time.last = time.start = timeAbsolute / 1000;
        time.delta = time.passed = time.deltaMs = time.passedMs = 0; // Exit early after initial update.

        return;
      } // Check if minimum time has been elapsed.


      var deltaMs = timeAbsolute - time.lastMs;

      if (deltaMs <= options.stepMinimum) {
        return;
      } // Update time values.


      time.lastMs = time.currentMs;
      time.last = time.current;
      time.currentMs = timeAbsolute;
      time.current = timeAbsolute / 1000;
      time.deltaMs = deltaMs;
      time.delta = deltaMs / 1000;
      time.passedMs += deltaMs; // Adding the delta could introduce drift because we are not measuring from the start time, hover doing so would case issues if the updater is disabled and later on re-enabled. Due to the high precession the drift will only cause a noticeable effect after a long time, long enough to not cause a problem in most use cases. Long story short, good enough.

      time.passed = time.passedMs / 1000; // Invoke callback.

      callback();
    };
    /**
     * Get whether the instance is enabled.
     * @returns {Bool} Whether the instance is enabled.
     */


    this.isEnabled = function () {
      return isEnabled;
    };
    /**
     * Get updater id.
     * @returns {Symbol} Unique identifier.
     */


    this.getId = function () {
      return id;
    };
    /**
     * Get time proxy.
     * @returns {ProxyDispatcher} Time proxy.
     */


    this.getProxy = function () {
      return proxy;
    };
    /**
     * Get time data.
     * @returns {Proxy} Time data.
     */


    this.getTime = function () {
      return time;
    };
    /**
     * Enable updater.
     */


    this.enable = function () {
      if (isEnabled) {
        return;
      }

      isEnabled = true; // Start update loop.

      request = window.requestAnimationFrame(update);
    };
    /**
     * Disable updater.
     */


    this.disable = function () {
      if (!isEnabled) {
        return;
      }

      isEnabled = false; // Stop updating.

      if (request) {
        cancelAnimationFrame(request);
        request = null;
      }
    };
  });

  var DoarsUpdate = /*#__PURE__*/_createClass(
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  function DoarsUpdate(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, DoarsUpdate);

    options = Object.assign({}, options); // Set private variables.

    var contextUpdate, directiveUpdate, updater; // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      // Create and add directive.
      var _createDirectiveUpdat = createDirectiveUpdate(options),
          _createDirectiveUpdat2 = _slicedToArray(_createDirectiveUpdat, 2),
          _directiveUpdate = _createDirectiveUpdat2[0],
          update = _createDirectiveUpdat2[1];

      directiveUpdate = _directiveUpdate;
      library.addDirectives(-1, directiveUpdate); // Setup update loop.

      updater = new Updater(options, function () {
        // Update all directives.
        update(); // Dispatch update triggers.

        library.update([{
          id: updater.getId(),
          path: 'current'
        }, {
          id: updater.getId(),
          path: 'delta'
        }, {
          id: updater.getId(),
          path: 'last'
        }, {
          id: updater.getId(),
          path: 'passed'
        }]);
      }); // Create and add context.

      contextUpdate = createContextUpdate(updater);
      library.addContexts(0, contextUpdate); // Enable updater.

      updater.enable();
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      // Remove context.
      library.removeContexts(contextUpdate); // Remove directive.

      library.removeDirectives(directiveUpdate); // Disable updater.

      updater.disable(); // Reset private variables.

      contextUpdate = null;
      directiveUpdate = null;
      updater = null;
    });
  });

  return DoarsUpdate;

}));
//# sourceMappingURL=doars-update.umd.js.map
