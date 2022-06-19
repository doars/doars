// src/symbols.js
var VIEW = Symbol("VIEW");

// src/factories/directives/view.js
var EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 3
};
var view_default = (observer) => {
  return {
    name: "view",
    update: (component, attribute, {
      processExpression
    }) => {
      const element = attribute.getElement();
      const key = attribute.getKey();
      const value = attribute.getValue();
      if (attribute[VIEW]) {
        if (attribute[VIEW].value === value) {
          return;
        }
        observer.remove(element, attribute[VIEW].handler);
        if (attribute[VIEW].timeout) {
          clearTimeout(attribute[VIEW].timeout);
        }
        delete attribute[VIEW];
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
        const isChanged = attribute[VIEW].isIntersecting !== event.isIntersecting;
        if (!isChanged) {
          return;
        }
        attribute[VIEW].isIntersecting = event.isIntersecting;
        if (key === "enter" && !event.isIntersecting || key === "leave" && event.isIntersecting) {
          if (attribute[VIEW].timeout) {
            clearTimeout(attribute[VIEW].timeout);
            attribute[VIEW].timeout = null;
          }
          return;
        }
        const execute = () => {
          processExpression(component, attribute.clone(), value, {
            $event: event
          }, {
            return: false
          });
          attribute[VIEW].buffer = [];
        };
        attribute[VIEW].buffer.push(event);
        if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          if (attribute[VIEW].buffer.length < modifiers.buffer) {
            return;
          }
          execute();
        } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          if (attribute[VIEW].timeout) {
            clearTimeout(attribute[VIEW].timeout);
            attribute[VIEW].timeout = null;
          }
          attribute[VIEW].timeout = setTimeout(execute, modifiers.debounce);
        } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
          const now = window.performance.now();
          if (attribute[VIEW].lastExecution && now - attribute[VIEW].lastExecution < modifiers.throttle) {
            return;
          }
          execute();
          attribute[VIEW].lastExecution = now;
        } else {
          execute();
        }
      };
      observer.add(element, handler);
      attribute[VIEW] = {
        buffer: [],
        handler,
        isIntersecting: false,
        timeout: attribute[VIEW] ? attribute[VIEW].timeout : null,
        value
      };
    },
    destroy: (component, attribute) => {
      if (!attribute[VIEW]) {
        return;
      }
      const element = attribute.getElement();
      observer.remove(element, attribute[VIEW].handler);
      if (attribute[VIEW].timeout) {
        clearTimeout(attribute[VIEW].timeout);
      }
      delete attribute[VIEW];
    }
  };
};

// src/ViewObserver.js
var ViewObserver = class {
  constructor(options = null) {
    options = Object.assign({
      root: null,
      rootMargin: "0px",
      threshold: 0
    }, options);
    const items = /* @__PURE__ */ new WeakMap();
    const intersect = (entries) => {
      for (const entry of entries) {
        for (const callback of items.get(entry.target)) {
          callback(entry);
        }
      }
    };
    const intersectionObserver = new IntersectionObserver(intersect, options);
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

// src/DoarsView.js
var DoarsView = class {
  constructor(library, options = null) {
    options = Object.assign({}, options);
    let directiveView, observer;
    library.addEventListener("enabling", () => {
      const _options = Object.assign({}, options);
      if (!_options.root) {
        _options.root = library.getOptions().root;
      }
      observer = new ViewObserver(options);
      directiveView = view_default(observer);
      library.addDirectives(-1, directiveView);
    });
    library.addEventListener("disabling", () => {
      library.removeDirectives(directiveView);
      directiveView = null;
      observer = null;
    });
  }
};
export {
  DoarsView as default
};
//# sourceMappingURL=doars-view.esm.js.map
