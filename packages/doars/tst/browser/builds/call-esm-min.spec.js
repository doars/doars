import { test, expect } from '@playwright/test'

test('basic test', async ({
  context,
}) => {
  const page = await context.newPage()
  page.addScriptTag() // TODO:
})
