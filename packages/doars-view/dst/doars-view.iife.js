var DoarsView = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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

  var VIEW = Symbol('VIEW');

  // Import symbols.

  var EXECUTION_MODIFIERS = {
    NONE: 0,
    BUFFER: 1,
    DEBOUNCE: 2,
    THROTTLE: 3
  };
  function createDirectiveView (observer) {
    return {
      name: 'view',
      update: function update(component, attribute, _ref) {
        var executeExpression = _ref.executeExpression;
        // Deconstruct attribute.
        var element = attribute.getElement();
        var key = attribute.getKey();
        var value = attribute.getValue(); // Check if existing handler exists.

        if (attribute[VIEW]) {
          // Exit early if value has not changed.
          if (attribute[VIEW].value === value) {
            return;
          } // Stop observing the element.


          observer.remove(element, attribute[VIEW].handler); // Clear any ongoing timeouts.

          if (attribute[VIEW].timeout) {
            clearTimeout(attribute[VIEW].timeout);
          } // Delete directive data.


          delete attribute[VIEW];
        } // Deconstruct attribute.


        var modifiers = attribute.getModifiers(); // Process execution modifiers.

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
        } // Create intersection handler.


        var handler = function handler(event) {
          // Check if intersection has changed.
          var isChanged = attribute[VIEW].isIntersecting !== event.isIntersecting;

          if (!isChanged) {
            return;
          } // Update state in attribute data.


          attribute[VIEW].isIntersecting = event.isIntersecting; // Exit early if expression should not be executed.

          if (key === 'enter' && !event.isIntersecting || key === 'leave' && event.isIntersecting) {
            // Clear existing timeout.
            if (attribute[VIEW].timeout) {
              clearTimeout(attribute[VIEW].timeout);
              attribute[VIEW].timeout = null;
            }

            return;
          }

          var execute = function execute() {
            // Execute value using a copy of the attribute since this attribute should not update based on what contexts will be accessed.
            executeExpression(component, attribute.clone(), value, {
              $event: event
            }, {
              return: false
            }); // Reset the buffer.

            attribute[VIEW].buffer = [];
          }; // Store event in buffer.


          attribute[VIEW].buffer.push(event); // Check if we need to apply an execution modifier.

          if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
            // Exit early if buffer is not full.
            if (attribute[VIEW].buffer.length < modifiers.buffer) {
              return;
            }

            execute();
          } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
            // Clear existing timeout.
            if (attribute[VIEW].timeout) {
              clearTimeout(attribute[VIEW].timeout);
              attribute[VIEW].timeout = null;
            } // Setup timeout and execute expression when it finishes.


            attribute[VIEW].timeout = setTimeout(execute, modifiers.debounce);
          } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
            // Get current time in milliseconds.
            var now = window.performance.now(); // Exit early if throttle time has not passed.

            if (attribute[VIEW].lastExecution && now - attribute[VIEW].lastExecution < modifiers.throttle) {
              return;
            }

            execute(); // Store new latest execution time.

            attribute[VIEW].lastExecution = now;
          } else {
            // Execute expression.
            execute();
          }
        }; // Start observing the element.


        observer.add(element, handler); // Store handler.

        attribute[VIEW] = {
          buffer: [],
          handler: handler,
          isIntersecting: false,
          timeout: attribute[VIEW] ? attribute[VIEW].timeout : null,
          value: value
        };
      },
      destroy: function destroy(component, attribute) {
        // Check if a handler exists.
        if (!attribute[VIEW]) {
          return;
        } // Deconstruct attribute.


        var element = attribute.getElement(); // Stop observing the element.

        observer.remove(element, attribute[VIEW].handler); // Clear any ongoing timeouts.

        if (attribute[VIEW].timeout) {
          clearTimeout(attribute[VIEW].timeout);
        } // Delete directive data.


        delete attribute[VIEW];
      }
    };
  }

  var ViewObserver =
  /**
   * Create observer instance.
   * @param {Object} options Intersection observer options.
   */
  function ViewObserver() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ViewObserver);

    // Overwrite default options.
    options = Object.assign({
      root: null,
      rootMargin: '0px',
      threshold: 0
    }, options); // Store data per element.

    var items = new WeakMap();
    /**
     * Intersection observer handler.
     * @param {Array<IntersectionObserverEntry>} entries Intersection observer entries.
     */

    var intersect = function intersect(entries) {
      // Invoke callbacks of each entry.
      var _iterator = _createForOfIteratorHelper(entries),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;

          var _iterator2 = _createForOfIteratorHelper(items.get(entry.target)),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var callback = _step2.value;
              callback(entry);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }; // Create intersection observer.


    var intersectionObserver = new IntersectionObserver(intersect, options);
    /**
     * Add element to observe.
     * @param {HTMLElement} element Element to observer.
     * @param {Function} callback Callback to call on intersection change.
     */

    this.add = function (element, callback) {
      // Add callback to list.
      if (!items.has(element)) {
        items.set(element, []);
      }

      items.get(element).push(callback); // Start observing element.

      intersectionObserver.observe(element);
    };
    /**
     * Remove element from observing.
     * @param {HTMLElement} element Element that is observed.
     * @param {Function} callback Callback that is called on intersection change.
     */


    this.remove = function (element, callback) {
      // Remove callback from list.
      if (!items.has(element)) {
        return;
      }

      var list = items.get(element);
      var index = list.indexOf(callback);

      if (index >= 0) {
        list.splice(index, 1);
      } // Check if there are no more callbacks.


      if (list.length === 0) {
        // Remove element from callbacks list.
        items.delete(element); // Stop observing element.

        intersectionObserver.unobserve(element);
      }
    };
  };

  var DoarsView =
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  function DoarsView(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, DoarsView);

    // Store options.
    options = Object.assign({}, options); // Set private variables.

    var directiveView, observer; // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      // Overwrite default options.
      var _options = Object.assign({}, options);

      if (!_options.root) {
        _options.root = library.getOptions().root;
      } // Setup observer.


      observer = new ViewObserver(options); // Create and add directive.

      directiveView = createDirectiveView(observer);
      library.addDirectives(-1, directiveView);
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      // Remove directive.
      library.removeDirectives(directiveView);
      directiveView = null; // Remove observer.

      observer = null;
    });
  };

  return DoarsView;

}());
//# sourceMappingURL=doars-view.iife.js.map
