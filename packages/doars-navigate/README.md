<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-navigate.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-navigate)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-navigate?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-navigate)

</div>

<hr/>

# @doars/doars-navigate

Plugin that adds a navigation directive that loads pages without unloading the current page by listening to anchor tags. This improving performance similar to single page applications whilst still using server side rendered pages underneath.

It fetches the document the anchor tag links to and morphs the existing webpage to the newly fetched page. For even faster load times preload options exist so links are loaded before the users clicks on it.

Because it retrieves the raw `HTML` of a page no additional work on the server is necessary. And the plugin can automatically update the URL of the browser ensuring that the back and reload buttons still work as intended.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-navigate
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsNavigate from '@doars/doars-navigate'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsNavigate = DoarsNavigate(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the
library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-navigate@3/dst/doars-navigate.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsNavigate = window.DoarsNavigate(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-navigate@3/dst/doars-navigate.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-navigate@3/dst/doars-navigate.iife.js) builds are available via the jsDelivr CDN.

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-navigate

Listen to anchor tags inside the directive and update its contents when a link is clicked with the newly fetched content. The attribute value is not read.

The directive supports the [redirect, request, and title headers](https://github.com/doars/doars/tree/main/packages/doars#headers) specified in the main library.

#### d-navigate modifiers

- `{boolean} capture = false` Whether to set capture to true on the event listeners.
- `{boolean} decode = false` Whether the returned HTML needs to be decoded. Only relevant if special HTML characters are encoded. For example `&` has become `&amp;` or `&#38;`.
- `{boolean} document = false` Whether to update the entire document (`<head>` and `body` tags) and not just the element itself.
- `{boolean} history = false` Whether the history of the tab needs to be updated when a new page is loaded. In other words the URL that the user sees in the navigation bar is updated to reflect the page transition. It also listens to the back button and prevent a full page reload that way. Do note the `document` modifier also needs to be enabled on the directive for this to be used.
- `{boolean} morph = false` Whether to convert the old document structure to the new, or to fully overwrite the existing structure with the new.
- `{boolean} outer = false` Whether to also update the tag the directive is placed on and not just the children of the element.
- `{string} preload = null` Whether to fetch navigation links before the user clicks to navigate to it. This can create faster transition. But enabling this option comes at the cost of taking up more memory usage and network bandwidth. Available options are `interact` and `intersect`. Interact will fetch and add the result to cache when the link is either hovered over using a pointer or focused on. Intersect will fetch and add the result to cache when the link enters the viewport.
- `{boolean} script = false` If the `allowInlineScript` option of the main library is not set the effect can still be enabled for this directive.
- `{boolean} stop = false` Whether to stop the click event from propagating further. Useful when a `d-navigation` is placed inside another `d-navigation`.

### d-navigate-indicator

Set this directive on the same element as the `d-navigate` directive to specify another element as the indicator to show when a link is clicked, but before the content is fetched. The directive should return an element or the selector of an element inside. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `indicator` name can be changed in the options of the Doars library, not via the plugin options.

### d-navigate-select

Set this directive on the same element as the `d-navigate` directive to select part of the retrieved data as the new content instead of the entire body. The directive should return the selector of an element.

> The `select` name can be changed in the options of the Doars library, not via the plugin options.

### d-navigate-target

Set this directive on the same element as the `d-navigate` directive to specify another element as the target to update when a link is clicked. The directive should return an element or the selector of an element. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `target` name can be changed in the options of the Doars library, not via the plugin options.

### d-navigate examples

```HTML
<!-- On click replaces the div with the /example.html page contents. -->
<div d-navigation>
  <a href="/example.html">Go to example</a>
</div>
```

```HTML
<!-- On click replaces the entire document with the /example.html page contents. -->
<div d-navigation.document>
  <a href="/example.html">Go to example</a>
</div>
```

```HTML
<!-- Whilst fetching the content from /example.html it shows the indicator. -->
<div d-navigation d-navigation-indicator="$references.indicator">
  <a href="/example.html">Go to example</a>

  <template d-reference="'indicator'">Loading...</template>
</div>
```

```HTML
<!-- On click replaces the target node with the main element directly inside the body of the /example.html page. -->
<div d-navigation d-navigation-select="'body>main'">
  <a href="/example.html">Go to example</a>
</div>
```

```HTML
<!-- On click replaces the target node with the /example.html page contents. -->
<div d-navigation d-navigation-target="$references.target">
  <a href="/example.html">Go to example</a>

  <div d-reference="'target'"></div>
</div>
```

## Events

### d-navigate-started

Dispatched when starting to fetch the contents of URL.

#### Event

- `url:URL` URL of the contents that are being fetched.

### d-navigate-failed

Dispatched when the fetching of the page failed.

#### Event

- `response:Response` - The response of the failed fetch call.
- `url:URL` URL of the contents that was being fetched.

### d-navigate-succeeded

Dispatched when the contents has successfully been updated.

#### Event

- `url:URL` URL of the contents that are being fetched.

## API

### DoarsNavigate

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See options](#doarsnavigate-options).
  - `@returns {DoarsNavigate}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsNavigate options

- `{object} fetchOptions = {}` Default fetch options to use, the options object provided when calling fetch will be merged with this default.
- `{string} intersectionMargin = '0px'` Only used when intersection is selected for the preload option. Specifies a set of offsets to add to the viewports bounding box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
- `{number} intersectionThreshold = 0` Only used when intersection is selected for the preload option. Specifies a ratio of intersection area to total bounding box area for the observed target. A value of 0.0 means that even a single visible pixel counts as the target being visible. 1.0 means that the entire target element is visible.
- `{boolean} navigateDirectiveEvaluate = true` If set to false the navigate directive's value is read as a string literal instead of an expression to process.
- `{string} navigateDirectiveName = 'navigate'` The name of the navigate directive.

## Compatible versions

| `@doars/doars-navigate` version | `@doars/doars` version |
| ------------------------------- | ---------------------- |
| `3.x`                           | `3.x`                  |
| `2.x`                           | `2.x`                  |
