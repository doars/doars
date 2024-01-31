<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-fetch.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-fetch)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-fetch?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-fetch)

</div>

<hr/>

# @doars/doars-fetch

Adds a fetch context and directive that handles communication with servers.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-fetch
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsFetch from '@doars/doars-fetch'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsFetch = DoarsFetch(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-fetch@3/dst/doars-fetch.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsFetch = window.DoarsFetch(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@3/dst/doars-fetch.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-fetch@3/dst/doars-fetch.iife.js) builds are available via the jsDelivr CDN.

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### \$fetch

Call the fetch API.

- Type: `function`
- Parameters:
  - `{string} url` Url to fetch from.
  - `{object} options = {}` Fetch options, [see Fetch docs on MDN](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters). An additional option, `returnType`, has been added to automatically get and convert the returned data. The return type can be one of the following types: `arrayBuffer`, `blob`, `element`, `html`, `formData`, `json`, `svg`, `text`, `xml`, or `auto`. When the value `auto` is used it will try to automatically parse the response based on the content type, extension, or accept type header used by the response.
- Returns: `Promise`

```HTML
<!-- On initialization fetch the data from doars.js.org and manually convert it to text and store it as text on the message variable of the state. -->
<div d-state="{ message: 'empty string' }"
  d-initialized="
    $fetch('https://doars.js.org')
      .then((result) => {
        result.text().then((text) => {
          $inContext(({ $state }) => {
            $state.message = text
          })
        })
      })
  ">
  <div d-text="message"></div>
</div>

<!-- On initialization fetch the data from doars.js.org and automatically convert it to text and store it as text on the message variable of the state. -->
<div d-state="{ message: 'empty string' }"
  d-initialized="
    $fetch('https://doars.js.org', { returnType: 'text' })
      .then((text) => {
        $inContext(({ $state }) => {
          $state.message = text
        })
      })
  ">

  <div d-text="message"></div>
</div>
```

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-fetch

Call the fetch API and place the results in the document. The directive's value should be an expression that resolves to the path needs to be fetched.

The directive can be placed on any element but is especially useful on forms. On form elements it can either listen to form submission events or change events and perform a request at those times. Meaning the directive is excellent at handling form submissions whilst staying on the same page. For instance when the website has a search bar and the results should be shown below it in a pop-up.

If no attribute value is specified and the element is an anchor tag or a form tag then the `href` and `action` attribute will be read respectively instead.

When placed on a form the encoding type can be specified using the `encoding` modifier, otherwise the `enctype` attribute of the form will be used. The same can be said about the `method` modifier that will use the `method` attribute as a fallback on form tags.

The directive supports the [redirect, request, and title headers](https://github.com/doars/doars/tree/main/packages/doars#headers) specified in the main library.

#### d-fetch modifiers

The directive supports the following modifiers.

- `{number} buffer = null` Amount of times it has to be triggered before the directive is called. If set without a specific value then 5 will be used.
- `{boolean} capture = false` Whether to set `capture` to true on the event listeners.
- `{number} debounce = null` Time in milliseconds the event needs to have been in triggered before the expression is executed. A second event will overwrite the existing debounce and start the timer again. If set without a specific value then 500 will be used.
- `{boolean} decode = false` Whether the returned HTML needs to be decoded. Only relevant if special HTML characters are encoded. For example `&` has become `&amp;` or `&#38;`.
- `{number} delay = null` Time in milliseconds the fetch starts after the event has been triggered. If set without a specific value then 500 will be used.
- `{boolean} document = false` Whether to update the entire document (`<head>` and `body` tags) and not just the element itself.
- `{string} encoding = (method === 'HEAD' || method === 'GET') ? 'parameters' : 'urlencoded'` The encoding method for the post data. If the method is either `head` or `get` it will always add the data as url parameters since these request can not have a body, otherwise the default is `application/x-www-form-urlencoded`. Available options are `json`, `multipart`, `parameters`, `urlencoded`, and `xml`.
- `{boolean} history = false` Whether the history of the tab needs to be updated when a new page is loaded. In other words the URL that the user sees in the navigation bar is updated to reflect the page transition. Do note the `document` modifier also needs to be enabled on the directive for this to be used.
- `{string} method = 'GET'` The request method to use.
- `{boolean} morph = false` Whether to convert the old document structure to the new, or to fully overwrite the existing structure with the new.
- `{string} on` The event to listen to. The default value depends on the element the directive is placed on. For forms this is submit, for inputs this is change, if the `poll` modifier is set it will be `load`. There are also several [special event listeners](#d-fetch-special-event-listeners).
- `{boolean} once = false` WWhether the `once` option needs to be enabled when listening to the event.
- `{boolean} passive = false` Whether the `passive` option needs to be enabled when listening to the event.
- `{number} poll = null` After the event is trigger automatically trigger the fetch request again. If set without a specific value then 60000 (one minute) will be used.
- `{string} position = 'inner'` Where on the target to apply the fetched content. Available options are `append` (inside the target as the first element), `prepend` (inside the target as the last element), `after` (outside the target after it), `before` (outside the target before it), `outer` (replace the target), and `inner` (replace the target's contents).
- `{boolean} prevent = false` Whether to call `preventDefault` on the event invoking the route change.
- `{boolean} script = false` If the `allowInlineScript` option of the main library is not set the effect can still be enabled for this directive.
- `{boolean} self = false` Whether the target of the event invoking the route change must be the directive's element itself and not an underlying element.
- `{boolean} stop = false` Whether to stop the click event from propagating further.
- `{number} throttle = null` Time in milliseconds before the directive can be executed again. If set without a specific value then 500 will be used.

#### d-fetch special event listeners

The `on` modifier has several special event listeners that can trigger a fetch request.

- `intersect` This event will trigger when the element enters the viewport. Useful for lazy loading.
- `load` This event will trigger when the directive is found and read by the core library.

### d-fetch-indicator

Set this directive on the same element as the `d-fetch` directive to specify another element as the indicator to show when a fetch is invoked, but before the content is fetched. The directive should return an element or the selector of an element inside. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `indicator` name can be changed in the options of the Doars library, not via the plugin options.

### d-fetch-select

Set this directive on the same element as the `d-fetch` directive to select part of the retrieved data as the new content instead of the entire body. The directive should return the selector of an element.

> The `select` name can be changed in the options of the Doars library, not via the plugin options.

### d-fetch-target

Set this directive on the same element as the `d-fetch` directive to specify another element as the target to update when a fetch is invoked. The directive should return an element or the selector of an element. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `target` name can be changed in the options of the Doars library, not via the plugin options.

### d-fetch examples

```HTML
<!-- On submit gets from the route. -->
<form d-fetch="'/contact/form/'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the route, but prevents resubmission for a second. -->
<form d-fetch.throttle-1000="'/contact/form/'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the route, and append the contents to the form. -->
<form d-fetch.append="'/contact/form/'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the route, whilst fetching shows the indicator. -->
<form d-fetch="'/contact/form/'" d-fetch-indicator="$references.indicator">
  <button type="submit">Submit</button>

  <template d-reference="'indicator'">Fetching...</template>
</form>
```

```HTML
<!-- On submit gets from the route, but selects the main element in body to add as the contents of the form. -->
<form d-fetch="'/contact/form/'" d-fetch-select="'body>main'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the route, and sets the contents to the target. -->
<form d-fetch="'/contact/form/'" d-fetch-target="$references.target">
  <button type="submit">Submit</button>

  <div d-reference="'target'"></div>
</form>
```

## Events

### d-fetch-started

Dispatched when starting to fetch the contents of URL.

#### Event

- `url:URL` URL of the contents that are being fetched.

### d-fetch-failed

Dispatched when the fetching of the page failed.

#### Event

- `response:Response` - The response of the failed fetch call.
- `url:URL` URL of the contents that was being fetched.

### d-fetch-succeeded

Dispatched when the contents has successfully been updated.

#### Event

- `url:URL` URL of the contents that are being fetched.

## API

### DoarsFetch

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See options](#doarsstorertc-options).
  - `@returns {DoarsFetch}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsFetch options

- `{string} fetchContextName = '$fetch'` The name of the fetch context.
- `{boolean} fetchDirectiveEvaluate = true` If set to false the fetch directive's value is read as a string literal instead of an expression to process.
- `{string} fetchDirectiveName = 'submit'` The name of the fetch directive.
- `{object} fetchOptions = {}` Default fetch options to use, the options object provided when calling fetch will be merged with this default.
- `{string|boolean} intersectionEvent = 'intersect'` The name of the intersect special event listener. To disable the event from ever triggering set this option to false.
- `{HTMLElement} intersectionRoot = null` The element to be used as the viewport for checking the visibility of the elements. It must be an ancestor of the targeted elements. By default it is the browsers viewport.
- `{CSS margin property} intersectionMargin = '0px'` Margin around the root.
- `{number|Array<number>} intersectionThreshold = 0` Thresholds of visibility the directive should be executed. `0` results in as soon as a pixel is in view. `1` results in that the entire element needs to be in view. `[0, 0.5, 1]` results in three possible calls when it is a pixel in view, 50% in view and entirely in view.
- `{string|boolean} loadedEvent = 'load'` The name of the load special event listener. To disable the event from ever triggering set this option to false.

## Compatible versions

| `@doars/doars-fetch` version | `@doars/doars` version |
| ---------------------------- | ---------------------- |
| `3.x`                        | `3.x`                  |
| `2.x`                        | `2.x`                  |
| `1.x`                        | `1.x`                  |
