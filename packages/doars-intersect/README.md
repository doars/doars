<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-intersect.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-intersect)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-intersect?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-intersect)

</div>

<hr/>

# @doars/doars-intersect

Plugin that adds an intersect directive for reacting to intersection changes.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-intersect
```

```JavaScript
// Import libraries.
import Doars from '@doars/doars'
import DoarsIntersect from '@doars/doars-intersect'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsIntersect = DoarsIntersect(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-intersect@3/dst/doars-intersect.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsIntersect = window.DoarsIntersect(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-intersect@3/dst/doars-intersect.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-intersect@3/dst/doars-intersect.iife.js) builds are available via the jsDelivr CDN.

## Directives

The following
[directives](https://github.com/doars/doars/tree/main/packages/doars#directives)
are added by the plugin.

### d-intersect

Executes the attribute when an intersection change is observed on the element. The directive's value should be a function expression. The directive's name can either be nothing, `enter`, or `leave`. If the name is `enter` the directive is only ran when the element enters into view, if the name is `leave` the directive is only ran when the element exist out of view. If neither is given the directive is run in either case.

#### Modifiers

The directive supports the following modifiers.

- `{number} buffer = null` Amount of times it has to be triggered before the directive is called.  If set without a specific value then 5 will be used.
- `{number} debounce = null` Time in milliseconds the element needs to have been in view before the expression is executed. If set without a specific value then 500 will be used.
- `{number} delay = null` Time in milliseconds the expression is executed after the element has been in view. If set without a specific value then 500 will be used.
- `{number} throttle = null` Time in milliseconds before the directive can be executed again. If set without a specific value then 500 will be used.

#### Examples

```HTML
<div d-intersect="console.log('Element entered or left the viewport.')">
```

```HTML
<div d-intersect:enter="console.log('Element entered the viewport.')">
```

```HTML
<div d-intersect:leave.debounce-750="console.log('Element left the viewport, and has not re-entered for 750 milliseconds.')">
```

## API

### DoarsIntersect

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See options](#doarsintersect-options).
  - `@returns {DoarsIntersect}`

#### DoarsIntersect options

- `{string} intersectDirectiveName = 'intersect'` The name of the intersect directive.
- `{HTMLElement} intersectionRoot = null` The element to be used as the viewport for checking the visibility of the elements. It must be an ancestor of the targeted elements. By default it is the browsers viewport.
- `{CSS margin property} intersectionMargin = '0px'` Margin around the root.
- `{number|Array<number>} intersectionThreshold = 0` Thresholds of visibility the directive should be executed. `0` results in as soon as a pixel is in view. `1` results in that the entire element needs to be in view. `[0, 0.5, 1]` results in three possible calls when it is a pixel in view, 50% in view and entirely in view.

> The options are the same as those of the
> [intersection observer](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API#intersection_observer_options)
> itself.

## Compatible versions

| `@doars/doars-intersect` version | `@doars/doars` version |
| -------------------------------- | ---------------------- |
| `3.x`                            | `3.x`                  |
| `2.x`                            | `2.x`                  |
