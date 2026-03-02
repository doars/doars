---
name: using-doars-ipc
description: Reference for using the @doars/doars-ipc plugin for bidirectional IPC between Bun backend and WebView frontend.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-ipc

Doars plugin for bidirectional IPC communication between Bun backend and WebView frontend. Use with `@webviewjs/webview` or similar for desktop apps with native-web bridge.

## When to use this skill

When building desktop applications with Bun and WebView. When implementing native-web communication bridges. When creating Electron/Tauri-like apps with Doars. When handling IPC between frontend and backend in a desktop environment.

```javascript
// Frontend
import Doars from '@doars/doars'
import DoarsIPC from '@doars/doars-ipc'

const doars = new Doars()
DoarsIPC(doars, { ipcPath: '__myApp' })
doars.enable()
```

```javascript
// Backend (Bun)
import createServer from '@doars/doars-ipc/src/IPCServer.js'

const server = createServer('__myApp', webview.evaluateScript)

server.register('getUser', async (data) => {
  const user = await db.getUser(data.id)
  return `<div>${user.name}</div>`
})

webview.onIpcMessage((msg) => server.handle(msg.body.toString()))
```

```html
<!-- Frontend usage -->
<form d-ipc="saveForm">
  <input name="name" />
  <button type="submit">Save</button>
</form>
```

## API

### Frontend

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsIPC(doars, options?)` | `DoarsIPC` | Initialize plugin |
| `$ipc.methodName(data?)` | `Promise` | Call registered server method |

### Backend

| Function | Returns | Purpose |
|----------|---------|---------|
| `createServer(path, evaluateFn)` | `IPCServer` | Create server handler |
| `server.register(name, handler)` | `void` | Register method handler |
| `server.handle(message)` | `void` | Process incoming IPC message |
| `server.dispatch(event, data, selector?)` | `void` | Send event to frontend |

## Context

### `$ipc`

Proxy that routes any method call to the server:

```javascript
// Any method you call is sent to the server
$ipc.getUser({ id: 1 })        // Returns Promise
$ipc.saveForm({ name: 'John' }) // Returns Promise
```

## Directive

### `d-ipc`

Call server method and optionally update DOM with response:

```html
<!-- Call on form submit -->
<form d-ipc="saveForm">
  <input name="value" />
  <button>Save</button>
</form>

<!-- With modifiers -->
<form d-ipc.throttle-1000="saveForm"
     d-ipc-target="$references.result"
     d-ipc-indicator="$references.spinner">
  <button>Submit</button>
</form>
```

**Modifiers:** Same as `d-fetch` - `throttle`, `debounce`, `delay`, `poll`, `append`, `prepend`, `inner`, `outer`, `document`, `morph`, `decode`

## Server Handler

```javascript
import createServer from '@doars/doars-ipc/src/IPCServer.js'

const server = createServer('__doarsIPC', webview.evaluateScript)

// Register handlers
server.register('methodName', async (data) => {
  // Process request
  return '<html>response</html>' // Return HTML to inject
})

// Handle messages from webview
webview.onIpcMessage((msg) => {
  server.handle(msg.body.toString())
})

// Push events to webview
server.dispatch('notification', { message: 'Hello!' }, '#app')
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `ipcPath` | `'__doarsIPC'` | Window path for client handler |
| `ipcContextName` | `'$ipc'` | Name of IPC context |
| `ipcDirectiveName` | `'ipc'` | Name of IPC directive |
| `intersectionEvent` | `'intersect'` | Viewport entry event name |
| `loadedEvent` | `'load'` | Load event name |

## Client Handler

Auto-created at `window[ipcPath]`:

```javascript
// Usually don't use directly - use $ipc context
window.__doarsIPC.call('methodName', data)
window.__doarsIPC.resolve(id, data) // Internal use
window.__doarsIPC.reject(id, error) // Internal use
```

## Anti-patterns

Don't use for simple HTTP requests:
```html
<!-- Overkill for regular API calls -->
<div d-ipc="fetchData">
```

Use `d-fetch` instead:
```html
<!-- Standard HTTP via the doars-fetch plugin -->
<div d-fetch="'/api/data'">
```

Don't forget error handling:
```javascript
// Unhandled rejections
$ipc.riskyOperation()
```

Always catch:
```javascript
// Handle errors
$ipc.riskyOperation().catch(err => console.error(err))
```

## Events

- `d-ipc-started` - When IPC call begins
- `d-ipc-succeeded` - When call completes
- `d-ipc-failed` - When call fails

## Full documentation

For complete server API and advanced patterns, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-ipc/README.md).
