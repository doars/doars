<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-alias.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-alias)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-alias?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-alias)

</div>

<hr/>

# @doars/doars-alias

Plugin for creating aliases or renaming any context or directive.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-alias
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsAlias from '@doars/doars-alias'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsAlias = new DoarsAlias(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-alias@1/dst/doars-alias.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsAlias = window.DoarsAlias(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-alias@1/dst/doars-alias.esm.js)
> and
> [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-alias@1/dst/doars-alias.iife.js)
> builds are also available via the jsDelivr CDN.

## Examples

```JavaScript
// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsAlias = new DoarsAlias(doars, {
  aliasContexts: {
    component: "root",
  },
  renameContexts: {
    references: "refs",
  },
  aliasDirective: {
    attribute: "attr",
    initialized: "init",
  },
  renameDirective: {
    reference: "ref",
  },
})

// Enable library.
doars.enable()
```

## API

### DoarsAlias

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {Object} options = null` [See options](#doarsalias-options).
  - `@returns {DoarsAlias}`

#### DoarsAlias options

- `{Object} aliasContexts` The contexts to alias.
  - `{Array<String>|String} [name]` The alias or aliases of the context.
- `{Object} aliasDirectives` The directives to alias.
  - `{Array<String>|String} [name]` The alias or aliases of the directive.
- `{Object} renameContexts` The contexts to rename.
  - `{String} [name]` The new name of the context.
- `{Object} renameDirectives` The directives to rename.
  - `{String} [name]` The new name of the directive.

> Where `[name]` is the current name of the context or directive that should be
> aliased or renamed.

## Compatible versions

| `@doars/doars-alias` version | `@doars/doars` version |
| ---------------------------- | ---------------------- |
| `1.x`                        | `1.x`                  |
| `2.x`                        | `2.x`                  |
