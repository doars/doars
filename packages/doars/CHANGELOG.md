# CHANGELOG.md

## 2.0.0

- Added additional modifiers to the `on` directive.
- Added setting `simple contexts` to expression context.
- Changed `sync-state` to context agnostic `sync` directive.
- Added `call` and `interpret` expression processors.
- Switched to building the distributed build with `esbuild`.
- Split utilities off to separate `common` package.

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
