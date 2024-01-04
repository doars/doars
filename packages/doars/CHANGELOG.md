# CHANGELOG.md

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
