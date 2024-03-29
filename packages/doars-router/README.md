<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-router.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-router)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-router?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-router)

</div>

<hr/>

# @doars/doars-router

Plugin that adds a router context with set of directives to control it.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-router
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsRouter from '@doars/doars-router'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsRouter = DoarsRouter(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-router@3/dst/doars-router.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsRouter = window.DoarsRouter(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-router@3/dst/doars-router.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-router@3/dst/doars-router.iife.js) builds are available via the jsDelivr CDN.

## Directives

The following
[directives](https://github.com/doars/doars/tree/main/packages/doars#directives)
are added by the plugin.

### d-route

Define a new route, which will automatically be added to the closest router in the document. The directive's value should be the path of the route to set active.

#### Examples

```HTML
<div d-route="/user/me/">
  <!-- Route content -->
</div>
```

```HTML
<template d-route="/user/me/">
  <!-- Route content -->
</template>
```

### d-router

Define an new router, which will manage all routes directly below it in the document. The directive's value can optionally be a function expression returning an object in the for of [router options](#router-options). The returned options will override the default options given to the plugin.

#### Examples

```HTML
<div d-router>
  <!-- Routes and other content -->
</div>
```

```HTML
<div d-router="{ /* options */ }">
  <!-- Routes and other content -->
</div>
```

### d-route-to

Navigate to the specified route when the user clicks on or in the element with this directive. The directive's value should be the path to navigate to.

#### Modifiers

- `{boolean} prevent = false` Whether to call `preventDefault` on the event invoking the route change.
- `{boolean} self = false` Whether the target of the event invoking the route change must be the directive's element itself and not an underlying element.
- `{boolean} stop = false` Whether to call `stopPropagation` on the event invoking the route change.

#### Examples

```HTML
<button d-route-to="/user/me/">
  Go to me
</button>
```

```HTML
<button d-route-to.prevent.stop="/user/me/">
  Go to me
</button>
```

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### \$router

Access the closest [Router](#router) instance. The closest router is retrieved by going up in the document tree looking for a [`d-router`](#d-router) directive.

#### Examples

```HTML
<button d-on:click="$router.setPath('/user/me/')">
  Go to me
</button>
```

## API

### DoarsRouter

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See router options](#router-options).
  - `@returns {DoarsRouter}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

### Router

Extends the
[`EventDispatcher`](https://github.com/doars/doars/tree/main/packages/doars#eventdispatcher).

- `constructor` Create router instance.
  - `@param {object} options = null` [See router options](#router-options).
  - `@returns {Router}`

##### Router options

- `{string} basePath = ''` Base path of the routes.
- `{string} path = ''` Initial active path.
- `{object} pathToRegexp = {}` [Path-to-RegExp options](#path-to-regexp-options)
  used for parsing route paths.
- `{boolean} updateHistory = false` Whether to update the
  [History API](https://developer.mozilla.org/docs/Web/API/History_API).
- `{string} routerContextName = '$router'` The name of the router context.
- `{string} routeDirectiveName = '$router'` The name of the route directive.
- `{string} routerDirectiveName = '$router'` The name of the router directive.
- `{string} routeToDirectiveName = '$router'` The name of the route to directive.

##### Path-to-RegExp options

- `{boolean} sensitive = false` Whether the regular expression will be case sensitive.
- `{boolean} strict = false` Whether the regular expression won't allow an optional trailing delimiter to match.
- `{boolean} end = true` Whether the regular expression will match to the end of the string.
- `{boolean} start = true` Whether the regular expression will match from the beginning of the string.
- `{string} delimiter = '/#?'` The default delimiter for segments, for example `[^/#?]` for `:named` patterns.
- `{string} endsWith = null` Optional character, or list of characters, to treat as "end" characters.
- `{function} encode = (x) => x` A function to encode strings before inserting into the regular expression.
- `{string} prefixes = './'` List of characters to automatically consider prefixes when parsing.

> See [Path-to-RegExp](https://github.com/pillarjs/path-to-regexp#readme) for
> more information.

##### Router events

The following events are dispatched by a `Router` and can be listened to by calling the `addEventListener(/* name, callback, options */)` function on the instance.

- `added` When a new router is registered.
  - `@param {Router} router` Router instance.
  - `@param {string} route` Added route.
- `changed` When the route is changed.
  - `@param {Router} router` Router instance.
  - `@param {string} route` Current route.
  - `@param {string} path` Current path.
- `destroyed` When this instance is destroyed.
  - `@param {Router} router` Router instance.
- `removed` When an existing route is unregistered.
  - `@param {Router} router` Router instance.
  - `@param {string} route` Removed route.

## Compatible versions

| `@doars/doars-router` version | `@doars/doars` version |
| ----------------------------- | ---------------------- |
| `3.x`                         | `3.x`                  |
| `2.x`                         | `2.x`                  |
| `1.x`                         | `1.x`                  |
