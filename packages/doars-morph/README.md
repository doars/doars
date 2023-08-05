<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-morph.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-morph)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-morph?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-morph)

</div>

<hr/>

# @doars/doars-morph

Plugin that adds a morph context and directive which instead of setting directly to the innerHTML of an element morphs the DOM to the new structure.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-morph
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsMorph from '@doars/doars-morph'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsMorph = new DoarsMorph(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-morph@2/dst/doars-morph.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsMorph = window.DoarsMorph(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-morph@2/dst/doars-morph.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-morph@2/dst/doars-morph.iife.js)
> builds are also available via the jsDelivr CDN.

## Directives

The following
[directives](https://github.com/doars/doars/tree/main/packages/doars#directives)
are added by the plugin.

### d-morph

#### Modifiers

- `{Boolean} decode = false` If the returned type is a string the value will's special HTML characters will be decoded. For example `&gt;` will become `>`.

#### Examples

```HTML
<!-- Morph the inner HTML of the element to the string. -->
<div d-morph="'<h1>Hello world!</h1>'"></div>
```

```HTML
<!-- Decodes the special HTML characters before morphing the inner HTML of the element to the string. -->
<div d-morph.decode="'&lt;h1&gt;Hello world!&lt;/h1&gt;'"></div>
```

```HTML
<!-- Morph the inner HTML of the element to a value from the state. -->
<div d-morph="$state.message"></div>
```

## API

### DoarsMorph

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@returns {DoarsMorph}`

## Compatible versions

| `@doars/doars-morph` version | `@doars/doars` version |
| ---------------------------- | ---------------------- |
| `2.x`                        | `2.x`                  |
