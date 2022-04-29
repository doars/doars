export default ({ defaultInit }) => {
  return {
    name: 'fetch',

    update: (component, attribute, { processExpression }) => {
      // On click get the data at the url and set it as the outer html of the button.
      // <button d-fetch.outer=”/click-target-url”>Click to get</button>
      // On buttons 'click' is assumed to be the event to listen to.

      // On click delete the data at the url and store the response in the component's state.
      // <button d-fetch.delete=”/click-target-url” d-on:d-fetch="$state.result = event.detail.response">Click to delete</button>

      // On mouse over get the data at the url and set it as the inner html of the referenced element.
      // <div d-reference="target"></div>
      // <button d-fetch:mouseover.once=”/click-target-url” d-on:d-fetch="$references.target.innerHtml = event.detail.response">Hover to get</button>

      // On submit post the form to the target url and morph the form's inner html to the results.
      // <form d-fetch.inner.morph=”/click-target-url” method="post">[...]</form>
      // On forms 'submit' is assumed to be the event to listen to.
    },
  }
}
