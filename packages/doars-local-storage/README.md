<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-local-storage.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-local-storage)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-local-storage?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-local-storage)

</div>

<hr/>

# @doars/doars-local-storage

Plugin that adds a local storage context to get values from and set values in local storage.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-local-storage
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsLocalStorage from '@doars/doars-local-storage'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsLocalStorage = DoarsLocalStorage(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-local-storage@2/dst/doars-local-storage.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsLocalStorage = window.DoarsLocalStorage(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-local-storage@2/dst/doars-local-storage.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-local-storage@2/dst/doars-local-storage.iife.js)
> builds are also available via the jsDelivr CDN.

## Contexts

The following
[contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts)
are added by the plugin.

### $localStorage

Access the local storage object.

#### Examples

```HTML
<!-- Sets a 'hello' cookie to 'world' -->
<div d-initialize="$localStorage.hello = 'world'"></div>
```

```HTML
<!-- Logs the 'hello' cookie the console -->
<div d-initialize="console.log($localStorage.hello)"></div>
```

```HTML
<!-- Deletes the 'hello' cookie -->
<div d-initialize="$localStorage.hello = null"></div>
```

## API

### DoarsLocalStorage

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarslocalstorage-options).
  - `@returns {DoarsLocalStorage}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsLocalStorage options

- `{Boolean} deconstruct = false` Whether to deconstruct the context so when
  accessing the properties you do not need to prefix it with `$localStorage`. Do note
  the `$localStorage` context will be checked after the `$for` and `$state` contexts
  since the `$localStorage` context is inserted before the others. This means that when
  a property exists on both the local storage and state the value from the state
  will be returned.

## Compatible versions

| `@doars/doars-local-storage` version | `@doars/doars` version |
| ------------------------------------ | ---------------------- |
| `2.x`                                | `2.x`                  |
