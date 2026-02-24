---
name: using-doars-navigate
description: Reference for using the @doars/doars-navigate plugin for SPA-like navigation without page reloads.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-navigate

Doars plugin for SPA-like navigation without page reloads. Intercepts anchor clicks, fetches new pages, and morphs the DOM - keeping the app state intact.

## When to use this skill

When creating single-page application navigation. When implementing page transitions without full reloads. When prefetching links for faster navigation. When morphing between pages instead of full replacements. When handling browser history in a Doars app.

```javascript
import Doars from '@doars/doars'
import DoarsNavigate from '@doars/doars-navigate'

const doars = new Doars()
DoarsNavigate(doars)
doars.enable()
```

```html
<!-- Basic navigation container -->
<nav d-navigate>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- Full page transitions with history -->
<body d-navigate.document.history>
  <nav>
    <a href="/page1">Page 1</a>
    <a href="/page2">Page 2</a>
  </nav>
  <main><!-- Content replaced here --></main>
</body>
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsNavigate(doars, options?)` | `DoarsNavigate` | Initialize plugin |

**Directive:** `d-navigate` with modifiers for history, preloading, and morphing

## Directive

### `d-navigate`

Container that intercepts clicks on child anchor tags:

```html
<!-- Replace container content -->
<div d-navigate>
  <a href="/page">Go to page</a>
</div>

<!-- Replace entire document -->
<body d-navigate.document.history>
  <!-- All links become SPA transitions -->
</body>
```

## Modifiers

| Modifier | Purpose | Example |
|----------|---------|---------|
| `document` | Update `<head>` + body | `d-navigate.document` |
| `history` | Update URL + enable back button | `d-navigate.document.history` |
| `morph` | Morph DOM instead of replace | `d-navigate.morph` |
| `decode` | Decode HTML entities | `d-navigate.decode` |
| `outer` | Replace the directive element too | `d-navigate.outer` |
| `preload-interact` | Prefetch on hover/focus | `d-navigate.preload-interact` |
| `preload-intersect` | Prefetch when in viewport | `d-navigate.preload-intersect` |
| `stop` | Stop propagation | `d-navigate.stop` |
| `capture` | Use capture phase | `d-navigate.capture` |

## Sub-directives

Use on same element as `d-navigate`:

| Directive | Purpose | Example |
|-----------|---------|---------|
| `d-navigate-indicator` | Show while loading | `d-navigate-indicator="$refs.loading"` |
| `d-navigate-target` | Element to update | `d-navigate-target="$refs.content"` |
| `d-navigate-select` | Extract from response | `d-navigate-select="'main'"` |

## Implicit behaviors

- **Anchor interception:** Only clicks on `<a>` tags are intercepted
- **Same-origin only:** External links bypass navigation
- **Modifier keys:** Ctrl/Cmd+click opens in new tab (not intercepted)
- **History API:** `.history` modifier uses `pushState` + handles `popstate`
- **Preload caching:** Prefetched pages are cached for instant navigation

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `navigateDirectiveName` | `'navigate'` | Directive name |
| `fetchOptions` | `{}` | Default fetch options |
| `intersectionMargin` | `'0px'` | Preload viewport margin |
| `intersectionThreshold` | `0` | Preload visibility threshold |

## Events

- `d-navigate-started` - When navigation begins
- `d-navigate-succeeded` - When navigation completes
- `d-navigate-failed` - When navigation fails

## Anti-patterns

Don't use on individual links:
```html
<!-- Won't work - must be on container -->
<a href="/page" d-navigate>Link</a>
```

Wrap in container:
```html
<!-- Correct usage -->
<div d-navigate>
  <a href="/page">Link</a>
</div>
```

Don't forget document modifier for full pages:
```html
<!-- Only updates body content, breaks head/title -->
<body d-navigate>
```

Use document modifier:
```html
<!-- Updates head and handles history -->
<body d-navigate.document.history>
```

## Full documentation

For complete modifier reference and preload configuration, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-navigate/README.md).
