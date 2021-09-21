(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DoarsAlias = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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

  var DoarsAlias =
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  function DoarsAlias(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, DoarsAlias);

    // Clone options.
    options = deepAssign({}, options); // Store changes made to contexts and directives.

    var contextAliases, contextsRenamed, directiveAliases, directivesRenamed; // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      if (options.aliasContexts || options.renameContexts) {
        // Store insert offset so aliases are added directly after the original.
        var insertOffset = 1; // Iterate over all contexts.

        var contexts = library.getContexts();

        for (var i = contexts.length - 1; i >= 0; i--) {
          var context = contexts[i];

          if (options.renameContexts) {
            var rename = options.renameContexts[context.name];

            if (rename) {
              if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(rename)) {
                console.error('Invalid rename name for context.');
              } else {
                if (!contextsRenamed) {
                  contextsRenamed = {};
                } // Store previous name.


                contextsRenamed[rename] = context.name; // Set new name.

                context.name = rename;
              }
            }
          }

          if (options.aliasContexts) {
            var aliases = options.aliasContexts[context.name];

            if (aliases) {
              if (!contextAliases) {
                contextAliases = [];
              }

              if (Array.isArray(aliases)) {
                var inertCount = 0;

                var _iterator = _createForOfIteratorHelper(aliases),
                    _step;

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var alias = _step.value;

                    if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(alias)) {
                      console.error('Invalid aliases name for context.');
                      continue;
                    } // Create context alias.


                    var contextAlias = Object.assign({}, context);
                    contextAlias.name = alias; // Disable deconstruction of aliases.

                    contextAlias.deconstruct = false; // Add context alias to lists.

                    contextAliases.push(contextAlias);
                    inertCount++;
                  } // Add new aliases to library.

                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                library.addContexts.apply(library, [i + insertOffset].concat(_toConsumableArray(contextAliases.slice(insertOffset - 1)))); // Increment insertion offset by amount of aliases added.

                insertOffset += inertCount;
              } else if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(aliases)) {
                console.error('Invalid alias name for context.');
              } else {
                // Create context alias.
                var _contextAlias = Object.assign({}, context);

                _contextAlias.name = aliases; // Disable deconstruction of aliases.

                _contextAlias.deconstruct = false; // Add alias to library.

                library.addContexts(i + insertOffset, _contextAlias); // Increment insertion offset.

                insertOffset++;
              }
            }
          }
        }
      }

      if (options.aliasDirectives || options.renameDirectives) {
        // Store insert offset so aliases are added directly after the original.
        var _insertOffset = 1; // Iterate over all directives.

        var directives = library.getDirectives();

        for (var _i = directives.length - 1; _i >= 0; _i--) {
          var directive = directives[_i];

          if (options.renameDirectives) {
            var _rename = options.renameDirectives[directive.name];

            if (_rename) {
              if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(_rename)) {
                console.error('Invalid rename name for directive.');
              } else {
                if (!directivesRenamed) {
                  directivesRenamed = {};
                } // Store previous name.


                directivesRenamed[_rename] = directive.name; // Set new name.

                directive.name = _rename;
              }
            }
          }

          if (options.aliasDirectives) {
            var _aliases = options.aliasDirectives[directive.name];

            if (_aliases) {
              if (!directiveAliases) {
                directiveAliases = [];
              }

              if (Array.isArray(_aliases)) {
                var _inertCount = 0;

                var _iterator2 = _createForOfIteratorHelper(_aliases),
                    _step2;

                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    var _alias = _step2.value;

                    if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(_alias)) {
                      console.error('Invalid aliases name for directive.');
                      continue;
                    } // Create directive alias.


                    var directiveAlias = Object.assign({}, directive);
                    directiveAlias.name = _alias; // Add directive alias to lists.

                    directiveAliases.push(directiveAlias);
                    _inertCount++;
                  } // Add new aliases to library.

                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }

                library.addDirectives.apply(library, [_i + _insertOffset].concat(_toConsumableArray(directiveAliases.slice(_insertOffset - 1)))); // Increment insertion offset by amount of aliases added.

                _insertOffset += _inertCount;
              } else if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(_aliases)) {
                console.error('Invalid alias name for directive.');
              } else {
                // Create directive alias.
                var _directiveAlias = Object.assign({}, directive);

                _directiveAlias.name = _aliases; // Add alias to library.

                library.addDirectives(_i + _insertOffset, _directiveAlias); // Increment insertion offset.

                _insertOffset++;
              }
            }
          }
        }
      }
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      // Remove directive aliases first.
      if (directiveAliases) {
        library.removeDirectives.apply(library, _toConsumableArray(directiveAliases)); // Forget aliases.

        directiveAliases = null;
      } // Undo name changes to directives.


      if (directivesRenamed) {
        // Iterate over all directives.
        var directives = library.getDirectives();

        for (var i = directives.length - 1; i >= 0; i--) {
          var directive = directives.length[i]; // Check if directive has been renamed.

          if (directive.name in directivesRenamed) {
            // Set old name.
            directive.name = directivesRenamed[directive.name];
          }
        } // Forget renames.


        directivesRenamed = null;
      } // Remove context aliases first.


      if (contextAliases) {
        library.removeContexts.apply(library, _toConsumableArray(contextAliases)); // Forget aliases.

        contextAliases = null;
      } // Undo name changes to contexts.


      if (contextsRenamed) {
        // Iterate over all contexts.
        var contexts = library.getContexts();

        for (var _i2 = contexts.length - 1; _i2 >= 0; _i2--) {
          var context = contexts.length[_i2]; // Check if context has been renamed.

          if (context.name in contextsRenamed) {
            // Set old name.
            context.name = contextsRenamed[context.name];
          }
        } // Forget renames.


        contextsRenamed = null;
      }
    });
  };

  return DoarsAlias;

})));
//# sourceMappingURL=doars-alias.umd.js.map
