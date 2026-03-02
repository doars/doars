---
name: using-doars-update
description: Reference for using the @doars/doars-update plugin for animation frames and update loops.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-update

Doars plugin adding `d-update` directive and `$update` context for running code on every frame/update loop. Use for animations, games, or any time-based updates.

## When to use this skill

When implementing animations that run on every frame. When building games or interactive simulations. When creating frame-independent animations. When you need timing information for physics or movement. When implementing custom animation loops.

```javascript
import Doars from '@doars/doars'
import DoarsUpdate from '@doars/doars-update'

const doars = new Doars()
DoarsUpdate(doars)
doars.enable()
```

```html
<!-- Run on every frame -->
<div d-update="updateAnimation($update.delta)">
</div>

<!-- Access timing info -->
<div d-text="'Time: ' + Math.floor($update.passed) + 's'">
</div>

<!-- Control execution order -->
<div d-update.order-1000="lateUpdate()">
<div d-update.order-100="earlyUpdate()">
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsUpdate(doars, options?)` | `DoarsUpdate` | Initialize plugin |

**Context:** `$update` with timing information

## Context

### `$update`

Timing information for the current frame:

```javascript
// Current time
$update.current      // Seconds since start
$update.currentMs    // Milliseconds since start

// Frame delta (time since last frame)
$update.delta        // Seconds
$update.deltaMs      // Milliseconds

// Previous frame time
$update.last         // Seconds
$update.lastMs       // Milliseconds

// Total elapsed time
$update.passed       // Seconds
$update.passedMs     // Milliseconds

// Loop start time
$update.start        // Seconds
$update.startMs      // Milliseconds
```

## Directive

### `d-update`

Execute expression every frame/update iteration:

```html
<!-- Basic update loop -->
<div d-update="animate()"></div>

<!-- With order modifier (lower = earlier) -->
<div d-update.order-100="physics()"></div>
<div d-update.order-500="render()"></div>
<div d-update.order-1000="postProcess()"></div>
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `updateContextName` | `'$update'` | Name of update context |
| `updateDirectiveName` | `'update'` | Name of update directive |
| `defaultOrder` | `500` | Default order value |
| `stepMinimum` | `0` | Minimum ms between updates (0 = every frame) |

## Common use cases

### Simple Animation Loop

```html
<div d-state="{ x: 0 }"
     d-update="x = (x + $update.delta * 100) % 500"
     d-attribute:style="'transform: translateX(' + x + 'px)'">
  Moving box
</div>
```

### FPS Counter

```html
<div d-state="{ frames: 0, lastTime: 0, fps: 0 }"
     d-update="
       frames++;
       if ($update.current - lastTime >= 1) {
         fps = frames;
         frames = 0;
         lastTime = $update.current
       }
     "
     d-text="fps + ' FPS'">
</div>
```

### Countdown Timer

```html
<div d-state="{ remaining: 60 }"
     d-update="remaining = Math.max(0, 60 - $update.passed)"
     d-text="Math.ceil(remaining) + 's'">
</div>
```

### Frame-independent Movement

```html
<div d-state="{ x: 0, speed: 200 }"
     d-update="x += speed * $update.delta"
     d-attribute:style="'left: ' + x + 'px'">
  <!-- Moves at consistent speed regardless of frame rate -->
</div>
```

## Anti-patterns

Don't do heavy work every frame:
```html
<!-- Blocks the main thread -->
<div d-update="heavyComputation()">
```

Use throttling or Web Workers:
```html
<!-- Limit update frequency -->
<div d-update="if ($update.deltaMs >= 100) heavyComputation()">
```

Don't forget to pause when not needed:
```javascript
// Keeps running even when not visible
<div d-update="expensiveRender()">
```

Pause when hidden:
```html
<!-- Use visibility API or conditional -->
<div d-update="if (isActive) updateGame()">
```

## Performance Tips

- Use `stepMinimum` to cap update rate
- Lower order numbers run earlier (physics before rendering)
- Use `$update.delta` for frame-independent calculations
- Clean up update loops when components are destroyed

## Full documentation

For complete timing reference and performance tuning, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-update/README.md).
