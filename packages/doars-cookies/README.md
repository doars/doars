<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-cookies.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-cookies)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-cookies?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-cookies)

</div>

<hr/>

# @doars/doars-cookies

Plugin that adds a cookies context to add and remove browser cookies

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-cookies
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsCookies from '@doars/doars-cookies'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsCookies = new DoarsCookies(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-cookies@2/dst/doars-cookies.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsCookies = window.DoarsCookies(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-cookies@2/dst/doars-cookies.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-cookies@2/dst/doars-cookies.iife.js)
> builds are also available via the jsDelivr CDN.

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

## API

### DoarsCookies

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@returns {DoarsCookies}`

## Compatible versions

| `@doars/doars-cookies` version | `@doars/doars` version |
| ------------------------------ | ---------------------- |
| `2.x`                          | `2.x`                  |
