# CHANGELOG.md

## 3.1.0

- Added `d-navigate-select` directive.

## 3.0.1

- Updated to use new fetch and parse utility.

## 3.0.0

- Added `esm` suffix back onto ESM builds.
- Added renaming option.
- Added evaluation option.
- Removed caching options.
- Removed document title header option.
- Renamed `loaded` event to `succeeded`.
- Renamed `navigate-loader` directive to `indicator`.
- Renamed `navigate-target` directive to `target`.

## 2.1.4

- Remove accidental inclusion of core library from plugin.

## 2.1.3

- Added `Vary` header pointing to the `d-request` header.

## 2.1.2

- Added `d-request` header to every request denoting the directive name used.
- Fix issue where fetch options weren't applied.

## 2.1.1

- Fixed issue with morph modifier.

## 2.1.0

- Allow `loader` and `target` to return element selectors in addition to elements.

## 2.0.0

- Initial release.
