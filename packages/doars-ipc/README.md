<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars-ipc.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-ipc)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars-ipc?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars-ipc)

</div>

<hr/>

# @doars/doars-ipc

Adds an IPC context and directive that handles communication between the back-end (Bun) and the front-end (WebView). Designed for use with `@webviewjs/webview` or similar webview libraries that support bidirectional communication via `postMessage` (WebView → Bun) and `evaluateScript` (Bun → WebView).

The plugin automatically creates a client-side IPC handler that uses `window.ipc.postMessage()` to send requests to the host, and expects the host to route responses back via JavaScript evaluation.

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars @doars/doars-ipc
```

```JavaScript
// Import library.
import Doars from '@doars/doars'
import DoarsIPC from '@doars/doars-ipc'

// Setup a library instance.
const doars = new Doars()

// Setup the plugin.
const doarsIPC = DoarsIPC(doars /*, options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@3/dst/doars.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars-ipc@3/dst/doars-ipc.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()

    // Setup the plugin.
    const doarsIPC = window.DoarsIPC(doars /*, options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars-ipc@3/dst/doars-ipc.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars-ipc@3/dst/doars-ipc.iife.js) builds are available via the jsDelivr CDN.

## Host setup

To use this plugin, you need to set up the server-side handler in your application using a webview library like `@webviewjs/webview`:

```JavaScript
import { Application } from '@webviewjs/webview'
import createServer from '@doars/doars-ipc/src/utilities/server.js'

const app = new Application()
const window = app.createBrowserWindow()

const webview = window.createWebview({
  html: `<!-- your HTML with doars -->`,
})

// Create server handler with the path and evaluate function
const server = createServer('__doarsIPC', (js) => webview.evaluateScript(js))

// Register routes
server.register('getResults', async (data) => {
  // Process request and return HTML
  return `<div>Results for: ${data.query}</div>`
})

// Handle incoming messages from webview
webview.onIpcMessage((msg) => {
  server.handle(msg.body.toString())
})

app.run()
```

## Contexts

The following [contexts](https://github.com/doars/doars/tree/main/packages/doars#contexts) are added by the plugin.

### \$ipc

Call the IPC API. The `$ipc` context is a Proxy that automatically routes method calls through the client handler. Any method called on `$ipc` will be sent to the host via `postMessage` and return a Promise that resolves with the response.

- Type: `Proxy` that intercepts method calls and routes them through the IPC handler.

```HTML
<!-- On initialization call ipc and call the doSomething function then store the resulting text on the message variable of the state. -->
<div d-state="{ message: 'empty string' }"
  d-initialized="
    $ipc.doSomething([...])
      .then((result) => {
        $inContext(({ $state }) => {
          $state.message = result.text
        })
      })
  ">
  <div d-text="message"></div>
</div>
```

## Directives

The following [directives](https://github.com/doars/doars/tree/main/packages/doars#directives) are added by the plugin.

### d-ipc

Call the IPC API and place the results in the document. The directive's value should be the name of a function that is registered on the server handler.

The directive can be placed on any element but is especially useful on forms. On form elements it can either listen to form submission events or change events and perform a request at those times. Meaning the directive is excellent at handling form submissions whilst staying on the same page. For instance when the website has a search bar and the results should be shown below it in a pop-up.

If no attribute value is specified and the element is an anchor tag or a form tag then the `href` and `action` attribute will be read respectively instead.

#### d-ipc modifiers

The directive supports the following modifiers.

- `{number} buffer = null` Amount of times it has to be triggered before the directive is called. If set without a specific value then 5 will be used.
- `{boolean} capture = false` Whether to set `capture` to true on the event listeners.
- `{number} debounce = null` Time in milliseconds the event needs to have been in triggered before the expressions is executed. A second event will overwrite the existing debounce and start the timer again. If set without a specific value then 500 will be used.
- `{boolean} decode = false` Whether the returned HTML needs to be decoded. Only relevant if special HTML characters are encoded. For example `&` has become `&amp;` or `&#38;`.
- `{number} delay = null` Time in milliseconds the call starts after the event has been triggered. If set without a specific value then 500 will be used.
- `{boolean} document = false` Whether to update the entire document (`<head>` and `body` tags) and not just the element itself.
- `{boolean} morph = false` Whether to convert the old document structure to the new, or to fully overwrite the existing structure with the new.
- `{string} on` The event to listen to. The default value depends on the element the directive is placed on. For forms this is submit, for inputs this is change, if the `poll` modifier is set it will be `load`. There are also several [special event listeners](#d-ipc-special-event-listeners).
- `{boolean} once = false` WWhether the `once` option needs to be enabled when listening to the event.
- `{boolean} passive = false` Whether the `passive` option needs to be enabled when listening to the event.
- `{number} poll = null` After the event is trigger automatically trigger the IPC request again. If set without a specific value then 60000 (one minute) will be used.
- `{string} position = 'inner'` Where on the target to apply the called content. Available options are `append` (inside the target as the first element), `prepend` (inside the target as the last element), `after` (outside the target after it), `before` (outside the target before it), `outer` (replace the target), and `inner` (replace the target's contents).
- `{boolean} prevent = false` Whether to call `preventDefault` on the event invoking the route change.
- `{boolean} script = false` If the `allowInlineScript` option of the main library is not set the effect can still be enabled for this directive.
- `{boolean} self = false` Whether the target of the event invoking the route change must be the directive's element itself and not an underlying element.
- `{boolean} stop = false` Whether to stop the click event from propagating further.
- `{number} throttle = null` Time in milliseconds before the directive can be executed again. If set without a specific value then 500 will be used.

#### d-ipc special event listeners

The `on` modifier has several special event listeners that can trigger a IPC request.

- `intersect` This event will trigger when the element enters the viewport. Useful for lazy loading.
- `load` This event will trigger when the directive is found and read by the core library.

### d-ipc-indicator

Set this directive on the same element as the `d-ipc` directive to specify another element as the indicator to show when a IPC function is invoked, but before the content is called. The directive should return an element or the selector of an element inside. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `indicator` name can be changed in the options of the Doars library, not via the plugin options.

### d-ipc-select

Set this directive on the same element as the `d-ipc` directive to select part of the retrieved data as the new content instead of the entire body. The directive should return the selector of an element.

> The `select` name can be changed in the options of the Doars library, not via the plugin options.

### d-ipc-target

Set this directive on the same element as the `d-ipc` directive to specify another element as the target to update when a IPC function is invoked. The directive should return an element or the selector of an element. If a string is returned the element should exist inside the element with this directive on it.

The simplest way to get an element is to use this directive in combination with the `$references` context.

> The `target` name can be changed in the options of the Doars library, not via the plugin options.

### d-ipc examples

```HTML
<!-- On submit gets from the function. -->
<form d-ipc="getResults">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the function, but prevents resubmission for a second. -->
<form d-ipc.throttle-1000="getResults">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the function, and append the contents to the form. -->
<form d-ipc.append="getResults'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the function, whilst processing shows the indicator. -->
<form d-ipc="getResults" d-ipc-indicator="$references.indicator">
  <button type="submit">Submit</button>

  <template d-reference="'indicator'">Processing...</template>
</form>
```

```HTML
<!-- On submit gets from the function, but selects the main element in body to add as the contents of the form. -->
<form d-ipc="getResults" d-ipc-select="'body>main'">
  <button type="submit">Submit</button>
</form>
```

```HTML
<!-- On submit gets from the function, and sets the contents to the target. -->
<form d-ipc="getResults" d-ipc-target="$references.target">
  <button type="submit">Submit</button>

  <div d-reference="'target'"></div>
</form>
```

## Events

### d-ipc-started

Dispatched when starting to call the IPC function.

### d-ipc-failed

Dispatched when calling the IPC function failed.

### d-ipc-succeeded

Dispatched when the call has successfully been resolved.

## API

### DoarsIPC

- `constructor` Create plugin instance.
  - `@param {Doars} library` A doars library instance.
  - `@param {object} options = null` [See options](#doarsipc-options).
  - `@returns {DoarsIPC}`
- `disable` Disables the plugin. Can only be called when the doars is disabled.
- `enable` Enables the plugin. Can only be called when the doars is disabled.

#### DoarsIPC options

- `{string} ipcContextName = '$ipc'` The name of the IPC context.
- `{string} ipcDirectiveName = 'ipc'` The name of the IPC directive.
- `{string} ipcPath = '__doarsIPC'` The path on the window object where the IPC client handler is mounted. Supports dot notation for nested paths (e.g., `'myApp.ipc'` mounts to `window.myApp.ipc`).
- `{string|boolean} intersectionEvent = 'intersect'` The name of the intersect special event listener. To disable the event from ever triggering set this option to false.
- `{HTMLElement} intersectionRoot = null` The element to be used as the viewport for checking the visibility of the elements. It must be an ancestor of the targeted elements. By default it is the browsers viewport.
- `{CSS margin property} intersectionMargin = '0px'` Margin around the root.
- `{number|Array<number>} intersectionThreshold = 0` Thresholds of visibility the directive should be executed. `0` results in as soon as a pixel is in view. `1` results in that the entire element needs to be in view. `[0, 0.5, 1]` results in three possible calls when it is a pixel in view, 50% in view and entirely in view.
- `{string|boolean} loadedEvent = 'load'` The name of the load special event listener. To disable the event from ever triggering set this option to false.

### Server handler

The server-side handler that routes incoming IPC messages to registered callbacks.

```JavaScript
import createServer from '@doars/doars-ipc/src/utilities/server.js'

const server = createServer(path, evaluate)
```

**Parameters:**
- `path {string}` - The path on window where the client handler is mounted (e.g., `'__doarsIPC'`). Must match the `ipcPath` option used in the plugin.
- `evaluate {function(string): void}` - Function to evaluate JavaScript in the WebView. Typically `webview.evaluateScript`.

**Methods:**
- `register(name, callback)` - Register a route handler. The callback receives the data from the client and should return HTML or a Promise that resolves to HTML.
- `unregister(name)` - Remove a registered route handler.
- `handle(message)` - Process an incoming IPC message from the WebView. Should be called from `webview.onIpcMessage`.
- `dispatch(name, event, selector = 'body')` - Dispatch a custom event to the WebView's DOM. The event is sent to the element matching the selector.

**Example:**

```JavaScript
import createServer from '@doars/doars-ipc/src/utilities/server.js'

const server = createServer('__doarsIPC', (js) => webview.evaluateScript(js))

// Register routes
server.register('getUser', async (data) => {
  const user = await db.getUser(data.id)
  return `<div class="user">${user.name}</div>`
})

server.register('saveForm', async (data) => {
  await db.save(data)
  return '<div class="success">Saved!</div>'
})

// Handle incoming messages
webview.onIpcMessage((msg) => {
  server.handle(msg.body.toString())
})

// Dispatch events to the webview
server.dispatch('notification', { message: 'Hello!' }, '#notification-area')
```

### Client Handler

The client-side handler that runs in the WebView. This is automatically created and mounted by the plugin.

```JavaScript
// This is automatically done by the plugin:
import createClient from '@doars/doars-ipc/src/utilities/client.js'
window.__doarsIPC = createClient()
```

**Methods:**
- `call(name, data)` - Initiates an IPC call to the server. Returns a Promise that resolves with the response.
- `resolve(identifier, data)` - Called by the server to resolve a pending call. (Internal use)
- `reject(identifier, error)` - Called by the server to reject a pending call. (Internal use)

You typically don't need to interact with the client handler directly - use the `$ipc` context instead.

## Compatible versions

| `@doars/doars-ipc` version | `@doars/doars` version |
| ---------------------------- | ---------------------- |
| `3.x`                        | `3.x`                  |
