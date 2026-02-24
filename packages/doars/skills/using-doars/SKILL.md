---
name: using-doars
description: Reference for using the @doars/doars declarative frontend library and its directives, contexts, and modifiers.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars

Doars is a declarative frontend library for adding reactive behavior directly in HTML markup. The expressions of a directive are only ran when needed instead of on each state change.

```html
<div d-state="{ count: 0 }">
  <button d-on:click="count++">Clicked <span d-text="count">0</span> times</button>
</div>
```

## When to use this skill

Writing or modifying code that uses the @doars/doars declarative frontend library. When implementing components, event handling, or state management with Doars directives. When troubleshooting Doars directive syntax, modifiers, or contexts.

## API

| Constructor | Returns | Purpose |
|-------------|---------|---------|
| `new Doars(options?)` | `Doars` | Create library instance |
| `doars.enable()` | `Doars` | Start processing directives |
| `doars.disable()` | `Doars` | Stop processing directives |
| `doars.setSimpleContext(name, value)` | `boolean` | Add global context value |

Core directives: `d-state`, `d-text`, `d-html`, `d-show`, `d-if`, `d-for`, `d-on`, `d-sync`, `d-attribute`, `d-reference`, `d-watch`, `d-initialized`, `d-transition`, `d-cloak`, `d-ignore`

## Implicit behaviors

- Components defined by `d-state`: Everything inside a `d-state` element becomes a reactive component
- Auto-deconstruction: Access `message` directly instead of `$state.message` within component scope
- Context hierarchy: first `$for` (loop vars), then `$state` (local), then `$store` (global), then simple contexts
- Proxy-based reactivity: Uses ES6 Proxies, IE not supported
- Event delegation: All event listeners use delegation for performance

## Directive quick reference

| Directive | Purpose | Example |
|-----------|---------|---------|
| `d-state="{ }"` | Define component + initial state | `<div d-state="{ count: 0 }">` |
| `d-text="expr"` | Set inner text | `<span d-text="count">` |
| `d-html="expr"` | Set inner HTML | `<div d-html="content">` |
| `d-show="expr"` | Toggle display | `<div d-show="isOpen">` |
| `d-if="expr"` | Conditional rendering (on `<template>`) | `<template d-if="show">` |
| `d-for="item of items"` | Loop rendering (on `<template>`) | `<template d-for="item of list">`, `<template d-for="(item, index) of list">`, `<template d-for="(key, value, index) in object">` |
| `d-on:event="expr"` | Event handling | `<button d-on:click="increment()">` |
| `d-sync="path"` | Two-way binding | `<input d-sync="$state.message">` |
| `d-attribute:name="expr"` | Set attributes | `<img d-attribute:src="url">` |
| `d-reference="'name'"` | Capture element reference | `<input d-reference="'input'">` |
| `d-watch="expr"` | Run on value change | `<div d-watch="log(value)">` |
| `d-initialized="expr"` | Run once on init | `<div d-initialized="doSomething()">` |
| `d-transition:in/out="selector"` | CSS transitions | `<div d-transition:in=".fade-in">` |
| `d-cloak` | Hide until initialized (removed after) | `<div d-cloak>` |
| `d-ignore` | Skip processing | `<div d-ignore>` |

## Directive modifiers

### d-attribute

| Modifier | Type | Description |
|----------|------|-------------|
| `selector` | `boolean` | Return CSS selector instead of value/object |

Examples:
```html
<div d-attribute.selector="active ? '[class*=visible]' : '[class*=hidden]'"></div>
```

### d-html

| Modifier | Type | Default | Description |
|----------|------|---------|-------------|
| `decode` | `boolean` | `false` | Decode HTML entities (`&gt;` to `>`) |
| `morph` | `boolean` | `false` | Morph DOM instead of replacing |
| `outer` | `boolean` | `false` | Set `outerHTML` instead of `innerHTML` |

Examples:
```html
<div d-html.decode="'&lt;b&gt;Bold&lt;/b&gt;'"></div>
<div d-html.outer="'<section>New content</section>'"></div>
```

### d-on

Event names: Use `:event` syntax, e.g., `d-on:click`, `d-on:keydown`, `d-on:submit`

Special key filters: For `keydown`/`keyup`, append `-key` to filter, e.g., `d-on:keydown-enter`, `d-on:keyup-escape`

| Modifier | Type | Default | Description |
|----------|------|---------|-------------|
| `buffer` | `number` | `null` (5) | Bundle N events together |
| `capture` | `boolean` | `false` | Use capture phase |
| `cmd` | `boolean` | `false` | Require meta/cmd key |
| `code` | `boolean` | `false` | Check `code` instead of `key` |
| `debounce` | `number` | `null` (500ms) | Delay execution after last trigger |
| `delay` | `number` | `null` (500ms) | Delay execution by N ms |
| `document` | `boolean` | `false` | Listen on document |
| `held` | `number` | `null` | Fire if held for N ms (`keydown`, `mousedown`, `pointerdown`) |
| `hold` | `number` | `null` | Fire after held for N ms (`keydown`, `mousedown`, `pointerdown`) |
| `meta` | `boolean` | `false` | Require meta key |
| `once` | `boolean` | `false` | Execute once only |
| `outside` | `boolean` | `false` | Fire when click outside element |
| `passive` | `boolean` | `false` | Use passive listener |
| `prevent` | `boolean` | `false` | Call `preventDefault()` |
| `repeat` | `boolean` | `false` | Allow repeat key events |
| `self` | `boolean` | `false` | Only if target is element itself |
| `stop` | `boolean` | `false` | Call `stopPropagation()` |
| `super` | `boolean` | `false` | See `meta` |
| `throttle` | `number` | `null` (500ms) | Max once per N ms |
| `window` | `boolean` | `false` | Listen on window |

Constraints: Only one of `buffer`, `held`, `hold`, `debounce`, `throttle`. Only one of `document`, `outside`, `window`.

Examples:
```html
<input d-on:input.debounce-300="search($event.target.value)">
<button d-on:click.once="submit()">Submit Once</button>
<div d-on:click.outside="closeModal()">Modal</div>
<form d-on:submit.prevent="handleSubmit()">
<input d-on:keydown-escape="close()">
```

### d-sync

| Modifier | Description |
|----------|-------------|
| `:state` | Sync to `$state` (default) |
| `:store` | Sync to `$store` |

Examples:
```html
<!-- $state.message -->
<input d-sync="message">

<!-- $state.message -->
<input d-sync:state="message">

<!-- $store.message -->
<input d-sync:store="message">

<!-- Deep path, $store.nested.message -->
<input d-sync="$store.nested.message">
```

### d-text

| Modifier | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | `boolean` | `false` | Use `textContent` instead of `innerText` |

Examples:
```html
<div d-text="message"></div>          <!-- innerText -->
<div d-text.content="message"></div>  <!-- textContent -->
```

### d-transition

Names: Use `:in` or `:out` to specify direction

| Modifier | Type | Default | Description |
|----------|------|---------|-------------|
| `from` | `boolean` | `false` | Apply only on first frame |
| `to` | `boolean` | `false` | Apply only on last frame |

Examples:
```html
<div d-show="visible"
     d-transition:in.from=".fade-in-start"
     d-transition:in=".fade-in"
     d-transition:in.to=".fade-in-end"
     d-transition:out=".fade-out">
```

## Contexts available in expressions

| Context | Description |
|---------|-------------|
| `$state` | Component's reactive state (auto-deconstructed) |
| `$for` | Loop iteration variables (auto-deconstructed) |
| `$store` | Global data store |
| `$element` | Current directive's element |
| `$component` | Component's root element |
| `$references` | Object of referenced elements |
| `$parent`, `$children`, `$siblings` | Component relationships |
| `$dispatch('event', data)` | Dispatch custom events |
| `$nextTick(fn)` | Run after DOM updates |
| `$watch('prop', fn)` | Watch property changes |
| `$inContext(fn)` | Execute with current context |

## Anti-patterns

Don't mix directive prefixes:
```html
<!-- Won't work, directive must use consistent prefix defined when initialising the framework -->
<div d-state="{ x: 1 }" x-on:click="x++">
```

Don't expect direct DOM mutations to persist:
```javascript
// Will be overwritten if the element has a d-text directive
element.innerHTML = 'manual'
```

Use reactive state instead:
```html
<!-- State drives the DOM -->
<div d-html="content" d-initialized="content = 'initial'"></div>
```

Don't forget `d-state` creates components:
```html
<!-- Nested d-state creates nested components with isolated state -->
<div d-state="{ x: 1 }">
  <div d-state="{ y: 2 }">
    <!-- Can't access x directly here, you have to use $parent -->
    <p d-text="$parent.$state.x"></p>
  </div>
</div>
```

## Full documentation

For complete directive/context reference and plugin authoring, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars/README.md).
