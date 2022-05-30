// Import utils.
import { deepAssign } from '@doars/utils/src/ObjectUtils.js'

export default class DoarsAlias {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  constructor(library, options = null) {
    // Clone options.
    options = deepAssign({}, options)

    // Store changes made to contexts and directives.
    let contextAliases, contextsRenamed, directiveAliases, directivesRenamed

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      if (options.aliasContexts || options.renameContexts) {
        // Store insert offset so aliases are added directly after the original.
        let insertOffset = 1

        // Iterate over all contexts.
        const contexts = library.getContexts()
        for (let i = contexts.length - 1; i >= 0; i--) {
          const context = contexts[i]

          if (options.renameContexts) {
            const rename = options.renameContexts[context.name]
            if (rename) {
              if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(rename)) {
                console.error('Invalid rename name for context.')
              } else {
                if (!contextsRenamed) {
                  contextsRenamed = {}
                }

                // Store previous name.
                contextsRenamed[rename] = context.name
                // Set new name.
                context.name = rename
              }
            }
          }

          if (options.aliasContexts) {
            const aliases = options.aliasContexts[context.name]
            if (aliases) {
              if (!contextAliases) {
                contextAliases = []
              }

              if (Array.isArray(aliases)) {
                let inertCount = 0
                for (const alias of aliases) {
                  if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(alias)) {
                    console.error('Invalid aliases name for context.')
                    continue
                  }

                  // Create context alias.
                  const contextAlias = Object.assign({}, context)
                  contextAlias.name = alias
                  // Disable deconstruction of aliases.
                  contextAlias.deconstruct = false

                  // Add context alias to lists.
                  contextAliases.push(contextAlias)
                  inertCount++
                }
                // Add new aliases to library.
                library.addContexts(i + insertOffset, ...contextAliases.slice(insertOffset - 1))

                // Increment insertion offset by amount of aliases added.
                insertOffset += inertCount
              } else if (!/^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(aliases)) {
                console.error('Invalid alias name for context.')
              } else {
                // Create context alias.
                const contextAlias = Object.assign({}, context)
                contextAlias.name = aliases
                // Disable deconstruction of aliases.
                contextAlias.deconstruct = false

                // Add alias to library.
                library.addContexts(i + insertOffset, contextAlias)

                // Increment insertion offset.
                insertOffset++
              }
            }
          }
        }
      }

      if (options.aliasDirectives || options.renameDirectives) {
        // Store insert offset so aliases are added directly after the original.
        let insertOffset = 1

        // Iterate over all directives.
        const directives = library.getDirectives()
        for (let i = directives.length - 1; i >= 0; i--) {
          const directive = directives[i]

          if (options.renameDirectives) {
            const rename = options.renameDirectives[directive.name]
            if (rename) {
              if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(rename)) {
                console.error('Invalid rename name for directive.')
              } else {
                if (!directivesRenamed) {
                  directivesRenamed = {}
                }

                // Store previous name.
                directivesRenamed[rename] = directive.name
                // Set new name.
                directive.name = rename
              }
            }
          }

          if (options.aliasDirectives) {
            const aliases = options.aliasDirectives[directive.name]
            if (aliases) {
              if (!directiveAliases) {
                directiveAliases = []
              }

              if (Array.isArray(aliases)) {
                let inertCount = 0
                for (const alias of aliases) {
                  if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(alias)) {
                    console.error('Invalid aliases name for directive.')
                    continue
                  }

                  // Create directive alias.
                  const directiveAlias = Object.assign({}, directive)
                  directiveAlias.name = alias

                  // Add directive alias to lists.
                  directiveAliases.push(directiveAlias)
                  inertCount++
                }
                // Add new aliases to library.
                library.addDirectives(i + insertOffset, ...directiveAliases.slice(insertOffset - 1))

                // Increment insertion offset by amount of aliases added.
                insertOffset += inertCount
              } else if (!/^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(aliases)) {
                console.error('Invalid alias name for directive.')
              } else {
                // Create directive alias.
                const directiveAlias = Object.assign({}, directive)
                directiveAlias.name = aliases

                // Add alias to library.
                library.addDirectives(i + insertOffset, directiveAlias)

                // Increment insertion offset.
                insertOffset++
              }
            }
          }
        }
      }
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove directive aliases first.
      if (directiveAliases) {
        library.removeDirectives(...directiveAliases)

        // Forget aliases.
        directiveAliases = null
      }

      // Undo name changes to directives.
      if (directivesRenamed) {
        // Iterate over all directives.
        const directives = library.getDirectives()
        for (let i = directives.length - 1; i >= 0; i--) {
          const directive = directives.length[i]

          // Check if directive has been renamed.
          if (directive.name in directivesRenamed) {
            // Set old name.
            directive.name = directivesRenamed[directive.name]
          }
        }

        // Forget renames.
        directivesRenamed = null
      }

      // Remove context aliases first.
      if (contextAliases) {
        library.removeContexts(...contextAliases)

        // Forget aliases.
        contextAliases = null
      }

      // Undo name changes to contexts.
      if (contextsRenamed) {
        // Iterate over all contexts.
        const contexts = library.getContexts()
        for (let i = contexts.length - 1; i >= 0; i--) {
          const context = contexts.length[i]

          // Check if context has been renamed.
          if (context.name in contextsRenamed) {
            // Set old name.
            context.name = contextsRenamed[context.name]
          }
        }

        // Forget renames.
        contextsRenamed = null
      }
    })
  }
}
