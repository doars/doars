// src/directives/intersect.js
var INTERSECT = Symbol("INTERSECT");
var EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 3
};
var intersect_default = ({
  intersectDirectiveName
}, observer) => ({
  name: intersectDirectiveName,
  update: (component, attribute, processExpression) => {
    const element = attribute.getElement();
    const key = attribute.getKey();
    const value = attribute.getValue();
    if (attribute[INTERSECT]) {
      if (attribute[INTERSECT].value === value) {
        return;
      }
      observer.remove(element, attribute[INTERSECT].handler);
      if (attribute[INTERSECT].timeout) {
        clearTimeout(attribute[INTERSECT].timeout);
      }
      delete attribute[INTERSECT];
    }
    const modifiers = attribute.getModifiers();
    let executionModifier = EXECUTION_MODIFIERS.NONE;
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
    }
    const handler = (event) => {
      const isChanged = attribute[INTERSECT].isIntersecting !== event.isIntersecting;
      if (!isChanged) {
        return;
      }
      attribute[INTERSECT].isIntersecting = event.isIntersecting;
      if (key === "enter" && !event.isIntersecting || key === "leave" && event.isIntersecting) {
        if (attribute[INTERSECT].timeout) {
          clearTimeout(attribute[INTERSECT].timeout);
          attribute[INTERSECT].timeout = null;
        }
        return;
      }
      const execute = () => {
        processExpression(
          component,
          attribute.clone(),
          value,
          { $event: event },
          { return: false }
        );
        attribute[INTERSECT].buffer = [];
      };
      attribute[INTERSECT].buffer.push(event);
      if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
        if (attribute[INTERSECT].buffer.length < modifiers.buffer) {
          return;
        }
        execute();
      } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
        if (attribute[INTERSECT].timeout) {
          clearTimeout(attribute[INTERSECT].timeout);
          attribute[INTERSECT].timeout = null;
        }
        attribute[INTERSECT].timeout = setTimeout(execute, modifiers.debounce);
      } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
        const now = window.performance.now();
        if (attribute[INTERSECT].lastExecution && now - attribute[INTERSECT].lastExecution < modifiers.throttle) {
          return;
        }
        execute();
        attribute[INTERSECT].lastExecution = now;
      } else {
        execute();
      }
    };
    observer.add(element, handler);
    attribute[INTERSECT] = {
      buffer: [],
      handler,
      isIntersecting: false,
      timeout: attribute[INTERSECT] ? attribute[INTERSECT].timeout : null,
      value
    };
  },
  destroy: (component, attribute) => {
    if (!attribute[INTERSECT]) {
      return;
    }
    const element = attribute.getElement();
    observer.remove(element, attribute[INTERSECT].handler);
    if (attribute[INTERSECT].timeout) {
      clearTimeout(attribute[INTERSECT].timeout);
    }
    delete attribute[INTERSECT];
  }
});

// src/IntersectionObserver.js
var IntersectionObserver = class _IntersectionObserver {
  /**
   * Create observer instance.
   * @param {object} options Intersection observer options.
   */
  constructor(options = null) {
    const items = /* @__PURE__ */ new WeakMap();
    const intersect = (entries) => {
      for (const entry of entries) {
        for (const callback of items.get(entry.target)) {
          callback(entry);
        }
      }
    };
    const intersectionObserver = new _IntersectionObserver(intersect, options);
    this.add = (element, callback) => {
      if (!items.has(element)) {
        items.set(element, []);
      }
      items.get(element).push(callback);
      intersectionObserver.observe(element);
    };
    this.remove = (element, callback) => {
      if (!items.has(element)) {
        return;
      }
      const list = items.get(element);
      const index = list.indexOf(callback);
      if (index >= 0) {
        list.splice(index, 1);
      }
      if (list.length === 0) {
        items.delete(element);
        intersectionObserver.unobserve(element);
      }
    };
  }
};

// src/DoarsIntersect.js
function DoarsIntersect_default(library, options = null) {
  options = Object.assign({
    intersectDirectiveName: "intersect",
    intersectionRoot: null,
    intersectionMargin: "0px",
    intersectionThreshold: 0
  }, options);
  let isEnabled = false;
  let intersectionDirective, intersectionObserver;
  const onEnable = () => {
    const _options = Object.assign({}, options);
    if (!_options.root) {
      _options.root = library.getOptions().root;
    }
    intersectionObserver = new IntersectionObserver({
      root: options.intersectionRoot ? options.intersectionRoot : library.getOptions().root,
      rootMargin: options.intersectionMargin,
      threshold: options.intersectionThreshold
    });
    intersectionDirective = intersect_default(
      options,
      intersectionObserver
    );
    library.addDirectives(-1, intersectionDirective);
  };
  const onDisable = () => {
    library.removeDirectives(intersectionDirective);
    intersectionDirective = null;
    intersectionObserver = null;
  };
  this.disable = () => {
    if (!library.getEnabled() && isEnabled) {
      isEnabled = false;
      library.removeEventListener("enabling", onEnable);
      library.removeEventListener("disabling", onDisable);
    }
  };
  this.enable = () => {
    if (!isEnabled) {
      isEnabled = true;
      library.addEventListener("enabling", onEnable);
      library.addEventListener("disabling", onDisable);
    }
  };
  this.enable();
}
export {
  DoarsIntersect_default as default
};
//# sourceMappingURL=doars-intersect.esm.js.map
