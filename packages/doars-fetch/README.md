<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-fetch.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-fetch)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-fetch?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-fetch)

</div>

<hr/>

# @doars/doars-fetch

Adds a fetch context that handles parsing the returned content.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
$ npm i @doars/doars @doars/doars-fetch
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsFetch from '@doars/doars-fetch'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsFetch = new DoarsFetch(doars /*, options */)

// Enable library.
doars.enable()
```

### UMD build from jsDelivr

Add the UMD build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsFetch = new window.DoarsFetch(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.iife.js) builds are also available via the jsDelivr CDN.

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

// TODO:

## API

### DoarsFetch

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsstorertc-options).
  - `@returns {DoarsFetch}`

#### DoarsFetch options
