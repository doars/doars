(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DoarsStore = factory());
}(this, (function () { 'use strict';

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

  function createContextStore (options, id, store, proxy) {
    return {
      deconstruct: !!options.deconstruct,
      name: '$store',
      create: function create(component, attribute, update, _ref) {
        var RevocableProxy = _ref.RevocableProxy;

        // Create event handlers.
        var onDelete = function onDelete(target, path) {
          return update(id, path.join('.'));
        };

        var onGet = function onGet(target, path) {
          return attribute.accessed(id, path.join('.'));
        };

        var onSet = function onSet(target, path) {
          return update(id, path.join('.'));
        }; // Add event listeners.


        proxy.addEventListener('delete', onDelete);
        proxy.addEventListener('get', onGet);
        proxy.addEventListener('set', onSet); // Wrap in a revocable proxy.

        var revocable = RevocableProxy(store, {});
        return {
          value: revocable.proxy,
          // Remove event listeners.
          destroy: function destroy() {
            proxy.removeEventListener('delete', onDelete);
            proxy.removeEventListener('get', onGet);
            proxy.removeEventListener('set', onSet); // Revoke access to store.

            revocable.revoke();
          }
        };
      }
    };
  }

  var SYNC_STORE = Symbol('SYNC_STORE');

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
  /**
   * Set value on path at object.
   * @param {Object} object Object to set on.
   * @param {Array<String>} path Path to value.
   * @param {Any} value Value to set.
   */

  var set = function set(object, path, value) {
    // Exit early if not an object.
    if (typeof object !== 'object') {
      return;
    }

    var i = 0;

    for (; i < path.length - 1; i++) {
      object = object[path[i]]; // Exit early if not an object.

      if (typeof object !== 'object') {
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
  var STORE_PREFIX = '$store.';
  function createDirectiveSyncStore (id, store) {
    var directive = createDirectiveSync(SYNC_STORE, function (component, attribute) {
      // Remove prefix from value.
      var value = attribute.getValue();

      if (value.startsWith(STORE_PREFIX)) {
        value = value.substring(STORE_PREFIX.length);
      } // Return directive data.


      return {
        data: store,
        id: id,
        path: value
      };
    }, STORE_PREFIX);
    directive.name = 'sync-store';
    return directive;
  }

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

    return ProxyDispatcher;
  }(EventDispatcher);

  var DoarsStore =
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   * @param {Object} datastore Initial datastore's data.
   */
  function DoarsStore(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var datastore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, DoarsStore);

    // Clone options.
    options = Object.assign({
      deconstruct: false
    }, options); // Set private variables.

    var contextStore, datastoreCopy, directiveSyncStore, proxy, store; // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      // Create proxy.
      datastoreCopy = deepAssign({}, datastore);
      proxy = new ProxyDispatcher();
      store = proxy.add(datastoreCopy); // Create store id.

      var id = Symbol('ID_STORE'); // Create contexts.

      contextStore = createContextStore(options, id, store, proxy); // Get index of state and insert the context directly before it.

      var existingContexts = library.getContexts();
      var stateIndex = 0;

      for (var i = existingContexts.length - 1; i >= 0; i--) {
        var context = existingContexts[i];

        if (context.name === '$state') {
          stateIndex = i;
          break;
        }
      }

      library.addContexts(stateIndex, contextStore); // Create and add directive.

      directiveSyncStore = createDirectiveSyncStore(id, store);
      library.addDirectives(-1, directiveSyncStore);
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      // Remove contexts.
      library.removeContexts(contextStore); // Remove directive.

      library.removeDirective(directiveSyncStore); // Reset references.

      store = null;
      proxy.remove(datastoreCopy);
      proxy = null;
      datastoreCopy = null;
      directiveSyncStore = null;
      contextStore = null;
    });
  };

  return DoarsStore;

})));
//# sourceMappingURL=doars-store.umd.js.map
