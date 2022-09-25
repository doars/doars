// Import from node.
import { readFileSync } from 'fs';

// Import components.
import card from '../components/card.js'
import carousel from '../components/carousel.js'
import code from '../components/code.js'
import logo from '../components/logo.js'
import section from '../components/section.js'
import template from '../components/template.js'
import window from '../components/window.js'

// Import renderer.
import { render as r } from '../utils/RenderUtils.js'

// Import icon components.
const iconCopy = readFileSync('src/icons/copy-outline.svg')
const iconGithub = readFileSync('src/icons/logo-github.svg')

export default function () {
  return template(
    // Meta data.
    {
      description: 'Doars will scan the web page and process the directives found as well as keep the state and content up to date.',
      keywords: ['doars', 'javascript', 'minimal', 'modular', 'small', 'declarative', 'reactive', 'front-end', 'framework'],
      title: 'Doars | Build reactive web pages without leaving your HTML!',
    },

    // Page content.
    r('main', [
      section([
        r('div', {
          class: 'logo'
        }, logo()),

        r('h1', 'Build reactive web pages without leaving your HTML.'),
        r('p', 'Large font-end frameworks come at a big cost from compiling to loading. Doars is a declarative and light solution that scans the web page and processes the directives found as well as keep the state and content up to date.'),

        r('div', {
          class: 'bar',
        }, [
          r('a', {
            class: 'button',
            href: 'https://github.com/doars/doars#readme',
            target: '_blank',
          }, iconGithub),

          r('button', {
            class: 'flex-grow md:flex-grow-0',
            'onclick': () => {
              window.copyToClipboard('npm i @doars/doars')
            },
          }, [
            '&#160;',
            r('code', 'npm i @doars/doars'),
            '&#160;&#160;',
            iconCopy,
          ]),

          r('button', {
            class: 'flex-grow md:flex-grow-0',
            'onclick': () => {
              window.copyToClipboard('https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js')
            },
          }, [
            '&#160;',
            r('code', 'https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js'),
            '&#160;&#160;',
            iconCopy,
          ]),
        ]),

        r('div', {
          class: 'branch branch-reverse',
        }, [
          window({}, [
            '<!-- Define component. -->',
            '<div d-state="{ messages: [ \'Hello there!\', \'General Kenobi.\' ] }">',
            '  <div>List</div>',
            '',
            '  <!-- Create a list item for each message. -->',
            '  <ol>',
            '    <template d-for="message of messages">',
            '      <li d-text="message"></li>',
            '    </template>',
            '  </ol>',
            '',
            '  <!-- Store input as a reference. -->',
            '  <input type="text" d-reference="input">',
            '',
            '  <!-- On click add input value to the messages. -->',
            '  <button d-on:click="messages.push($references.input.value); $references.input.value = \'\'">',
            '    Add',
            '  </button>',
            '</div>',
            '',
            '<!-- Import library. -->',
            '<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>',
            '<script>',
            '  document.addEventListener(\'DOMContentLoaded\', () => {',
            '    // Setup and enable the library.',
            '    const doars = new window.Doars()',
            '    doars.enable()',
            '  })',
            '</script>',
          ]),

          r('div', {
            class: 'card-example -mt-1.5 ml-auto mr-3 md:-mr-1.25 -rotate-2 transform',
          }, [
            r('div', {
              'd-state': {
                messages: [
                  'Hello there!',
                  'General Kenobi.',
                ],
              },
            }, [
              r('div', {
                class: 'font-900 text-2',
              }, 'List'),
              r('ol', {
                class: 'h-12 font-500 overflow-y-scroll',
              }, [
                r('template', {
                  'd-for': 'message of messages',
                }, [
                  r('li', {
                    class: 'break-words',
                    'd-text': 'message',
                  }),
                ]),
              ]),
              r('fieldset', {
                class: 'flex flex-row flex-nowrap group',
              }, [
                r('input', {
                  class: 'flex-grow flex-shrink w-full',
                  'd-reference': 'input',
                  type: 'text',
                }),
                r('button', {
                  class: 'border-l-0 flex-grow-0 flex-shrink-0',
                  'd-on:click': ($references, messages) => {
                    const value = $references.input.value
                    if (value && value !== '') {
                      messages.push(value);
                      $references.input.value = '';
                    }
                  },
                }, 'Add'),
              ]),
            ]),
          ]),
        ]),
      ]),

      section([
        r('h2', 'Write logic directly in your layout.'),
        r('p', 'Simply look at the HTML and read what it does, not just what structure it has. You won\'t need to dig through other files since the functionality is written on the relevant element itself.'),
      ]),

      section([
        r('h2', 'But don\'t worry, the markup is still yours!'),
        r('p', 'We promise we won\'t take it away. You can still modify the document directly in code and we will do all the work to stay up to date.'),

        r('div', {
          class: 'branch',
        }, [
          // Code.
          window({}, [
            '<!-- Define component. -->',
            '<div d-state>',
            '  <span>Counter: </span>',
            '',
            '  <!-- The text directive\'s content is directly modified,',
            '       but will be picked up by the library and used. -->',
            '  <span id="counter-text" d-text="0"></span>',
            '</div>',
            '',
            '<!-- Setup increment button. -->',
            '<button onclick="increment()">Increment</button>',
            '',
            '<!-- Import library. -->',
            '<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>',
            '<script>',
            '  // Increment count and set to text directive.',
            '  let count = 0',
            '  let element = document.getElementById(\'counter-text\')',
            '  increment = () => {',
            '    count++',
            '    element.setAttribute(\'d-text\', count)',
            '  }',
            '',
            '  document.addEventListener(\'DOMContentLoaded\', () => {',
            '    // Setup and enable the library.',
            '    const doars = new Doars()',
            '    doars.enable()',
            '  })',
            '</script>',
          ]),

          // Card.
          r('div', {
            class: 'card-example -mt-1.5 ml-auto mr-3 md:-ml-1.25 rotate-2 transform',
          }, [
            r('div', {
              class: 'font-900 mb-0.5 text-2',
              'd-state': '{}',
            }, [
              'Counter:&#160;',

              r('span', {
                'id': 'counter-text',
                'd-text': 0,
              }),
            ]),

            r('button', {
              'class': 'w-full',
              'onclick': 'window.increment()',
            }, 'Increment'),
          ]),
        ]),
      ]),

      section([
        r('h2', 'Use as much or as little as you want.'),
        r('p', 'Doars can easily be added to an existing project since this solution doesn\'t force you to adopt an application wide architecture. You only need to load the library onto the page and add instructions in the form of attributes to your layouts.'),
      ]),

      section([
        r('h2', 'Small in size and quick to update!'),

        r('p', 'Minified and compressed the library is less than <code><b>10kB</b></code>, and when the state or document changes only relevant directives are executed making updates fast.'),
      ]),

      section([
        r('h2', 'Simple to use, but rich in functionality.'),
        // r('p', ''),
      ]),

      section([
        r('h3', 'The build-in directives'),
        // r('p', ''),
      ]),

      r('div', {
        class: 'mb-6 -mt-4',
      }, [
        carousel({
          alignOnHover: true,
        }, [
          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-state',
          }, 'd-state', 'Define a component and set its initial state.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-reference',
          }, 'd-reference', 'Add the element to the component\'s references context.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-initialized',
          }, 'd-initialized', 'Runs once when the component is initialized'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-watch',
          }, 'd-watch', 'Runs every time a value used changes.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-on',
          }, 'd-on', 'Listen to events on the document tree.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-text',
          }, 'd-text', 'Set the inner text or text content of the element.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-html',
          }, 'd-html', 'Set the inner html of the element.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-attribute',
          }, 'd-attribute', 'Set an attribute\'s value.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-select',
          }, 'd-select', 'Set selected item of a select element or selectable input elements.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-sync-state',
          }, 'd-sync-state', 'Keep the value of an element in sync with a value in the state.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-transition',
          }, 'd-transition', 'Change attributes on an element when being hidden or shown.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-show',
          }, 'd-show', 'Return whether the element should be displayed.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-if',
          }, 'd-if', 'Return whether the template should be added to the document.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-for',
          }, 'd-for', 'Loop over a value and create elements based on a template.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-cloak',
          }, 'd-cloak', 'Is removed after the component is initialized.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#d-ignore',
          }, 'd-ignore', 'Ignore the element and its children from being processed.'),
        ]),
      ]),

      section([
        r('h3', 'The build-in contexts'),
        // r('p', ''),
      ]),

      r('div', {
        class: 'mb-6 -mt-4',
      }, [
        carousel({
          alignOnHover: true,
        }, [
          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$state',
          }, '$state', 'Get component\'s state.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$for',
          }, '$for', 'Get variables defined in the for directive.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$parent',
          }, '$parent', 'Context of parent component.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$children',
          }, '$children', 'List of contexts of child components.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$component',
          }, '$component', 'Component\'s root element.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$element',
          }, '$element', 'Directive\'s element.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$references',
          }, '$references', 'List of referenced elements in the component.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$dispatch',
          }, '$dispatch', 'Dispatch custom event on the element.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$nexttick',
          }, '$nextTick', 'Execute a function after updates are done processing.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars#$incontext',
          }, '$inContext', 'Execute a function in context after the existing one has been revoked.'),
        ]),
      ]),

      section([
        r('h2', 'Easy to add to your project.'),
        // r('p', ''),
      ]),

      r('div', {
        class: 'mb-6 -mt-4',
      }, [
        carousel({}, [
          card({}, 'From NPM', 'Install the package from NPM, then import and enable the library in your build.',
            r('button', {
              'onclick': () => {
                window.copyToClipboard('npm i @doars/doars')
              },
            }, [
              '&#160;',
              r('code', 'npm i @doars/doars'),
              '&#160;&#160;',
              iconCopy,
            ]),

            r('div', {
              class: 'code-wrapper',
            }, [
              code({
                language: 'javascript',
              }, [
                '// Import library.',
                'import Doars from \'@doars/doars\'',
                '',
                '// Setup and enable the library.',
                'const doars = new Doars()',
                'doars.enable()',
              ]),
            ]),
          ),

          card({}, 'ESM build from jsDelivr', 'Import the ESM build from for example the jsDelivr CDN and enable the library.',
            r('div', {
              class: 'code-wrapper',
            }, [
              code({}, [
                '<script type="module">',
                '  // Import library.',
                '  import doars from \'https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.esm.js\'',
                '',
                '  // Setup and enable the library.',
                '  const doars = new Doars()',
                '  doars.enable()',
                '</script>',
              ]),
            ]),
          ),

          card({}, 'IIFE build from jsDelivr', 'Add the IFFE build to the page from for example the jsDelivr CDN and enable the library.',
            r('div', {
              class: 'code-wrapper',
            }, [
              code({}, [
                '<!-- Import library. -->',
                '<script src="https://cdn.jsdelivr.net/npm/@doars/doars@2/dst/doars.iife.js"></script>',
                '<script>',
                '  document.addEventListener(\'DOMContentLoaded\', () => {',
                '    // Setup and enable the library.',
                '    const doars = new Doars()',
                '    doars.enable()',
                '  })',
                '</script>',
              ]),
            ]),
          ),
        ]),
      ]),

      section([
        r('h2', 'Customize to your liking!'),
        r('p', 'If the build-in contexts and directives aren\'t enough you can easily add new functionality by adding plugins or writing your own.'),
      ]),

      r('div', {
        class: 'mb-6 -mt-4',
      }, [
        carousel({
          alignOnHover: true,
        }, [
          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-store#readme',
          }, '@doars/doars-store', 'Adds a store context for global state management.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-view#readme',
          }, '@doars/doars-view', 'Adds a view directive for reacting to intersection changes.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-router#readme',
          }, '@doars/doars-router', 'Adds a router context with set of directives to control it.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-fetch#readme',
          }, '@doars/doars-fetch', 'Adds a fetch context that handles parsing the returned content.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-alias#readme',
          }, '@doars/doars-alias', 'Create aliases for or rename any context or directive.'),

          card({
            href: 'https://github.com/doars/doars/tree/main/packages/doars-update#readme',
          }, '@doars/doars-update', 'Adds an update loop context and directive.'),
        ]),
      ]),
    ]),

    r('footer', [
      section([
        r('div', {
          class: 'branch',
        }, [
          r('div', {
            class: 'logo'
          }, logo()),
          r('ul', [
            r('li', [
              r('a', {
                href: 'https://github.com/doars/doars#readme',
                target: '_blank',
              }, 'GitHub')
            ]),
            r('li', [
              r('a', {
                href: 'https://npmjs.com/org/doars/',
                target: '_blank',
              }, 'NPM')
            ]),
            r('li', [
              r('a', {
                href: 'https://rondekker.com',
                target: '_blank',
              }, 'From Ron Dekker')
            ]),
          ]),
        ]),
      ]),
    ])
  )
}
