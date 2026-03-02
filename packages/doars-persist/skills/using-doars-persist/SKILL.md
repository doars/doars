---
name: using-doars-persist
description: Reference for using the @doars/doars-persist plugin for persistent storage (cookies, localStorage, sessionStorage).
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-persist

Doars plugin adding `$cookies`, `$localStorage`, and `$sessionStorage` contexts for persistent client-side storage. Access storage directly in directive expressions.

## When to use this skill

When persisting user preferences across sessions. When storing form data temporarily. When implementing "remember me" functionality. When saving UI state (theme, sidebar collapsed, etc.). When working with cookies for auth or tracking.

```javascript
import Doars from '@doars/doars'
import DoarsPersist from '@doars/doars-persist'

const doars = new Doars()
DoarsPersist(doars)
doars.enable()
```

```html
<!-- Persist form data to localStorage -->
<div d-state="{ }">
  <input d-sync="$localStorage.username" placeholder="Username" />
  <input d-sync="$localStorage.theme" placeholder="Theme" />
</div>

<!-- Set cookie on init -->
<div d-initialized="$cookies.sessionId = generateId()"></div>

<!-- Read from storage -->
<div d-text="$localStorage.username ?? 'Guest'"></div>
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsPersist(doars, options?)` | `DoarsPersist` | Initialize plugin |

**Contexts:** `$cookies`, `$localStorage`, `$sessionStorage`

## Contexts

### `$cookies`

Get/set browser cookies:

```javascript
// Set cookie (auto-expires when session ends)
$cookies.sessionId = 'abc123'

// Get cookie
$cookies.sessionId  // 'abc123'

// Delete cookie
$cookies.sessionId = null
```

### `$localStorage`

Persistent storage across sessions:

```javascript
// Set value (persists after browser close)
$localStorage.theme = 'dark'

// Get value
$localStorage.theme  // 'dark'

// Delete
$localStorage.theme = null
```

### `$sessionStorage`

Storage for current session only:

```javascript
// Set value (cleared when tab closes)
$sessionStorage.tempData = { ... }

// Get value
$sessionStorage.tempData

// Delete
$sessionStorage.tempData = null
```

## Implicit behaviors

- **Auto-serialization:** Objects/arrays are JSON serialized automatically
- **Null deletion:** Setting to `null` removes the item
- **Event synchronization:** Changes trigger Doars updates like reactive state
- **Storage events:** Cross-tab synchronization via `storage` events

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `cookiesContextName` | `'$cookies'` | Name of cookies context |
| `cookiesContextDeconstruct` | `false` | Allow direct `cookies.prop` access |
| `localStorageContextName` | `'$localStorage'` | Name of localStorage context |
| `localStorageContextDeconstruct` | `false` | Allow direct `localStorage.prop` access |
| `sessionStorageContextName` | `'$sessionStorage'` | Name of sessionStorage context |
| `sessionStorageContextDeconstruct` | `false` | Allow direct `sessionStorage.prop` access |

## Deconstruction

Enable to access without prefix (checked after `$state` and `$for`):

```javascript
DoarsPersist(doars, {
  localStorageContextDeconstruct: true
})
```

```html
<!-- Can now access directly -->
<div d-text="username"></div>
```

## Anti-patterns

Don't store sensitive data:
```javascript
// Never do this
$localStorage.password = userPassword
```

Store tokens, not credentials:
```javascript
// Store auth token
$localStorage.authToken = secureToken
```

Don't store large data:
```javascript
// localStorage has ~5-10MB limit
$localStorage.hugeDataset = massiveArray
```

Use IndexedDB for large data:
```javascript
// Store in IndexedDB, reference in Doars
```

Don't forget storage limits:
```html
<!-- May throw if quota exceeded -->
<div d-initialized="$localStorage.big = hugeData">
```

Handle errors:
```html
<!-- Wrap in try-catch -->
<div d-initialized="try { $localStorage.data = x } catch(e) { console.error(e) }">
```

## Storage Comparison

| Context | Persistence | Scope | Use Case |
|---------|-------------|-------|----------|
| `$cookies` | Session/expiration | Domain + path | Auth tokens, tracking |
| `$localStorage` | Permanent | Origin | User preferences, cache |
| `$sessionStorage` | Tab lifetime | Tab only | Form drafts, temp state |

## Full documentation

For storage options and advanced patterns, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-persist/README.md).
