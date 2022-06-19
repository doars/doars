Cypress.Commands.add('setupDoars', (options = {}) => {
  options = Object.assign({
    build: 'execute',
    format: 'esm',
    minify: false,
  })

  let fileName = 'doars'
  if (options.build && options.build !== 'execute') {
    fileName += '-' + options.build
  }
  if (options.format) {
    fileName += '.' + options.format
  }
  if (options.minify) {
    fileName += '.min'
  }
  fileName += '.js'

  const script = document.createElement('script')
  script.setAttribute('src',)
  document.body.appendChild(script)
})


Cypress.Commands.add('setHtml', (
  html
) => {

})
