// src/constants.js
var PRELOAD_INTERACT = "interact";
var PRELOAD_INTERSECT = "intersect";

// src/symbols.js
var NAVIGATE = Symbol("NAVIGATE");

// ../common/src/utilities/Element.js
var fromString = (string) => {
  const stringStart = string.substring(0, 15).toLowerCase();
  const isDocument = stringStart.startsWith("<!doctype html>") || stringStart.startsWith("<html>");
  if (isDocument) {
    const html = document.createElement("html");
    html.innerHTML = string;
    return html;
  }
  const template = document.createElement("template");
  template.innerHTML = string;
  return template.content.childNodes[0];
};
var insertAfter = (reference, node) => {
  if (reference.nextSibling) {
    reference.parentNode.insertBefore(node, reference.nextSibling);
  } else {
    reference.parentNode.appendChild(node);
  }
};
var isSame = (a, b) => {
  if (a.isSameNode && a.isSameNode(b)) {
    return true;
  }
  if (a.type === 3) {
    return a.nodeValue === b.nodeValue;
  }
  if (a.tagName === b.tagName) {
    return true;
  }
  return false;
};

// ../common/src/utilities/Html.js
var DECODE_LOOKUP = {
  "&amp;": "&",
  "&#38;": "&",
  "&lt;": "<",
  "&#60;": "<",
  "&gt;": ">",
  "&#62;": ">",
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&#34;": '"'
};
var DECODE_REGEXP = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
var decode = (string) => {
  if (typeof string !== "string") {
    return string;
  }
  return string.replaceAll(DECODE_REGEXP, (character) => {
    return DECODE_LOOKUP[character];
  });
};

// ../common/src/utilities/Attribute.js
var copyAttributes = (existingNode, newNode) => {
  const existingAttributes = existingNode.attributes;
  const newAttributes = newNode.attributes;
  let attributeNamespaceURI = null;
  let attributeValue = null;
  let fromValue = null;
  let attributeName = null;
  let attribute = null;
  for (let i = newAttributes.length - 1; i >= 0; --i) {
    attribute = newAttributes[i];
    attributeName = attribute.name;
    attributeNamespaceURI = attribute.namespaceURI;
    attributeValue = attribute.value;
    if (attributeNamespaceURI) {
      attributeName = attribute.localName || attributeName;
      fromValue = existingNode.getAttributeNS(attributeNamespaceURI, attributeName);
      if (fromValue !== attributeValue) {
        existingNode.setAttributeNS(attributeNamespaceURI, attributeName, attributeValue);
      }
    } else {
      if (!existingNode.hasAttribute(attributeName)) {
        existingNode.setAttribute(attributeName, attributeValue);
      } else {
        fromValue = existingNode.getAttribute(attributeName);
        if (fromValue !== attributeValue) {
          if (attributeValue === "null" || attributeValue === "undefined") {
            existingNode.removeAttribute(attributeName);
          } else {
            existingNode.setAttribute(attributeName, attributeValue);
          }
        }
      }
    }
  }
  for (let j = existingAttributes.length - 1; j >= 0; --j) {
    attribute = existingAttributes[j];
    if (attribute.specified !== false) {
      attributeName = attribute.name;
      attributeNamespaceURI = attribute.namespaceURI;
      if (attributeNamespaceURI) {
        attributeName = attribute.localName || attributeName;
        if (!newNode.hasAttributeNS(attributeNamespaceURI, attributeName)) {
          existingNode.removeAttributeNS(attributeNamespaceURI, attributeName);
        }
      } else {
        if (!newNode.hasAttributeNS(null, attributeName)) {
          existingNode.removeAttribute(attributeName);
        }
      }
    }
  }
};

// ../common/src/utilities/Morph.js
var morphNode = (existingNode, newNode) => {
  const nodeType = newNode.nodeType;
  const nodeName = newNode.nodeName;
  if (nodeType === 1) {
    copyAttributes(existingNode, newNode);
  }
  if (nodeType === 3 || nodeType === 8) {
    if (existingNode.nodeValue !== newNode.nodeValue) {
      existingNode.nodeValue = newNode.nodeValue;
    }
  }
  if (nodeName === "INPUT") {
    _updateInput(existingNode, newNode);
  } else if (nodeName === "OPTION") {
    _updateAttribute(existingNode, newNode, "selected");
  } else if (nodeName === "TEXTAREA") {
    _updateTextarea(existingNode, newNode);
  }
};
var morphTree = (existingTree, newTree, options) => {
  if (typeof existingTree !== "object") {
    throw new Error("Existing tree should be an object.");
  }
  if (typeof newTree === "string") {
    newTree = fromString(newTree);
  } else if (typeof newTree !== "object") {
    throw new Error("New tree should be an object.");
  }
  if (options && options.childrenOnly || newTree.nodeType === 11) {
    _updateChildren(existingTree, newTree);
    return existingTree;
  }
  return _updateTree(existingTree, newTree);
};
var _updateInput = (existingNode, newNode) => {
  const newValue = newNode.value;
  const existingValue = existingNode.value;
  _updateAttribute(existingNode, newNode, "checked");
  _updateAttribute(existingNode, newNode, "disabled");
  if (existingNode.indeterminate !== newNode.indeterminate) {
    existingNode.indeterminate = newNode.indeterminate;
  }
  if (existingNode.type === "file") {
    return;
  }
  if (existingValue !== newValue) {
    existingNode.setAttribute("value", newValue);
    existingNode.value = newValue;
  }
  if (newValue === "null") {
    existingNode.value = "";
    existingNode.removeAttribute("value");
  }
  if (!newNode.hasAttributeNS(null, "value")) {
    existingNode.removeAttribute("value");
  } else if (existingNode.type === "range") {
    existingNode.value = newValue;
  }
};
var _updateTextarea = (existingNode, newNode) => {
  const newValue = newNode.value;
  if (existingNode.value !== newValue) {
    existingNode.value = newValue;
  }
  if (existingNode.firstChild && existingNode.firstChild.nodeValue !== newValue) {
    existingNode.firstChild.nodeValue = newValue;
  }
};
var _updateAttribute = (existingNode, newNode, name) => {
  if (existingNode[name] !== newNode[name]) {
    existingNode[name] = newNode[name];
    if (newNode[name]) {
      existingNode.setAttribute(name, "");
    } else {
      existingNode.removeAttribute(name);
    }
  }
};
var _updateTree = (existingTree, newTree) => {
  if (!existingTree) {
    return newTree;
  }
  if (!newTree) {
    return null;
  }
  if (existingTree.isSameNode && existingTree.isSameNode(newTree)) {
    return existingTree;
  }
  if (existingTree.tagName !== newTree.tagName) {
    return newTree;
  }
  morphNode(existingTree, newTree);
  _updateChildren(existingTree, newTree);
  return existingTree;
};
var _updateChildren = (existingNode, newNode) => {
  let existingChild, newChild, morphed, existingMatch;
  let offset = 0;
  for (let i = 0; ; i++) {
    existingChild = existingNode.childNodes[i];
    newChild = newNode.childNodes[i - offset];
    if (!existingChild && !newChild) {
      break;
    } else if (!newChild) {
      existingNode.removeChild(existingChild);
      i--;
    } else if (!existingChild) {
      existingNode.appendChild(newChild);
      offset++;
    } else if (isSame(existingChild, newChild)) {
      morphed = _updateTree(existingChild, newChild);
      if (morphed !== existingChild) {
        existingNode.replaceChild(morphed, existingChild);
        offset++;
      }
    } else {
      existingMatch = null;
      for (let j = i; j < existingNode.childNodes.length; j++) {
        if (isSame(existingNode.childNodes[j], newChild)) {
          existingMatch = existingNode.childNodes[j];
          break;
        }
      }
      if (existingMatch) {
        morphed = _updateTree(existingMatch, newChild);
        if (morphed !== existingMatch) {
          offset++;
        }
        existingNode.insertBefore(morphed, existingChild);
      } else if (!newChild.id && !existingChild.id) {
        morphed = _updateTree(existingChild, newChild);
        if (morphed !== existingChild) {
          existingNode.replaceChild(morphed, existingChild);
          offset++;
        }
      } else {
        existingNode.insertBefore(newChild, existingChild);
        offset++;
      }
    }
  }
};

// src/factories/directives/navigate.js
var NAME = "navigate";
var NAME_LOADER = "-loader";
var NAME_TARGET = "-target";
var HEADER_DATE = "Date";
var HEADER_CACHE_CONTROL = "Cache-Control";
var CACHE_INVALIDATION_CLAUSES = [
  "no-cache",
  "must-revalidate",
  "no-store"
];
var loaderAdd = (attribute, component, libraryOptions, processExpression, transitionIn) => {
  const element = attribute.getElement();
  const directive = attribute.getDirective();
  const attributeName = libraryOptions.prefix + "-" + directive + NAME_LOADER;
  if (!element.hasAttribute(attributeName)) {
    return;
  }
  const loaderTemplate = processExpression(
    component,
    attribute,
    element.getAttribute(attributeName)
  );
  if (!loaderTemplate) {
    return;
  }
  if (loaderTemplate.tagName !== "TEMPLATE") {
    console.warn("Doars: `" + attributeName + "` directive must be placed on a `<template>` tag.");
    return;
  }
  if (loaderTemplate.childCount > 1) {
    console.warn("Doars: `" + attributeName + "` directive must have a single child node.");
    return;
  }
  if (attribute[NAVIGATE].loaderTransitionOut) {
    attribute[NAVIGATE].loaderTransitionOut();
    attribute[NAVIGATE].loaderTransitionOut = null;
  } else if (attribute[NAVIGATE].loaderElement) {
    return;
  }
  let loaderElement = document.importNode(loaderTemplate.content, true);
  insertAfter(loaderTemplate, loaderElement);
  attribute[NAVIGATE].loaderElement = loaderElement = loaderTemplate.nextElementSibling;
  attribute[NAVIGATE].loaderTransitionIn = transitionIn(component, loaderElement);
};
var loaderRemove = (attribute, component, transitionOut) => {
  if (attribute[NAVIGATE].loaderTransitionOut) {
    return;
  }
  if (!attribute[NAVIGATE].loaderElement) {
    return;
  }
  const loaderElement = attribute[NAVIGATE].loaderElement;
  attribute[NAVIGATE].loaderTransitionIn = transitionOut(component, loaderElement, () => {
    if (loaderElement) {
      loaderElement.remove();
    }
  });
};
var validCacheFromHeaders = (headers, maxAge = null) => {
  if (!headers.has(HEADER_DATE) || !headers.has(HEADER_CACHE_CONTROL)) {
    return false;
  }
  const cacheDate = new Date(headers.get(HEADER_DATE));
  const currentDate = /* @__PURE__ */ new Date();
  if (cacheDate > currentDate) {
    return false;
  }
  if (maxAge) {
    const expireDate2 = new Date(cacheDate.getTime() + maxAge);
    if (currentDate > expireDate2) {
      return false;
    }
  }
  const cacheControl = headers.get(HEADER_CACHE_CONTROL).split(",");
  let cacheMaxAge = 0;
  for (const cacheControlItem of cacheControl) {
    if (cacheControlItem.trim().startsWith("max-age=")) {
      cacheMaxAge = parseInt(cacheControlItem.split("=")[1].trim(), 10);
    }
    if (cacheControlItem.trim().startsWith("s-maxage=")) {
      cacheMaxAge = parseInt(cacheControlItem.split("=")[1].trim(), 10);
      break;
    }
  }
  if (cacheMaxAge <= 0) {
    return false;
  }
  const expireDate = new Date(cacheDate.getTime() + cacheMaxAge * 1e3);
  return expireDate >= currentDate;
};
var clearCacheCounter = 0;
var clearCacheInterval = null;
var navigate_default = (options) => {
  let cache = {};
  const setupCacheClearing = () => {
    if (clearCacheCounter > 0) {
      clearCacheCounter++;
      return;
    }
    clearCacheInterval = setInterval(
      () => {
        for (const location in cache) {
          if (!Object.hasOwnProperty.call(cache, location) || !cache.headers) {
            continue;
          }
          if (!validCacheFromHeaders(cache.headers, options.cacheMaxAge)) {
            delete cache[location];
          }
        }
      },
      options.cacheInterval
    );
  };
  const getFromUrl = (url, dispatchEvent) => {
    return new Promise((resolve) => {
      if (window.location.hostname !== url.hostname) {
        resolve(null);
      }
      if (Object.hasOwnProperty.call(cache, url.location)) {
        if (cache[url.location].headers && validCacheFromHeaders(cache[url.location].headers)) {
          resolve(cache[url.location]);
          return;
        }
        if (cache[url.location].listeners) {
          cache[url.location].listeners.push(
            () => {
              resolve(cache[url.location]);
            }
          );
        } else {
          cache[url.location] = {
            listeners: []
          };
        }
      } else {
        cache[url.location] = {
          listeners: []
        };
      }
      dispatchEvent("-started", {
        url
      });
      fetch(url, options.defaultInit).then((response) => {
        if (response.status < 200 || response.status >= 300) {
          dispatchEvent("-failed", {
            response,
            url
          });
          resolve(null);
          return;
        }
        const contentType = response.headers.get("Content-Type");
        if (!contentType.toLowerCase().startsWith("text/html")) {
          console.warn('Returned response not of header type text/html, content type is "' + contentType + '".');
        }
        let allowCache = true;
        if (response.headers.has(HEADER_CACHE_CONTROL)) {
          const cacheControl = response.headers.get(HEADER_CACHE_CONTROL).split(",");
          let maxAge = 0;
          for (const cacheControlItem of cacheControl) {
            const cacheClause = cacheControlItem.trim();
            if (CACHE_INVALIDATION_CLAUSES.indexOf(cacheClause) >= 0) {
              allowCache = false;
              break;
            }
            if (cacheClause.startsWith("s-maxage=")) {
              maxAge = parseInt(cacheClause.split("=")[1].trim(), 10);
              if (maxAge <= 0) {
                allowCache = false;
                break;
              }
            }
            if (cacheClause.startsWith("max-age=") && maxAge <= 0) {
              maxAge = parseInt(cacheClause.split("=")[1].trim(), 10);
              if (maxAge <= 0) {
                allowCache = false;
                break;
              }
            }
          }
        }
        response.text().then((html) => {
          const result = {
            headers: response.headers,
            html
          };
          const listeners = cache[url.location].listeners;
          if (allowCache) {
            cache[url.location] = result;
            setupCacheClearing();
          } else {
            delete cache[url.location];
          }
          resolve(result);
          if (listeners) {
            for (const listener of listeners) {
              listener();
            }
          }
        });
      });
    });
  };
  return {
    name: NAME,
    update: (component, attribute, {
      processExpression,
      transitionIn,
      transitionOut
    }) => {
      const element = attribute.getElement();
      if (element[NAVIGATE]) {
        return;
      }
      const library = component.getLibrary();
      const libraryOptions = library.getOptions();
      const directive = attribute.getDirective();
      const modifiers = attribute.getModifiers();
      const listenerOptions = {};
      if (modifiers.capture) {
        listenerOptions.capture = true;
      }
      const dispatchEvent = (suffix = "", data = {}) => {
        element.dispatchEvent(
          new CustomEvent(
            libraryOptions.prefix + "-" + directive + suffix,
            {
              detail: Object.assign({
                attribute,
                component
              }, data)
            }
          )
        );
      };
      const loadFromUrl = (url) => {
        attribute[NAVIGATE].url = url;
        const identifier = (/* @__PURE__ */ new Date()).toISOString();
        attribute[NAVIGATE].identifier = identifier;
        loaderAdd(
          attribute,
          component,
          libraryOptions,
          processExpression,
          transitionIn
        );
        getFromUrl(url, dispatchEvent).then((result) => {
          if (!attribute[NAVIGATE].identifier || attribute[NAVIGATE].identifier !== identifier) {
            return;
          }
          if (!result) {
            loaderRemove(
              attribute,
              component,
              transitionOut
            );
            delete attribute[NAVIGATE].url;
            delete attribute[NAVIGATE].identifier;
            return;
          }
          let html = result.html;
          if (modifiers.decode) {
            html = decode(result.html);
          }
          let target = null;
          if (modifiers.document) {
            target = document.documentElement;
          } else {
            const attributeName = libraryOptions.prefix + "-" + directive + NAME_TARGET;
            if (element.hasAttribute(attributeName)) {
              target = processExpression(
                component,
                attribute,
                element.getAttribute(attributeName)
              );
            }
            if (!target) {
              target = element;
            }
          }
          if (modifiers.morph) {
            html = fromString(html);
            morphTree(target, html, {
              childrenOnly: !modifiers.outer
            });
          } else if (modifiers.outer) {
            target.outerHTML = html;
          } else {
            target.innerHTML = html;
          }
          let documentTitle = "";
          if (options.headerTitle && result.headers.has(options.headerTitle)) {
            documentTitle = result.headers.get(options.headerTitle);
          }
          if (modifiers.document && modifiers.history) {
            history.pushState({}, documentTitle, url);
          }
          if (documentTitle && document.title !== documentTitle) {
            document.title = documentTitle;
          }
          loaderRemove(
            attribute,
            component,
            transitionOut
          );
          delete attribute[NAVIGATE].url;
          delete attribute[NAVIGATE].identifier;
          dispatchEvent("-loaded", {
            url
          });
        });
      };
      const loadHandler = (event) => {
        const anchor = event.target.closest("a");
        if (!anchor || !anchor.hasAttribute("href")) {
          return;
        }
        const href = anchor.getAttribute("href");
        const url = new URL(href, window.location);
        if (window.location.hostname !== url.hostname) {
          return;
        }
        if (attribute[NAVIGATE].url && attribute[NAVIGATE].url.href === url.href) {
          return;
        }
        event.preventDefault();
        if (modifiers.stop) {
          event.stopPropagation();
        }
        loadFromUrl(url);
      };
      element.addEventListener(
        "click",
        loadHandler,
        listenerOptions
      );
      let historyHandler;
      if (modifiers.document && modifiers.history) {
        historyHandler = (event) => {
          const url = new URL(event.target.location);
          if (attribute[NAVIGATE].url && attribute[NAVIGATE].url.href === url.href) {
            return;
          }
          loadFromUrl(url);
        };
        window.addEventListener(
          "popstate",
          historyHandler,
          { passive: true }
        );
      }
      let destroyPreloader;
      if (modifiers.preload === PRELOAD_INTERACT) {
        const preloadHandler = (event) => {
          const anchor = event.target.closest("a");
          if (!anchor || !anchor.hasAttribute("href")) {
            return;
          }
          const href = anchor.getAttribute("href");
          getFromUrl(new URL(href, window.location), dispatchEvent);
        };
        element.addEventListener(
          "focusin",
          preloadHandler,
          Object.assign({ passive: true }, listenerOptions)
        );
        element.addEventListener(
          "pointerenter",
          preloadHandler,
          Object.assign({ passive: true }, listenerOptions)
        );
        destroyPreloader = () => {
          element.removeEventListener(
            "focusin",
            attribute[NAVIGATE].preloadHandler
          );
          element.removeEventListener(
            "pointerenter",
            attribute[NAVIGATE].preloadHandler
          );
        };
      } else if (modifiers.preload === PRELOAD_INTERSECT) {
        const intersectionObserver = new IntersectionObserver(
          (anchors2) => {
            for (const anchor of anchors2) {
              if (anchor.isIntersecting) {
                getFromUrl(
                  new URL(
                    anchor.target.getAttribute("href"),
                    window.location
                  ),
                  dispatchEvent
                );
              }
            }
          },
          {
            root: null,
            rootMargin: options.intersectionMargin,
            threshold: options.intersectionThreshold
          }
        );
        const mutationObserver = new MutationObserver(
          (mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === "attributes") {
                if (mutation.attributeName === "href" && mutation.target instanceof HTMLElement && mutation.target.tagName === "A") {
                  if (mutation.target.hasAttribute("href")) {
                    intersectionObserver.observe(mutation.target);
                  } else {
                    intersectionObserver.unobserve(mutation.target);
                  }
                }
              } else if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                  if (node instanceof HTMLElement && node.tagName === "A" && node.hasAttribute("href")) {
                    intersectionObserver.observe(node);
                  }
                }
                for (const node of mutation.removedNodes) {
                  if (node instanceof HTMLElement && node.tagName === "A" && node.hasAttribute("href")) {
                    intersectionObserver.unobserve(node);
                  }
                }
              }
            }
          }
        );
        destroyPreloader = () => {
          mutationObserver.disconnect();
          intersectionObserver.disconnect();
        };
        const anchors = element.querySelectorAll("a[href]");
        for (const anchor of anchors) {
          intersectionObserver.observe(anchor);
        }
        mutationObserver.observe(
          element,
          {
            attributes: true,
            childList: true,
            subtree: true
          }
        );
      }
      attribute[NAVIGATE] = {
        cache,
        historyHandler,
        loadHandler,
        destroyPreloader
      };
    },
    destroy: (component, attribute, {
      transitionOut
    }) => {
      if (!attribute[NAVIGATE]) {
        return;
      }
      if (clearCacheCounter > 0) {
        clearCacheCounter--;
        if (clearCacheCounter === 0 && clearCacheInterval) {
          clearInterval(clearCacheInterval);
          cache = {};
        }
      }
      attribute[NAVIGATE].target.removeEventListener(
        "click",
        attribute[NAVIGATE].loadHandler
      );
      if (attribute[NAVIGATE].historyHandler) {
        window.removeEventListener(
          "popstate",
          attribute[NAVIGATE].historyHandler
        );
      }
      if (attribute[NAVIGATE].destroyPreloader) {
        attribute[NAVIGATE].destroyPreloader();
      }
      loaderRemove(
        attribute,
        component,
        transitionOut
      );
      delete attribute[NAVIGATE];
    }
  };
};

// src/DoarsNavigate.js
var DoarsNavigate = function(library, options = null) {
  options = Object.assign({
    cacheInterval: 60 * 1e3,
    cacheMaxAge: 30 * 60 * 1e3,
    fetchOptions: {},
    headerTitle: null,
    intersectionMargin: "0px",
    intersectionThreshold: 0
  }, options);
  let isEnabled = false;
  let navigateDirective;
  const onEnable = () => {
    navigateDirective = navigate_default(options);
    library.addDirectives(-1, navigateDirective);
  };
  const onDisable = () => {
    library.removeDirective(navigateDirective);
    navigateDirective = null;
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
};
var DoarsNavigate_default = DoarsNavigate;
export {
  DoarsNavigate_default as default
};
//# sourceMappingURL=doars-navigate.js.map
