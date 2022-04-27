<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-view.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-view)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-view?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-view)

</div>

<hr/>

# @doars/doars-view

Plugin that adds a view directive for reacting to intersection changes.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-view
```

```JavaScript
// Import libraries.
import Doars from "@doars/doars";
import DoarsView from "@doars/doars-view";

// Setup a library instance.
const doars = new Doars();

// Setup the plugin.
const doarsView = new DoarsView(doars /*, options */);

// Enable library.
doars.enable();
```

### UMD build from jsDelivr

Add the UMD build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-view@1/dst/doars-view.umd.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsView = new  window.DoarsView(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-view@1/dst/doars-view.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-view@1/dst/doars-view.iife.js)
> builds are also available via the jsDelivr CDN.

## Directives

The following
[directives](https://github.com/doars/doars/tree/main/packages/doars#directives)
are added by the plugin.

### d-view

Executes the attribute when an intersection change is observed on the element.
The directive's value should be a function expression. The directive's name can
either be nothing, `enter`, or `leave`. If the name is `enter` the directive is
only ran when the element enters into view, if the name is `leave` the directive
is only ran when the element exist out of view. If neither is given the
directive is run in either case.

#### Modifiers

The directive supports the following modifiers.

- `{Number} buffer = 5` Amount of times it has to be triggered before the
  directive is called.
- `{Number} debounce = 500` Time in milliseconds the element needs to have been
  in view before the expression is executed.
- `{Number} throttle = 500` Time in milliseconds before the directive can be
  executed again.

#### Examples

```HTML
<div d-view="console.log('Element entered or left the viewport.')">
```

```HTML
<div d-view:enter="console.log('Element entered the viewport.')">
```

```HTML
<div d-view:leave.debounce-750="console.log('Element left the viewport, and has not re-entered for 750 milliseconds.')">
```

## API

### DoarsView

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsview-options).
  - `@returns {DoarsView}`

#### DoarsView options

- `{HTMLElement} root = null` The element to be used as the viewport for
  checking the visibility of the elements. It must be an ancestor of the
  targeted elements. By default it is the browsers viewport.
- `{CSS margin property} rootMargin = '0px'` Margin around the root.
- `{Number|Array<Number>} threshold = 0` Thresholds of visibility the directive
  should be executed. `0` results in as soon as a pixel is in view. `1` results
  in that the entire element needs to be in view. `[0, 0.5, 1]` results in three
  possible calls when it is a pixel in view, 50% in view and entirely in view.

> The options are the same as those of the
> [intersection observer](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API#intersection_observer_options)
> itself.

## Compatible versions

| `@doars/doars-view` version | `@doars/doars` version |
| --------------------------- | ---------------------- |
| `1.x`                       | `1.x`                  |
