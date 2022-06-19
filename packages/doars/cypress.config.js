import { defineConfig } from 'cypress';

export default defineConfig({
  screenshotOnRunFailure: false,
  screenshotsFolder: 'tst/cypress/screenshots/',
  video: false,
  videosFolder: 'tst/cypress/videos/',

  e2e: {
    excludeSpecPattern: '*.html',
    fixturesFolder: false,
    setupNodeEvents: false,
    specPattern: 'tst/cypress/integration/',
    supportFile: 'tst/cypress/support/e2e.js',
  },
});
