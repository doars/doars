---
name: using-doars-fetch
description: Reference for using the @doars/doars-fetch plugin for AJAX requests and dynamic content loading.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/doars-fetch

Doars plugin that adds `$fetch` context and `d-fetch` directive for AJAX requests with automatic DOM updates. Use for forms, lazy loading, or dynamic content without page reloads.

## When to use this skill

When implementing AJAX functionality with Doars. When working with forms that submit without page reloads. When creating lazy-loaded content or infinite scroll. When fetching and injecting HTML/JSON data into the DOM dynamically.

```javascript
import Doars from '@doars/doars'
import DoarsFetch from '@doars/doars-fetch'

const doars = new Doars()
DoarsFetch(doars)
doars.enable()
```

```html
<!-- Simple fetch on form submit -->
<form d-fetch="'/api/search'">
  <input name="q" />
  <button type="submit">Search</button>
</form>

<!-- Fetch with target and indicator -->
<div d-fetch="'/api/results'"
     d-fetch-target="$references.output"
     d-fetch-indicator="$references.spinner">
  <button>Load</button>
  <template d-reference="'spinner'">Loading...</template>
</div>
<div d-reference="'output'"></div>
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `DoarsFetch(doars, options?)` | `DoarsFetch` | Initialize plugin |
| `$fetch(url, options?)` | `Promise` | Fetch API wrapper |

**Directive:** `d-fetch` with modifiers: `append`, `prepend`, `after`, `before`, `inner`, `outer`, `document`, `morph`, `decode`, `throttle`, `debounce`, `delay`, `poll`, `once`

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fetchContextName` | `string` | `'$fetch'` | Name of the fetch context |
| `fetchDirectiveName` | `string` | `'fetch'` | Name of the fetch directive |
| `fetchOptions` | `object` | `{}` | Default fetch options |
| `fetchAutoParse` | `boolean` | `true` | Automatically parse responses based on content type |
| `fetchParsers` | `Array` | `[]` | Custom parsers for additional content types |

## Context

### `$fetch(url, options?)`

Enhanced fetch with automatic response parsing:

```javascript
// Auto-parse based on content-type
$fetch('/api/data')  // Returns parsed JSON/HTML/text

// Explicit return type
$fetch('/api/data', { returnType: 'json' })    // Force JSON
$fetch('/api/data', { returnType: 'text' })    // Force text
$fetch('/api/data', { returnType: 'element' }) // Parse as DOM element

// Disable auto-parsing for a single request
$fetch('/api/data', { autoParse: false })      // Returns raw Response

// Use custom parsers for this request only
$fetch('/api/data', {
  returnType: 'yaml',
  parsers: [{ types: ['yaml'], parser: (r) => r.text().then(yaml.parse) }]
})
```

**Return types:** `auto`, `arrayBuffer`, `blob`, `element`, `html`, `formData`, `json`, `svg`, `text`, `xml`

**Fetch options:** `returnType`, `autoParse`, `parsers`, plus standard [fetch options](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters)

## Custom Parsers

Add support for additional content types (YAML, TOML, CSV, etc.) by providing custom parsers:

```javascript
// Setup with custom parsers
DoarsFetch(doars, {
  fetchParsers: [
    {
      types: ['yaml', 'yml'],
      parser: async (response) => {
        const text = await response.text()
        return jsYaml.load(text) // Using js-yaml library
      }
    },
    {
      types: ['csv'],
      parser: async (response) => {
        const text = await response.text()
        return text.split('\n').map(row => row.split(','))
      }
    },
    {
      types: ['toml'],
      parser: async (response) => {
        const text = await response.text()
        return toml.parse(text) // Using @iarna/toml
      }
    }
  ]
})
```

Then use custom types in templates:

```html
<!-- Fetch and parse YAML configuration -->
<div d-state="{ config: null }"
     d-initialized="$fetch('/config.yaml', { returnType: 'yaml' }).then(data => $state.config = data)">
  <div d-text="config?.title ?? 'Loading...'"></div>
</div>

<!-- Fetch and parse CSV data -->
<div d-state="{ rows: [] }"
     d-initialized="$fetch('/data.csv', { returnType: 'csv' }).then(data => $state.rows = data)">
  <div d-for="row in rows">
    <span d-text="row.join(' | ')"></span>
  </div>
</div>
```

### Parser Structure

Each parser object must have:
- `types: string[]` - Array of type names this parser handles (e.g., `['yaml', 'yml']`)
- `parser: (response, type) => Promise<any>` - Function that receives the Response object and type, returns a Promise with parsed data

## Directive Modifiers

| Modifier | Purpose | Example |
|----------|---------|---------|
| `position` | Where to insert result | `d-fetch.append`, `d-fetch.prepend` |
| `document` | Update entire `<head>` + body | `d-fetch.document` |
| `morph` | Morph DOM instead of replace | `d-fetch.morph` |
| `decode` | Decode HTML entities | `d-fetch.decode` |
| `throttle-500` | Min 500ms between requests | `d-fetch.throttle-500` |
| `debounce-300` | Wait 300ms after last trigger | `d-fetch.debounce-300` |
| `delay-1000` | Wait 1s before fetching | `d-fetch.delay-1000` |
| `poll-60000` | Re-fetch every minute | `d-fetch.poll-60000` |
| `once` | Only fetch once | `d-fetch.once` |

**Special events:** `on:intersect` (viewport entry), `on:load` (directive init)

## Implicit behaviors

- **Auto-parse:** Responses are automatically parsed based on `Content-Type` header (JSON, HTML, XML, etc.) - enabled by default via `fetchAutoParse: true`
- **Forms:** Automatically serializes form data, uses `action` attribute as URL if no value given
- **Anchors:** Uses `href` attribute as URL if no value given
- **Method:** Defaults to `GET`, uses form's `method` attribute if available
- **Encoding:** Auto-detects from form `enctype`, supports `json`, `multipart`, `urlencoded`, `xml`
- **History:** Use with `.document.history` to update URL and enable back button

## Sub-directives

Use on same element as `d-fetch`:

| Directive | Purpose |
|-----------|---------|
| `d-fetch-indicator` | Element to show during fetch |
| `d-fetch-target` | Element to update with result |
| `d-fetch-select` | CSS selector to extract from response |

## Anti-patterns

Don't manually parse responses in expressions:
```html
<!-- Don't do this -->
<div d-initialized="$fetch('/api').then(r => r.json()).then(data => ...)">
```

Use `returnType` option:
```html
<!-- Let plugin handle parsing -->
<div d-initialized="$fetch('/api', { returnType: 'json' }).then(data => ...)">
```

Don't fetch raw Response when you need processed data:
```html
<!-- Don't do this - autoParse is true by default -->
<div d-initialized="$fetch('/api', { autoParse: false }).then(r => r.json())">
```

Let auto-parse handle it, or disable globally if needed:
```javascript
// Disable auto-parse globally
DoarsFetch(doars, { fetchAutoParse: false })
```

Don't ignore loading states:
```html
<!-- Users won't know fetch is happening -->
<button d-fetch="'/slow-endpoint'">Submit</button>
```

Provide feedback:
```html
<!-- Show loading indicator -->
<button d-fetch="'/slow-endpoint'" d-fetch-indicator="$refs.spinner">Submit</button>
<template d-reference="'spinner'">Loading...</template>
```

## Events

- `d-fetch-started` - When fetch begins
- `d-fetch-succeeded` - When fetch completes successfully
- `d-fetch-failed` - When fetch fails

## Full documentation

For complete modifier reference and advanced options, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/doars-fetch/README.md).
