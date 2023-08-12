(() => {
  // src/factories/contexts/cookies.js
  var cookies_default = (options) => {
    return {
      name: "$cookies",
      create: () => {
      }
    };
  };

  // src/contexts/removeCookie.js
  var removeCookie_default = {
    name: "$removeCookie",
    create: () => {
      return (name) => {
      };
    }
  };

  // src/contexts/setCookie.js
  var setCookie_default = {
    name: "$setCookie",
    create: () => {
      return (name, value, expiration) => {
      };
    }
  };

  // src/DoarsCookies.js
  var DoarsCookies = class {
    constructor(library, options = null) {
      options = Object.assign({}, options);
      const cookieContext = cookies_default(options);
      library.addEventListener("enabling", () => {
        library.addContexts(0, removeCookie_default, setCookie_default, cookieContext);
      });
      library.addEventListener("disabling", () => {
        library.removeContexts(removeCookie_default, setCookie_default, cookieContext);
      });
    }
  };
})();
//# sourceMappingURL=doars-cookies.iife.js.map
