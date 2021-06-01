<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/doars/doars-store.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/doars/doars-store)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/doars/doars-store?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/doars/doars-store)

</div>

<hr/>

# @doars/doars-store

Plugin that adds a store context for global state management.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
$ npm i @doars/doars @doars/doars-store
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsStore from '@doars/doars-store'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsStore = new DoarsStore(doars /*, options, data */)

// Enable library.
doars.enable()
```

### UMD build from jsDelivr

Add the UMD build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/doars/doars@1/dst/doars.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/doars/doars-store@1/dst/doars-store.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsStore = new window.DoarsStore(doars /*, options, data */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/doars/doars-store@1/dst/doars-store.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/doars/doars-store@1/dst/doars-store.iife.js) builds are also available via the jsDelivr CDN.

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-sync-store

Keep the value of an element in sync with a value in the store. It works on input, checkbox, radio, select, and text area elements, as wel as divs with the [content editable](https://developer.mozilla.org/docs/Web/Guide/HTML/Editable_content) attribute. The directive's value should be a dot separated path to a property on the store.

#### Examples

```HTML
<input type="text" name="message" d-sync-store="message" />
```

```HTML
<input type="text" name="status" d-sync-store="messenger.status" />
```

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### $store

Access the datastore object.

#### Examples

```HTML
<!-- Read from the data store. -->
<div d-text="$store.message"></div>
```

```HTML
<!-- Write to the data store. -->
<div d-on:click="$store.message = 'Hello there!'"></div>
```

```HTML
<!-- Access directly if the deconstruct option is set to true. -->
<div d-text="message"></div>
```

```HTML
<!-- If the deconstruct option is set, but the same key exists on the state. -->
<div d-state="{ message: 'Hello there!' }">
  <!-- Then 'Hello there!' will be read instead of the value from the data store. -->
  <div d-text="message"></div>
</div>
```

## API

### DoarsStore

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsstore-options).
  - `@param {Object} datastore = {}` Initial datastore data.
  - `@returns {DoarsStore}`

#### DoarsStore options

- `{Boolean} deconstruct = false` Whether to deconstruct the context so when accessing the properties you do not need to prefix it with `$store`. Do note the `$store` context will be checked after the `$for` and `$state` contexts since the `$store` context is inserted before the others. This means that when a property exists on both the store and state the value from the state will be returned.
