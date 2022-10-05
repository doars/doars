(() => {
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

  // src/utilities/Fetch.js
  var parseResponse = (response, type) => {
    let promise;
    switch (String.prototype.toLowerCase.call(type)) {
      default:
        console.warn('Unknown response type "' + type + '" used when using the $fetch context.');
        break;
      case "arraybuffer":
        promise = response.arrayBuffer();
        break;
      case "blob":
        promise = response.blob();
        break;
      case "formdata":
        promise = response.formData();
        break;
      case "json":
        promise = response.json();
        break;
      case "element":
      case "html":
      case "svg":
      case "text":
      case "xml":
        promise = response.text();
        break;
    }
    if (!promise) {
      return null;
    }
    return promise.then((response2) => {
      switch (type) {
        case "element":
          const template = document.createElement("template");
          template.innerHTML = response2;
          response2 = template.content.childNodes[0];
          break;
        case "html":
          response2 = new DOMParser().parseFromString(response2, "text/html");
          break;
        case "svg":
          response2 = new DOMParser().parseFromString(response2, "image/svg+xml");
          break;
        case "xml":
          response2 = new DOMParser().parseFromString(response2, "application/xml");
          break;
      }
      return response2;
    });
  };
  var responseType = (response) => {
    switch (String.prototype.toLowerCase(response.headers.get("content-type"))) {
      case "text/html":
        return "html";
      case "application/json":
      case "application/ld+json":
      case "application/vnd.api+json":
        return "json";
      case "image/svg+xml":
        return "svg";
      case "text/plain":
        return "text";
      case "application/xml":
      case "text/xml":
        return "xml";
    }
    return null;
  };

  // src/factories/contexts/fetch.js
  var fetch_default = ({
    defaultInit
  }) => {
    return {
      name: "$fetch",
      create: () => {
        return {
          value: (url, init = null) => {
            if (defaultInit) {
              init = deepAssign({}, defaultInit, init);
            }
            let returnType = init.returnType ? init.returnType : null;
            delete init.returnType;
            return fetch(url, init).then((response) => {
              if (returnType === "auto" && response.headers.get("content-type")) {
                returnType = responseType(response);
              }
              if (returnType) {
                response = parseResponse(response, returnType);
              }
              return response;
            });
          }
        };
      }
    };
  };

  // src/DoarsFetch.js
  function DoarsFetch_default(library, options = null) {
    options = Object.assign({
      defaultInit: {},
      encodingConverters: {
        "application/json": () => {
        },
        "application/x-www-form-urlencoded": () => {
        },
        "multipart/formdata": () => {
        }
      }
    }, options);
    let isEnabled = false;
    let fetchContext;
    const onEnable = function() {
      fetchContext = fetch_default(options);
      library.addContexts(0, fetchContext);
    };
    const onDisable = function() {
      library.removeContexts(fetchContext);
      fetchContext = null;
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

  // src/DoarsFetch.iife.js
  window.DoarsFetch = DoarsFetch_default;
})();
//# sourceMappingURL=doars-fetch.iife.js.map
