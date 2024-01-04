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
npm i @doars/doars @doars/doars-update
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsUpdate from '@doars/doars-update'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsUpdate = DoarsUpdate(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-update@3/dst/doars-update.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsUpdate = window.DoarsUpdate(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-update@3/dst/doars-update.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-update@3/dst/doars-update.iife.js) builds are available via the jsDelivr CDN.

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-update

Executes the attribute each iteration of the update loop. The directive's value should be a function expression.

#### Modifiers

The directive supports the following modifiers.

- `{number} order = {options.defaultOrder}` The execution order of the directive. To change the default order see the [plugin options](#doarsupdate-options).

#### Examples

```HTML
<div d-update="console.log('Update!')">
```

```HTML
<div d-update.order-1000="console.log('Update!')">
```

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### \$update

Get information about the most recent update iteration. The context is an `object` that contains the following properties.

- `{number} current` Current update time in seconds.
- `{number} currentMs` Current update time in milliseconds.
- `{number} delta` Time in between the previous and current update in seconds.
- `{number} deltaMs` Time in between the previous and current update in milliseconds.
- `{number} last` Previous update time in seconds.
- `{number} lastMs` Previous update time in milliseconds.
- `{number} passed` Total time passed in seconds.
- `{number} passedMs` Total time passed in milliseconds.
- `{number} start` Start time of update loop in seconds.
- `{number} startMs` Start time of update loop in milliseconds.

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
  - `@param {object} options = null` [See options](#doarsupdate-options).
  - `@returns {DoarsUpdate}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsUpdate options

- `{number} defaultOrder = 500` Default order modifier value of update directive.
- `{number} stepMinimum = 0` Minimum amount of time in milliseconds between updates.
- `{string} updateContextName = '$update'` The name of the update context.
- `{string} updateDirectiveName = 'update'` The name of the update directive.

## Compatible versions

| `@doars/doars-update` version | `@doars/doars` version |
| ----------------------------- | ---------------------- |
| `3.x`                         | `3.x`                  |
| `2.x`                         | `2.x`                  |
| `1.x`                         | `1.x`                  |
