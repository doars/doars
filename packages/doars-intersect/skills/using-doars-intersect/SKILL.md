---
name: using-doars-intersect
description: Reference for using the @doars/doars-intersect plugin for viewport detection and lazy loading.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-intersect

Doars plugin adding `d-intersect` directive for viewport detection. Run code when elements enter/leave the viewport using Intersection Observer API.

## When to use this skill

When implementing lazy loading for images or content. When tracking analytics for visible elements. When triggering animations based on scroll position. When implementing infinite scroll patterns. When deferring heavy operations until elements are visible.

```javascript
import Doars from '@doars/doars'
import DoarsIntersect from '@doars/doars-intersect'

const doars = new Doars()
DoarsIntersect(doars)
doars.enable()
```

```html
<!-- Run when element enters or leaves viewport -->
<div d-intersect="console.log('Visibility changed')">
  Track me
</div>

<!-- Run only when entering -->
<img d-intersect:enter="this.src = imageUrl" 
     loading="lazy" />

<!-- Run only when leaving -->
<div d-intersect:leave="cleanup()">
  Widget
</div>

<!-- Lazy load with debounce -->
<div d-intersect:enter.debounce-500="loadHeavyContent()">
  Heavy content loads after 500ms in viewport
</div>
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsIntersect(doars, options?)` | `DoarsIntersect` | Initialize plugin |

**Directive:** `d-intersect` with `:enter`, `:leave` variants

## Directive

### `d-intersect`

Execute expression on viewport intersection changes:

```html
<!-- On enter OR leave -->
<div d-intersect="handleVisibility()">

<!-- Only on enter -->
<div d-intersect:enter="animateIn()">

<!-- Only on leave -->
<div d-intersect:leave="animateOut()">
```

## Modifiers

| Modifier | Purpose | Example |
|----------|---------|---------|
| `buffer-5` | Execute every 5th trigger | `d-intersect.buffer-5` |
| `debounce-500` | Wait 500ms after last trigger | `d-intersect.debounce-500` |
| `delay-1000` | Wait 1s after trigger | `d-intersect.delay-1000` |
| `throttle-250` | Max once per 250ms | `d-intersect.throttle-250` |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `intersectDirectiveName` | `'intersect'` | Directive name |
| `intersectionRoot` | `null` | Viewport element (null = browser viewport) |
| `intersectionMargin` | `'0px'` | Margin around root |
| `intersectionThreshold` | `0` | Visibility threshold (0-1) |

**Threshold values:**
- `0` - Any pixel visible
- `0.5` - 50% visible
- `1` - Fully visible
- `[0, 0.25, 0.5, 0.75, 1]` - Multiple thresholds

## Common use cases

### Lazy Loading Images

```html
<img d-intersect:enter="this.src = $state.imageUrl" 
     alt="Lazy loaded image" />
```

### Infinite Scroll

```html
<div d-for="item of items">
  <!-- Render items -->
</div>
<div d-intersect:enter="loadMoreItems()">
  Loading more...
</div>
```

### Analytics

```html
<div d-intersect:enter.once="trackView('section-1')">
  <!-- Track when user sees this section -->
</div>
```

### Animations

```html
<div d-intersect:enter="isVisible = true" 
     d-intersect:leave="isVisible = false"
     d-attribute:class="isVisible ? 'fade-in' : 'fade-out'">
  Animated content
</div>
```

## Anti-patterns

Don't forget cleanup:
```javascript
// May keep references
$element.addEventListener('scroll', heavyHandler)
```

Remove listeners:
```javascript
// Clean up when leaving
<div d-intersect:leave="removeListeners()">
```

Don't use for above-fold content:
```html
<!-- Unnecessary - content already visible -->
<div d-intersect:enter="loadImmediately()">
```

Load critical content immediately:
```html
<!-- Load normally -->
<div d-initialized="loadCritical()">
```

## Full documentation

For threshold configuration and advanced options, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-intersect/README.md).
