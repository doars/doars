---
name: using-doars-router
description: Reference for using the @doars/doars-router plugin for client-side routing with path-based navigation.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-router

Doars plugin for client-side routing with `$router` context and `d-route`, `d-router`, `d-route-to` directives. Create SPAs with path-based routing without page reloads.

## When to use this skill

When implementing client-side routing in a Doars application. When creating multi-page SPAs with URL-based navigation. When handling route parameters and dynamic routes. When building apps that need History API support. When you need route guards or navigation control.

```javascript
import Doars from '@doars/doars'
import DoarsRouter from '@doars/doars-router'

const doars = new Doars()
DoarsRouter(doars)
doars.enable()
```

```html
<!-- Define router -->
<div d-router>
  <!-- Define routes -->
  <template d-route="/">
    <h1>Home</h1>
  </template>
  
  <template d-route="/about">
    <h1>About</h1>
  </template>
  
  <template d-route="/user/:id">
    <h1>User {{ $router.params.id }}</h1>
  </template>
  
  <!-- Navigation -->
  <nav>
    <button d-route-to="/">Home</button>
    <button d-route-to="/about">About</button>
    <button d-route-to="/user/123">User 123</button>
  </nav>
</div>
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsRouter(doars, options?)` | `DoarsRouter` | Initialize plugin |
| `$router.setPath(path)` | `void` | Navigate programmatically |
| `$router.path` | `string` | Current route path |
| `$router.params` | `object` | Route parameters |

**Directives:** `d-router` (define router), `d-route` (define route), `d-route-to` (navigation)

## Directives

### `d-router`

Define a router scope:

```html
<!-- Basic router -->
<div d-router>
  <!-- Routes here -->
</div>

<!-- With options -->
<div d-router="{ basePath: '/app', updateHistory: true }">
  <!-- Routes here -->
</div>
```

### `d-route`

Define a route (must be inside `d-router`):

```html
<template d-route="/">
  <h1>Home</h1>
</template>

<!-- With parameters -->
<template d-route="/user/:id">
  <h1>User {{ $router.params.id }}</h1>
</template>

<!-- Multiple parameters -->
<template d-route="/post/:category/:slug">
  <h1>{{ $router.params.category }} - {{ $router.params.slug }}</h1>
</template>
```

### `d-route-to`

Navigate to a route:

```html
<!-- Basic navigation -->
<button d-route-to="/about">About</button>

<!-- With modifiers -->
<button d-route-to.prevent.stop="/about">About</button>
```

**Modifiers:** `prevent` (preventDefault), `stop` (stopPropagation), `self` (only if target is element)

## Context

### `$router`

Access to current router instance:

```javascript
// Navigate programmatically
$router.setPath('/new-path')

// Get current path
$router.path  // '/current/path'

// Get route parameters
$router.params  // { id: '123', ... }

// Listen to route changes
$router.addEventListener('changed', ({ path, route }) => {
  console.log('Navigated to:', path)
})
```

## Route Patterns

Uses `path-to-regexp` for pattern matching:

| Pattern | Matches |
|---------|---------|
| `/` | Exact root |
| `/about` | Exact path |
| `/user/:id` | `/user/123`, `/user/abc` |
| `/post/:id?` | Optional parameter |
| `/files/*` | Wildcard |
| `/files/(.*)` | Capture groups |

## Router Options

| Option | Default | Description |
|--------|---------|-------------|
| `basePath` | `''` | Base path for all routes |
| `path` | `''` | Initial active path |
| `updateHistory` | `false` | Use History API for URLs |
| `pathToRegexp` | `{}` | Path-to-RegExp options |
| `routerContextName` | `'$router'` | Context name |

## Path-to-RegExp Options

| Option | Default | Description |
|--------|---------|-------------|
| `sensitive` | `false` | Case-sensitive matching |
| `strict` | `false` | No optional trailing delimiter |
| `end` | `true` | Match to end of string |
| `start` | `true` | Match from start of string |
| `delimiter` | `'/#'` | Segment delimiters |

## Events

- `added` - When a route is registered
- `removed` - When a route is unregistered  
- `changed` - When route changes
- `destroyed` - When router is destroyed

## Anti-patterns

Don't use without `d-router` container:
```html
<!-- Won't work - needs d-router parent -->
<template d-route="/">
  <h1>Home</h1>
</template>
```

Wrap in router:
```html
<!-- Correct -->
<div d-router>
  <template d-route="/">
    <h1>Home</h1>
  </template>
</div>
```

Don't mix with `d-navigate` without care:
```html
<!-- Conflicting navigation -->
<div d-router>
  <nav d-navigate>
    <a href="/">Home</a>
  </nav>
</div>
```

Use one or the other:
```html
<!-- Router navigation -->
<div d-router>
  <button d-route-to="/">Home</button>
</div>
```

## Full documentation

For complete routing patterns and advanced usage, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-router/README.md).
