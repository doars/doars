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
npm i @doars/doars @doars/doars-fetch
```

```JavaScript
// Import library.
import Doars from "@doars/doars";
import DoarsFetch from "@doars/doars-fetch";

// Setup a library instance.
const doars = new Doars();

// Setup the plugin.
const doarsFetch = new DoarsFetch(doars /*, options */);

// Enable library.
doars.enable();
```

### UMD build from jsDelivr

Add the UMD build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.umd.js"></script>
<script type="application/javascript">
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

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@1/dst/doars-fetch.iife.js)
> builds are also available via the jsDelivr CDN.

## Contexts

The following
[contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are
added by the plugin.

### \$fetch

Call fetch function.

- Type: `Any`
- Parameters:
  - `{String} url` Url to fetch from.
  - `{Object} init = {}` Fetch init object,
    [see Fetch docs on MDN](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
    However an additional option, `returnType`, has been added to automatically
    get and convert the returned data. The return type can be one of the
    following types: `arrayBuffer`, `blob`, `element`, `html`, `formData`,
    `json`, `svg`, `text`, `xml`, or `auto`. When the value `auto` is used it
    will try to automatically parse the response based on the content type
    header used by the response.

```HTML
<!-- On initialization fetch the data from doars.dev and manually convert it to text and store it as text on the message variable of the state. -->
<div d-state="{ message: 'empty string' }" d-initialized="
  $fetch('https://doars.dev').then((result) => {
    result.text().then((text) => {
      $inContext(({ $state }) => {
        $state.message = text
      })
    })
  })">
  <div d-text="message"></div>
</div>

<!-- On initialization fetch the data from doars.dev and automatically convert it to text and store it as text on the message variable of the state. -->
<div d-state="{ message: 'empty string' }" d-initialized="
  $fetch('https://doars.dev', { returnType: 'text' })
    .then((text) => {
      $inContext(({ $state }) => {
        $state.message = text
      })
    })
  ">

  <div d-text="message"></div>
</div>
```

## API

### DoarsFetch

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsstorertc-options).
  - `@returns {DoarsFetch}`

#### DoarsFetch options

- `{Object} defaultInit = {}` Default init to use, the init object provided when
  calling fetch will be merged with this default.

## Compatible versions

| `@doars/doars-fetch` version | `@doars/doars` version |
| ---------------------------- | ---------------------- |
| `1.x`                        | `1.x`                  |
