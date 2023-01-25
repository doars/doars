<div align="center">

![Project logo](.docs/src/assets/icons/256-round.png)

</div>

# Doars

Build reactive websites without leaving your HTML. Ditch the hassle with other frameworks. Doars is a declarative and light solution that scans the webpage then processes the instructions found as well as keep the state and content up-to-date.

You can write logic directly in your layout, as a result you have to simply look at the HTML to read what the elements do. You won't need to dig through other files because the functionality is written on the structure itself.

```HTML
<!-- Add library to the document from a CDN. -->
<script src="https://cdn.jsdelivr.net/npm/@doars/doars@1/dst/doars.iife.js"></script>
<script>
  // Wait for the DOM to be interactive.
  document.addEventListener('DOMContentLoaded', () => {
    // Setup a library instance.
    const doars = new window.Doars()
    // Enable library.
    doars.enable()
  })
</script>

<!-- Define component with a list of messages. -->
<div d-state="{ messages: [ 'Hello there!', 'General Kenobi.' ] }">
  <!-- Create a list item for each message. -->
  <ol>
    <template d-for="message of messages">
      <li d-text="message"></li>
    </template>
  </ol>

  <!-- Store input as a reference. -->
  <input type="text" d-reference="input">

  <!-- On click add input value to the messages. -->
  <button d-on:click="messages.push($references.input.value); $references.input.value = ''">
    Add
  </button>
</div>
```

But don't worry, the markup is still yours! We promise we won't take it away. You can still modify the document directly in your own code and the library will do all the work to stay up to date.

Use as much or as little as you want. Doars can easily be added to an existing server side rendered or statically generated project because this solution doesn't force you to adopt an application wide architecture. You only need to load the library onto the page and add instructions in the form of attributes to your layouts.

## Packages

This mono-repository includes the core library as well as several plugins. See the full list below or the packages directory.

| Name                                                                                               | Description                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [@doars/doars](https://github.com/doars/doars/tree/main/packages/doars#readme)                     | The core library, it manages the components and plugins as well as includes the basic contexts and directives. |
| [@doars/doars-alias](https://github.com/doars/doars/tree/main/packages/doars-alias#readme)         | Plugin for creating aliases or renaming any context or directive.                                              |
| [@doars/doars-fetch](https://github.com/doars/doars/tree/main/packages/doars-fetch#readme)         | Plugin that adds a fetch context that handles parsing the returned content.                                    |
| [@doars/doars-intersect](https://github.com/doars/doars/tree/main/packages/doars-intersect#readme) | Plugin that adds an intersect directive for reacting to intersection changes.                                  |
| [@doars/doars-router](https://github.com/doars/doars/tree/main/packages/doars-router#readme)       | Plugin that adds a router context with set of directives to control it.                                        |
| [@doars/doars-store](https://github.com/doars/doars/tree/main/packages/doars-store#readme)         | Plugin that adds a store context for global state management.                                                  |
| [@doars/doars-update](https://github.com/doars/doars/tree/main/packages/doars-update#readme)       | Plugin that adds an update loop context and directive.                                                         |

## Contributing

If you are using the library and are running into an problem that you don't know how to solve, or would love to see a particular feature then feel free to [create an issue](./issues/new/choose). Or perhaps you want to make that cool feature, or help out in any other way. Then you are more then welcome! Read more about how to [contribute](./CONTRIBUTING.md).

## In the wild

If you are using Doars then please [let me know](https://rondekker.com#contact), I would love to hear about it!
