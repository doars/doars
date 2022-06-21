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

// src/DoarsAlias.js
var DoarsAlias = class {
  constructor(library, options = null) {
    options = deepAssign({}, options);
    let contextAliases, contextsRenamed, directiveAliases, directivesRenamed;
    library.addEventListener("enabling", () => {
      if (options.aliasContexts || options.renameContexts) {
        let insertOffset = 1;
        const contexts = library.getContexts();
        for (let i = contexts.length - 1; i >= 0; i--) {
          const context = contexts[i];
          if (options.renameContexts) {
            const rename = options.renameContexts[context.name];
            if (rename) {
              if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(rename)) {
                console.error("Invalid rename name for context.");
              } else {
                if (!contextsRenamed) {
                  contextsRenamed = {};
                }
                contextsRenamed[rename] = context.name;
                context.name = rename;
              }
            }
          }
          if (options.aliasContexts) {
            const aliases = options.aliasContexts[context.name];
            if (aliases) {
              if (!contextAliases) {
                contextAliases = [];
              }
              if (Array.isArray(aliases)) {
                let inertCount = 0;
                for (const alias of aliases) {
                  if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(alias)) {
                    console.error("Invalid aliases name for context.");
                    continue;
                  }
                  const contextAlias = Object.assign({}, context);
                  contextAlias.name = alias;
                  contextAlias.deconstruct = false;
                  contextAliases.push(contextAlias);
                  inertCount++;
                }
                library.addContexts(i + insertOffset, ...contextAliases.slice(insertOffset - 1));
                insertOffset += inertCount;
              } else if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(aliases)) {
                console.error("Invalid alias name for context.");
              } else {
                const contextAlias = Object.assign({}, context);
                contextAlias.name = aliases;
                contextAlias.deconstruct = false;
                library.addContexts(i + insertOffset, contextAlias);
                insertOffset++;
              }
            }
          }
        }
      }
      if (options.aliasDirectives || options.renameDirectives) {
        let insertOffset = 1;
        const directives = library.getDirectives();
        for (let i = directives.length - 1; i >= 0; i--) {
          const directive = directives[i];
          if (options.renameDirectives) {
            const rename = options.renameDirectives[directive.name];
            if (rename) {
              if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(rename)) {
                console.error("Invalid rename name for directive.");
              } else {
                if (!directivesRenamed) {
                  directivesRenamed = {};
                }
                directivesRenamed[rename] = directive.name;
                directive.name = rename;
              }
            }
          }
          if (options.aliasDirectives) {
            const aliases = options.aliasDirectives[directive.name];
            if (aliases) {
              if (!directiveAliases) {
                directiveAliases = [];
              }
              if (Array.isArray(aliases)) {
                let inertCount = 0;
                for (const alias of aliases) {
                  if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(alias)) {
                    console.error("Invalid aliases name for directive.");
                    continue;
                  }
                  const directiveAlias = Object.assign({}, directive);
                  directiveAlias.name = alias;
                  directiveAliases.push(directiveAlias);
                  inertCount++;
                }
                library.addDirectives(i + insertOffset, ...directiveAliases.slice(insertOffset - 1));
                insertOffset += inertCount;
              } else if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(aliases)) {
                console.error("Invalid alias name for directive.");
              } else {
                const directiveAlias = Object.assign({}, directive);
                directiveAlias.name = aliases;
                library.addDirectives(i + insertOffset, directiveAlias);
                insertOffset++;
              }
            }
          }
        }
      }
    });
    library.addEventListener("disabling", () => {
      if (directiveAliases) {
        library.removeDirectives(...directiveAliases);
        directiveAliases = null;
      }
      if (directivesRenamed) {
        const directives = library.getDirectives();
        for (let i = directives.length - 1; i >= 0; i--) {
          const directive = directives.length[i];
          if (directive.name in directivesRenamed) {
            directive.name = directivesRenamed[directive.name];
          }
        }
        directivesRenamed = null;
      }
      if (contextAliases) {
        library.removeContexts(...contextAliases);
        contextAliases = null;
      }
      if (contextsRenamed) {
        const contexts = library.getContexts();
        for (let i = contexts.length - 1; i >= 0; i--) {
          const context = contexts.length[i];
          if (context.name in contextsRenamed) {
            context.name = contextsRenamed[context.name];
          }
        }
        contextsRenamed = null;
      }
    });
  }
};
export {
  DoarsAlias as default
};
//# sourceMappingURL=doars-alias.esm.js.map
