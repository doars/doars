(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DoarsFetch = factory());
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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
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
            Object.assign(target, _defineProperty({}, key, {}));
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
          Object.assign(target, _defineProperty({}, key, source[key]));
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
    return value && _typeof(value) === 'object' && !Array.isArray(value);
  };

  var parseResponse = function parseResponse(response, type) {
    var promise;

    switch (String.prototype.toLowerCase.call(type)) {
      default:
        console.warn('Unknown response type "' + type + '" used when using the $fetch context.');
        break;

      case 'arraybuffer':
        promise = response.arrayBuffer();
        break;

      case 'blob':
        promise = response.blob();
        break;

      case 'formdata':
        promise = response.formData();
        break;

      case 'json':
        promise = response.json();
        break;
      // HTML and xml need to be converted to text before being able to be parsed.

      case 'element':
      case 'html':
      case 'svg':
      case 'text':
      case 'xml':
        promise = response.text();
        break;
    }

    if (!promise) {
      return null;
    }

    return promise.then(function (response) {
      switch (type) {
        // Convert from html to HTMLElement inside a document fragment.
        case 'element':
          var template = document.createElement('template');
          template.innerHTML = response;
          response = template.content.childNodes[0];
          break;
        // Parse some values via the DOM parser.

        case 'html':
          response = new DOMParser().parseFromString(response, 'text/html');
          break;

        case 'svg':
          response = new DOMParser().parseFromString(response, 'image/svg+xml');
          break;

        case 'xml':
          response = new DOMParser().parseFromString(response, 'application/xml');
          break;
      }

      return response;
    });
  };
  var responseType = function responseType(response) {
    switch (String.prototype.toLowerCase(response.headers.get('content-type'))) {
      case 'text/html':
        return 'html';

      case 'application/json':
      case 'application/ld+json':
      case 'application/vnd.api+json':
        return 'json';

      case 'image/svg+xml':
        return 'svg';

      case 'text/plain':
        return 'text';

      case 'application/xml':
      case 'text/xml':
        return 'xml';
    }

    return null;
  };

  // Import utils.
  var createFetchContext = (function (options) {
    return {
      name: '$fetch',
      create: function create() {
        return {
          value: function value(url) {
            var _init$returnType;

            var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            // Apply default options to init.
            if (options.defaultInit) {
              init = deepAssign(options.defaultInit, init);
            } // Extract optional return type.


            var returnType = (_init$returnType = init.returnType) !== null && _init$returnType !== void 0 ? _init$returnType : null;
            delete init.returnType; // Perform and process fetch request.

            return fetch(url, init).then(function (response) {
              // Automatically base return type on header.
              if (returnType === 'auto' && response.headers.get('content-type')) {
                returnType = responseType(response);
              } // Parse response based on return type.


              if (returnType) {
                response = parseResponse(response, returnType);
              }

              return response;
            });
          }
        };
      }
    };
  });

  var DoarsFetch =
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  function DoarsFetch(library) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, DoarsFetch);

    // Clone options.
    options = Object.assign({
      defaultInit: {}
    }, options); // Create contexts.

    var fetchContext = createFetchContext(options); // Enable plugin when library is enabling.

    library.addEventListener('enabling', function () {
      library.addContexts(0, fetchContext);
    }); // Disable plugin when library is disabling.

    library.addEventListener('disabling', function () {
      library.removeContexts(fetchContext);
    });
  };

  return DoarsFetch;

})));
//# sourceMappingURL=doars-fetch.umd.js.map
