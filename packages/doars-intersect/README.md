<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-intersect.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-intersect)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-intersect?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-intersect)

</div>

<hr/>

# @doars/doars-intersect

Plugin that adds a intersect directive for reacting to intersection changes.

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
const doarsIntersect = new DoarsIntersect(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-intersect@2/dst/doars-intersect.iife.js"></script>
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

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-intersect@1/dst/doars-intersect.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-intersect@1/dst/doars-intersect.iife.js)
> builds are also available via the jsDelivr CDN.

## Directives

The following
[directives](https://github.com/doars/doars/tree/main/packages/doars#directives)
are added by the plugin.

### d-intersect

Executes the attribute when an intersection change is observed on the element.
The directive's value should be a function expression. The directive's name can
either be nothing, `enter`, or `leave`. If the name is `enter` the directive is
only ran when the element enters into intersect, if the name is `leave` the directive
is only ran when the element exist out of intersect. If neither is given the
directive is run in either case.

#### Modifiers

The directive supports the following modifiers.

- `{Number} buffer = 5` Amount of times it has to be triggered before the
  directive is called.
- `{Number} debounce = 500` Time in milliseconds the element needs to have been
  in intersect before the expression is executed.
- `{Number} throttle = 500` Time in milliseconds before the directive can be
  executed again.

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
  - `@param {Object} options = null` [See options](#doarsintersect-options).
  - `@returns {DoarsIntersect}`

#### DoarsIntersect options

- `{HTMLElement} root = null` The element to be used as the viewport for
  checking the visibility of the elements. It must be an ancestor of the
  targeted elements. By default it is the browsers viewport.
- `{CSS margin property} rootMargin = '0px'` Margin around the root.
- `{Number|Array<Number>} threshold = 0` Thresholds of visibility the directive
  should be executed. `0` results in as soon as a pixel is in intersect. `1` results
  in that the entire element needs to be in intersect. `[0, 0.5, 1]` results in three
  possible calls when it is a pixel in intersect, 50% in intersect and entirely in intersect.

> The options are the same as those of the
> [intersection observer](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API#intersection_observer_options)
> itself.

## Compatible versions

| `@doars/doars-intersect` version | `@doars/doars` version |
| -------------------------------- | ---------------------- |
| `2.x`                            | `2.x`                  |
