<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-update.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-update)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-update?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-update)

</div>

<hr/>

# @doars/doars-update

Plugin that adds an update loop context and directive.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
$ npm i @doars/doars @doars/doars-update
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsUpdate from '@doars/doars-update'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsUpdate = new DoarsUpdate(doars /*, options */)

// Enable library.
doars.enable()
```

### UMD build from jsDelivr

Add the UMD build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-update@1/dst/doars-update.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsUpdate = new window.DoarsUpdate(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-update@1/dst/doars-update.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-update@1/dst/doars-update.iife.js) builds are also available via the jsDelivr CDN.

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-update

Executes the attribute each iteration of the update loop. The directive's value should be a function expression.

#### Modifiers

The directive supports the following modifiers.

- `{Number} order = {options.defaultOrder}` The execution order of the directive. To change the default order see the [plugin options](#doarsupdate-options).

#### Examples

```HTML
<div d-update="console.log('Update!')">
```

```HTML
<div d-update.order-1000="console.log('Update!')">
```

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### $update

Get information about the most recent update iteration. The context is an `Object` that contains the following properties.

- `{Number} current` Current update time in seconds.
- `{Number} currentMs` Current update time in milliseconds.
- `{Number} delta` Time in between the previous and current update in seconds.
- `{Number} deltaMs` Time in between the previous and current update in milliseconds.
- `{Number} last` Previous update time in seconds.
- `{Number} lastMs` Previous update time in milliseconds.
- `{Number} passed` Total time passed in seconds.
- `{Number} passedMs` Total time passed in milliseconds.
- `{Number} start` Start time of update loop in seconds.
- `{Number} startMs` Start time of update loop in milliseconds.

#### Examples

```HTML
<div d-watch="console.log($update)">
```

```HTML
<div d-watch="console.log($update.passedMs)">
```

## API

### DoarsUpdate

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsupdate-options).
  - `@returns {DoarsUpdate}`

#### DoarsUpdate options

- `{Number} defaultOrder = 500` Default order modifier value of update directive.
- `{Number} stepMinimum = 0` Minimum amount of time in milliseconds between updates.
