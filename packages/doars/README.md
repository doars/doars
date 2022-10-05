<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/doars.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@doars/doars?label=Size&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/doars)

</div>

<hr/>

# @doars/doars

The core library, it manages the components and plugins as well as includes the basic contexts and directives.

## Table of contents

- [Install](#install)
- [Directives overview](#directives-overview)
- [Contexts overview](#contexts-overview)
- [Directives](#directives)
- [Contexts](#contexts)
- [Simple contexts](#simple-contexts)
- [Browser support](#browser-support)
- [Expression processors](#expression-processors)
- [API](#api)
- [Writing contexts](#writing-contexts)
- [Writing directives](#writing-directives)
- [Writing plugins](#writing-plugins)

## Install

### From NPM

Install the package from NPM, then import and enable the library in your build.

```
npm i @doars/doars
```

```JavaScript
// Import library.
import Doars from "@doars/doars"

// Setup an instance.
const doars = new Doars(/* options */)

// Enable library.
doars.enable()
```

### IIFE build from jsDelivr

Add the IIFE build to the page from for example the jsDelivr CDN and enable the library.

```HTML
<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup an instance.
    const doars = new window.Doars(/* options */)

    // Enable library.
    doars.enable()
  })
</script>
```

> [ESM](https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.esm.js) and [IIFE](https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js) builds are also available via the jsDelivr CDN.

## Directives overview

| Name                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| [d-attribute](#d-attribute)     | Set an attribute's value.                                           |
| [d-cloak](#d-cloak)             | Is removed after the component is initialized.                      |
| [d-for](#d-for)                 | Loop over a value and create elements based on a template.          |
| [d-html](#d-html)               | Set the inner html of the element.                                  |
| [d-if](#d-if)                   | Return whether the template should be added to the document.        |
| [d-ignore](#d-ignore)           | Ignore the element and its children from being processed.           |
| [d-initialized](#d-initialized) | Runs once when the component is initialized.                        |
| [d-on](#d-on)                   | Listen to events on the document tree.                              |
| [d-reference](#d-reference)     | Add the element to the component's references context.              |
| [d-select](#d-select)           | Set selected item of a select element or selectable input elements. |
| [d-show](#d-show)               | Return whether the element should be displayed.                     |
| [d-state](#d-state)             | Define a component and set its initial state.                       |
| [d-sync](#d-sync)               | Keep the value of an element in sync with a value in the state.     |
| [d-text](#d-text)               | Set the inner text or text content of the element.                  |
| [d-transition](#d-transition)   | Change attributes on an element when being hidden or shown.         |
| [d-watch](#d-watch)             | Runs every time a value used changes.                               |

## Contexts overview

| Name                        | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| [\$children](#children)     | List of contexts of child components.                               |
| [\$component](#component)   | Component's root element.                                           |
| [\$dispatch](#dispatch)     | Dispatch custom event on the element.                               |
| [\$element](#element)       | Directive's element.                                                |
| [\$for](#for)               | Get variables defined in the for directive.                         |
| [\$inContext](#inContext)   | Call a function in context after the existing one has been revoked. |
| [\$nextTick](#nextTick)     | Call a function after updates are done processing.                  |
| [\$parent](#parent)         | Context of parent component.                                        |
| [\$references](#references) | List of referenced elements in the component.                       |
| [\$state](#state)           | Get component's state.                                              |

## Directives

Directives are instructional attributes placed on elements in order to make the elements react to changes and input.

Directives consist of several parts, some are optional depending on which directive is used. The first part is the prefix, by default `d-`. The second part the name of the directive, for example `d-on`. Optionally a name can be provided after a colon `d-on:click`. After a stop additional modifiers can be provided `d-on:click.once`. Finally the attribute value is provided. What the name, modifiers, and value are used for dependents on the directive.

A directive will only be read if it is part of a component. A component is defined by setting the [`d-state`](#d-state) on an element. Everything inside the element becomes part until another component is defined further down the hierarchy.

### d-attribute

Set an attribute's value or multiple attributes at once by returning an object. The directive's value should be function expression. If the directive is given a name the attribute with that name will be set to the value returned by the expression. Otherwise an object needs to be returned where the keys of the object are the attribute names and the value is set as the value of the attribute. Alternatively a promise can be returned resolving into an attribute value or object if attribute name and value pairs.

#### d-attribute modifiers

- `{Boolean} selector = false` Return a CSS style selector instead of a specific value or object.

#### d-attribute examples

```HTML
<!-- Only show if active is true. -->
<div d-attribute:style="$state.active ? '' : 'display:none'"></div>
```

```HTML
<!-- Only show if active is true. -->
<div d-attribute="$state.active ? { style: '' } : { style: 'display:none' }"></div>
```

```HTML
<!-- Only show if active is true. -->
<div d-attribute.selector="$state.active ? '[style]' : '[style=display:none]'"></div>
```

### d-cloak

Is removed after the component is initialized.

```HTML
<!-- Hide any components with the cloak directive. -->
<style>
  [d-cloak] {
    display: none
  }
</style>

<!-- Since the cloak directive is removed after initialization this element won't be visible until then. -->
<div d-cloak>
  Not hidden!
</div>
```

### d-for

Loop over a value and create elements based on a template. The directive's value gets split into two parts. The first part a list of variable names and the second part should be a function expression. The split happens at the `of` or `in` keyword. The variable names are the names under which the values of the function expression are made available on the [\$for context](#for). The function expression can return either a number, array, object, or promise resolving into a number, array, or object. Which variable name matches which value of the return type depends on the return type. For numbers only one variable will be set to the index of the iteration. For arrays the first variable is the value, and the second variable the index of the iteration. For objects the first variable is the key, the second variable is the value, and the third variable the index of the iteration. The directive can only be used on a [`template`](https://developer.mozilla.org/docs/Web/HTML/Element/template) element.

#### d-for examples

```HTML
<!-- Create four items base of a number. Make the index of the item available on the $for context under the property named 'index'. -->
<template d-for="index of 4">
  <li>Item</li>
</template>
```

```HTML
<!-- Create two item based of an array. Make the value and index available on the $for context under the properties named 'value' and 'index' respectively.  -->
<template d-for="(value, index) of [ 'value A', 'Value b' ]">
  <li>Item</li>
</template>
```

```HTML
<!-- Create two item based of an object. Make the key, value, and index available on the $for context under the properties named 'key', 'value', and 'index' respectively.  -->
<template d-for="(key, value, index) in { a: 'value A', b: 'Value b' }">
  <li>Item</li>
</template>
```

### d-html

Set the inner HTML of the element. The directive's value should be a function expression returning the HTML to set, or a promise resolving into the HTML to set. The inner HTML is only updated if it differs from the current value.

#### d-html modifiers

- `{Boolean} decode = false` If the returned type is a string the value will's special HTML characters will be decoded. For example `&gt;` will become `>`.

#### d-html examples

```HTML
<!-- Write a string to the inner HTML of the element. -->
<div d-html="'<h1>Hello world!</h1>'"></div>
```

```HTML
<!-- Decodes the special HTML characters before writing the string to the inner HTML of the element. -->
<div d-html.decode="'&lt;h1&gt;Hello world!&lt;/h1&gt;'"></div>
```

```HTML
<!-- Write a value from the state to the inner HTML of the element. -->
<div d-html="$state.message"></div>
```

> The inner HTML is only updated if it is different from the current inner HTML.

### d-if

Return whether the template should be added to the document. The directive's value should be a function expression. If the result is truthy then the element will added to the document otherwise. If the result was previously truthy and is not any more then the element added by the directive will be removed. Alternatively a promise can be returned. After it has been resolved its truthiness will be checked and the directive will update then. The directive can only be used on a [`template`](https://developer.mozilla.org/docs/Web/HTML/Element/template) element.

#### d-if examples

```HTML
<!-- Adds the span tag to the document. -->
<template d-if="true">
  <span>Hello world!</span>
</template>
```

```HTML
<!-- Toggles adding and removing the span element when the button is clicked. -->
<div d-state="{ active: false }">
  <button d-on:click="$state.active = !$state.active">
    Toggle
  </button>

  <template d-if="$state.active">
    <span>Active</span>
  </template>
</div>
```

### d-ignore

Ignore the element and its children from being processed.

#### d-ignore examples

```HTML
<!-- The text directive will never run due to the ignore attribute on the same element. -->
<p d-ignore d-text="'This message will not be displayed.'">
  This message will not be updated.
</p>

<!-- The text directive will never run due to the ignore attribute on the parent element. -->
<div d-ignore>
  <p d-text="'This message will not be displayed.'">
    This message will not be updated
  </p>
</div>
```

### d-initialized

Runs once when the component is initialized. The directive's value should be a function expression.

#### d-initialized examples

```HTML
<!-- Logs initialized to the console when the element's component is initialized. -->
<div d-initialized="console.log('initialized')"></div>
```

### d-on

Listen to events on the document.

The directive's name is the event name to listen to. When listen to the `keydown` or `keyup` events a hyphen after the event name can be used to specify which key to filter on. For example `d-on:keydown-h`, or `d-on:keyup-space`. The directive's value should be a function expression. It will processed when the event is triggered.

#### d-on modifiers

- `{Number} buffer = null` Buffer multiple events together whereby the value is the amount of calls to bundle together. All events will be made available in an $events context and the most recent event is also available in the $event context. If set without a specific value then 5 will be used.
- `{Boolean} capture = false` Whether the `capture` option needs to be enabled when listening to the event.
- `{Boolean} cmd = false` See meta modifier.
- `{Boolean} code = false` Whether the keyboard event's key or code property should be checked.
- `{Number} debounce = null` Only fire the event if another event hasn't been invoked in the amount of time in milliseconds specified. All events will be made available in an $events context and the most recent event is also available in the $event context. If set without a specific value then 500 will be used.
- `{Boolean} document = false` Listen for the event on the document, instead of the element the directive is placed on.
- `{Number} held = null` Only fire the event if the key, mouse, or pointer was held down for the amount of time in milliseconds specified. This modifier can only be used in combination with the `keydown`, `mousedown`, and `pointerdown` events.
- `{Number} hold = null` Only fire the event after the amount of time specified has been elapsed and the key, mouse, or pointer has been held down. This modifier can only be used in combination with the `keydown`, `mousedown`, and `pointerdown` events. The key difference with the held modifier is this fires as soon as the time has elapsed.
- `{Boolean} meta = false` Whether the meta (command or windows) key needs to held for the directive to fire.
- `{Boolean} once = false` WWhether the `once` option needs to be enabled when listening to the event.
- `{Boolean} outside = false` Whether the event needs to have happened outside the element it is applied on.
- `{Boolean} passive = false` Whether the `passive` option needs to be enabled when listening to the event.
- `{Boolean} prevent = false` Whether to call `preventDefault` on the event invoking the route change.
- `{Boolean} repeat = false` Whether to allow repeat calls of the event. Repeat calls are detriment by the [`KeyboardEvent.repeat`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat) property.
- `{Boolean} self = false` Whether the target of the event invoking the route change must be the directive's element itself and not an underlying element.
- `{Boolean} stop = false` Whether to call `stopPropagation` on the event invoking the route change.
- `{Boolean} super = false` See `meta` modifier.
- `{Number} throttle = null` Prevent the event from firing again for the amount of time in milliseconds specified. All events will be made available in an $events context and the most recent event is also available in the $event context. If set without a specific value then 500 will be used.
- `{Boolean} window = false` Listen for the event on the window, instead of the element the directive is placed on.

Only one of the following five modifiers can be used at a time `buffer`, `held` `hold`, `debounce`, or `throttle`.

Only one of the following three modifiers can be used at a time `document`, `outside`, or `window`.

#### d-on examples

```HTML
<input d-on:change.debounce-250="updateSearchResults($event)" type="text" />
```

```HTML
<div d-state="{ open: false }">
  <!-- Show the opened div when the button is clicked. -->
  <button d-on:click="open = true">
    Open
  </button>

  <!-- Close the opened div when clicking outside the div. -->
  <div d-show="open" d-on:click.outside="open = false">
    Opened!
  </div>
</div>
```

### d-reference

Add the element to the component's references context. The directive's value should be the variable name under which to make the reference available in the [`$references`](#references) context.

#### d-reference examples

```HTML
<!-- Make the element accessible under $references.myElement. -->
<div d-reference="myElement"></div>
```

### d-select

Set selected item of a select element or selectable input elements. Selectable input elements are input elements with the type `checkbox` or `radio`. The directive's value should be a function expression. The function expression should return the value of the item to select, an array of values to select if the `multiple` attribute is applied, an input element with the type `checkbox` is used, or a promising resolving into one the previously mentioned types.

#### d-select examples

```HTML
<!-- Will select the second option only. -->
<select d-select="'b'">
  <option value="a" selected>Option A</option>
  <option value="b">Option B</option>
  <option value="c">Option C</option>
</select>
```

```HTML
<!-- Will select the second and third options. -->
<select d-select="[ 'b', 'c' ]" multiple>
  <option value="a" selected>Option A</option>
  <option value="b">Option B</option>
  <option value="c">Option C</option>
</select>
```

```HTML
<!-- Will select the second checkbox only. -->
<div d-state="{ selected: 'b' }">
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="a" checked>
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="b">
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="c">
</div>
```

```HTML
<!-- Will select the second and third checkboxes. -->
<div d-state="{ selected: [ 'b', 'c' ] }">
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="a" checked>
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="b">
  <input type="checkbox" name="checkbox-name" d-select="$state.selected" value="c">
</div>
```

```HTML
<!-- Will select the second toggle. -->
<div d-state="{ selected: 'b' }">
  <input type="radio" name="radio-name" d-select="$state.selected" value="a" checked>
  <input type="radio" name="radio-name" d-select="$state.selected" value="b">
  <input type="radio" name="radio-name" d-select="$state.selected" value="c">
</div>
```

### d-show

Return whether the element should be displayed. The directive's value should be a function expression. The directive applies the inline styling of `display: none` to the element if the directive's value returns a non truthy value (`false`, or `null`, etc.), otherwise the inline styling of `display: none` is removed. Alternatively a promise can be returned. After it has been resolved its truthiness will be checked and the directive will update then.

#### d-show examples

```HTML
<div d-show="true">
  Shown!
</div>
```

```HTML
<div d-state="{ visible: false }">
  <div d-show="$state.visible">
    Hidden!
  </div>
</div>
```

### d-state

Define a component and set its initial state. The directive's value should be a function expression returning an object. If no value is given an empty state of `{}` will be used.

### d-state examples

```HTML
<!-- Define a component. -->
<div d-state="{ message: 'Hello there.' }">

  <!-- Define a child component. -->
  <div d-state="{ message: 'General Kenobi!' }">
    <!-- The span will output the message of the child component. -->
    <span d-text="$state.message"></span>
  </div>
</div>

<!-- Define another component unrelated the former. -->
<div d-state="{ message: 'The Force will be with you. Always.' }">
  <span d-text="$state.message"></span>
</div>
```

### d-sync

Keep the value of an element in sync with a value in the state. It works on input, checkbox, radio, select, and text area elements, as wel as div's with the [content editable](https://developer.mozilla.org/docs/Web/Guide/HTML/Editable_content) attribute. The directive's value should be a dot separated path to a property on the state of the component.

#### d-sync examples

```HTML
<input type="text" name="message" d-sync="$state.message" />
```

```HTML
<input type="text" name="status" d-sync="$state.messenger.status" />
```

```HTML
<input type="text" name="message" d-sync:state="message" />
```

```HTML
<input type="text" name="message" d-sync="message" />
```

### d-text

Set the inner text or text content of the element. The directive's value should be a function expression returning the text to set, or a promise resolving into the text to set. The inner text or text content is only updated if differs from the current value.

#### d-text modifiers

- `{Boolean} content = false` Whether to write to `textContent` instead of `innerText`. See [the MDN docs for the differences between `innerText` and `textContent`](https://developer.mozilla.org/docs/Web/API/Node/textContent#differences_from_innertext).

#### d-text examples

```HTML
<!-- Write a string to the inner text fo the element. -->
<div d-text="'Afterwards'"></div>
```

```HTML
<!-- Write a value from the state to the inner text fo the element. -->
<div d-text="$state.message"></div>
```

```HTML
<!-- Write a value from the state to the text content of the element. -->
<div d-text.content="$state.message"></div>
```

### d-transition

Change attributes on an element when being hidden or shown. The directive's name should either be `in` or `out`. Where `in` is used when an element is being show, and `out` when a element will be hidden. The directive's value should be a CSS selector. This selector will be applied when another directive is transition the element away from being hidden or will become hidden. Differing selectors can be used during each type of transitions, and different selectors can be applied during each phase of the transition using modifiers.

The duration of the transition depends on the transition duration or animation duration set on the element after the first frame.

#### d-transition modifiers

One of the following modifiers can be applied. If both are applied the directive is ignored.

- `{Boolean} from = false` Will only be applied on the first frame of the transition.
- `{Boolean} to = false` Will only be applied on the last frame of the transition.

Not using a modifier means the selector is applied during the entire transitioning period.

#### d-transition examples

```HTML
<!-- When this element is made visible by the show directive. the first-frame and transition classes are applied then the next frame the first-frame class is removed. On the last frame of the transition the last-frame class is applied and then the next frame the transitioning and last-frame classes are removed. -->
<div d-show="true" style="display: none" d-transition:in.from=".first-frame" d-transition:in=".transitioning" d-transition:in.to=".last-frame"></div>
```

### d-watch

Runs every time a value used changes. The directive's name is ignored so multiple watch directive's can be applied to the same element. The directive's value should be a function expression.

#### d-watch examples

```HTML
<div d-state="{ message: null }">
  <!-- Store the value of this input in the state. -->
  <input type="text" d-sync="$state.message" />

  <!-- Log the message to the console when it changes. -->
  <div d-watch="console.log(message)"></div>
</div>
```

## Contexts

Contexts are the variables available to directive expressions during execution.

### \$children

List of contexts of child components.

- Type: `Array<Object>`

#### \$children examples

```HTML
<!-- Sets the amount of child components of the directive's component to the innerText of the directive's element. -->
<div d-text="$children.length"></div>
```

```HTML
<!-- Logs the first child component of the directive's component to the console. -->
<div d-initialized="console.log($children[0])"></div>
```

### \$component

Component's root element.

- Type: `HTMLElement`

#### \$component examples

```HTML
<!-- On initialization sets the id of the directive's component's element to 'myComponent'. -->
<div d-initialized="$component.id = 'myComponent'"></div>
```

### \$dispatch

Dispatch custom event on the element.

- Type: `Function`
- Parameters:
  - `{String} name` Name of the event.
  - `{Object} detail = {}` Detail data of the event.

#### \$dispatch examples

```HTML
<!-- On click dispatches the 'beenClicked' event. -->
<div d-on:click="$dispatch('beenClicked')"></div>
```

### \$element

Directive's element.

- Type: `HTMLElement`

#### \$element examples

```HTML
<!-- On initialization sets the id of the directive's element to 'myElement'. -->
<div d-initialized="$element.id = 'myElement'"></div>
```

### \$for

Get variables defined in the for directive. This context gets deconstruct automatically so when accessing the properties you do not need to prefix it with `$for`.

#### \$for examples

```HTML
<!-- Loops over and adds the indices and values of the array to the page. -->
<template d-for="(value, index) of [ 'Hello world!' ]">
  <div>
    <span d-text="$for.index"></span> - <span d-text="$for.value"></span>
  </div>
</template>
```

```HTML
<!-- Loops over and adds the indices and values of the object to the page. -->
<template d-for="(key, value, index) in { message: 'Hello world!' }">
  <div>
    <span d-text="$for.index"></span> - <span d-text="$for.value"></span>
  </div>
</template>
```

```HTML
<!-- Loops over and adds the indices and values of the object to the page. The same as the previous example, but it makes use of the fact that the context gets automatically deconstructed. -->
<template d-for="(key, value, index) in { message: 'Hello world!' }">
  <div>
    <span d-text="index"></span> - <span d-text="value"></span>
  </div>
</template>
```

### \$inContext

Call a function in context after the existing one has been revoked. Whereby the first parameter of the callback method will be an object containing the contexts. Useful for accessing a component's context after running an asynchronous function.

- Type: `Function`
- Parameters:
  - `{Function} callback` Callback to invoke.

#### \$inContext examples

```HTML
<!-- On initialization runs an asynchronous method and sets the result on the state of the component. -->
<div d-initialized="
  doSomething().then((result) => {
    $inContext(({ $state }) => {
      $state.value = result
    })
  })
"></div>
```

### \$nextTick

Call a function after updates are done processing. Whereby the first parameter of the callback method will be an object containing the contexts.

- Type: `Function`
- Parameters:
  - `{Function} callback` Callback to invoke.

#### \$nextTick examples

```HTML
<!-- On initialization sets the initialized property on the component's state to true. -->
<div d-initialized="
  $nextTick(({ $state }) => {
    $state.initialized = true
  })"></div>
```

### \$parent

Context of parent component.

- Type: `Object`

#### \$parent examples

```HTML
<!-- On initialization sets the accessible property on the parent component's state to true. -->
<div d-initialized="$parent.state.accessible = true"></div>
```

### \$references

List of referenced elements in the component.

- Type: `Object<String, HTMLElement>`

#### \$references examples

```HTML
<!-- On initialization logs the reference named 'otherElement' to the console. -->
<div d-reference="otherElement"></div>
<div d-initialized="console.log($references.otherElement)"></div>
```

### \$state

Get component's state. This context gets deconstruct automatically so when accessing the properties you do not need to prefix it with `$state`. Do note the `$state` context will be checked after the `$for` context since the `$state` context is inserted before the for context. This means that when a property exists on both the state and the for contexts the value from the for will be returned.

- Type: `Object`

#### \$state examples

```HTML
<!-- On initialization sets the property property on the component's state to true. -->
<div d-initialized="$state.property = true"></div>
```

```HTML
<!-- Sets the message of the state as innerText on the directive's element. -->
<div d-text="$state.message"></div>
```

```HTML
<!-- Sets the message of the state as innerText on the directive's element. The same as the previous example, but it makes use of the fact that the context gets automatically deconstructed. -->
<div d-text="message"></div>
```

## Simple contexts

A simple context is a context that is added using the setSimpleContext function on the Doars instance. The advantage are they can be easily added or removed using a single function. The disadvantages are they do not have access to the attribute and component, as well as a destroy function called after every expression processed. Therefore simple contexts are best used for values that need to be accessible to every context and do not require any life cycle management or information about the attribute or component the value is used in.

The simple contexts are used as the base to build the full context from. This means they will be overwritten by any other context or property on any deconstructed context, like the component's state, that the simple context has a name in common with.

```HTML
<!-- Create the component's state with the message by calling the simple context. -->
<div d-state="createState()">
  <!-- Call the simple context with the message when the button has been clicked. -->
  <button d-on:click="handleButtonClick($state.message)">
    Log message
  </button>
</div>

<!-- Import library. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup an instance.
    const doars = new window.Doars()

    // Set the simple contexts on the instance.
    doars.setSimpleContext('createState', () => {
      // Return an object with our message.
      return {
        message: 'Hello there!'
      }
    })
    doars.setSimpleContext('handleButtonClick', (message) => {
      // Log the message to the console.
      console.log('The element has been clicked!', message)
    })

    // Enable library.
    doars.enable()
  })
</script>
```

## Browser support

Internet Explorer and older versions of other browsers are not supported as the library heavily relies on [proxies](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for its state management. See proxy browser compatibility on [MDN Web Docs](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy#browser_compatibility) or the [can i use statistics](https://caniuse.com/proxy).

## Expression processors

Some directives can return JavaScript expressions. The expressions are given to a function that processes it. There are three different processors provided by default each having a separate build. You can also specify a custom processor function using the options.

### Execute processor

The execute function uses the [`Function` constructor](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) to process the expressions. Which is similar to the [`eval` function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/eval) in that it is not very safe to use, nor recommended. This processor function does not work when a [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) is set that does not contain `unsafe-eval`. That being said this process method does allow for running any expression you might want, since it uses the JavaScript interpreter directly.

```HTML
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
```

```JavaScript
import Doars from '@doars/doars'
// Or the file directly.
import Doars from '@doars/doars/src/DoarsExecute.js'
```

### Interpret processor

The interpret function uses a [custom interpreter](https://github.com/doars/doars/tree/main/packages/interpret#readme) that parses and runs the expression. The interpret does not support all JavaScript features, but any expression that it runs is also valid JavaScript. To see what features are supported see the interpreter's [supported features](https://github.com/doars/doars/tree/main/packages/interpret#supported-features) section.

Because the interpret processor does not use the `Function` constructor it can be used when a [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/CSP) is setup without `unsafe-eval`. However the interpreter is essentially a way to get around the policy and should not be used without taking the accompanying risks into consideration.

```HTML
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars-interpret.iife.js"></script>
```

```JavaScript
import Doars from '@doars/doars/src/DoarsInterpret.js'
```

### Call processor

The call function is the simplest processor and also the most limiting one. Instead of trying to the evaluate the expression, instead it assumes the expression is a dot separated path to a value in the contexts. If the value at the path is a function it will run it and given the contexts object as a parameter. This means it also the most limiting build-in processor function, however in combination the [simple contexts](#simple-contexts) functions you can still accomplish anything you might want to do.

Because the call processor does not try to run an arbitrary expression it is the most secure option out of all of the build-in.

```HTML
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars-call.iife.js"></script>
```

```JavaScript
import Doars from '@doars/doars/src/DoarsCall.js'
```

#### Call processor examples

```HTML
<!-- Instead of -->
<div d-state="{ message: 'Hello there!' }">
  <button d-on:click="console.log('The element has been clicked!', $state.message)">
    Log message
  </button>
</div>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup an instance.
    const doars = new window.Doars()
    // Enable library.
    doars.enable()
  })
</script>

<!-- You need to do -->
<div d-state="createState">
  <button d-on:click="handleButtonClick">
    Log message
  </button>
</div>
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars-call.iife.js"></script>
<script type="application/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Setup an instance.
    const doars = new window.Doars()

    // Set the simple contexts on the instance.
    doars.setSimpleContext('createState', () => {
      // Return an object with our message.
      return {
        message: 'Hello there!'
      }
    })
    doars.setSimpleContext('handleButtonClick', ({ $state }) => {
      // Log the message to the console.
      console.log('The element has been clicked!', $state.message)
    })

    // Enable library.
    doars.enable()
  })
</script>
```

## API

### EventDispatcher

Base class extended by several other classes in order to dispatch events.

- `constructor` Create instance.
  - `@returns {EventDispatcher}`
- `addEventListener` Add callback to event.
  - `@param {String} name` Event name.
  - `@param {Function} callback` Callback to invoke when the event is
    dispatched.
  - `@param {Object} options` Event listener options.
    - `{Boolean} once = false` Removes the callback after it has been invoked.
- `removeEventListener` Remove callback from event.
  - `@param {String} name` Event name.
  - `@param {Function} callback` Callback to remove.
- `removeEventListeners` Remove all callbacks to an event.
  - `@param {String} name` Event name.
- `removeAllEventListeners` Remove all callbacks of the event dispatcher.
- `dispatchEvent` Trigger event callbacks.
  - `@param {String} name` Event name.
  - `@param {Array<Any>} parameters` List of parameters to pass to the callback.
  - `@param {Object} options` Dispatch options.
    - `{Boolean} reverse = false` Invokes event callbacks in reverse order from
      which they were added.

### ProxyDispatcher

Sends out events when an object it keeps track of get accessed of mutated. Extends the [`EventDispatcher`](#eventdispatcher).

- `constructor` Create instance.
  - `@param {Object} options = {}` Options.
    - `{Boolean} delete = true` Whether to dispatch delete events.
    - `{Boolean} get = true` Whether to dispatch get events.
    - `{Boolean} set = true` Whether to dispatch set events.
  - `@returns {ProxyDispatcher}`
- `add` Add object to proxy dispatcher.
  - `@param {Object} target` Object to add.
  - `@returns {Proxy}`
- `remove` Remove object from proxy dispatcher.
  - `@param {Object} target` Object to remove.

#### ProxyDispatcher events

- `delete` When an property is deleted from a tracked object.
  - `@param {Object} target` The root object the property has been deleted from.
  - `@param {Array<String>} path` Path segments leading to the deleted property.
- `get` When a property is retrieved on a tracked object.
  - `@param {Object} target` The root object the property has been retrieved
    from.
  - `@param {Array<String>} path` Path segments leading to the retrieved
    property.
  - `@param {Any} receiver`
- `set` When a value is set on a tracked object.
  - `@param {Object} target` The root object the property has been set on.
  - `@param {Array<String>} path` Path segments leading to the set property.
  - `@param {Any} value` Value of the set property.
  - `@param {Any} receiver`

### Doars

Extends the [`EventDispatcher`](#eventdispatcher).

- `constructor` Create instance.
  - `@param {Object} options = null` Options.
    - `{String} prefix = 'd'` The prefix of the directive's attribute names.
    - `{Function|String} processor = 'execute'` The expression processor to use. By default it will grab either the `executeExpression` and `evaluateExpression` function located on the Doars constructor, with a preferences for the execute function if both are available. To set the preferred processor to `evaluateExpression` use `'evaluate'`. If a function is set that function will be used instead.
    - `{HTMLElement|String} root = document.body.firstElementChild` The element to scan and keep track of. If a string is provided it will be used as a query selector to find the element.
  - `@returns {Doars}`
- `getEnabled` Whether this is currently enabled.
  - `@returns {Boolean}` Whether the library is enabled.
- `getId` Get the unique identifier.
  - `@returns {Symbol}` Unique identifier.
- `getOptions` Get the current options.
  - `@returns {Object}` Current options.
- `enable` Enable the library.
  - `@returns {Doars}` This instance.
- `disable` Disable the library. Disabling the library does not return everything back to the state is was before enabling it. Listeners will be removed, modifications to the document will not be undone. For instance the
  `cloak` attribute once removed will not return.
  - `@returns {Doars}` This instance.
- `getSimpleContexts` Get simple contexts.
  - `@returns {Object}` Stored simple contexts.
- `setSimpleContexts` Add a value directly to the contexts without needing to use an object or having to deal with indices.
  - `@param {String} name` Property name under which to add the context.
  - `@param {Any} value = null` The value to add, null removes the context.
  - `@returns {Boolean}` Whether the value was successfully set.
- `getContexts` Get list of contexts.
  - `@returns {Array<Object>}` List of contexts.
- `addContexts` Add contexts at the index. _Can only be called when NOT enabled._
  - `@param {Number} index` Index to start adding at.
  - `@param {...Object} contexts` List of contexts to add.
  - `@returns {Array<Object>}` List of added contexts.
- `removeContexts` Remove contexts. _Can only be called when NOT enabled._
  - `@param {...Object} contexts` List of contexts to remove.
  - `@returns {Array<Object>}` List of removed contexts.
- `getDirectives` Get list of directives.
  - `@returns {Array<Object>}` List of directives.
- `getDirectivesNames` Get list of directive names.
  - `@returns {Array<String>}` List of directive names.
- `getDirectivesObject` Get object of directives with the directive name as key.
  - `@returns {Object}` Object of directives.
- `isDirectiveName` Check whether a name matches that of a directive.
  - `@param {String} attributeName` Name of the attribute to match.
  - `@returns {Boolean}` Whether the name matches that of a directive.
- `addDirective` Add directives at the index. _Can only be called when NOT enabled._
  - `@param {Number} index` Index to start adding at.
  - `@param {...Object} directives` List of directives to add.
  - `@returns {Array<Object>}` List of added directives.
- `removeDirectives` Remove directives. _Can only be called when NOT enabled._
  - `@param {...Object} directives` List of directives to remove.
  - `@returns {Array<Object>}` List of removed directives.
- `update` Update directives based on triggers. _Can only be called when enabled._
  - `@param {Array<Object>} triggers` List of triggers to update with.

#### Doars events

The following events are dispatched by the library and can be listened to by calling the `addEventListener(/* name, callback, options */)` function on the instance.

- `enabling` When enabling, but before enabling is done.
  - `@param {Doars} doars` Library instance.
- `enabled` After enabling is done.
  - `@param {Doars} doars` Library instance.
- `updated` After enabling is done and when an update has been handled.
  - `@param {Doars} doars` Library instance.
- `disabling` When disabling, but before disabling is done.
  - `@param {Doars} doars` Library instance.
- `disabled` After disabling is done.
  - `@param {Doars} doars` Library instance.
- `components-added` When one or more components are added.
  - `@param {Doars} doars` Library instance.
  - `@param {Array<HTMLElements>} addedElements` List of added components.
- `components-removed` When one or more components are removed.
  - `@param {Doars} doars` Library instance.
  - `@param {Array<HTMLElements>} removedElements` List of removed components.
- `contexts-added` When one or more contexts are added.
  - `@param {Doars} doars` Library instance.
  - `@param {Object} addedContexts` List of added contexts.
- `contexts-removed` When one or more contexts are removed.
  - `@param {Doars} doars` Library instance.
  - `@param {Object} removedContexts` List of removed contexts.
- `simple-context-added` When a simple context is added.
  - `@param {Doars} doars` Library instance.
  - `@param {string} name` Name of simple context.
  - `@param {any} value` Value of simple context.
- `simple-context-removed` When a simple context is removed
  - `@param {Doars} doars` Library instance.
  - `@param {string} name` Name of simple context.
- `directives-added` When one or more directives are added.
  - `@param {Doars} doars` Library instance.
  - `@param {Object} addedDirectives` List of added directives.
- `directives-removed` When one or more directives are removed.
  - `@param {Doars} doars` Library instance.
  - `@param {Object} removedDirectives` List of removed directives.

### Component

- `getAttributes` Get the attributes in this component.
  - `@returns {Array<Attribute>}` List of attributes.
- `getChildren` Get child components in hierarchy of this component.
  - `@returns {Array<Component>}` List of components.
- `getElement` Get root element of the component.
  - `@returns {HTMLElement}` Element.
- `getId` Get component id.
  - `@returns {Symbol}` Unique identifier.
- `getLibrary` Get the library instance this component is from.
  - `@returns {Doars}` Doars instance.
- `getParent` Get parent component in hierarchy of this component.
  - `@returns {Component}` Component.
- `getProxy` Get the event dispatcher of state's proxy.
  - `@returns {ProxyDispatcher}` State's proxy dispatcher.
- `getState` Get the component's state.
  - `@returns {Proxy}` State.

#### Component events

The following events are dispatched by the component and can be listened to by calling the `addEventListener(/* name, callback, options */)` function on the component's root element.

- `d-destroyed` When this instance is destroyed.
  - `@param {CustomEvent} event` Event data.
    - `{Object} detail` Event details.
      - `{HTMLElement} element` Component's root element.
      - `{Symbol} id` Component's unique identifier.
- `d-updated` When one or more attributes on the component have been updated.
  - `@param {CustomEvent} event` Event data.
    - `{Object} detail` Event details.
      - `{HTMLElement} element` Component's root element.
      - `{Symbol} id` Component's unique identifier.
      - `{Array<Attribute>} updatedAttributes` List of updated attributes.

### Attribute

Extends the [`EventDispatcher`](#eventdispatcher).

- `getComponent` Get the component this attribute is a part of.
  - `@returns {Component}` Attribute's component.
- `getElement` Get the element this attribute belongs to.
  - `@returns {HTMLElement}` Element.
- `getId` Get attribute id.
  - `@returns {Symbol}` Unique identifier.
- `getDirective` Get the directive this attribute matches.
  - `@returns {String}` Directive name.
- `getKey` Get the optional key of the attribute.
  - `@returns {String}` Key.
- `getKeyRaw` Get the optional key of the attribute before being processed.
  - `@returns {String}` Raw key.
- `getModifiers` Get the optional modifiers of the attribute.
  - `@returns {Object}` Modifiers object
- `getModifiersRaw` Get the optional modifiers of the attribute before being processed.
  - `@returns {Array<String>}` List of raw modifiers.
- `getName` Get attribute's name.
  - `@returns {String}` Attribute name.
- `getValue` Get the attribute's value.
  - `@returns {String}` Value.
- `accessed` Mark an item as accessed.
  - `@param {Symbol} id` Unique identifier.
  - `@param {String} path` Context path.
- `hasAccessed` Check if attribute accessed any of the item's paths.
  - `@param {Symbol} id` Unique identifier.
  - `@param {Array<String>} paths` Contexts path.
  - `@returns {Boolean}` Whether any item's path was accessed.
- `clone` Creates a clone of the attribute without copying over the id and accessed values.
  - `@returns {Attribute}` Cloned attribute.

#### Attribute events

The following events are dispatched by an `Attribute` and can be listened to by calling the `addEventListener(/* name, callback, options */)` function on the instance.

- `changed` When the value is changed.
  - `@param {Attribute} attribute` The attribute instance.
- `destroyed` When the instance is destroyed.
  - `@param {Attribute} attribute` The attribute instance.
- `accessed` When a new item is marked as accessed.
  - `@param {Attribute} attribute` The attribute instance.
  - `@param {Symbol} id` The accessed's unique identifier.
  - `@param {String} path` The accessed's context path.

## Writing contexts

Contexts can be added to the Doars instance using the `addContexts` function where the first parameter is the index to add them to in the list, and the rest of the parameters the contexts you want to add.

Technically a context is nothing more than an object with a `name` property and a `create` property. The `name` must be a valid variable name, and `create` a function that returns an object containing the value that will be made available under the context's `name` when executing an expression.

The `create` function is given several arguments, the first is the `Component`, the second the `Attribute`.

Take for example the `$element` context. All it needs to do is the return the element of the attribute that is being processed, simple enough.

```JavaScript
export default {
  // The name of the context.
  name: '$element',

  // The function to process in order to create the context.
  create: (component, attribute) => {
    return {
      // Set the value to make available under the context's name.
      value: attribute.getElement(),
    }
  },
}
```

In addition to the `Component` and `Attribute` arguments the `create` function is also given a third and fourth argument. The third is an update function, and the fourth an object containing several utility classes and functions.

The update function can be called to trigger an update of the main library instance. In order for the library to know which directives need to be updated it will need to be given where something has updated as well as what has been updated. The where is taken care of by providing a [`Symbol`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol), and the what is a `String`.

The utilities arguments has the following properties:

- `createContexts:Function` Create component's contexts for an attributes expression. See the [ContextUtils](https://github.com/doars/doars/blob/8a530366bc5c8129fc8fabead47ea4f4683d52d4/packages/doars/src/utils/ContextUtils.js#L1) for more information.
- `createContextsProxy:Function` Create component's contexts only after the context gets used. See the [ContextUtils](https://github.com/doars/doars/blob/8a530366bc5c8129fc8fabead47ea4f4683d52d4/packages/doars/src/utils/ContextUtils.js#L1) for more information.
- `RevocableProxy:RevocableProxy` A [Proxy.revocable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable) polyfill.

Besides the `name` and `create` properties, an additional `deconstruct` property can be set. If `deconstruct` is set to a truthy value then the value returned by the context will be deconstructed using the [`with`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/with) statement. The result is that the context's name will not be needed in order to get the properties on the context. For example `$state.something.or.another` will also be accessible via `something.or.another`. Do note that the with statement is called in the same order that the contexts are added to by the `addContexts` function. In other words if two context both have the `deconstruct` property set and both contain the same property then the one later in the list will be used.

A more advanced context example is the `$state` context. It needs to get the state from the component and trigger an update if the state is changed as well as mark any properties accessed on it as accessed by the attribute. Finally when the contexts is no longer needed it will need to remove the listeners and revoke access to it.

```JavaScript
export default {
  // Mark the context for deconstruction.
  deconstruct: true,

  // The name of the context.
  name: '$state',

  // The function to process in order to create the context.
  create: (component, attribute, update, { RevocableProxy }) => {
    // Get and check values from the component.
    const proxy = component.getProxy()
    const state = component.getState()
    if (!proxy || !state) {
      return
    }

    // Create event handlers that trigger an update if a property on the state is deleted or set, and mark a value as accessed if a value is retrieved.
    const onDelete = (target, path) =>
      update(component.getId(), '$state.' + path.join('.'))
    const onGet = (target, path) =>
      attribute.accessed(component.getId(), '$state.' + path.join('.'))
    const onSet = (target, path) =>
      update(component.getId(), '$state.' + path.join('.'))

    // Add event listeners.
    proxy.addEventListener('delete', onDelete)
    proxy.addEventListener('get', onGet)
    proxy.addEventListener('set', onSet)

    // Wrap in a revocable proxy.
    const revocable = RevocableProxy(state, {})

    return {
      // Set the value to make available under the context's name.
      value: revocable.proxy,

      destroy: () => {
        // Remove event listeners.
        proxy.removeEventListener('delete', onDelete)
        proxy.removeEventListener('get', onGet)
        proxy.removeEventListener('set', onSet)

        // Revoke access to state.
        revocable.revoke()
      },
    }
  },
}
```

And there you have it, most of what you need to know about writing your own custom contexts. For more examples see the [build-in contexts](https://github.com/doars/doars/tree/main/packages/doars/src/contexts) and [plugin packages](https://github.com/doars/doars/tree/main/packages).

## Writing directives

> TODO: See the [build-in directives](https://github.com/doars/doars/tree/main/packages/doars/src/directives) and [plugin packages](https://github.com/doars/doars/tree/main/packages) for now.

## Writing plugins

> TODO: See the [plugin packages](https://github.com/doars/doars/tree/main/packages) for now.
