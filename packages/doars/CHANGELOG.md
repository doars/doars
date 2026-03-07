# CHANGELOG.md

## 4.0.0

- Removed `content` modifier of `text` directive, the `text` directive now writes to `textContent` instead of `innerText` by default.
- Removed `transition` events.
- Removed unused functions and events from `Doars`, `Component`, and `Attribute`.
- Added `clone` modifier to `html` directive.
- Added `inner` modifier to the `text` directive.
- Added support for `NodeList` as a return type to the `html` directive.
- Added support for `outer` modifier when return a `Node` to the `html` directive.
- Changed how data access and update triggers are handled and stored.
- Bug fixes.
- Performance improvements.

## 3.1.1

- Fix error when using `for` and `if` directives.

## 3.1.0

- Added delay modifier to `on` directive.
- Added `selectFromElementDirectiveName` and `selectFromElementDirectiveEvaluate` option.

## 3.0.3

- Fixed reading of `referenceDirectiveEvaluate` function.

## 3.0.0

- Added `esm` suffix back onto ESM builds.
- Added `morph` modifier to the `html` directive.
- Added `store` context.
- Added type definitions.
- Changed `reference` directive to run as an expression.
- Fixed issue in `sync` directive for paths.
- Removed utility object parameter from create function of contexts.

## 2.1.0

- Add `outer` modifier to `html` directive.

## 2.0.0

- Added additional modifiers to the `on` directive.
- Added setting `simple contexts` to expression context.
- Changed `sync-state` to context agnostic `sync` directive.
- Added `call` and `interpret` expression processors.
- Switched to building the distributed build with `esbuild`.
- Split utilities off into a separate `common` package.
- Split `morph` modifier from `html` directive off into a separate `morph` plugin.

## 1.2.0

- Fixed `morph` modifier when the root node changes.
- Add promise support to directives expecting a value.

## 1.1.2

- Fixes.

## 1.1.1

- Fixed reactivity of `$inContext` context.

## 1.1.0

- Added `ignore` directive.
- Added `morphNode`, and `morphTree` to directive utils.
- Added `morph` modifiers to `html` directive.

## 1.0.0

- Initial release.
