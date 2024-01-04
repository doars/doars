<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-persist.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-persist)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-persist?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-persist)

</div>

<hr/>

# @doars/doars-persist

Plugin that adds cookies, local storage, and sessions storage contexts to get and set persistent data.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-persist
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsPersist from '@doars/doars-persist'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsPersist = DoarsPersist(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-persist@3/dst/doars-persist.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsPersist = window.DoarsPersist(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-persist@3/dst/doars-persist.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-persist@3/dst/doars-persist.iife.js) builds are available via the jsDelivr CDN.

## Contexts

The following
[contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts)
are added by the plugin.

### $cookies

Access the cookies object.

#### Examples

```HTML
<!-- Sets a 'hello' cookie to 'world' -->
<div d-initialize="$cookies.hello = 'world'"></div>
```

```HTML
<!-- Logs the 'hello' cookie the console -->
<div d-initialize="console.log($cookies.hello)"></div>
```

```HTML
<!-- Deletes the 'hello' cookie -->
<div d-initialize="$cookies.hello = null"></div>
```

### $localStorage

Access the local storage object.

#### Examples

```HTML
<!-- Sets a 'hello' value on local storage to 'world' -->
<div d-initialize="$localStorage.hello = 'world'"></div>
```

```HTML
<!-- Logs the 'hello' value from local storage the console -->
<div d-initialize="console.log($localStorage.hello)"></div>
```

```HTML
<!-- Deletes the 'hello' local storage value -->
<div d-initialize="$localStorage.hello = null"></div>
```

### $sessionStorage

Access the session storage object.

#### Examples

```HTML
<!-- Sets a 'hello' value on session storage to 'world' -->
<div d-initialize="$sessionStorage.hello = 'world'"></div>
```

```HTML
<!-- Logs the 'hello' value from session storage the console -->
<div d-initialize="console.log($sessionStorage.hello)"></div>
```

```HTML
<!-- Deletes the 'hello' session storage value -->
<div d-initialize="$sessionStorage.hello = null"></div>
```

## API

### DoarsPersist

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See options](#doarspersist-options).
  - `@returns {DoarsPersist}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsPersist options

- `{boolean} cookiesContextDeconstruct = false` Whether to deconstruct the context so when accessing the properties you do not need to prefix it with `$cookies`. Do note the `$cookies` context will be checked after the `$for` and `$state` contexts since the `$cookies` context is inserted before the others. This means that when a property exists on both the cookies and state the value from the state will be returned.
- `{string} cookiesContextName = '$cookies'` The name of the cookies context.
- `{boolean} localStorageContextDeconstruct = false` Whether to deconstruct the context so when accessing the properties you do not need to prefix it with `$localStorage`. Do note the `$localStorage` context will be checked after the `$for` and `$state` contexts since the `$localStorage` context is inserted before the others. This means that when a property exists on both the local storage and state the value from the state will be returned.
- `{string} localStorageContextName = '$localStorage'` The name of the local storage context.
- `{boolean} sessionStorageContextDeconstruct = false` Whether to deconstruct the context so when accessing the properties you do not need to prefix it with `$sessionStorage`. Do note the `$sessionStorage` context will be checked after the `$for` and `$state` contexts since the `$sessionStorage` context is inserted before the others. This means that when a property exists on both the session storage and state the value from the state will be returned.
- `{string} sessionStorageContextName = '$sessionStorage'` The name of the session storage context.

## Compatible versions

| `@doars/doars-persist` version | `@doars/doars` version |
| ------------------------------ | ---------------------- |
| `3.x`                          | `3.x`                  |
